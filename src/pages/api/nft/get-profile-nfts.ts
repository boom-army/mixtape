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
      showUnverifiedCollections: false,
    },
  });
  return response;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { address, page } = req.query;

  if (!address) {
    return res.status(400).json({ error: "Missing owner address" });
  }

  try {
    const data = await getNFTsByOwner(address as string, Number(page) ?? 1);
    const filteredData = data.items
      .filter((nft) =>
        nft?.authorities?.some(
          (authority) =>
            authority.address === "MXTPExF3AYg6bW31ucCWHjh2wYaoDsF1Kx8jbHpD41N"
        )
      )
      .map((nft) => ({
        mint: nft.id,
        image: nft?.content?.links?.image,
        meta: nft?.content?.metadata,
      }));
    res.status(200).json({ profileNfts: filteredData });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to fetch NFTs by owner" });
  }
}
