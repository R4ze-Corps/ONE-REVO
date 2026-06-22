import type { NextApiRequest, NextApiResponse } from "next";
import { getSetting, setSetting } from "@/lib/app-storage";

const key = "records:promotion-movements";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const movements = (await getSetting<any[]>(key)) || [];
    res.status(200).json({ movements });
    return;
  }

  if (req.method === "POST") {
    const movement = {
      id: `movement-${Date.now()}`,
      type: String(req.body?.type || "promotion"),
      memberId: String(req.body?.memberId || ""),
      memberName: String(req.body?.memberName || "Membro"),
      roleId: String(req.body?.roleId || ""),
      roleName: String(req.body?.roleName || "Cargo"),
      justification: String(req.body?.justification || ""),
      message: String(req.body?.message || ""),
      createdAt: new Date().toISOString(),
    };

    if (!movement.memberId || !movement.roleId || !movement.message) {
      res.status(400).json({ error: "Selecione membro, cargo e gere a mensagem." });
      return;
    }

    const movements = (await getSetting<any[]>(key)) || [];
    const nextMovements = [movement, ...movements];
    await setSetting(key, nextMovements);
    res.status(201).json({ movement, movements: nextMovements });
    return;
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).json({ error: "Metodo nao permitido." });
}
