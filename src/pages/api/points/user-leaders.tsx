// src/pages/api/points/user-leaders.ts
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../lib/prisma";

export default async function userLeaders(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const topUsers = await prisma.points.groupBy({
        by: ['userId'],
        _sum: {
          points: true,
        },
        orderBy: {
          _sum: {
            points: 'desc',
          },
        },
        take: 11,
      });      

      const topUsersDetails = await Promise.all(
        topUsers
          .filter(user => user.userId !== null)
          .map(async (user) => {
            const userDetails = await prisma.user.findUnique({
              where: {
                id: user.userId as string,
              },
              select: {
                id: true,
              },
            });
      
            return {
              user: userDetails,
              totalPoints: user._sum.points || 0,
            };
          })
      );

      res.status(200).json({ topUsers: topUsersDetails });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ error: "An error occurred while fetching the top users." });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}