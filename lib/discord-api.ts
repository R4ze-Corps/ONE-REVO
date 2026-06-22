import { getSetting } from "@/lib/app-storage";

export type BotCredentials = {
  oneToken?: string;
  discordToken?: string;
  guildId?: string;
};

export type DiscordRole = {
  id: string;
  name: string;
  color?: number;
  position?: number;
};

export type DiscordChannel = {
  id: string;
  name: string;
  type: number;
};

type DiscordMember = {
  user?: {
    id: string;
    username: string;
    global_name?: string | null;
    avatar?: string | null;
  };
  nick?: string | null;
  roles?: string[];
};

export function maskToken(token = "") {
  if (!token) {
    return "";
  }

  if (token.length <= 10) {
    return `${token.slice(0, 2)}...`;
  }

  return `${token.slice(0, 6)}...${token.slice(-4)}`;
}

function normalizeBotToken(token = "") {
  const trimmed = token.trim();

  if (!trimmed) {
    return "";
  }

  return trimmed.toLowerCase().startsWith("bot ") ? trimmed : `Bot ${trimmed}`;
}

export async function getSavedBotCredentials() {
  return (await getSetting<BotCredentials>("bot-credentials")) || {};
}

export async function resolveDiscordCredentials(input: {
  botToken?: string;
  guildId?: string;
}) {
  const saved = await getSavedBotCredentials();
  const botToken =
    input.botToken?.trim() ||
    saved.discordToken ||
    process.env.DISCORD_BOT_TOKEN ||
    "";
  const guildId =
    input.guildId?.trim() ||
    saved.guildId ||
    process.env.DISCORD_GUILD_ID ||
    "";

  if (!botToken) {
    throw new Error("Informe e salve o TOKEN DISCORD do bot em Configurar.");
  }

  if (!guildId) {
    throw new Error("Informe e salve o ID do servidor Discord.");
  }

  return {
    botToken: normalizeBotToken(botToken),
    guildId,
  };
}

export async function discordFetch<T>(path: string, botToken: string): Promise<T> {
  const response = await fetch(`https://discord.com/api/v10${path}`, {
    headers: {
      Authorization: botToken,
    },
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      payload?.message ||
      (response.status === 403
        ? "O bot nao tem permissao para acessar esse servidor."
        : "Nao foi possivel consultar o Discord.");
    throw new Error(message);
  }

  return payload as T;
}

export function mapDiscordRole(role: DiscordRole) {
  return {
    id: role.id,
    name: role.name,
    color: role.color || 0,
    position: role.position || 0,
  };
}

export function mapDiscordChannel(channel: DiscordChannel) {
  return {
    id: channel.id,
    name: channel.name,
    type: channel.type,
  };
}

export function mapDiscordMember(member: DiscordMember, roles: DiscordRole[] = []) {
  const user = member.user;
  const displayName = member.nick || user?.global_name || user?.username || "Usuario";
  const roleIds = member.roles || [];
  const roleNames = roleIds
    .map((roleId) => roles.find((role) => role.id === roleId)?.name)
    .filter(Boolean);
  const highestRole = roleIds
    .map((roleId) => roles.find((role) => role.id === roleId))
    .filter(Boolean)
    .sort((a, b) => (b?.position || 0) - (a?.position || 0))[0];

  return {
    id: user?.id || "",
    name: displayName,
    username: user?.username || displayName,
    avatarUrl:
      user?.avatar && user?.id
        ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`
        : "",
    roles: roleIds,
    roleNames,
    highestRoleName: highestRole?.name || roleNames[0] || "Membro",
  };
}
