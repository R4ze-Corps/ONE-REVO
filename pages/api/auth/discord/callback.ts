import type { NextApiRequest, NextApiResponse } from "next";
import {
  discordStateCookie,
  exchangeDiscordCode,
  fetchDiscordUser,
  getAuthErrorRedirect,
  setSessionCookie,
} from "@/lib/discord-auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const code = typeof req.query.code === "string" ? req.query.code : "";
  const state = typeof req.query.state === "string" ? req.query.state : "";
  const savedState = req.cookies[discordStateCookie];

  if (!code || !state || !savedState || state !== savedState) {
    res.writeHead(302, {
      Location: getAuthErrorRedirect("Login Discord invalido ou expirado. Tente novamente."),
    });
    res.end();
    return;
  }

  try {
    const accessToken = await exchangeDiscordCode(req, code);
    const user = await fetchDiscordUser(accessToken);

    setSessionCookie(res, user);
    res.writeHead(302, {
      Location: "/design.html?auth=discord",
    });
    res.end();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Nao foi possivel concluir o login Discord.";

    res.writeHead(302, {
      Location: getAuthErrorRedirect(message),
    });
    res.end();
  }
}
