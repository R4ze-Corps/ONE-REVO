import type { NextApiRequest, NextApiResponse } from "next";
import {
  discordFetch,
  mapDiscordRole,
  resolveDiscordCredentials,
  type DiscordRole,
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
    const roles = await discordFetch<DiscordRole[]>(`/guilds/${guildId}/roles`, botToken);

    res.status(200).json({
      roles: roles
        .filter((role) => role.name !== "@everyone")
        .map(mapDiscordRole)
        .sort((a, b) => b.position - a.position),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Nao foi possivel carregar os cargos.";
    res.status(400).json({ error: message });
  }
}
