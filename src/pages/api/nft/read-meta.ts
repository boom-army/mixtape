import type { NextApiRequest, NextApiResponse } from "next";
import { Helius } from "helius-sdk";
import { getCluster } from "../../../../scripts/helpers";

const helius = new Helius(process.env.NEXT_HELIUS_RPC_KEY!, getCluster());

async function getNFTMetadata(id: string) {
  const response = await helius.rpc.getAsset({
    id,
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

  const { address } = req.query;

  if (!address) {
    return res.status(400).json({ error: "Missing NFT id" });
  }  

  try {
    const data = await getNFTMetadata(address as string);
    res.status(200).json({ asset: data });
  } catch (error) {
    console.log(error);
    
    res.status(500).json({ error: "Failed to fetch NFT metadata" });
  }
}