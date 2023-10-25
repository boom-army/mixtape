import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../lib/prisma";

export default async function topMints(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const topMints = await prisma.points.groupBy({
        by: ['mintAddress'],
        _sum: {
          points: true,
        },
        orderBy: {
          _sum: {
            points: 'desc',
          },
        },
        take: 10,
      });      

      const topMintsDetails = await Promise.all(topMints.map(async (mint) => {
        const mintDetails = await prisma.mint.findUnique({
          where: {
            mintAddress: mint.mintAddress as string,
          },
          select: {
            mintAddress: true,
            nftMetadata: true,
          },
        });

        return {
          mint: mintDetails,
          totalPoints: mint._sum.points || 0,
        };
      }));

      res.status(200).json({ topMints: topMintsDetails });
    } catch (error) {
      res
        .status(500)
        .json({ error: "An error occurred while fetching the top mints." });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
