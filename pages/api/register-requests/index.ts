import type { NextApiRequest, NextApiResponse } from "next";
import { getSetting, setSetting } from "@/lib/app-storage";
import { readSessionUser } from "@/lib/discord-auth";

export type RegisterRequest = {
  id: string;
  discordUserId: string;
  discordName: string;
  avatarUrl: string;
  name: string;
  gameId: string;
  phone: string;
  recruiter: { id: string; name: string };
  indicated: { id: string; name: string };
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  resolvedAt?: string;
};

const key = "records:register-requests";

async function getRegisterRequests() {
  return (await getSetting<RegisterRequest[]>(key)) || [];
}

export async function saveRegisterRequests(requests: RegisterRequest[]) {
  return setSetting(key, requests);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const status = String(req.query.status || "");
    const requests = await getRegisterRequests();

    res.status(200).json({
      requests: status ? requests.filter((request) => request.status === status) : requests,
    });
    return;
  }

  if (req.method === "POST") {
    const sessionUser = readSessionUser(req);
    const discordUserId = String(req.body?.discordUserId || sessionUser?.id || "");
    const name = String(req.body?.name || "").trim();
    const gameId = String(req.body?.gameId || "").trim();
    const phone = String(req.body?.phone || "").trim();
    const recruiter = req.body?.recruiter;
    const indicated = req.body?.indicated;

    if (!discordUserId || !name || !gameId || !phone || !recruiter?.id || !indicated?.id) {
      res.status(400).json({ error: "Preencha todos os campos do registro." });
      return;
    }

    const requests = await getRegisterRequests();
    const activeRequest = requests.find(
      (request) => request.discordUserId === discordUserId && request.status === "pending",
    );

    if (activeRequest) {
      res.status(409).json({ error: "Voce ja possui um registro pendente na fila de aprovacao." });
      return;
    }

    const request: RegisterRequest = {
      id: `register-${Date.now()}`,
      discordUserId,
      discordName: sessionUser?.displayName || sessionUser?.username || "Discord",
      avatarUrl: sessionUser?.avatarUrl || "",
      name,
      gameId,
      phone,
      recruiter,
      indicated,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    const nextRequests = [request, ...requests];
    await saveRegisterRequests(nextRequests);

    res.status(201).json({ request, requests: nextRequests });
    return;
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).json({ error: "Metodo nao permitido." });
}
