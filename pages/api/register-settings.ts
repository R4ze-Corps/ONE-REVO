import type { NextApiRequest, NextApiResponse } from "next";
import { getSetting, setSetting } from "@/lib/app-storage";

type RegisterSettings = {
  guildId: string;
  roles: {
    entry: { id: string; name: string };
    member: { id: string; name: string };
    mention: { id: string; name: string };
  };
};

function keyForGuild(guildId: string) {
  return `register-settings:${guildId || "default"}`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const guildId = String(req.query.guildId || "");
    const settings = await getSetting<RegisterSettings>(keyForGuild(guildId));

    res.status(200).json({ settings });
    return;
  }

  if (req.method === "POST") {
    const guildId = String(req.body?.guildId || "");
    const roles = req.body?.roles;

    if (!guildId || !roles?.entry || !roles?.member || !roles?.mention) {
      res.status(400).json({ error: "Informe o servidor e os tres cargos de registro." });
      return;
    }

    const settings = await setSetting<RegisterSettings>(keyForGuild(guildId), {
      guildId,
      roles,
    });

    res.status(200).json({ settings });
    return;
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).json({ error: "Metodo nao permitido." });
}
