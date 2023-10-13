import type { NextApiRequest, NextApiResponse } from "next";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { walletAdapterPayer } from "@metaplex-foundation/umi-signer-wallet-adapters";
import { Keypair } from "@solana/web3.js";
import { mplBubblegum, readApi } from "@metaplex-foundation/mpl-bubblegum";
import { publicKey } from "@metaplex-foundation/umi";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return;
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { address } = req.query;

  if (!address) {
    return res.status(400).json({ error: "Missing NFT id" });
  }

  const umi = createUmi(process.env.NEXT_PUBLIC_SOLANA_NETWORK!).use(readApi());

  try {
    const data = await umi.rpc.getAssetsByOwner({
      owner: publicKey(String(address)),
      page: 1,
      limit: 50,
    });
    // const data = await umi.rpc.getAssetsByGroup({
    //   groupKey: 'collection',
    //   groupValue: publicKey(String(address)),
    // })
    // const data = await umi.rpc.getAsset(publicKey(String(address)));
    res.status(200).json({ asset: data });
  } catch (error) {
    console.log(error);

    res.status(500).json({ error: "Failed to fetch NFT metadata" });
  }
}
