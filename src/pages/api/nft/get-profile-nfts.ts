import type { NextApiRequest, NextApiResponse } from "next";
import { Helius } from "helius-sdk";
import { getCluster } from "../../../utils";

const helius = new Helius(process.env.NEXT_HELIUS_RPC_KEY!, getCluster());

async function getNFTsByOwner(ownerAddress: string, page = 1) {
  const response = await helius.rpc.getAssetsByOwner({
    ownerAddress,
    page,
    displayOptions: {
      showCollectionMetadata: true,
    },
  });
  return response;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { address, page } = req.query;

  if (!address) {
    return res.status(400).json({ error: "Missing owner address" });
  }  

  try {
    const data = await getNFTsByOwner(address as string, Number(page) ?? 1);
    res.status(200).json({ profileNfts: data });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to fetch NFTs by owner" });
  }
}