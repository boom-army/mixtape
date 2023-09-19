import prisma from "../../../lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function createTiplink(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { userId, mintAddress, tipLink, signature } = req.body;

    const mintData = await prisma.mint.findUnique({
      where: {
        mintAddress: mintAddress,
      }
    });

    if (!mintData) {
      return res.status(404).json({ error: "Mint not found for this NFT" });
    }

    const mint = await prisma.mint.findFirst({
      where: { mintAddress },
    });

    if (!mint) {
      return res.status(404).json({ error: "Mint not found" });
    }

    const newTipLink = await prisma.tipLink.create({
      data: {
        tipLink,
        signature,
        mintAddress,
        sender: userId,
      },
    });

    return res.status(200).json({ tipLinkData: newTipLink });
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
