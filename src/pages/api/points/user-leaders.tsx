// src/pages/api/points/user-leaders.ts
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../lib/prisma";

export default async function userLeaders(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
        },
      });

      const topUsers = (await Promise.all(
        users.map(async (user) => {
          const totalPoints = await prisma.points.aggregate({
            _sum: {
              points: true,
            },
            where: {
              userId: user.id,
            },
          });
          return {
            user: user,
            totalPoints: totalPoints._sum.points || 0,
          };
        })
      )).filter(user => user.totalPoints > 0);

      const sortedUsers = topUsers.sort((a, b) => b.totalPoints - a.totalPoints);

      res.status(200).json({ topUsers: sortedUsers });
    } catch (error) {
      res
        .status(500)
        .json({ error: "An error occurred while fetching the top users." });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}