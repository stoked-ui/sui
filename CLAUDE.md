# Project Guardrails

## Media API Boundary

- `packages/sui-media-api` is reserved for media-component endpoints only.
- Do not add non-media business routes there (including products, clients, licenses, invoices, users, or other app-domain APIs).
- Implement non-media APIs in the Docs Next.js API surface under `docs/pages/api/*`.

## Local Development

- The main documentation site runs on **localhost:5199** by default.
- Use `pnpm docs:dev` to start the local server.

