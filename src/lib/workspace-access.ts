// DEPRECATED: owner-only custom auth (see owner-auth.ts) replaced the Supabase + allowlist model.
import type { User } from "@supabase/supabase-js";

import { appEnv, hasWorkspaceAccessRestrictions } from "./env";

type WorkspaceUser = Pick<User, "app_metadata" | "email" | "id" | "user_metadata">;

function normalizeValue(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function toRoleList(value: unknown) {
  if (typeof value === "string") {
    return [normalizeValue(value)].filter(Boolean);
  }

  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => normalizeValue(item))
    .filter(Boolean);
}

export function getWorkspaceRoles(user: WorkspaceUser | null | undefined) {
  const roles = new Set<string>();

  for (const role of [
    ...toRoleList(user?.app_metadata?.role),
    ...toRoleList(user?.app_metadata?.roles),
    ...toRoleList(user?.user_metadata?.role),
    ...toRoleList(user?.user_metadata?.roles),
  ]) {
    roles.add(role);
  }

  return [...roles];
}

export function isWorkspaceAuthorized(user: WorkspaceUser | null | undefined) {
  if (!user) {
    return false;
  }

  if (!hasWorkspaceAccessRestrictions()) {
    return true;
  }

  const userId = normalizeValue(user.id);
  const email = normalizeValue(user.email);

  if (userId && appEnv.workspaceAccess.allowedUserIds.includes(userId)) {
    return true;
  }

  if (email && appEnv.workspaceAccess.allowedEmails.includes(email)) {
    return true;
  }

  const roles = getWorkspaceRoles(user);
  return roles.some((role) => appEnv.workspaceAccess.allowedRoles.includes(role));
}