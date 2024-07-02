import type { NextApiRequest, NextApiResponse } from "next";
import { Helius } from "helius-sdk";
import { getCluster } from "../../../utils";
import { DasApiAssetList } from "@metaplex-foundation/digital-asset-standard-api";

const helius = new Helius(process.env.NEXT_HELIUS_RPC_KEY!, getCluster());

async function getNFTsByOwner(ownerAddress: string, page = 1) {
  const response: DasApiAssetList = await fetch(
    process.env.NEXT_PUBLIC_SOLANA_NETWORK!,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "",
        method: "getAssetsByOwner",
        params: {
          ownerAddress,
          page,
          displayOptions: {
            showCollectionMetadata: true,
            showUnverifiedCollections: false,
          },
        },
      }),
    }
  ).then((res) => res.json());
  return response;
}

// const getNFTsByOwner = async (ownerAddress: string, page = 1) => {
//   const response = await fetch(process.env.NEXT_PUBLIC_SOLANA_NETWORK!, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       jsonrpc: "2.0",
//       id: "my-id",
//       method: "getAssetsByOwner",
//       params: {
//         ownerAddress,
//         page,
//         limit: 1000,
//         displayOptions: {
//           showCollectionMetadata: true,
//           showUnverifiedCollections: false,
//         },
//         disableCache: true,
//       },
//     }),
//   });
//   const { result }: { result: DAS.GetAssetResponseList } =
//     await response.json();
//   return result;
// };

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
        nft?.creators?.some(
          (item) =>
            item.address === "MXTPExF3AYg6bW31ucCWHjh2wYaoDsF1Kx8jbHpD41N"
        )
      )
      .map((nft) => ({
        mint: nft.id,
        image: nft?.content?.links?.find(
          (link) => link.type === "image"
        )?.uri,
        meta: nft?.content?.metadata,
      }));
    res.status(200).json({ profileNfts: filteredData });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to fetch NFTs by owner" });
  }
}
