import prisma from "../../../lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";
import ytdl from "@distube/ytdl-core";

const stream = async (req: NextApiRequest, res: NextApiResponse) => {
  const url = req.query.url as string;
  const publicKey = req.query.publicKey as string;
  const mintAddress = req.query.mintAddress as string;
  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  if (publicKey && mintAddress) {
    try {
      await prisma.points.create({
        data: {
          points: 1,
          userId: publicKey,
          mintAddress,
          awardedId: "stream",
        },
      })
    } catch (error) {
      console.log("streaming points error", error);
    }
  }

  res.setHeader("Content-Type", "audio/mpeg");
  ytdl(url, { filter: "audioonly" })
    .pipe(res)
    .on("error", (error) => {
      console.error(error);
      res.status(500).end();
    });
};

export default stream;
