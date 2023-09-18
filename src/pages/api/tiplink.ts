import prisma from "../../../lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function tiplink(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { userId, mintAddress, tipLink, signature } = req.body;

    const mintData = await prisma.mint.findUnique({
      where: {
        mintAddress: mintAddress,
      },
      include: {
        user: true,
      },
    });

    if (!mintData || mintData.user.id !== userId) {
      return res.status(404).json({ error: "Mint not found for this user" });
    }

    const mint = await prisma.mint.findUnique({
      where: { mintAddress },
    });

    if (!mint) {
      return res.status(404).json({ error: "Mint not found" });
    }

    const newTipLink = await prisma.tipLink.create({
      data: {
        tipLink,
        signature,
        mintId: mint.id,
      },
    });

    return res.status(200).json(newTipLink);
  } else if (req.method === "GET") {
    const { mintAddress } = req.query;
    if (!mintAddress) {
      return res.status(400).json({ error: "Incorrect mintAddress" });
    }

    const tipLinkData = await prisma.tipLink.findMany({
      where: {
        mint: {
          mintAddress: mintAddress as string,
        },
      },
      include: {
        mint: true,
      },
    });
    if (!tipLinkData) {
      return res.status(404).json({ error: "TipLink not found for this mint" });
    }
    return res.status(200).json({ tipLinkData });
  } else {
    res.setHeader("Allow", ["POST", "GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
