import type { NextApiRequest, NextApiResponse } from "next";
import { getSetting, setSetting } from "@/lib/app-storage";

const key = "module-settings:farm";

const defaultSettings = {
  globalGoal: 100,
  manager: null,
  goalRoles: {
    complete: null,
    incomplete: null,
    noDelivery: null,
    admin: null,
  },
  products: [],
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const settings = (await getSetting(key)) || defaultSettings;
    res.status(200).json({ settings });
    return;
  }

  if (req.method === "POST") {
    const settings = await setSetting(key, {
      ...defaultSettings,
      ...req.body,
      goalRoles: {
        ...defaultSettings.goalRoles,
        ...(req.body?.goalRoles || {}),
      },
    });

    res.status(200).json({ settings });
    return;
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).json({ error: "Metodo nao permitido." });
}
