import type { NextApiRequest, NextApiResponse } from "next";
import { getSetting, setSetting } from "@/lib/app-storage";

const allowedModules = new Set([
  "hierarquia",
  "acoes",
  "punicoes",
  "farm",
  "ausencia",
  "promocoes",
  "configurar",
]);

function settingKey(moduleName: string) {
  return `module-settings:${moduleName}`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const moduleName = String(req.query.module || req.body?.module || "");

  if (!allowedModules.has(moduleName)) {
    res.status(400).json({ error: "Modulo invalido." });
    return;
  }

  if (req.method === "GET") {
    const settings = await getSetting(settingKey(moduleName));
    res.status(200).json({ settings });
    return;
  }

  if (req.method === "POST") {
    const settings = await setSetting(settingKey(moduleName), req.body?.settings || {});
    res.status(200).json({ settings });
    return;
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).json({ error: "Metodo nao permitido." });
}
