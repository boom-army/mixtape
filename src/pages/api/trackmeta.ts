import { NextApiRequest, NextApiResponse } from "next";
import ytdl from "@distube/ytdl-core";
import { removeOfficialVideoText } from "../../utils/tracks";

const trackmeta = async (req: NextApiRequest, res: NextApiResponse) => {
  const urlsParam = req.query.urls as string;
  const urls = urlsParam ? urlsParam.split(",").map(decodeURIComponent) : [];

  if (!urls || urls.length === 0) {
    return res.status(400).json({ error: "URLs are required" });
  }

  try {
    const metaList = [];

    for (const url of urls) {
      const videoInfo = await ytdl.getInfo(url);
      const meta = {
        id: videoInfo.videoDetails.videoId,
        title: removeOfficialVideoText(videoInfo.videoDetails.title),
        lengthSeconds: parseInt(videoInfo.videoDetails.lengthSeconds),
      };

      metaList.push(meta);
    }

    res.status(200).json(metaList);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Failed to get video details", details: error instanceof Error ? error.message : "Unknown error" });
  }
};

export default trackmeta;
