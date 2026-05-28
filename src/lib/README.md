# src/lib — Design Intent
This directory exists **only** to support the smallest possible, understandable surface area for the IGComplex portfolio.

## env.ts
- `appEnv` + `hasSupabasePublicEnv`, `hasSupabaseServiceRoleEnv`, `hasWorkspaceAccessRestrictions` (and the legacy `hasDatabaseUrl` for now) 
- Single source of truth for all environment-derived configuration and capability flags. Required by almost every other module.
## supabase/{server, browser, admin}.ts
- `createSupabaseServerClient`, `createSupabaseBrowserClient`, `createSupabaseAdminClient` 
- Standard, minimal wrappers around the official Supabase SSR and JS clients. One per execution context. No business logic.
## storage.ts
- `resolveStorageAsset`, `extractStoragePath`, `appendExtension` 
- Tiny, pure utilities for turning storage paths into public URLs and handling file extensions. Used by content reads and workspace asset handling.
## auth.ts
- `getLoginHref`, `getCurrentUser`, `requireUser`, `requireWorkspaceUser`
- Thin, explicit auth helpers built on top of the Supabase server client. Keeps protected routes and workspace requirements easy to audit.
## workspace-access.ts
- `getWorkspaceRoles`, `isWorkspaceAuthorized` 
- Small, self-contained authorization logic using email / user id / role claims. Explicit and auditable (no magic admin surface).
- Together with auth.ts, provides a safe place for workspace
## content-data.ts
- `getProjects`, `getProjectById`, `getArticles`, `getGachaGames`, `getSiteProfile`, `getAcademicHistory`, `getSkillGroups`, `getCvUrl` 
- The single place the public site gets content. Direct Supabase reads + seeded fallback + unstable_cache. Guard comment at top. This is the canonical content surface.
## site-content.ts
- Type definitions (`Project`, `Article`, `GachaGame`, etc.) + static seeded data + `getCvDownloadUrl` — Provides the canonical TypeScript shapes and fallback data when Supabase is unavailable or empty. 
- Types are the contract & seeds are a convenience.
## storage-admin.ts
- `cleanupStoragePaths`, `uploadStorageFile`, `prepareAssetMutation`, `finalizePreparedAssets`, `rollbackPreparedAssets`, `PreparedAssetMutation`
- Currently used by the remaining article/gacha/CV workspace flows.



