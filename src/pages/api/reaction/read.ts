import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../lib/prisma";

export default async function fetchMintEmote(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const { mintAddress, userId } = req.query;

    if (!mintAddress) {
      return res.status(400).json({ error: "No mintAddress provided" });
    }

    try {
      const mintEmotes = await prisma.mintEmote.findMany({
        where: { 
          mintAddress: Array.isArray(mintAddress) ? mintAddress[0] : mintAddress,
          userId: userId ? (Array.isArray(userId) ? userId[0] : userId) : undefined
        },
        include: {
          emote: true
        }
      });

      return res.status(200).json({ mintEmotes });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: (error as Error).message });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}