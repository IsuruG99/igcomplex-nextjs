"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { createOwnerSession, ownerSessionCookieName, verifyOwnerCredentials } from "../../lib/owner-auth";

export type LoginFormState = {
  error?: string;
};

function normalizeNextPath(value: string) {
  if (!value.startsWith("/") || value.startsWith("//")) {
    return "/workspace";
  }
  return value;
}

export async function loginAction(
  _previousState: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const nextPath = normalizeNextPath(String(formData.get("next") ?? "/workspace"));

  if (!password) {
    return { error: "Password is required." };
  }

  const ok = await verifyOwnerCredentials(username, password);
  if (!ok) {
    return { error: "Invalid credentials." };
  }

  const token = await createOwnerSession(username || "owner");
  const cookieStore = await cookies();
  cookieStore.set(ownerSessionCookieName(), token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  redirect(nextPath);
}