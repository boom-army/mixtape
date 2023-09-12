import { NextApiHandler } from "next";

const health: NextApiHandler = async (req: any, res) => {
    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
    });
};

export default health;
