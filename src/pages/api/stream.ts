import prisma from "../../../lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";
import ytdl from "@distube/ytdl-core";
import { AwardType } from "../../types";

const stream = async (req: NextApiRequest, res: NextApiResponse) => {
  const { url, publicKey, mintAddress } = req.query as {
    url: string;
    publicKey: string | null;
    mintAddress: string;
  };
  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  if (mintAddress) {
    console.log({
      points: 1,
      userId: publicKey,
      mintAddress,
      awardedId: AwardType.STREAM,
    });

    try {
      await prisma.points.create({
        data: {
          points: 1,
          userId: publicKey,
          mintAddress,
          awardedId: AwardType.STREAM,
        },
      });
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
