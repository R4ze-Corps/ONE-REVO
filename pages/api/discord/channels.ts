import type { NextApiRequest, NextApiResponse } from "next";
import {
  discordFetch,
  mapDiscordChannel,
  resolveDiscordCredentials,
  type DiscordChannel,
} from "@/lib/discord-api";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST" && req.method !== "GET") {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).json({ error: "Metodo nao permitido." });
    return;
  }

  try {
    const { botToken, guildId } = await resolveDiscordCredentials({
      botToken: req.body?.botToken,
      guildId: req.body?.guildId || String(req.query.guildId || ""),
    });
    const channels = await discordFetch<DiscordChannel[]>(`/guilds/${guildId}/channels`, botToken);

    res.status(200).json({
      channels: channels
        .filter((channel) => channel.type === 0 || channel.type === 5)
        .map(mapDiscordChannel)
        .sort((a, b) => a.name.localeCompare(b.name)),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Nao foi possivel carregar os canais.";
    res.status(400).json({ error: message });
  }
}
