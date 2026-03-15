# Stoked UI — Codebase Overview

> **Generated:** 2026-03-03 | **Updated:** 2026-03-15 | **Meta version:** 0.2.0
> **Repository:** `@stoked-ui/sui` v0.1.0-alpha.5
> **Root:** `/opt/worktrees/stoked-ui/stoked-ui-main`

---

## 1. Repository Purpose

Stoked UI is a **full-stack product platform** combining a React component library, NestJS backend APIs, a documentation/consulting site, CDN asset management, and deployment infrastructure — all managed as a pnpm monorepo. It produces two integrated product lines:

1. **@stoked-ui/* npm packages** — A suite of media-centric React components built on MUI v5: file explorer, timeline animation editor, video editor, media viewer, and GitHub integration widgets. Published to npm under `@stoked-ui/*`.

2. **stokd-cloud** — An autonomous AI project orchestration platform (separate workspace at `/opt/dev/stoked-projects-project-97/`) that uses Claude Agent SDK to manage GitHub Projects with a VSCode extension, NestJS state tracking API, MCP server, and native macOS widget.

The two workspaces share a developer ecosystem but are independently built and deployed.

**Domains served:** `stoked-ui.com`, `stokedconsulting.com`

---

## 2. Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                    stoked-ui-main (this repo)                           │
│  pnpm workspaces · Turborepo · NX · Lerna (versioning)                  │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────── Public Packages (@stoked-ui/*) ────────────────────┐  │
│  │                                                                     │  │
│  │  common ──► media ──► file-explorer ──► timeline ──► editor         │  │
│  │    │                                      │                         │  │
│  │    └──► common-api                        └──► github               │  │
│  │              │                                                      │  │
│  │         media-api (NestJS)           docs (shared components)       │  │
│  │                                                                     │  │
│  │         video-renderer (Rust/WASM)                                  │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌──── Internal Packages ─────────┐  ┌──── Infrastructure ─────────┐    │
│  │  stoked-cli (Rust CLI)         │  │  SST v4 (AWS)               │    │
│  │  cdn (Vite admin app)          │  │  ├─ StaticSite (CloudFront) │    │
│  │  docs-utils, api-docs-builder  │  │  ├─ CdnSite (CloudFront+S3)│    │
│  │  proptypes, markdown           │  │  ├─ ApiGatewayV2            │    │
│  │  test-utils, eslint-plugin     │  │  ├─ Lambda (Google Auth)    │    │
│  │  video-validator, envinfo      │  │  └─ Lambda (subscribe/sms)  │    │
│  │  react-docgen-types            │  └──────────────────────────────┘    │
│  └────────────────────────────────┘                                      │
│                                                                          │
│  ┌──── Docs Site ─────────────────────────────────────────────────────┐  │
│  │  Next.js 13 (stokedui-com) · Static export → docs/export          │  │
│  │  API Routes: auth, blog, licenses, invoices, clients, cdn          │  │
│  │  Modules: auth (session/transfer), cdn, clients, invoices          │  │
│  │  Dev: localhost:5199                                               │  │
│  └────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Package Dependency Graph

### 3.1 Published Packages

Arrows show `peerDependencies` / `dependencies` (workspace links).

```
@stoked-ui/common          (v0.1.2)  ← foundation layer, no @stoked-ui deps
    ↑
@stoked-ui/common-api      (v0.1.0)  ← peer: common (server-side DTOs/decorators)
@stoked-ui/media           (v0.1.0-alpha.5)  ← peer: common
    ↑
@stoked-ui/file-explorer   (v0.1.2)  ← peer: common, media
    ↑
@stoked-ui/timeline        (v0.1.3)  ← peer: common, media, file-explorer
    ↑
@stoked-ui/editor          (v0.1.2)  ← peer: common, media, file-explorer, timeline
                                       optional: video-renderer-wasm
@stoked-ui/github          (v0.0.0-a.0) ← peer: common, media, file-explorer, timeline

@stoked-ui/media-api       (v1.0.0)  ← dep: common, common-api (standalone NestJS)
@stoked-ui/docs            (v0.1.21) ← dev: editor, file-explorer, media, timeline
```

### 3.2 Internal Packages

```
@stoked-ui/docs-utils               (leaf — no workspace deps)
    └──► @stoked-ui/proptypes       (dep: docs-utils)
    └──► @stoked-ui/internal-api-docs-builder  (dep: docs-utils, docs-markdown)

@stoked-ui/docs-markdown             (leaf)
@stoked-ui/internal-test-utils       (leaf)
eslint-plugin-stoked-ui              (leaf)
@stoked-ui/internal-cdn              (leaf — Vite React app, no workspace deps)
@types/react-docgen                  (leaf — type definitions for react-docgen)
stoked-cli                           (leaf — Rust binary, no workspace deps)
```

### 3.3 Build Order (Turborepo `^build`)

1. `@stoked-ui/common`
2. `@stoked-ui/common-api`, `@stoked-ui/media` (parallel)
3. `@stoked-ui/file-explorer`
4. `@stoked-ui/timeline`
5. `@stoked-ui/editor`, `@stoked-ui/github` (parallel)
6. `@stoked-ui/docs`
7. `@stoked-ui/media-api` (independent NestJS build)
8. `stokedui-com` (Next.js docs site — depends on all packages)

---

## 4. Package Details

### 4.1 Core UI Packages

| Package | Path | Description | Entry Point |
|---------|------|-------------|-------------|
| **common** | `packages/sui-common` | Utilities: `LocalDb`, `GrokLoader`, `Colors`, `FetchBackoff`, `MimeType`, `ProviderState`, `SocialLinks`, `UserMenu`, hooks (`useResize`). Deps: `@tempfix/idb`, `framer-motion` | `src/index.tsx` |
| **media** | `packages/sui-media` | Media management: `MediaFile`, `WebFile`, `App`, `Stage`, `WebFileFactory`, `MediaViewer`, `MediaCard`, `ThumbnailStrip`, FileSystemApi, zip, React Query hooks, abstractions (`IRouter`, `IAuth`, `IPayment`). Deps: `@tanstack/react-query`, `jszip` | `src/index.ts` |
| **file-explorer** | `packages/sui-file-explorer` | File tree: `FileExplorer`, `FileExplorerBasic`, `FileExplorerTabs`, `FileElement`, `useFile` hook, DnD via `@atlaskit/pragmatic-drag-and-drop`, built on `@mui/x-tree-view` | `src/index.ts` |
| **timeline** | `packages/sui-timeline` | Animation timeline: `Timeline`, `Engine`, `Controller`, `TimelineCursor`, `TimelineLabels`, `TimelinePlayer`, `TimelineTrack`, `TimelineProvider`, interaction via `interactjs`, virtualized rendering | `src/index.ts` |
| **editor** | `packages/sui-editor` | Video/project editor: `Editor`, `EditorFile`, `EditorEngine`, `Controllers`, `EditorView`, `EditorProvider`, `EditorAction`, `EditorTrack`, forms via `react-hook-form` + `yup`. Optional WASM renderer | `src/index.ts` |
| **github** | `packages/sui-github` | GitHub widgets: `GithubCalendar` heatmap, `GithubEvents` feed, event type renderers, API handlers, `date-fns`/`date-fns-tz` | `src/index.ts` |
| **docs** | `packages/sui-docs` | Documentation components: `BrandingCssVarsProvider`, `Demo`, `DemoEditor`, `HighlightedCode`, `MarkdownElement`, `DocsProvider`, `InfoCard`, `Link`, `NProgressBar`, 30+ subpath exports | `src/index.js` |

### 4.2 API Packages

| Package | Path | Description | Entry Point |
|---------|------|-------------|-------------|
| **common-api** | `packages/sui-common-api` | Shared NestJS utilities: decorators (`src/decorators/`), DTOs (`src/dtos/`), Mongoose schemas (`src/models/`) | `src/index.ts` |
| **media-api** | `packages/sui-media-api` | Full NestJS API: Media CRUD, Auth (JWT/Passport), Uploads (S3), Invoices, License (Stripe), Blog, Nostr relay, Health | `src/main.ts` (HTTP), `src/lambda.bootstrap.ts` (Lambda) |

**media-api Modules:**
- `MediaModule` — CRUD, thumbnails (Sharp), metadata extraction, video processing (FFmpeg)
- `AuthModule` — JWT authentication, user management (bcryptjs)
- `LicenseModule` + `StripeModule` — License keys, Stripe checkout payments
- `UploadsModule` — S3 file uploads
- `InvoicesModule` — Invoice management with API key auth
- `NostrModule` — NIP-23 long-form content polling
- `BlogModule` — Blog post CRUD with publish workflow
- `DatabaseModule` — MongoDB/Mongoose connection
- `HealthModule` — Health check endpoint
- `S3Module` — AWS S3 client

### 4.3 Rust/WASM Package

| Package | Path | Description |
|---------|------|-------------|
| **video-renderer** | `packages/sui-video-renderer` | High-performance video composition engine in Rust with WASM bindings |

**Workspace members:** `compositor/` (core engine), `wasm-preview/` (browser bindings), `cli/` (command-line tool), `benchmark/`

**WASM Exports:** `PreviewRenderer` class with `render_frame()`, `render_frame_at_time()`, `cache_image()`, canvas rendering. Uses `image`, `imageproc`, `fast_image_resize`, `resvg`, `wasm-bindgen`, `web-sys`.

Published as `wasm-preview` npm package in `pkg/` directory. Referenced by `@stoked-ui/editor` as `@stoked-ui/video-renderer-wasm: file:../sui-video-renderer/pkg`.

### 4.4 Internal Packages (`packages-internal/`)

| Package | Path | Build | Purpose |
|---------|------|-------|---------|
| **stoked-cli** | `packages-internal/stoked-cli` | `cargo build` | Rust CLI for Stoked Next.js APIs — auth, file operations, directory traversal. Deps: `clap`, `tokio`, `reqwest`, `tiny_http` |
| **cdn** | `packages-internal/cdn` | Vite | CDN admin app — S3 content browsing, file upload (multipart), permissions, drag-and-drop, role-based access |
| **docs-utils** | `packages-internal/docs-utils` | `tsc` | Documentation build utilities |
| **api-docs-builder** | `packages-internal/api-docs-builder` | `tsc` | API reference doc generation (react-docgen, Babel AST, remark) |
| **proptypes** | `packages-internal/proptypes` | `tsc` | TypeScript → PropTypes code generation |
| **markdown** | `packages-internal/markdown` | pre-built | Markdown parser (marked, prismjs), webpack loader |
| **eslint-plugin** | `packages-internal/eslint-plugin-stoked-ui` | none | Custom ESLint rules |
| **video-validator** | `packages-internal/sui-video-validator` | `tsup` | Frame comparison validation CLI (pixelmatch, Sharp, FFmpeg) |
| **test-utils** | `packages-internal/test-utils` | `tsc` | Test adapters: enzyme, @testing-library, mocha, karma, playwright |
| **envinfo** | `packages-internal/sui-envinfo` | custom | CLI for environment info reporting |
| **feedback** | `packages-internal/feedback` | claudia | Serverless Lambda for page ratings/comments |
| **react-docgen-types** | `packages-internal/react-docgen-types` | none | Type definitions for react-docgen (`@types/react-docgen`) |
| **rsc-builder** | `packages-internal/rsc-builder` | none | React Server Components builder utility |
| **netlify-plugin-cache-docs** | `packages-internal/netlify-plugin-cache-docs` | none | Netlify build plugin for docs caching |
| **stoked-mcp** | `packages-internal/stoked-mcp` | SST | MCP server (early development — `src/__tests__/` only) |
| **markdownlint-rule-mui** | `packages-internal/markdownlint-rule-mui` | none | Custom markdownlint rules: duplicate-h1, straight-quotes, table-alignment, terminal-language, git-diff |

---

## 5. Documentation & Consulting Site (`docs/`)

**Package:** `stokedui-com` (v0.1.0-alpha.5, private)

- **Tech:** Next.js 13.5.1 (Pages Router, static export to `docs/export/`)
- **Dev:** `pnpm docs:dev` → `localhost:5199`
- **Build output:** `docs/export/` (static site, served via CloudFront)
- **Service worker:** `docs/public/sw.js` — auto-skip-waiting for app updates
- **Key deps:** AWS SDK, Emotion, MUI v5 (full suite), `@docsearch/react`, `@react-oauth/google`, MongoDB, Stripe, `archiver`, markdown-to-jsx, SST
- **Workspace deps:** common, docs, editor, file-explorer, media, timeline, github, docs-markdown

### 5.1 API Routes (`docs/pages/api/`)

| Route Group | Endpoints | Purpose |
|-------------|-----------|---------|
| **auth/** | `login`, `register`, `google`, `impersonate`, `session`, `exchange`, `transfer`, `logout` | Authentication with session cookies, cross-origin transfer, Google OAuth |
| **auth/cli/** | `authorize` | CLI-based authentication flow |
| **auth/api-keys/** | `index`, `[id]` | API key CRUD for programmatic access |
| **account/** | `billing`, `billing/portal`, `licenses`, `settings` | Account management, Stripe billing portal |
| **cdn/** | `contents`, `folders`, `delete`, `move`, `export`, `permissions` | S3 CDN browsing and management with role-based access |
| **cdn/upload/** | `initiate`, `active`, `[sessionId]/{urls,status,complete,abort}`, `[sessionId]/part/[partNumber]` | Multipart upload flow with session tracking |
| **clients/** | `index`, `[id]` | Client CRUD |
| **deliverables/** | `index`, `[id]`, `upload-file`, `proxy/[...path]` | Deliverable CRUD with CDN proxy |
| **invoices/** | `index`, `[id]`, `has-invoices` | Invoice CRUD with existence check |
| **licenses/** | `checkout`, `create`, `activate`, `deactivate`, `validate`, `products` | Full license lifecycle: Stripe checkout, activation, validation |
| **products/** | `index`, `[id]`, `public`, `[id]/pages/{index,[pageId]}` | Product catalog with public listing and nested pages |
| **products/feedback/** | `index`, `register`, `verify` | Product feedback with email verification (SES), user auto-registration |
| **blog/** | `index`, `public`, `[slug]`, `[slug]/{publish,unpublish}`, `authors`, `tags`, `revalidate` | Blog CRUD with publish workflow, author/tag management |
| **users/** | `index`, `[id]` | User management |
| **webhooks/** | `stripe` | Stripe webhook handler |
| **chat/** | `send` | Chat message endpoint |
| **upload/** | `blog-image` | Blog image upload |
| **openapi** | `openapi` | OpenAPI spec generation |

### 5.2 Backend Modules (`docs/src/modules/`)

| Module | Key Files | Purpose |
|--------|-----------|---------|
| **auth** | `authStore.ts`, `withAuth.ts`, `session.ts`, `apiKeyStore.ts` | JWT auth, HTTP-only cookie sessions (`stoked_auth`), cross-origin session transfer (5-min JWTs), origin whitelisting, API key management |
| **db** | MongoDB connectivity | Shared database connection module |
| **cdn** | `cdnAccess.ts`, `cdnMutations.ts`, `cdnUploadStore.ts` | S3 content access with role-based permissions (admin/client/agent/subscriber), multipart upload session management, folder CRUD, `.cdnkeep` directory markers |
| **clients** | `contactUser.ts` | Contact user creation with password hashing, client-contact association, batch hydration |
| **invoices** | `invoiceNormalization.ts`, `cdnStorage.ts` | Legacy invoice format normalization, status tracking (draft/sent/paid), CDN-backed storage |
| **deliverables** | `cdnStorage.ts`, `htmlSnapshot.ts` | CDN-backed deliverable storage, HTML snapshot generation |
| **license** | `licenseStore.ts`, `stripeClient.ts`, `apiUtils` | License lifecycle management, Stripe integration, license API utilities |
| **products** | `feedbackStore.ts` | Product feedback with email verification (SES), auto-registration, verification code TTL, resend cooldown |
| **blog** | `blogStore.ts`, `blogApiUtils.ts` | Blog post CRUD, publish/unpublish workflow, author/tag management |
| **account** | Account pages & settings | Account management, billing portal integration |
| **openapi** | OpenAPI spec generation | Auto-generated API documentation |
| **utils** | `getApiUrl.ts`, `siteRouting.ts` | API URL construction, site routing helpers |
| **components** | 90+ component files | Page layouts, theme builders, client detail views, product pages |

---

## 6. Key Technologies

### Frontend
- **React 18.3.1** — pinned across all packages
- **Material UI v5** (`@mui/material` 5.17.1) — component foundation
- **MUI X Tree View** (`@mui/x-tree-view` 7.22.2) — base for file explorer
- **Emotion** — CSS-in-JS (`@emotion/styled` 11.8.1)
- **Framer Motion 12.4.10** — animations (common package)
- **InteractJS 1.10.11** — drag/resize interactions (timeline)
- **Atlaskit Pragmatic DnD** — drag-and-drop (file explorer)
- **React Query** (`@tanstack/react-query` 5.x) — server state management (media)
- **react-hook-form** + **yup** — form handling (editor)
- **Next.js 13.5** — documentation site (Pages Router, static export)
- **Vite** — CDN admin app bundling

### Backend
- **NestJS 10** — API framework (media-api)
- **MongoDB/Mongoose 8** — database
- **Passport + JWT** — authentication (media-api)
- **HTTP-only cookie sessions** — authentication (docs site)
- **Cross-origin session transfer** — 5-minute JWT transfer tokens between origins
- **API key authentication** — programmatic access for CLI and integrations
- **Stripe** — payment/licensing/billing portal
- **AWS S3** — file storage + CDN asset hosting
- **AWS SES** — email, **AWS SNS** — SMS
- **FFmpeg** (`fluent-ffmpeg`) — video processing
- **Sharp** — image processing/thumbnails
- **Nostr** (`nostr-tools`) — decentralized content integration
- **archiver** — zip archive creation for CDN export

### Infrastructure
- **SST v4** (Ion/Pulumi) — AWS IaC (`sst` 4.2.0)
- **AWS Lambda** (Node.js 20.x) — serverless compute
- **API Gateway V2** — HTTP API routing
- **CloudFront + S3** — static site hosting with edge functions (docs site + CDN site)
- **ACM** — certificate management with SAN validation (`infra/cert.ts`)
- **Route 53** — DNS (zones for stoked-ui.com, stokedconsulting.com)

### Build & Dev
- **pnpm 10.5.1** — package manager (enforced via `preinstall`)
- **Turborepo 2.7.4** — primary build orchestration with caching
- **NX 20.5.0** — supplementary task runner / caching metadata
- **Lerna 8.2.1** — version management (independent mode)
- **TypeScript 5.4.5** — strict mode, `experimentalDecorators`, path aliases
- **Babel 7.26.x** — multi-target transpilation (modern/node/stable)
- **tsup** — bundling (video-validator)
- **Webpack 5** — bundling (media-api lambda, e2e tests)

### Testing
- **Mocha** — unit/integration tests (stoked-ui packages)
- **Jest** — unit tests (NestJS packages, `mongodb-memory-server`)
- **Playwright** — e2e tests
- **Karma** — browser tests
- **NYC/Istanbul** — code coverage
- **Argos CI** — visual regression

### Rust/WASM
- **Rust** (edition 2021) — video renderer core + stoked-cli
- **wasm-bindgen** + **wasm-pack** — WASM compilation
- **web-sys** — browser API bindings
- **rayon** — parallel processing, **tokio** — async runtime
- **clap** — CLI argument parsing (stoked-cli)

---

## 7. Development Workflow

### Setup
```bash
pnpm install          # Install all workspace dependencies (enforced pnpm)
pnpm build            # Build all packages (Turbo-orchestrated, topological order)
```

### Development
```bash
pnpm dev              # Kill stale services → dev:prepare → dev (parallel, concurrency 15)
pnpm docs:dev         # Docs site only at http://localhost:5199
pnpm docs:debug       # Docs with DEV_DISPLAY=1 + experimental HTTPS
```

### Build System

The build pipeline is orchestrated by **Turbo** with topological `^build` dependency resolution:

| Build Type | Packages | Output |
|-----------|----------|--------|
| Custom Babel (`scripts/build.mjs`) | All `sui-*` UI packages (common, media, file-explorer, timeline, editor, github, docs, common-api) | `build/modern/` (ESM), `build/node/` (CJS), `build/stable/` (ES6) + types via `scripts/buildTypes.mjs` |
| NestJS CLI + webpack | `sui-media-api` | `dist/` (server), `dist-lambda/` (Lambda bundle) |
| Vite | `packages-internal/cdn` | `dist/` (static site) |
| Plain `tsc` | `docs-utils`, `proptypes`, `test-utils` | `build/` or `dist/` |
| `tsup` (CJS + ESM + dts) | `video-validator` | `dist/` |
| Cargo + wasm-pack | `sui-video-renderer` | `pkg/` (WASM + JS + types) |
| Cargo | `stoked-cli` | binary: `stoked` |
| Next.js static export | `stokedui-com` (docs) | `docs/export/` |
| None / pre-built | `docs-markdown`, `eslint-plugin`, `rsc-builder` | committed JS |

### Building
```bash
pnpm build            # Turbo build (cached, excludes docs site)
pnpm build:all        # Build packages + docs site
pnpm build:clean      # Force rebuild (no cache)
pnpm build:fresh      # Clean → install → build
pnpm build:ci         # Force rebuild, concurrency 8
```

### Testing
```bash
pnpm test             # Run all tests via scripts/test.mjs
pnpm test:unit        # Mocha: 'packages/**/*.test.{js,ts,tsx}'
pnpm test:e2e         # Webpack build → serve → Mocha
pnpm test:e2e-website # Playwright
pnpm test:karma       # Karma (browser tests)
pnpm test:coverage    # NYC + Mocha coverage report
pnpm typescript       # Type-check all packages (turbo run typescript)
```

### Code Quality
```bash
pnpm eslint           # Lint (Airbnb config + eslint-plugin-stoked-ui)
pnpm prettier         # Format (pretty-quick on changed files)
pnpm stylelint        # CSS-in-JS linting (docs only)
pnpm markdownlint     # Markdown linting
pnpm docs:api         # Regenerate API documentation
pnpm proptypes        # Regenerate PropTypes from TypeScript
```

### Release Process
```bash
pnpm release          # build:all → lerna version (independent) → deploy:prod
pnpm release:publish  # pnpm publish --recursive --tag latest
pnpm release:changelog # Generate changelog from GitHub commits
pnpm release:tag      # Git tagging
```

### Deployment
```bash
pnpm deploy:prod      # dotenvx → sst deploy --stage production
pnpm deploy           # SST deploy (default stage, requires ROOT_DOMAIN env)
pnpm docs:deploy      # Deploy docs site
```

---

## 8. Infrastructure (SST v4 / AWS)

**App:** `stoked-ui`, AWS `us-east-1`, profile `stoked` (local) / default (CI)
**Config:** `sst.config.ts` → imports `infra/` (index, api, site, cdn-site, domains, cert, envVars)

**Mandatory env vars:** `ROOT_DOMAIN` (exits if missing)

**SST Secrets** (`infra/secrets.ts`)**:** `MONGODB_URI`, `ROOT_DOMAIN`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `JWT_SECRET`

**Resources:**

| Resource | Type | Details |
|----------|------|---------|
| StaticSite (docs) | S3 + CloudFront | Serves `docs/export`. Edge functions: URL rewrites for stokedconsulting.com, CORS headers for media. Cache: 1yr immutable assets, no-cache HTML. |
| CdnSite | S3 + CloudFront | Serves `packages-internal/cdn/dist`. Asset bucket configured to not purge on deploy. Edge functions: API routing to consulting origin, CORS/media headers. Domain: `cdn.{consultingDomain}` |
| Google Auth Lambda | `ANY /api/auth/google` | `api/auth/google.handler` — Google OAuth authentication. Linked: `MONGODB_URI`, `JWT_SECRET`. Env: `NEXT_PUBLIC_GOOGLE_CLIENT_ID`, `AUTH_AUTO_DOMAINS` |
| Subscribe Lambda | `POST /subscribe` | `api/subscribe.subscribe` — email subscription with UUID verification token. SES send permission. |
| Verify Lambda | `GET /verify` | `api/subscribe.verify` — email verification. SES send permission. |
| SMS Lambda | `POST /smss` | `api/sms.handler` — SNS SMS (E.164 format validation) |

**Certificate Management:** `infra/cert.ts` — ACM certificate lookup with SAN validation, prevents overwriting SST-managed certificates, supports wildcard domain matching.

**Domains:**
- `stoked-ui.com` (Route53 zone `Z007684515CR7EDIISGDG`)
- `stokedconsulting.com` (Route53 zone `Z2CYVWQGVIX8W6`)
- API subdomain: `api.{primaryDomain}`
- CDN subdomain: `cdn.{consultingDomain}`

---

## 9. CDN Asset Management System

A dedicated system for managing client deliverables and assets on S3, consisting of three layers:

### 9.1 CDN Admin App (`packages-internal/cdn/`)

Vite + React SPA for browsing and managing S3 content:
- Directory browsing with breadcrumb navigation
- File search/filtering with deferred state
- Multipart file upload with progress tracking and resumption
- Delete, move, and export (zip download) operations
- Role-based access control (admin/client/agent/subscriber)
- Drag-and-drop support for files and folders
- Session authentication via docs site auth cookies

### 9.2 CDN API Routes (`docs/pages/api/cdn/`)

Next.js API routes providing the CDN backend:
- `contents` — List S3 objects/folders with role-aware filtering
- `folders` — Create directories (admin-only)
- `delete` — Remove files/folders (admin-only)
- `move` — Rename/move operations (admin-only)
- `export` — Download files or zip entire directories with role-aware access
- `permissions` — CRUD for role-based and user-specific access rules (MongoDB-backed)
- `upload/` — Full multipart upload flow: `initiate` → presigned URLs → `part` tracking → `complete`/`abort`

### 9.3 CDN Core Modules (`docs/src/modules/cdn/`)

- **`cdnAccess.ts`** — Permission model: `CdnViewer` (sub, role, clientSlug), path-based permission matching, client-scoped folder access (`clients/{clientSlug}/`)
- **`cdnMutations.ts`** — S3 operations: folder creation (`.cdnkeep` markers), recursive deletion (batched >1000 objects), move/copy with directory recursion
- **`cdnUploadStore.ts`** — MongoDB `cdnUploadSessions` collection: session lifecycle, presigned URL generation (1-hour expiry), part tracking (pending/uploading/completed/failed), 7-day session expiration, S3 reconciliation

---

## 10. Entry Points & Critical Paths

### Package Entry Points

| Package | Entry | Build Output |
|---------|-------|-------------|
| `@stoked-ui/common` | `packages/sui-common/src/index.tsx` | `build/`, `build/modern/`, `build/node/` |
| `@stoked-ui/common-api` | `packages/sui-common-api/src/index.ts` | `build/`, `build/modern/`, `build/node/` |
| `@stoked-ui/media` | `packages/sui-media/src/index.ts` | `build/`, `build/modern/`, `build/node/` |
| `@stoked-ui/file-explorer` | `packages/sui-file-explorer/src/index.ts` | `build/`, `build/modern/`, `build/node/` |
| `@stoked-ui/timeline` | `packages/sui-timeline/src/index.ts` | `build/`, `build/modern/`, `build/node/` |
| `@stoked-ui/editor` | `packages/sui-editor/src/index.ts` | `build/`, `build/modern/`, `build/node/` |
| `@stoked-ui/github` | `packages/sui-github/src/index.ts` | `build/`, `build/modern/`, `build/node/` |
| `@stoked-ui/docs` | `packages/sui-docs/src/index.js` | `build/` (legacy bundle primary) |
| `@stoked-ui/media-api` | `packages/sui-media-api/src/main.ts` | `dist/` (NestJS), `dist-lambda/` (Lambda) |
| CDN admin | `packages-internal/cdn/src/App.jsx` | `dist/` (Vite static) |
| Stoked CLI | `packages-internal/stoked-cli/src/main.rs` | binary: `stoked` |
| Docs site | `docs/pages/_app.js` | `docs/export/` (static) |

### User-Facing Entry Points

| Entry Point | Path/URL | Purpose |
|-------------|----------|---------|
| Docs site | `stoked-ui.com` / `pnpm docs:dev` (port 5199) | Product showcase, documentation, consulting portal |
| CDN admin | `cdn.stokedconsulting.com` | Client asset management |
| API Gateway | `api.stoked-ui.com/*` | Auth, subscribe, verify, SMS endpoints |
| Subscribe | `api.stoked-ui.com/subscribe` | Email subscription |

### Infrastructure Critical Files

| File | Purpose |
|------|---------|
| `sst.config.ts` | SST app definition — imports `infra/`, deploys site + cdn + api |
| `infra/index.ts` | Re-exports from `./site`, `./domains`, `./api`, `./cdn-site` |
| `infra/secrets.ts` | SST secret declarations (`MONGODB_URI`, `ROOT_DOMAIN`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `JWT_SECRET`) |
| `infra/api.ts` | API Gateway + Lambda definitions (Google Auth, Subscribe, Verify, SMS) |
| `infra/site.ts` | Static site (CloudFront) with edge functions |
| `infra/cdn-site.ts` | CDN static site (CloudFront + S3 asset bucket) with edge functions |
| `infra/cert.ts` | ACM certificate lookup and SAN validation |
| `infra/domains.ts` | Domain routing + Route53 zone IDs + CDN domain config |
| `infra/envVars.ts` | Environment variable verification |
| `infra/sst-globals.d.ts` | SST platform type declarations |

### Build System Critical Files

| File | Purpose |
|------|---------|
| `package.json` | Root workspace config, all scripts |
| `pnpm-workspace.yaml` | Workspace package declarations |
| `turbo.json` | Turbo task pipeline (build, dev, test, lint, typescript) |
| `nx.json` | Nx target defaults (copy-license, build, dev, watch) |
| `lerna.json` | Independent versioning config (pnpm client) |
| `tsconfig.json` | Root TypeScript config with path aliases |
| `babel.config.js` | Root Babel config |
| `scripts/build.mjs` | Multi-target Babel build pipeline |
| `scripts/buildTypes.mjs` | TypeScript declaration generator |
| `scripts/buildSite.sh` | Full docs site build orchestration |
| `scripts/copyFiles.mjs` | Post-build asset copying |
| `scripts/importConsultingInvoices.ts` | Bulk invoice import CLI (`--clientId`, `--dir`, `--dry-run`) |
| `docs/next.config.mjs` | Next.js config (static export, webpack aliases, markdown loader) |

---

## 11. Workspace Configuration

### pnpm Workspace (`pnpm-workspace.yaml`)
```yaml
packages:
  - benchmark
  - packages/*
  - packages-internal/*
  - docs
  - api
  - infra
  - test
onlyBuiltDependencies:
  - '@nestjs/core'
  - aws-sdk
  - core-js
  - esbuild
  - mongodb-memory-server
  - msgpackr-extract
  - nx
  - puppeteer
  - sharp
```

### TypeScript Path Aliases (`tsconfig.json`)
```
@stoked-ui/docs               → packages/sui-docs/src
@stoked-ui/docs-utils         → packages-internal/docs-utils/src
@stoked-ui/docs-markdown      → packages/sui-internal-markdown/src
@stoked-ui/file-explorer      → packages/sui-file-explorer/src
@stoked-ui/media              → packages/sui-media
@stoked-ui/timeline           → packages/sui-timeline
@stoked-ui/editor             → packages/sui-editor
@stoked-ui/github             → packages/sui-github
@stoked-ui/internal-test-utils → packages-internal/test-utils
@stoked-ui/video-renderer-wasm → packages/sui-editor/src/WasmPreview/wasm-module.d.ts
```

Note: `@stoked-ui/common` and `@stoked-ui/common-api` are resolved via standard node_modules, not tsconfig paths.

### Key Environment Variables

- `ROOT_DOMAIN` — Primary domain (stoked-ui.com, stokedconsulting.com) — **mandatory**
- `MONGODB_URI` — MongoDB connection string (SST secret) — **mandatory**
- `JWT_SECRET` — Authentication token signing (SST secret)
- `BLOG_API_TOKEN` — Blog API authentication (SST secret)
- `INVOICE_API_KEY` — Invoice API key (SST secret)
- `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` — Stripe integration
- `AUTH_AUTO_DOMAINS` — Auto-approved auth domains
- `NOSTR_RELAYS` / `NOSTR_NPUBS` — Nostr integration config
- `VITE_CDN_NAME` / `VITE_CDN_PUBLIC_BASE_URL` — CDN site identity and S3 base URL
- `VITE_STOKED_CONSULTING_ORIGIN` / `VITE_STOKED_UI_ORIGIN` — Cross-origin URLs for CDN
- `VITE_LOCAL_AUTH_ORIGIN` — Auth origin for local CDN dev (default: `http://localhost:5199`)

---

## 12. Patterns & Conventions

### Package Structure
Each published `@stoked-ui/*` package follows a standard layout:
```
packages/sui-{name}/
├── src/
│   ├── index.ts              # Public API barrel exports
│   ├── {ComponentName}/
│   │   ├── {ComponentName}.tsx
│   │   ├── {ComponentName}.types.ts
│   │   └── index.ts
│   └── internals/            # Non-exported internals
├── build/                    # Babel output (modern/, node/, stable/)
├── package.json
└── tsconfig.build.json
```

### Peer Dependency Pattern
All published UI packages use **peer dependencies** for workspace packages and MUI. Consumers must install: `@emotion/react`, `@emotion/styled`, `@mui/material`, `@mui/system`, `@mui/icons-material`, `react` (18.3.1), `react-dom`.

### MUI v5 Foundation
Components extend MUI v5 patterns: `styled()`, `useTheme()`, `sx` prop, theme customization. File explorer wraps `@mui/x-tree-view`.

### State Management
React Context + Provider pattern throughout: `EditorProvider`, `DocsProvider`, `TimelineProvider`. No external state library (Redux, Zustand) in stoked-ui packages.

### Authentication Pattern
Two auth systems coexist:
- **media-api**: JWT + Passport (NestJS) for API authentication
- **docs site**: HTTP-only cookie sessions (`stoked_auth`) with cross-origin transfer via short-lived JWTs. Session transfer flow: origin A → `transfer` endpoint → 5-min JWT → target origin's `exchange` endpoint → set cookie. Cascading logout across origins. API key auth for programmatic/CLI access.

**User Roles** (docs site): `admin`, `client`, `agent`, `totally stoked` (default), `subscriber`, `stokd member`. Roles auto-assigned: admin for `AUTO_DOMAINS` (stokedconsulting.com, stoked-ui.com, brianstoker.com), stokd member if active `stokd-membership` license, subscriber if any active license.

### NestJS Convention
Standard NestJS modular architecture: Mongoose schemas as models, DTOs with `class-validator`, Swagger auto-generation, JWT + Passport auth, Lambda deployment via `@codegenie/serverless-express`.

### CDN Access Control
Role-based permission model: admins have full access, clients are scoped to `clients/{clientSlug}/` directories, custom permissions stored in MongoDB with path-based matching and inheritance.

### Naming
- **npm scope:** `@stoked-ui/<name>`
- **Directory:** `packages/sui-<name>`
- **Build output:** `build/` (Babel packages), `dist/` (API packages, tsc/tsup/Vite)

### Resolution Overrides
Critical pinned versions in root `package.json`:
- React: `18.3.1` (exact)
- MUI: `5.17.1` (pnpm overrides)
- `@emotion/styled`: `11.8.1`
- `@interactjs/*`: `1.10.11`
- `webpack`: `>=5.104.1`

---

## 13. Tracked Packages (`.stokd/meta/config.json`)

```json
[
  "packages/sui-common",
  "packages/sui-common-api",
  "packages/sui-docs",
  "packages/sui-editor",
  "packages/sui-file-explorer",
  "packages/sui-github",
  "packages/sui-media",
  "packages/sui-media-api",
  "packages/sui-timeline"
]
```

Note: `packages/sui-video-renderer` is a Rust/WASM workspace (Cargo-managed, no `package.json`) and is not tracked in the stokd meta config.
