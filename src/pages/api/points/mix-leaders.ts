// src/pages/api/mints/top.ts
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../lib/prisma";

export default async function topMints(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const mints = await prisma.mint.findMany({
        select: {
          mintAddress: true,
          nftMetadata:true,
        },
      });

      const topMints = (await Promise.all(
        mints.map(async (mint) => {
          const totalPoints = await prisma.points.aggregate({
            _sum: {
              points: true,
            },
            where: {
              mintAddress: mint.mintAddress,
            },
          });
          return {
            mint: mint,
            totalPoints: totalPoints._sum.points || 0,
          };
        })
      )).filter(mint => mint.totalPoints > 0);

      const sortedMints = topMints.sort((a, b) => b.totalPoints - a.totalPoints);

      res.status(200).json({ topMints: sortedMints });
    } catch (error) {
      res
        .status(500)
        .json({ error: "An error occurred while fetching the top mints." });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
