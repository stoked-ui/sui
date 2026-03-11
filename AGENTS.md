# Agent Guardrails

## Media API Scope (Critical)

- `packages/sui-media-api` is for **media component APIs only**.
- Do **not** add new business/domain routes to `sui-media-api` (examples: products, clients, licenses, invoices, users, non-media auth flows).
- Business/domain API routes belong in the Docs Next.js API layer under `docs/pages/api/*`.
- If a new endpoint is requested and it is not strictly media-related, implement it in `docs/pages/api/*`, not `packages/sui-media-api`.

## Local Development

- The main documentation site runs on **localhost:5199** by default (e.g., `pnpm docs:dev`).
- API requests to the local environment should target this port.

