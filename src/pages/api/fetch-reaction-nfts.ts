import prisma from "../../../lib/prisma";
import { filter, some, map, uniqBy } from "lodash";
import { Helius } from "helius-sdk";
import { NextApiRequest, NextApiResponse } from "next";

const nftCollections = [
  "6zGB9MCm52r9vUk14BZA6p9hcZXCXf5NbCEUApGweNHU", // BRGR
  "BXHRjXaTwLoGdXGuoUzbaeUuBQ21E5vWjCqyUGLsD8fM", // TRRP
  "2K7qeDaKJh9GWCZJYqUwuA9Jbiicy8T4yzGS4PWdq4TJ", // SQDR
  "ofUvbBBKGG9X3YKQ8Xyv1s2GqQyUgwyk37XxuiNQY45", // RBNG
  "7soPY36PaM8Ck1EycPq5WJ3CVHjZK47aneFniK5GNFyQ", // null - computers
];

export default async function latest(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { ownerAddress } = req.body;

    if (!ownerAddress) {
      res.status(400).json({ error: "Missing ownerAddress" });
      return;
    }

    const helius = new Helius(process.env.NEXT_HELIUS_RPC_KEY!);

    try {
      const nfts = await helius.rpc.getAssetsByOwner({
        ownerAddress,
        page: 1,
        limit: 50,
      });

      const filteredNfts = nfts.items.filter((nft) =>
        nft.grouping?.some(
          (group) =>
            group.group_key === "collection" &&
            nftCollections.includes(group.group_value)
        )
      );

      const nftEmoteNames = filteredNfts.map(
        (nft) => nft.content?.metadata?.name
      );
      const uniqueNftEmotes = [...new Set(nftEmoteNames)];

      const nftEmotes = await prisma.nftEmote.findMany({
        where: {
          name: {
            in: uniqueNftEmotes as string[],
          },
        },
      });

      res.status(200).json({ nftEmotes });
    } catch (error) {
      res.status(500).json({ error: "Error fetching NFTs" });
    }
  } else {
    res.status(405).json({ error: "We only support POST" });
  }
}
