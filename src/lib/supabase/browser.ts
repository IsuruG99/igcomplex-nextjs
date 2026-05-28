import { createBrowserClient } from "@supabase/ssr";

import { appEnv, hasSupabasePublicEnv } from "../env";

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function createSupabaseBrowserClient() {
  if (!hasSupabasePublicEnv()) {
    return null;
  }

  if (!browserClient) {
    browserClient = createBrowserClient(
      appEnv.nextPublicSupabaseUrl,
      appEnv.nextPublicSupabaseAnonKey,
    );
  }

  return browserClient;
}