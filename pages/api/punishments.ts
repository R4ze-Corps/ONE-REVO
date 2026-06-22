import type { NextApiRequest, NextApiResponse } from "next";
import { getSetting, setSetting } from "@/lib/app-storage";
import { getSavedBotCredentials } from "@/lib/discord-api";

type Punishment = {
  id: string;
  memberId: string;
  memberName: string;
  roleId: string;
  roleName: string;
  sanctionLabel: string;
  description: string;
  createdAt: string;
};

const key = "records:punishments";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const punishments = (await getSetting<Punishment[]>(key)) || [];
    res.status(200).json({ punishments });
    return;
  }

  if (req.method === "POST") {
    const punishment: Punishment = {
      id: `punishment-${Date.now()}`,
      memberId: String(req.body?.memberId || ""),
      memberName: String(req.body?.memberName || "Membro"),
      roleId: String(req.body?.roleId || ""),
      roleName: String(req.body?.roleName || "Punição"),
      sanctionLabel: String(req.body?.sanctionLabel || "Punição"),
      description: String(req.body?.description || ""),
      createdAt: new Date().toISOString(),
    };

    if (!punishment.memberId || !punishment.roleId || !punishment.description) {
      res.status(400).json({ error: "Informe membro, sanção e motivo." });
      return;
    }

    const punishments = (await getSetting<Punishment[]>(key)) || [];
    const nextPunishments = [punishment, ...punishments];
    await setSetting(key, nextPunishments);

    try {
      const settings = await getSetting<any>("module-settings:punicoes");
      const credentials = await getSavedBotCredentials();
      const channelId = settings?.logChannel?.id;
      const botToken = credentials.discordToken || process.env.DISCORD_BOT_TOKEN;

      if (channelId && botToken) {
        const token = botToken.startsWith("Bot ") ? botToken : `Bot ${botToken}`;
        await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
          method: "POST",
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: `**Punicao registrada**\nMembro: <@${punishment.memberId}>\nSancao: <@&${punishment.roleId}>\nMotivo: ${punishment.description}`,
          }),
        });
      }
    } catch {
      // O registro continua salvo mesmo se o envio ao Discord falhar.
    }

    res.status(201).json({ punishment, punishments: nextPunishments });
    return;
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).json({ error: "Metodo nao permitido." });
}
