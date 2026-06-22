import type { NextApiRequest, NextApiResponse } from "next";
import { readSessionUser } from "@/lib/discord-auth";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = readSessionUser(req);

  if (!user) {
    res.status(200).json({ authenticated: false });
    return;
  }

  res.status(200).json({
    authenticated: true,
    user,
  });
}
