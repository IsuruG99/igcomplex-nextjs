type AppEnv = {
  nextPublicCvUrl: string;
  nextPublicSiteUrl: string;
  nextPublicSupabaseAnonKey: string;
  nextPublicSupabaseUrl: string;
  supabaseServiceRoleKey: string;
  storageBuckets: {
    media: string;
  };
};

function normalizeSupabaseUrl(value: string | undefined) {
  const rawValue = String(value ?? "").trim();

  if (!rawValue) {
    return "";
  }

  try {
    const parsed = new URL(rawValue);

    if (parsed.hostname.endsWith(".storage.supabase.co")) {
      const projectRef = parsed.hostname.replace(/\.storage\.supabase\.co$/, "");
      return `${parsed.protocol}//${projectRef}.supabase.co`;
    }

    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return rawValue.replace(/\/+$/, "");
  }
}

export const appEnv: AppEnv = {
  nextPublicCvUrl: process.env.NEXT_PUBLIC_CV_URL ?? "",
  nextPublicSiteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  nextPublicSupabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  nextPublicSupabaseUrl: normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL),
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  storageBuckets: {
    media: process.env.SUPABASE_STORAGE_BUCKET_MEDIA ?? "media",
  },
};

export function hasOwnerAuthEnv() {
  return (
    String(process.env.OWNER_USERNAME ?? "").trim().length > 0 &&
    String(process.env.OWNER_PASSWORD_HASH ?? "").trim().length > 0 &&
    String(process.env.OWNER_SESSION_SECRET ?? "").trim().length >= 16
  );
}

export function hasSupabasePublicEnv() {
  return appEnv.nextPublicSupabaseUrl.length > 0 && appEnv.nextPublicSupabaseAnonKey.length > 0;
}

export function hasSupabaseServiceRoleEnv() {
  return hasSupabasePublicEnv() && appEnv.supabaseServiceRoleKey.length > 0;
}

