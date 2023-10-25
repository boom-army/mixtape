import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../lib/prisma";

export default async function nftLeaders(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const id = req.query.id as string;

      if (!id) {
        res.status(400).json({ error: "Missing templateId query parameter." });
        return;
      }

      const mints = await prisma.mint.findMany({
        where: {
          templateId: id,
        },
        select: {
          mintAddress: true,
        },
      });

      const mintAddresses = mints.map((mint) => mint.mintAddress);

      const topMints = await prisma.points.groupBy({
        by: ["mintAddress"],
        where: {
          mintAddress: {
            in: mintAddresses,
          },
        },
        _sum: {
          points: true,
        },
        orderBy: {
          _sum: {
            points: "desc",
          },
        },
        take: 10,
      });

      const topMintsDetails = await Promise.all(
        topMints.map(async (mint) => {
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
        })
      );

      res.status(200).json({ topNFTs: topMintsDetails });
    } catch (error) {
      res
        .status(500)
        .json({ error: "An error occurred while fetching the top mints." });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
