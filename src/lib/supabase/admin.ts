import "server-only";

import { createClient } from "@supabase/supabase-js";

import { appEnv, hasSupabaseServiceRoleEnv } from "../env";

export function createSupabaseAdminClient() {
  if (!hasSupabaseServiceRoleEnv()) {
    return null;
  }

  return createClient(appEnv.nextPublicSupabaseUrl, appEnv.supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}