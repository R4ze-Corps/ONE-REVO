import type { NextApiRequest, NextApiResponse } from "next";
import {
  createOAuthState,
  getAuthErrorRedirect,
  getDiscordLoginUrl,
  setOAuthStateCookie,
} from "@/lib/discord-auth";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const state = createOAuthState();
  const loginUrl = getDiscordLoginUrl(req, state);

  if (!loginUrl) {
    res.writeHead(302, {
      Location: getAuthErrorRedirect("Configure DISCORD_CLIENT_ID para ativar o login Discord."),
    });
    res.end();
    return;
  }

  setOAuthStateCookie(res, state);
  res.writeHead(302, { Location: loginUrl });
  res.end();
}
