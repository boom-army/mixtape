import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";

export default async function latest(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const latestMints = await prisma.mint.findMany({
      take: 16,
      orderBy: {
        id: "desc",
      },
    });
    const latestTracks = latestMints.map((mint) => ({
      mint: mint.mintAddress,
      image: (mint.template as any)?.image,
      meta: mint.nftMetadata,
    }));
    res.status(200).json({ latestTracks });
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while fetching the latest mints." });
  }
}
