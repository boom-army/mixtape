import prisma from "../../../lib/prisma";
import { NextApiRequest, NextApiResponse } from 'next';

export default async function activeTemplates(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    const nftTemplates = await prisma.nftTemplate.findMany({
      where: {
        status: 'active',
      },
    });

    res.status(200).json({ nftTemplates });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}