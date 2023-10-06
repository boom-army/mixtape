import prisma from "../../../lib/prisma";
import { uniqBy } from "lodash";
import { Helius } from "helius-sdk";
import { NextApiRequest, NextApiResponse } from "next";
import {
  Metaplex,
  bundlrStorage,
  toMetaplexFile,
  walletAdapterIdentity,
} from "@metaplex-foundation/js";
import { Connection, Keypair } from "@solana/web3.js";
import sharp from "sharp";

interface NftEmote {
  image: string;
  cImage: string;
  name: string;
  description?: string;
  symbol?: string;
}

export default async function loadNFTs(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { collectionId, password } = req.body;

    if (password !== process.env.NEXT_ADMIN_PASSWORD) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!collectionId) {
      res.status(400).json({ error: "Missing collectionId" });
      return;
    }

    const url = process.env.NEXT_PUBLIC_SOLANA_NETWORK!;
    const connection = new Connection(url, "finalized");
    const keys = JSON.parse(process.env.NEXT_KEYPAIR!);
    const keysUint8Array = new Uint8Array(keys);
    const mintKeys = Keypair.fromSecretKey(keysUint8Array);

    const helius = new Helius(process.env.NEXT_HELIUS_RPC_KEY!);

    const metaplex = new Metaplex(connection);
    metaplex.use(walletAdapterIdentity(mintKeys)).use(
      bundlrStorage({
        address: process.env.NEXT_PUBLIC_ARWEAVE_URL,
        timeout: 60000,
        identity: mintKeys,
      })
    );

    try {
      const nfts = await helius.rpc.getAssetsByGroup({
        groupKey: "collection",
        groupValue: collectionId,
        page: 1,
      });

      const uniqueNfts = uniqBy(nfts.items, (nft) =>
        JSON.stringify(nft.content?.metadata?.name)
      );

      const nftEmotesPromises = uniqueNfts.map((nft) => {
        return new Promise<NftEmote>(async (resolve, reject) => {
          try {
            const uploadNFTImage = async () => {
              if (!nft.content?.metadata?.name || !nft.content?.links?.image) {
                throw new Error("NFT name or image not found");
              }
              const response = await fetch(nft.content?.links?.image);
              const imageBuffer = await response.arrayBuffer();

              const imageBlob = await sharp(Buffer.from(imageBuffer))
                .resize(128, 128)
                .png()
                .toBuffer();
              const imageFile = toMetaplexFile(
                imageBlob,
                nft.content?.metadata?.name,
                {
                  extension: "png",
                  contentType: "image/png",
                }
              );
              const imageUpload = await metaplex?.storage().upload(imageFile);
              if (!imageUpload) throw new Error("Image upload failed");
              return imageUpload;
            };
            const imageAddress = await uploadNFTImage();
            resolve({
              cImage: imageAddress,
              image: nft.content?.links?.image || "",
              name: nft.content?.metadata?.name || "",
              description: nft.content?.metadata?.description,
              symbol: nft.content?.metadata?.symbol,
            });
          } catch (error) {
            reject(error);
          }
        });
      });

      const nftEmotes: NftEmote[] = await Promise.all(nftEmotesPromises);

      for (const nft of nftEmotes) {
        await prisma.nftEmote.create({
          data: {
            ...nft,
            collection: collectionId,
          },
        });
      }

      res.status(200).json({ nftEmotes });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
