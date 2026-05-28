# IGComplex
Personal portfolio and small private-tools app.

## Current Scope
- Public home page, projects archive, project detail pages, blog feed, and CV page live under the App Router.
- Signed-in users can access a private hub, tracker, and a lightweight workspace.
- Supabase handles auth and storage, and may continue to back content data with a simplified schema.
- The codebase is being actively simplified so public content and protected mutations share one app-native model instead of legacy translation layers.

## Local Development
1. Install dependencies.
```bash
npm ci
```
2. Create a local environment file from the example and fill in the values you actually need.
```bash
cp .env.example .env
```
3. Start the development server.
```bash
npm run dev
```
4. Validate the project when making changes.
```bash
npm run lint
npm run typecheck
```
## Environment Variables
The repo now expects a clean Next.js-oriented env contract. Keep public and server-only values separate.
- `NEXT_PUBLIC_SITE_URL`: canonical site URL for metadata or absolute links.
- `NEXT_PUBLIC_CV_URL`: optional public URL for the CV PDF while storage wiring is in progress.
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL for browser-safe reads and auth.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: browser-safe anonymous key.
- `SUPABASE_SERVICE_ROLE_KEY`: server-only key for protected mutations.
- `SUPABASE_STORAGE_BUCKET_MEDIA`: storage bucket name.
### Login Creds 
(If it is me, i'd have env variable access, this checks that)
- `OWNER_USERNAME`: additional check (if it is me, i'd have env variable access, ).
- `OWNER_PASSWORD_HASH`: bcrypted password hash, additional check for database stored user password.

## Deployment Notes
- The app uses App Router and standalone output so the existing Docker flow remains usable for local or self-hosted experiments.
- Vercel should remain the primary deployment target.
- Avoid adding dynamic content or long-running background dependencies to maintain vercel-friendliness.