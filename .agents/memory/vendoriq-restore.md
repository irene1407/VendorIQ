---
name: VendorIQ restore from zip backup
description: Lessons from restoring a full pre-existing multi-artifact project (backed up as a zip) into a fresh Replit workspace scaffold.
---

When a user uploads a zip containing a full backup of "this exact project" (matching artifact IDs), the restore is a straight file copy per artifact/lib, not a rebuild:

- Re-create each artifact via the normal artifact creation flow first (to get workflow/port wiring), then overwrite its scaffolded `src/`, `package.json` deps, etc. with the extracted content. Keep the scaffold's own `vite.config.ts`/`tsconfig.json` when they only differ in quote style or add `incremental`/`tsBuildInfoFile` — those are scaffold improvements, not regressions.
- After restoring `lib/api-spec/openapi.yaml`, `lib/db/src/schema/*`, and `artifacts/api-server/src/*`, still run the normal codegen → db push → install pipeline; nothing is auto-wired just because files exist on disk.

**Why:** the project-search/artifact IDs matching doesn't mean the environment matches — dependencies, DB, and generated code all need to be regenerated from the restored source of truth files.

**How to apply:** treat a "restore this project" request as: (1) copy source files per package, (2) `pnpm install`, (3) `pnpm --filter @workspace/api-spec run codegen`, (4) `checkDatabase`/`createDatabase` + `pnpm --filter @workspace/db run push`, (5) restart workflows, (6) screenshot-verify key flows before declaring done.

## react-query 5.101.x + Orval-generated hooks: queryKey type error

Orval-generated hooks like `useGetContract(id, { query: { enabled: !!id } })` can fail `tsc` with "Property 'queryKey' is missing" once `@tanstack/react-query` resolves to 5.101.x, even though the runtime works fine (the generated `getXQueryOptions` helper fills in `queryKey` internally before calling `useQuery`).

**Why:** newer `UseBaseQueryOptions` requires `queryKey` in its type when passed as a standalone object; the generated Orval consumer code only casts the *return value*, not the *options a page passes in*, so the caller-side object literal fails the strict UseQueryOptions type even though it's spread with a real `queryKey` before being handed to `useQuery`.

**How to apply:** this is a pre-existing type-only issue independent of any file changes — it doesn't affect the Vite dev/build (no tsc in that path). Don't spend time "fixing" every page for this; note it and move on unless the user specifically needs a clean `pnpm run typecheck`.
