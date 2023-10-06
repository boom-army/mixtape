import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../lib/prisma";

export default async function fetchMintEmote(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const { mintAddress, userId } = req.query;

    if (!mintAddress || !userId) {
      return res.status(400).json({ error: "No mintAddress or userId provided" });
    }

    try {
      const mintEmote = await prisma.mintEmote.findMany({
        where: { 
          mintAddress: mintAddress as string,
          userId: userId as string
        },
        include: {
          emote: true
        }
      });

      return res.status(200).json({ mintEmote });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: (error as Error).message });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}