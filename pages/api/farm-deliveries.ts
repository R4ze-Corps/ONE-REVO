import type { NextApiRequest, NextApiResponse } from "next";
import { getSetting, setSetting } from "@/lib/app-storage";

type FarmDelivery = {
  id: string;
  memberId: string;
  memberName: string;
  productId: string;
  productName: string;
  quantity: number;
  mode: string;
  createdAt: string;
};

const key = "records:farm-deliveries";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const deliveries = (await getSetting<FarmDelivery[]>(key)) || [];
    res.status(200).json({ deliveries });
    return;
  }

  if (req.method === "POST") {
    const quantity = Number(req.body?.quantity);

    if (!quantity || quantity <= 0) {
      res.status(400).json({ error: "Informe uma quantidade valida." });
      return;
    }

    const delivery: FarmDelivery = {
      id: `farm-${Date.now()}`,
      memberId: String(req.body?.memberId || ""),
      memberName: String(req.body?.memberName || "Membro"),
      productId: String(req.body?.productId || ""),
      productName: String(req.body?.productName || "Produto"),
      quantity,
      mode: String(req.body?.mode || "self"),
      createdAt: new Date().toISOString(),
    };

    const deliveries = (await getSetting<FarmDelivery[]>(key)) || [];
    const nextDeliveries = [delivery, ...deliveries];
    await setSetting(key, nextDeliveries);
    res.status(201).json({ delivery, deliveries: nextDeliveries });
    return;
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).json({ error: "Metodo nao permitido." });
}
