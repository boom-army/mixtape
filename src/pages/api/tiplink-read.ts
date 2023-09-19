import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";

export default async function readTiplink(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { mintAddress } = req.query;

    const tipLinkData = await prisma.tipLink.findFirst({
      where: {
        mintId: mintAddress as string,
      },
    });

    if (!tipLinkData) {
      return res.status(404).json({ error: "TipLink not found" });
    }

    return res.status(200).json({ tipLinkData });
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}