import { NextApiRequest, NextApiResponse } from "next";
import ytdl from "@distube/ytdl-core";

const stream = (req: NextApiRequest, res: NextApiResponse) => {
  const url = req.query.url as string;  
  if (!url) {
    return res.status(400).json({ error: "URL is required" });
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
