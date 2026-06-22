import type { NextApiRequest, NextApiResponse } from "next";
import { getSavedBotCredentials, maskToken, type BotCredentials } from "@/lib/discord-api";
import { setSetting } from "@/lib/app-storage";

function publicCredentials(credentials: BotCredentials) {
  return {
    hasOneToken: Boolean(credentials.oneToken),
    hasDiscordToken: Boolean(credentials.discordToken || process.env.DISCORD_BOT_TOKEN),
    guildId: credentials.guildId || process.env.DISCORD_GUILD_ID || "",
    oneTokenPreview: maskToken(credentials.oneToken),
    discordTokenPreview: maskToken(credentials.discordToken || process.env.DISCORD_BOT_TOKEN),
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const credentials = await getSavedBotCredentials();
    res.status(200).json({ credentials: publicCredentials(credentials) });
    return;
  }

  if (req.method === "POST") {
    const current = await getSavedBotCredentials();
    const body = req.body || {};
    const nextCredentials: BotCredentials = {
      oneToken: body.oneToken?.trim() || current.oneToken || process.env.ONE_TOKEN || "",
      discordToken:
        body.discordToken?.trim() || current.discordToken || process.env.DISCORD_BOT_TOKEN || "",
      guildId: body.guildId?.trim() || current.guildId || process.env.DISCORD_GUILD_ID || "",
    };

    await setSetting("bot-credentials", nextCredentials);
    res.status(200).json({ credentials: publicCredentials(nextCredentials) });
    return;
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).json({ error: "Metodo nao permitido." });
}
