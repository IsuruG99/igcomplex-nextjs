# IGComplex Reset
## Context
- Main portfolio for work, plus a few private tools when I am signed in, such as the gacha tracker.
- This is no longer a Django migration project. The old Django app was an experiment and can be ignored for compatibility purposes.
- The target is a clean Next.js and Vercel-first portfolio that is understandable, maintainable, and small enough to reason about.
- Supabase stays in scope for auth, storage, and optionally content data, but the schema can be redesigned from scratch.
- Cloudflare R2 is out of scope. Supabase Storage is the only asset backend for now.
- Docker and later Supabase Terraform can still be added for practice, but they should support the Next.js app rather than preserve old structure.

## Product Direction
- Build the public site as a real Next.js App Router application, not as a port of Django templates.
- Keep the personal and technical tone, but redesign the structure in a Next.js-native way.
- Value simplicity, readability, documentation, and code that I can actually understand and extend.
- Prefer one canonical content shape end-to-end. Avoid translation layers that only exist because of old Django models.
- Use the smallest protected editing surface that solves the real need: simple add, edit, delete flows when signed in.
- Keep dependencies and file count under control. Split files by responsibility only when that genuinely improves clarity.
- Adjust Dockerfile, Dockerfile.dev, compose.dev.yml, README.md, .gitignore, env file, tsconfig, next-env.d.ts, next.config.ts, eslint.config.mjs, and package.json only when they support this cleaner direction.
- Keep Tailwind, Next.js, and security practices current, but do not add complexity just because the stack allows it.
- Provide an `.env.example` that reflects the actual runtime contract for the Next.js app.

## Related Important File Paths
- Dockerfile
- Dockerfile.dev
- eslint.config.mjs
- middleware.ts
- next.config.ts
- .env
- src/lib/env.ts

## Content And Data Principles
- No Django database compatibility is required.
- The Django project folder is archival reference only.
- If Supabase Postgres is used for public content, redesign the schema to be app-native and easier to reason about.
- Prefer arrays or JSON for multi-value content rather than newline or comma parsing when the schema is under our control.
- Keep storage paths simple and predictable. Use Supabase Storage directly without extra compatibility layers.

## Protected Area Principles
- Authentication should stay small and understandable.
- Authorization should be explicit and easy to audit.
- The protected area should feel like a lightweight internal tool, not a clone of Django admin.

## Frontend Principles
- Preserve tone, not template structure.
- Use Next.js strengths naturally: App Router, Server Components by default, client components only where interaction is real.
- Avoid copy that describes the app as a migration project unless it appears in an intentional article.
- Design for clarity first. Style should feel deliberate, but the code should remain easy to follow.

## Noted Problems (PRIORITY)
- Restore the terminal-style directory labels where they belong, including `// DIRECTORY: /home/igcomplex/cv`, because that is part of the site's visual identity.
- Preserve the established visual language: square edges, dark theme, and the red/cyan accent treatment.
- Public-page copy must stay concise, portfolio-appropriate, and close in tone to the original Django templates in `django-project-to-import/templates/`.
- Remove verbose or AI-sounding copy that reads like implementation guidance instead of portfolio content.
- Keep the route and naming expectations grounded in the original site structure. The blog page is a blog, not a generic writing or essays page.
- When reworking public pages, check them against the original Django templates so the final result keeps the original content intent even if the layout is modernized.

## Noted Simplifications (PRIORITY)
- Keep the `src/lib` layer small and easy to explain. Utilities should exist only when they remove real duplication or isolate real infrastructure concerns.
- Avoid database-migration-tier complexity for a simple portfolio. Prefer direct, readable data flow over layered abstractions.
- Every abstraction should be easy to justify in plain terms. If a file or helper would be hard to explain to a fresh graduate maintaining this app, simplify it.
- Do not introduce extra content concepts that the portfolio does not need. Avoid invented sections such as a separate "notes and essays" framing when the original site only needs a blog.
- Prefer sticking closely to the original Django page contents unless there is a clear product reason to change them.
- When simplifying, favor fewer concepts, fewer translation layers, and smaller files over architectural completeness.

