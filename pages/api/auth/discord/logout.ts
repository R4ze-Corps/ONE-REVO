import type { NextApiRequest, NextApiResponse } from "next";
import { clearAuthCookies } from "@/lib/discord-auth";

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  clearAuthCookies(res);

  res.writeHead(302, {
    Location: "/design.html",
  });
  res.end();
}
