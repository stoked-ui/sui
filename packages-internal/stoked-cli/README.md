# stoked CLI

`stoked` is a Rust CLI for the **Next.js API routes** in this repo (`docs/pages/api/*`), not `packages/sui-media-api`.

## Install

```bash
cargo install --path packages-internal/stoked-cli --force
```

## Auth (OAuth browser flow)

```bash
stoked auth login
stoked auth status
stoked auth token
stoked auth keys list
stoked auth keys revoke <api-key-id>
stoked auth logout
```

## Supported API groups

- `blog`
- `clients`
- `users`
- `products` (including `products pages`)
- `licenses`
- `invoices`
- `deliverables`
- `api` (generic passthrough for any route)

## Role-based access

- Admin users can use all command groups.
- Non-admin users are limited to:
  - `stoked licenses products`
  - `stoked invoices list|get|has`
  - `stoked deliverables list`

## Examples

```bash
# Public routes
stoked blog public --site stoked-ui.com --limit 10
stoked licenses products
stoked products public

# Authenticated routes (requires `stoked auth login`)
stoked clients list
stoked users list --role admin
stoked products list
stoked products pages list <productId>
stoked deliverables list --client-id <clientId>

# Create/update via JSON payload
stoked clients create --data-json '{"name":"Acme","contactEmail":"ops@acme.com"}'
stoked products update <id> --data-file ./product-update.json

# Generic API call
stoked api GET /products/public --no-auth
stoked api POST /clients --data-json '{"name":"Acme","contactEmail":"ops@acme.com"}'
```

## Config

The CLI stores auth/config in:

- `~/.stoked/config.json` by default
- override with `STOKED_CONFIG_DIR`

Base URL resolution order:

1. `--base-url`
2. `STOKED_BASE_URL`
3. saved config `base_url`
4. `http://localhost:3000`
