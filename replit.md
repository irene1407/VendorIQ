# VendorIQ

Enterprise procurement intelligence SaaS: supplier risk scoring, price forecasting, fraud detection, contract analysis, and an AI Agent Hub copilot for procurement teams.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/vendor-iq` — React + Vite frontend (dashboard, suppliers, risk, forecast, fraud, contracts, graph, news, search, monitoring, experiments, simulation, savings, alerts, AI Agent Hub)
- `artifacts/api-server` — Express API, routes in `src/routes/*` (one file per domain, e.g. `auth.ts`, `agents.ts`)
- `lib/api-spec/openapi.yaml` — source of truth for all API contracts
- `lib/db/src/schema/*` — Drizzle schema (suppliers, contracts, alerts)
- `artifacts/vendor-iq/src/index.css` — theme (black/ivory/grey palette)
- `artifacts/vendor-iq/src/components/layout/Shell.tsx` — app shell/sidebar, including the current-user widget (Name/Role/Company/Online status), backed by `GET /api/auth/me`

## Architecture decisions

- The AI Agent Hub copilot chat (`/agents` page, `POST /api/agents/query`) uses keyword-matched canned responses, not a real LLM — this is intentional demo behavior, not a bug.
- No real authentication system exists. The current-user display is backed by a single mock `GET /api/auth/me` endpoint returning a fixed user — there's no login flow.
- All currency is displayed in ₹ INR with Cr/L/K notation throughout the app.

## Product

Dashboard-driven procurement intelligence app covering supplier risk, price forecasting, fraud detection, contract analysis, a knowledge graph, news monitoring, semantic search, ML model monitoring/experiments, what-if simulation, savings tracking, alerts, and an AI Agent Hub with a copilot chat plus 5 autonomous background agents.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- The app was restored from a full project zip backup; if something seems missing, check `.agents/memory/vendoriq-restore.md` for the restore process used.
- Some pages (`contracts.tsx`, `risk.tsx`, `forecast.tsx`, `experiments.tsx`, `agents.tsx`) have pre-existing `tsc` type errors from an Orval/react-query 5.101.x version interaction (`queryKey` reported as missing). This does not affect the running app since Vite's dev/build path doesn't run `tsc`. See `.agents/memory/vendoriq-restore.md` for details.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
