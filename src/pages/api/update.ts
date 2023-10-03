import {
  Metaplex,
  walletAdapterIdentity,
  bundlrStorage,
  toMetaplexFile,
} from "@metaplex-foundation/js";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { NextApiRequest, NextApiResponse } from "next";
import { compact, values } from "lodash";

// Initialize connection
const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_NETWORK!, "confirmed");

const update = async (req: NextApiRequest, res: NextApiResponse) => {
  return res.status(404).json({ message: "Not found" });
  if (req.method === "POST") {
    const { mintAddress, password, image, fetchedMeta } = req.body;
    const errors = {
      // password:
      //   password !== "G1p59D3CScwE9r31RNFsGm3q5xZapt6EXHmtHV7Jq5AS"
      //     ? "Invalid password"
      //     : null,
      mintAddress: !mintAddress ? "Mint address is required" : null,
      image: !image ? "Image is required" : null,
      fetchedMeta: !fetchedMeta ? "Metadata is required" : null,
    };
    const errorMessages = compact(values(errors));
    if (errorMessages.length) {
      return res.status(400).json({ error: errorMessages.join(", ") });
    }
    let nftAddress = new PublicKey(mintAddress);

    try {
      const url = process.env.NEXT_PUBLIC_SOLANA_NETWORK!;
      const connection = new Connection(url, "confirmed");
      const keys = JSON.parse(process.env.NEXT_KEYPAIR!);

      const keysUint8Array = new Uint8Array(keys);
      const mintKeys = Keypair.fromSecretKey(keysUint8Array);

      const metaplex = new Metaplex(connection);
      metaplex.use(walletAdapterIdentity(mintKeys)).use(
        bundlrStorage({
          address: process.env.NEXT_PUBLIC_ARWEAVE_URL,
          timeout: 60000,
          identity: mintKeys,
        })
      );

      const imageType = image.split(";")[0].split(":")[1];
      const uploadNFTImage = async (base64Data: string) => {
        const base64Image = base64Data.split(";base64,").pop();
        if (!base64Image) {
          throw new Error("Failed to extract base64 image data");
        }
        const buffer = Buffer.from(base64Image, "base64");
        // @ts-ignore
        const imageFile = toMetaplexFile(buffer, fetchedMeta.name, {
          extension: imageType.split("/")[1],
          contentType: imageType,
        });
        const imageUpload = await metaplex?.storage().upload(imageFile);
        if (!imageUpload) throw new Error("Image upload failed");
        return imageUpload;
      };
      const imageAddress = await uploadNFTImage(image);

      if (fetchedMeta.json && fetchedMeta.json.properties) {
        fetchedMeta.json.properties.files = [
          {
            uri: imageAddress,
            type: imageType,
          },
        ];
      }

      const uploadedMeta = await metaplex?.nfts().uploadMetadata({
        ...fetchedMeta.json,
        image: imageAddress + `?ext=${imageType}`,
        type: imageType,
        payer: mintKeys.publicKey,
      });
      if (!uploadedMeta) throw new Error("Metadata upload failed");

      const nft = await metaplex.nfts().findByMint({ mintAddress: nftAddress });
      const { response } = await metaplex.nfts().update({
        nftOrSft: nft,
        uri: uploadedMeta.uri,
        authority: mintKeys,
      });

      res
        .status(200)
        .json({
          message: `NFT metadata updated successfully, tx: ${response.signature}`,
        });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error updating NFT metadata: " + error });
    }
  } else {
    // Handle any other HTTP method
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export default update;