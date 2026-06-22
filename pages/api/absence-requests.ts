import type { NextApiRequest, NextApiResponse } from "next";
import { getSetting, setSetting } from "@/lib/app-storage";

const key = "records:absence-requests";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const requests = (await getSetting<any[]>(key)) || [];
    res.status(200).json({ requests });
    return;
  }

  if (req.method === "POST") {
    const reason = String(req.body?.reason || "").trim();
    const startDate = String(req.body?.startDate || "");
    const endDate = String(req.body?.endDate || "");

    if (!reason || !startDate || !endDate) {
      res.status(400).json({ error: "Preencha motivo, inicio e termino." });
      return;
    }

    const request = {
      id: `absence-${Date.now()}`,
      userId: String(req.body?.userId || ""),
      userName: String(req.body?.userName || "Usuario"),
      reason,
      startDate,
      endDate,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    const requests = (await getSetting<any[]>(key)) || [];
    const nextRequests = [request, ...requests];
    await setSetting(key, nextRequests);
    res.status(201).json({ request, requests: nextRequests });
    return;
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).json({ error: "Metodo nao permitido." });
}
