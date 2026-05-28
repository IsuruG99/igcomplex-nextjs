import { redirect } from "next/navigation";

import { LoginForm } from "../../components/login-form";
import { getCurrentUser } from "../../lib/auth";
import { hasOwnerAuthEnv } from "../../lib/env";

type LoginPageProps = {
  searchParams: Promise<{
    message?: string;
    next?: string;
  }>;
};

function getLoginMessage(message?: string) {
  if (message === "auth-not-configured") {
    return "Owner auth is not configured yet. Add OWNER_USERNAME, OWNER_PASSWORD_HASH, and OWNER_SESSION_SECRET.";
  }

  return undefined;
}

function normalizeNextPath(nextPath?: string) {
  if (!nextPath || !nextPath.startsWith("/") || nextPath.startsWith("//")) {
    return "/workspace";
  }

  return nextPath;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const nextPath = normalizeNextPath(params.next);
  const user = await getCurrentUser();

  if (user) {
    redirect(nextPath);
  }

  return (
    <div className="login-shell">
      <section className="card login-card">
        <div className="card-stack">
          <div>
            <p className="breadcrumb">{"// SYSTEM_AUTH"}</p>
            <h1 className="headline accent-teal login-card__title">Login</h1>
            <p className="mono label login-card__subtitle">Single-owner env-based auth for private workspace tools.</p>
          </div>
          <LoginForm
            authConfigured={hasOwnerAuthEnv()}
            initialMessage={getLoginMessage(params.message)}
            nextPath={nextPath}
          />
          <p className="mono label login-card__note">
            Owner access only. Use the configured username plus the plain-text password that matches the stored bcrypt hash.
          </p>
        </div>
      </section>
    </div>
  );
}