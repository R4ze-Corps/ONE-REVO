import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import type { NextApiRequest, NextApiResponse } from "next";

export type DiscordSessionUser = {
  id: string;
  username: string;
  globalName?: string | null;
  displayName: string;
  avatarUrl: string;
};

type DiscordApiUser = {
  id: string;
  username: string;
  global_name?: string | null;
  avatar?: string | null;
  discriminator?: string;
};

export const discordSessionCookie = "one_discord_user";
export const discordStateCookie = "one_discord_oauth_state";

const sessionMaxAge = 60 * 60 * 24 * 7;

function base64Url(input: Buffer | string) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function getSessionSecret() {
  return (
    process.env.DISCORD_SESSION_SECRET ||
    process.env.DISCORD_CLIENT_SECRET ||
    "one-core-local-session-secret"
  );
}

function sign(value: string) {
  return base64Url(createHmac("sha256", getSessionSecret()).update(value).digest());
}

function verifySignature(value: string, signature: string) {
  const expected = sign(value);
  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature);

  if (expectedBuffer.length !== signatureBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, signatureBuffer);
}

function serializeCookie(
  name: string,
  value: string,
  options: { maxAge?: number; httpOnly?: boolean } = {},
) {
  const parts = [
    `${name}=${value}`,
    "Path=/",
    "SameSite=Lax",
  ];

  if (options.httpOnly !== false) {
    parts.push("HttpOnly");
  }

  if (process.env.NODE_ENV === "production") {
    parts.push("Secure");
  }

  if (typeof options.maxAge === "number") {
    parts.push(`Max-Age=${options.maxAge}`);
  }

  return parts.join("; ");
}

export function createOAuthState() {
  return base64Url(randomBytes(32));
}

export function setOAuthStateCookie(res: NextApiResponse, state: string) {
  res.setHeader("Set-Cookie", [
    serializeCookie(discordStateCookie, state, { maxAge: 60 * 10 }),
  ]);
}

export function clearAuthCookies(res: NextApiResponse) {
  res.setHeader("Set-Cookie", [
    serializeCookie(discordSessionCookie, "", { maxAge: 0 }),
    serializeCookie(discordStateCookie, "", { maxAge: 0 }),
  ]);
}

export function setSessionCookie(res: NextApiResponse, user: DiscordSessionUser) {
  const payload = base64Url(JSON.stringify(user));
  const cookieValue = `${payload}.${sign(payload)}`;

  res.setHeader("Set-Cookie", [
    serializeCookie(discordSessionCookie, cookieValue, { maxAge: sessionMaxAge }),
    serializeCookie(discordStateCookie, "", { maxAge: 0 }),
  ]);
}

export function readSessionUser(req: NextApiRequest): DiscordSessionUser | null {
  const rawCookie = req.cookies[discordSessionCookie];

  if (!rawCookie) {
    return null;
  }

  const [payload, signature] = rawCookie.split(".");

  if (!payload || !signature || !verifySignature(payload, signature)) {
    return null;
  }

  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as DiscordSessionUser;
  } catch {
    return null;
  }
}

export function getBaseUrl(req: NextApiRequest) {
  const forwardedHost = req.headers["x-forwarded-host"];
  const hostHeader = Array.isArray(forwardedHost)
    ? forwardedHost[0]
    : forwardedHost || req.headers.host;
  const forwardedProto = req.headers["x-forwarded-proto"];
  const protoHeader = Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto;
  const protocol = protoHeader || (process.env.NODE_ENV === "production" ? "https" : "http");

  return `${protocol}://${hostHeader}`;
}

export function getDiscordRedirectUri(req: NextApiRequest) {
  return (
    process.env.DISCORD_REDIRECT_URI ||
    `${getBaseUrl(req)}/api/auth/discord/callback`
  );
}

export function getDiscordLoginUrl(req: NextApiRequest, state: string) {
  const clientId = process.env.DISCORD_CLIENT_ID;

  if (!clientId) {
    return null;
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: getDiscordRedirectUri(req),
    response_type: "code",
    scope: "identify",
    state,
    prompt: "consent",
  });

  return `https://discord.com/oauth2/authorize?${params.toString()}`;
}

export function getAuthErrorRedirect(message: string) {
  return `/design.html?authError=${encodeURIComponent(message)}`;
}

export async function exchangeDiscordCode(req: NextApiRequest, code: string) {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Configure DISCORD_CLIENT_ID e DISCORD_CLIENT_SECRET.");
  }

  const response = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "authorization_code",
      code,
      redirect_uri: getDiscordRedirectUri(req),
    }),
  });

  const payload = await response.json();

  if (!response.ok || !payload.access_token) {
    throw new Error(payload.error_description || "Nao foi possivel autenticar com o Discord.");
  }

  return String(payload.access_token);
}

export async function fetchDiscordUser(accessToken: string): Promise<DiscordSessionUser> {
  const response = await fetch("https://discord.com/api/users/@me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const user = (await response.json()) as DiscordApiUser;

  if (!response.ok || !user.id) {
    throw new Error("Nao foi possivel buscar o perfil do Discord.");
  }

  const avatarUrl = user.avatar
    ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`
    : "";
  const displayName = user.global_name || user.username;

  return {
    id: user.id,
    username: user.username,
    globalName: user.global_name || null,
    displayName,
    avatarUrl,
  };
}
