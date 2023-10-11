import prisma from "../../../lib/prisma";
import {
  Metaplex,
  walletAdapterIdentity,
  bundlrStorage,
  toMetaplexFile,
  JsonMetadata,
} from "@metaplex-foundation/js";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { NextApiHandler } from "next";
import { MIXTAPE_COLLECTION, MIXTAPE_TX } from "../../utils/nft";
import { Helius } from "helius-sdk";
import { getCluster } from "../../utils";
import { NftTemplate } from "@prisma/client";
import { AwardType } from "../../types";

export interface MintNFT {
  template: NftTemplate;
  nftImageBlob: string;
  nftMetadata: JsonMetadata;
  publicKey: string;
}

const mint: NextApiHandler = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const { nftImageBlob, nftMetadata, template, publicKey } =
    req.body;
  const errors = {
    nftImageBlob: !nftImageBlob && "NFT image is required",
    nftMetadata: !nftMetadata && "NFT metadata is required",
    template: !template && "NFT template is required",
    publicKey: !publicKey && "Your Solana Wallet Public Key is required",
  };
  for (const [key, value] of Object.entries(errors)) {
    if (value) {
      return res.status(400).json({ error: value });
    }
  }

  try {
    const url = process.env.NEXT_PUBLIC_SOLANA_NETWORK!;
    const connection = new Connection(url, "finalized");
    const keys = JSON.parse(process.env.NEXT_KEYPAIR!);
    const keysUint8Array = new Uint8Array(keys);
    const mintKeys = Keypair.fromSecretKey(keysUint8Array);
    const helius = new Helius(process.env.NEXT_HELIUS_RPC_KEY!, getCluster());
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

    const metadata = await metaplex?.nfts().uploadMetadata(
      {
        ...nftMetadata,
        image: imageAddress + `?ext=${imageType}`,
        type: imageType,
        payer: mintKeys.publicKey,
      },
      { commitment: "finalized" }
    );
    if (!metadata) throw new Error("Metadata upload failed");

    const { result } = await helius.mintCompressedNft({
      owner: publicKey,
      name: nftMetadata.name,
      symbol: nftMetadata.symbol,
      description: nftMetadata.description,
      delegate: MIXTAPE_TX.toBase58(),
      collection: "12goZzd26JopD1jhcXWBjDhJh74zpBJjYKgVj8DaQfU5",
      creators: nftMetadata.properties?.creators,
      uri: metadata.uri,
      sellerFeeBasisPoints: nftMetadata?.seller_fee_basis_points,
      imageUrl: imageAddress + `?ext=${imageType}`,
      externalUrl: "",
      attributes: nftMetadata.properties?.attributes,
  });

    await prisma.$transaction([
      prisma.mint.create({
        data: {
          mintAddress: result.assetId,
          nftMetadata: JSON.parse(JSON.stringify(nftMetadata)),
          signature: result.signature,
          userId: publicKey,
          templateId: template.id,
        },
      }),
      prisma.points.create({
        data: {
          points: 5,
          userId: publicKey,
          mintAddress: result.assetId,
          awardedId: AwardType.MINT,
        },
      }),
    ]);

    return res.status(200).json({ mintAddress: result.assetId });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: (error as Error).message });
  }
};

export default mint;
