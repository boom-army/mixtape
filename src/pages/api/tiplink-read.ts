import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";

export default async function readTiplink(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { mintAddress } = req.body;

    if (!mintAddress) {
      return res.status(400).json({ error: "No mintAddress in body" });
    }

    try {
      const tipLinkData = await prisma.tipLink.findFirstOrThrow({
        where: { mintAddress: mintAddress as string },
      });
      return res.status(200).json({ tipLinkData });
    } catch (error) {
      return res.status(404).json({ error: "TipLink not found for this mint" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
