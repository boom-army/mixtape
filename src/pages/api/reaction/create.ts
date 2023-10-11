import prisma from "../../../../lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";
import { AwardType } from "../../../types";

export default async function createReaction(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { userId, emoteId, mintAddress } = req.body;  

  if (!userId || !emoteId || !mintAddress) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: { id: userId },
    });

    const mintEmote = await prisma.$transaction([
      prisma.mintEmote.create({
        data: {
          mintAddress,
          emoteId,
          userId,
        },
        include: {
          emote: true
        }
      }),
      prisma.points.create({
        data: {
          points: 1,
          userId,
          mintAddress,
          awardedId: AwardType.REACT,
        },
      }),
    ]);

    res.json({ mintEmote: mintEmote[0] });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: (error as Error).message });
  }
}
