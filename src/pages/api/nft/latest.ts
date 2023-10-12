import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../lib/prisma";

export default async function latest(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 16;
  const skip = (page - 1) * limit;

  try {
    const latestMints = await prisma.mint.findMany({
      skip: skip,
      take: limit,
      orderBy: {
        id: "desc",
      },
      include: {
        nftTemplate: true,
      },
    });

    const totalTracks = await prisma.mint.count();
    
    const latestTracks = latestMints.map((mint) => ({
      mint: mint.mintAddress,
      image: mint.nftTemplate.image,
      meta: mint.nftMetadata,
    }));
    res.status(200).json({ latestTracks, totalTracks });
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while fetching the latest mints." });
  }
}
