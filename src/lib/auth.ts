import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { parseOwnerSession, ownerSessionCookieName } from "./owner-auth";

type OwnerUser = { username: string };

function buildLoginHref(nextPath: string, message?: string) {
  const searchParams = new URLSearchParams({ next: nextPath });
  if (message) searchParams.set("message", message);
  return `/login?${searchParams.toString()}`;
}

export function getLoginHref(nextPath: string, message?: string) {
  return buildLoginHref(nextPath, message);
}

export async function getCurrentUser(): Promise<OwnerUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ownerSessionCookieName())?.value;
  const owner = await parseOwnerSession(token);
  return owner ? { username: owner.username } : null;
}

export async function requireUser(nextPath: string) {
  const user = await getCurrentUser();
  if (!user) {
    redirect(buildLoginHref(nextPath));
  }
  return user;
}

export async function requireWorkspaceUser(nextPath: string) {
  return requireUser(nextPath);
}