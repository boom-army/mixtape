import prisma from "../../../lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";
import ytdl from "@distube/ytdl-core";
import { AwardType } from "../../types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { url, publicKey, mintAddress } = req.query as {
    url: string;
    publicKey: string | undefined;
    mintAddress: string;
  };
  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  if (mintAddress) {
    try {
      let data: any = {
        points: 1,
        mintAddress,
        awardedId: AwardType.STREAM,
      };
      if (publicKey) {
        data = {
          ...data,
          userId: publicKey,
        };
      }
      await prisma.points.create({ data });
    } catch (error) {
      console.log("streaming points error", error);
    }
  }

  try {
    const info = await ytdl.getInfo(url);
    const format = ytdl.chooseFormat(info.formats, { quality: "highestaudio" });

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Disposition", "attachment");

    const stream = ytdl.downloadFromInfo(info, { format: format });

    stream.on("error", (error) => {
      console.error(error);
      res.status(500).json({ error: "Failed to stream video" });
    });

    res.on("close", () => {
      stream.destroy();
    });

    stream.pipe(res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch video info" });
  }
}