## Testing And Finalizing Any Changes
### Core Principles
- Leverage Next.js strengths where they fit naturally (caching, ISR, Partial Prerendering, edge runtime, Server Components, etc.).
- For hot paths or data-heavy code, consider V8 runtime costs: allocations, GC pressure, and memory layout.
- Always evaluate per-request cost × expected traffic. Measure before deep optimizations.
- Minimize dependencies and bundle size. Flag scalability risks early.
### Final Checks
- Thoroughly check functional edge cases (unusual inputs, error states, missed requirements, boundary conditions).
- Apply performance and scale optimizations only where they matter (high traffic, spikes, slow clients, large payloads).
- Suggest profiling: React Profiler, bundle analyzer, Lighthouse, flame graphs.
- Default to readable and maintainable code unless profiling justifies otherwise.
- Perform final lint and type checks.

## Post Backend Simplification (Phases 0–5 Complete) — Next Possible Plans & Edge Case Fixes

**Status as of 2026-05**: Major backend simplification effort completed. The following were achieved while strictly following the principles in this document:

- Removed Django-era translation layers (`content-model.ts`, row normalizers, `split*` string parsers).
- Removed raw `pg` Pool + `database.ts` layer; unified on Supabase client for all content reads.
- `src/lib` reduced to a small, justifiable surface (~8 focused modules). Every export has a one-sentence justification in `src/lib/README.md`.
- Simpler direct asset upload + best-effort cleanup pattern proven on the projects entity (create/update/delete).
- CV page terminal breadcrumb fixed (`// DIRECTORY: /home/igcomplex/cv`).
- Public page copy and tone audited against original Django templates — already very faithful; minimal drift found.
- `.env.example` updated to reflect the current Supabase-first runtime contract.
- Strong guardrails added (`content-data.ts` guard comment + living README).

### Recommended Next Work (Prioritized)

1. **Migrate remaining entities to the simpler asset pattern** (articles, gacha/tracker, CV upload)
   - The direct pattern (upload → DB → best-effort cleanup) has been validated on projects.
   - Once complete, `storage-admin.ts` + `PreparedAssetMutation` can likely be deleted or drastically reduced.

2. **Final cleanup pass**
   - Remove or fully deprecate `hasDatabaseUrl` + any remaining `DATABASE_URL` references in docs/code.
   - Evaluate whether `storage-admin.ts` should stay at all after the other entities are migrated.

3. **Light documentation / polish**
   - Consider moving seeded data in `site-content.ts` into a colocated `data/` folder only if it improves clarity (current state is acceptable).
   - Keep the `src/lib/README.md` honest after any future changes.

### Edge Cases & Observations from the Simplification Effort

- The original Supabase Postgres schema was already clean (native `text[]` arrays). Most of the bloat existed only in the application layer as a port of old Django string-based storage.
- Public pages (`/projects`, `/blog`, project detail) were already very close in tone and structure to the Django templates. The main explicit visual identity gap was the CV breadcrumb (now fixed).
- The simpler asset pattern introduces a small increase in "orphan file" risk on catastrophic failure, but this is acceptable for a personal portfolio and dramatically reduces cognitive load.
- Workspace editing surface is now noticeably lighter for the most active domain (projects). The remaining entities are the last piece of the old heavier pattern.
- No behavior change was introduced for public visitors or signed-in editing flows during the multi-phase refactor (verified after every step).

### Guardrails Going Forward

- Any new file added to `src/lib` must be justified in one sentence in the README.
- Prefer extending the direct Supabase + seeded pattern over introducing new mappers or repositories.
- When in doubt about asset handling, prefer the simpler direct pattern proven in Phase 4 over re-introducing two-phase commit machinery.

This section records the successful execution of the backend reset direction described in the earlier parts of this document. Future changes should continue in the same spirit: small, understandable, and faithful to the original site tone and visual identity.
