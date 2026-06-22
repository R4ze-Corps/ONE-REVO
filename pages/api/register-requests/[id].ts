import type { NextApiRequest, NextApiResponse } from "next";
import { getSetting } from "@/lib/app-storage";
import { getSavedBotCredentials } from "@/lib/discord-api";
import { type RegisterRequest, saveRegisterRequests } from "./index";

const key = "records:register-requests";

type RegisterSettings = {
  guildId: string;
  roles: {
    entry?: { id: string; name: string };
    member?: { id: string; name: string };
    mention?: { id: string; name: string };
  };
};

async function getRegisterRequests() {
  return (await getSetting<RegisterRequest[]>(key)) || [];
}

async function getRegisterSettings(guildId: string) {
  return getSetting<RegisterSettings>(`register-settings:${guildId || "default"}`);
}

function normalizeBotToken(token = "") {
  return token.startsWith("Bot ") ? token : `Bot ${token}`;
}

async function discordRequest(
  path: string,
  token: string,
  init: Omit<RequestInit, "headers"> & { body?: string } = {},
) {
  const response = await fetch(`https://discord.com/api/v10${path}`, {
    ...init,
    headers: {
      Authorization: normalizeBotToken(token),
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.message || `Discord retornou erro ${response.status}.`);
  }
}

async function syncApprovedRegistrationOnDiscord(request: RegisterRequest) {
  const credentials = await getSavedBotCredentials();
  const guildId = credentials.guildId || process.env.DISCORD_GUILD_ID || "";
  const botToken = credentials.discordToken || process.env.DISCORD_BOT_TOKEN || "";
  const warnings: string[] = [];

  if (!guildId || !botToken) {
    return ["Token do bot ou ID do servidor nao configurado."];
  }

  const settings = await getRegisterSettings(guildId);
  const nickname = `${request.gameId} | ${request.name}`.slice(0, 32);

  try {
    await discordRequest(
      `/guilds/${guildId}/members/${request.discordUserId}`,
      botToken,
      {
        method: "PATCH",
        body: JSON.stringify({ nick: nickname }),
      },
    );
  } catch (error) {
    warnings.push(error instanceof Error ? `Apelido: ${error.message}` : "Nao foi possivel alterar o apelido.");
  }

  for (const role of [settings?.roles?.member, settings?.roles?.mention]) {
    if (!role?.id) continue;
    try {
      await discordRequest(
        `/guilds/${guildId}/members/${request.discordUserId}/roles/${role.id}`,
        botToken,
        { method: "PUT" },
      );
    } catch (error) {
      warnings.push(error instanceof Error ? `Cargo ${role.name}: ${error.message}` : `Nao foi possivel aplicar ${role.name}.`);
    }
  }

  if (settings?.roles?.entry?.id) {
    try {
      await discordRequest(
        `/guilds/${guildId}/members/${request.discordUserId}/roles/${settings.roles.entry.id}`,
        botToken,
        { method: "DELETE" },
      );
    } catch (error) {
      warnings.push(error instanceof Error ? `Remover ${settings.roles.entry.name}: ${error.message}` : `Nao foi possivel remover ${settings.roles.entry.name}.`);
    }
  }

  return warnings;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PATCH") {
    res.setHeader("Allow", ["PATCH"]);
    res.status(405).json({ error: "Metodo nao permitido." });
    return;
  }

  const requestId = String(req.query.id || "");
  const action = String(req.body?.action || "");
  const nextStatus = action === "approve" || action === "approved"
    ? "approved"
    : action === "reject" || action === "rejected"
      ? "rejected"
      : "";

  if (!requestId || !nextStatus) {
    res.status(400).json({ error: "Informe uma acao valida para o registro." });
    return;
  }

  const requests = await getRegisterRequests();
  const request = requests.find((item) => item.id === requestId);

  if (!request) {
    res.status(404).json({ error: "Registro nao encontrado." });
    return;
  }

  if (request.status !== "pending") {
    res.status(409).json({ error: "Esse registro ja foi resolvido." });
    return;
  }

  const updatedRequest: RegisterRequest = {
    ...request,
    status: nextStatus,
    resolvedAt: new Date().toISOString(),
  };
  const nextRequests = requests.map((item) => (item.id === requestId ? updatedRequest : item));
  await saveRegisterRequests(nextRequests);

  const warnings = nextStatus === "approved"
    ? await syncApprovedRegistrationOnDiscord(updatedRequest)
    : [];

  res.status(200).json({ request: updatedRequest, requests: nextRequests, warnings });
}
