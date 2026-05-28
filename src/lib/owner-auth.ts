import "server-only";
import bcrypt from "bcryptjs";

const encoder = new TextEncoder();

function getSecret() {
  const s = process.env.OWNER_SESSION_SECRET;
  if (!s || s.length < 16) {
    throw new Error("OWNER_SESSION_SECRET must be set to a long random string");
  }
  return s;
}

async function hmac(data: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return Buffer.from(sig).toString("base64url");
}

export async function verifyOwnerCredentials(_username: string, password: string) {
  const configuredUsername = String(process.env.OWNER_USERNAME ?? "").trim();
  const hash = process.env.OWNER_PASSWORD_HASH;
  const username = String(_username ?? "").trim();

  if (!configuredUsername || !hash || !username) {
    return false;
  }

  if (username !== configuredUsername) {
    return false;
  }

  return bcrypt.compareSync(password, hash);
}

export async function createOwnerSession(username: string) {
  const exp = Date.now() + 1000 * 60 * 60 * 24 * 30; // 30 days
  const payload = `${username}:${exp}`;
  const sig = await hmac(payload);
  return `${payload}.${sig}`;
}

export async function parseOwnerSession(cookie: string | undefined) {
  if (!cookie) return null;
  const [payload, sig] = cookie.split(".");
  if (!payload || !sig) return null;
  const expected = await hmac(payload);
  if (sig !== expected) return null;

  const [username, expStr] = payload.split(":");
  if (!username || !expStr) return null;
  if (Date.now() > Number(expStr)) return null;

  return { username };
}

export function ownerSessionCookieName() {
  return "igc_owner";
}
