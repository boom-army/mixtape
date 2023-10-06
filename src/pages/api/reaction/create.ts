import prisma from "../../../../lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function createReaction(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { userId, emoteId, mintAddress } = req.body;
  console.log({ userId, emoteId, mintAddress });
  

  if (!userId || !emoteId || !mintAddress) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      await prisma.user.create({
        data: { id: userId },
      });
    }

    await prisma.$transaction([
      prisma.mintEmote.create({
        data: {
          mintAddress,
          emoteId,
          userId,
        },
      }),
      prisma.points.create({
        data: {
          points: 1,
          userId,
          mintAddress,
          awardedId: "reaction",
        },
      }),
    ]);

    res.json({ ok: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: (error as Error).message });
  }
}
