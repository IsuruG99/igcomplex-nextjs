import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { appEnv, hasSupabasePublicEnv } from "../env";

export async function createSupabaseServerClient() {
  if (!hasSupabasePublicEnv()) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(appEnv.nextPublicSupabaseUrl, appEnv.nextPublicSupabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, options, value }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Cookie writes can fail in read-only render contexts and will be handled by the caller later.
        }
      },
    },
  });
}