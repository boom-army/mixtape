import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const { name, runtime, price, image, releaseDate, endDate, maxSupply, status, password } = req.body;

    if (password !== process.env.NEXT_ADMIN_PASSWORD) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const newTemplate = await prisma.nftTemplate.create({
        data: {
          name,
          runtime,
          price,
          image,
          releaseDate,
          endDate,
          maxSupply,
          status
        },
      });

      return res.status(200).json(newTemplate);
    } catch (error) {
      return res.status(500).json({ error: "Failed to create NFT template", details: error instanceof Error ? error.message : "Unknown error" });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed." });
  }
};

export default handler;