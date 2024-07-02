import type { NextApiRequest, NextApiResponse } from "next";
import { Helius } from "helius-sdk";
import { getCluster } from "../../../utils";

const helius = new Helius(process.env.NEXT_HELIUS_RPC_KEY!, getCluster());

const getNFTMetadata = async (id: string) =>
  await fetch(process.env.NEXT_PUBLIC_SOLANA_NETWORK!, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: "",
      method: "getAsset",
      params: {
        id,
        options: {
          showCollectionMetadata: true,
        },
      },
    }),
  });

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { address } = req.query;

  if (!address) {
    return res.status(400).json({ error: "Missing NFT id" });
  }

  try {
    const data = await getNFTMetadata(address as string).then((res) =>
      res.json()
    );
    res.status(200).json({ asset: data.result });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to fetch NFT metadata" });
  }
}
