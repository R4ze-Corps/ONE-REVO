import type { NextApiRequest, NextApiResponse } from "next";
import {
  discordFetch,
  mapDiscordMember,
  resolveDiscordCredentials,
  type DiscordRole,
} from "@/lib/discord-api";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    res.status(405).json({ error: "Metodo nao permitido." });
    return;
  }

  try {
    const { botToken, guildId } = await resolveDiscordCredentials({
      guildId: String(req.query.guildId || ""),
    });
    const [members, roles] = await Promise.all([
      discordFetch<unknown[]>(`/guilds/${guildId}/members?limit=1000`, botToken),
      discordFetch<DiscordRole[]>(`/guilds/${guildId}/roles`, botToken),
    ]);

    res.status(200).json({
      members: members
        .map((member) => mapDiscordMember(member as Parameters<typeof mapDiscordMember>[0], roles))
        .filter((member) => member.id)
        .sort((a, b) => a.name.localeCompare(b.name)),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Nao foi possivel carregar os usuarios.";
    res.status(400).json({ error: message });
  }
}
