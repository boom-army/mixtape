import dayjs from "dayjs";
import prisma from "../../../lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function activeTemplates(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const nftTemplates = await prisma.nftTemplate.findMany({
      where: {
        status: "active",
      },
      include: {
        mints: true,
      },
    });
    const nftTemplatesWithMintCount = nftTemplates.map((template) => {
      const { mints, ...rest } = template;
      const isExpired = dayjs().isAfter(dayjs(rest.endDate));
      return {
        ...rest,
        mintCount: mints.length,
        isExpired,
      };
    });

    res.status(200).json({ nftTemplates: nftTemplatesWithMintCount });
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
