import prisma from "../../../lib/prisma";
import {
  Metaplex,
  walletAdapterIdentity,
  bundlrStorage,
  toMetaplexFile,
} from "@metaplex-foundation/js";
import { Connection, Keypair } from "@solana/web3.js";
import { NextApiHandler } from "next";
import { MintNFT } from "../../hooks/useMintNFT";
import dayjs from "dayjs";
import { MIXTAPE_COLLECTION } from "../../utils/nft";
import { TokenStandard } from "@metaplex-foundation/mpl-token-metadata";

interface MintRequest extends MintNFT {
  signature: string;
  // nonce: string;
}

const mint: NextApiHandler = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const { nftImageBlob, nftMetadata, template, signature }: MintRequest =
    req.body;
  // const location = nonce ? JSON.parse(Buffer.from(nonce, "base64").toString()) : null;
  const errors = {
    nftImageBlob: !nftImageBlob && "NFT image is required",
    nftMetadata: !nftMetadata && "NFT metadata is required",
    template: !template && "NFT template is required",
    signature: !signature && "A signed tx is required",
  };
  for (const [key, value] of Object.entries(errors)) {
    if (value) {
      return res.status(400).json({ error: value });
    }
  }

  try {
    const url = process.env.NEXT_PUBLIC_SOLANA_NETWORK!;
    const connection = new Connection(url, "confirmed");

    // Check tx exists
    const transactionResponse = await connection.getTransaction(signature);
    if (!transactionResponse) {
      return res.status(400).json({ error: "Transaction not found" });
    }

    // Check if the transaction was performed within the last 5 minutes
    const minutesAgo = dayjs().subtract(2, "minute");
    const transactionTime = transactionResponse?.blockTime
      ? dayjs.unix(transactionResponse?.blockTime)
      : dayjs();

    if (transactionTime.isBefore(minutesAgo)) {
      return res.status(400).json({
        error:
          "Transaction to mint has expired. Please sign a new transaction.",
      });
    }
    const senderAddress =
      transactionResponse.transaction.message.accountKeys[0];

    const keys = JSON.parse(process.env.NEXT_KEYPAIR!);
    const keysUint8Array = new Uint8Array(keys);
    const mintKeys = Keypair.fromSecretKey(keysUint8Array);

    // Use Prisma to write the senderAddress as the id to User table. It should find or create the user
    const senderId = senderAddress.toBase58();
    const user = await prisma.user.upsert({
      where: { id: senderId },
      update: {},
      create: { id: senderId },
    });

    // Check if the signature already exists in the database
    const existingMint = await prisma.mint.findFirst({
      where: { signature },
    });
    if (existingMint) {
      return res.status(400).json({ error: "Signature invalid" });
    }

    const metaplex = new Metaplex(connection);
    metaplex.use(walletAdapterIdentity(mintKeys)).use(
      bundlrStorage({
        address: process.env.NEXT_PUBLIC_ARWEAVE_URL,
        timeout: 60000,
        identity: mintKeys,
      })
    );

    const imageType = nftImageBlob.split(";")[0].split(":")[1];

    const uploadNFTImage = async (base64Data: string) => {
      const base64Image = base64Data.split(";base64,").pop();
      if (!base64Image) {
        throw new Error("Failed to extract base64 image data");
      }
      const buffer = Buffer.from(base64Image, "base64");
      const imageFile = toMetaplexFile(buffer, template.name, {
        extension: imageType.split("/")[1],
        contentType: imageType,
      });
      const imageUpload = await metaplex?.storage().upload(imageFile);
      if (!imageUpload) throw new Error("Image upload failed");
      return imageUpload;
    };
    const imageAddress = await uploadNFTImage(nftImageBlob);

    nftMetadata?.properties?.files?.push({
      uri: imageAddress,
      type: imageType,
    });

    // Retrieve the last record from prisma for mint and increment the id
    const lastMint = await prisma.mint.findFirst({
      orderBy: {
        id: "desc",
      },
    });
    const metaName = lastMint ? `MixtApe #${lastMint.id + 1}` : `MixtApe`;
    nftMetadata.name = metaName;

    const metadata = await metaplex?.nfts().uploadMetadata({
      ...nftMetadata,
      image: imageAddress + `?ext=${imageType}`,
      type: imageType,
      payer: mintKeys.publicKey,
    });
    if (!metadata) throw new Error("Metadata upload failed");

    const transaction = await metaplex?.nfts().create({
      updateAuthority: mintKeys,
      tokenOwner: senderAddress,
      uri: metadata.uri,
      symbol: nftMetadata.symbol as string,
      name: nftMetadata.name as string,
      sellerFeeBasisPoints: nftMetadata.seller_fee_basis_points as number,
      collection: MIXTAPE_COLLECTION,
      collectionAuthority: mintKeys,
      tokenStandard: TokenStandard.ProgrammableNonFungible,
    });

    if (transaction.response.confirmResponse.value.err) {
      return res.status(400).json({ error: "Minting failed" });
    }

    const mintAddress = transaction?.mintAddress.toString();

    await prisma.mint.create({
      data: {
        mintAddress,
        nftMetadata: JSON.parse(JSON.stringify(nftMetadata)),
        template: template,
        signature: signature,
        // location,
        userId: user.id,
      },
    });

    return res.status(200).json({ mintAddress });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Server error" });
  }
};

export default mint;
