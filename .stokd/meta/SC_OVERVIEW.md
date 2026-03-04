# Stoked UI — Codebase Overview

> **Generated:** 2026-03-03
> **Repository:** `@stoked-ui/sui` v0.1.0-alpha.5
> **Root:** `/opt/worktrees/stoked-ui/stoked-ui-main`

---

## 1. Repository Purpose

Stoked UI is a **full-stack product platform** combining a React component library, NestJS backend APIs, a documentation site, and deployment infrastructure — all managed as a pnpm monorepo. It produces two integrated product lines:

1. **@stoked-ui/* npm packages** — A suite of media-centric React components built on MUI v5: file explorer (v1 + v2), timeline animation editor, video editor, media viewer, and GitHub integration widgets. Published to npm under `@stoked-ui/*`.

2. **stokd-cloud** — An autonomous AI project orchestration platform (separate workspace at `/opt/dev/stoked-projects-project-97/`) that uses Claude Agent SDK to manage GitHub Projects with a VSCode extension, NestJS state tracking API, MCP server, and native macOS widget.

The two workspaces share a developer ecosystem but are independently built and deployed.

**Domains served:** `stoked-ui.com`, `stokedconsulting.com`, `stokedui.com`

---

## 2. Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                   stoked-ui-main (this repo)                        │
│  pnpm workspaces · Turborepo · NX · Lerna (versioning)             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────── Public Packages (@stoked-ui/*) ───────────────┐  │
│  │                                                                │  │
│  │  common ──► media ──► file-explorer ──► timeline ──► editor    │  │
│  │    │                  file-explorer-v2     │                   │  │
│  │    └──► common-api                         └──► github         │  │
│  │              │                                                 │  │
│  │         media-api (NestJS)          docs (shared components)   │  │
│  │                                                                │  │
│  │         video-renderer (Rust/WASM)                             │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌──── Internal Packages ────────┐  ┌──── Infrastructure ────────┐  │
│  │  stoked-mcp (MCP server)      │  │  SST v3 (AWS)              │  │
│  │  docs-utils, api-docs-builder │  │  ├─ StaticSite (CloudFront)│  │
│  │  proptypes, markdown          │  │  ├─ ApiGatewayV2           │  │
│  │  test-utils, eslint-plugin    │  │  ├─ Lambda (NestJS)        │  │
│  │  video-validator, envinfo     │  │  └─ Lambda (subscribe/sms) │  │
│  └───────────────────────────────┘  └────────────────────────────┘  │
│                                                                     │
│  ┌──── Docs Site ────────────────────────────────────────────────┐  │
│  │  Next.js 13 (stokedui-com) · Static export → docs/export     │  │
│  │  API Routes: auth, blog, licenses, invoices, clients          │  │
│  │  Dev: localhost:5199                                          │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 3. Package Dependency Graph

### 3.1 Published Packages

Arrows show `peerDependencies` / `dependencies` (workspace links).

```
@stoked-ui/common          (v0.1.2)  ← foundation layer, no @stoked-ui deps
    ↑
@stoked-ui/common-api      (v0.1.0)  ← peer: common (server-side DTOs/decorators)
@stoked-ui/media           (v1.0.0)  ← peer: common
    ↑
@stoked-ui/file-explorer   (v0.1.2)  ← peer: common, media
@stoked-ui/file-explorer-v2(v0.1.0)  ← peer: MUI (standalone, no @stoked-ui peer deps)
    ↑
@stoked-ui/timeline        (v0.1.3)  ← peer: common, media, file-explorer
    ↑
@stoked-ui/editor          (v0.1.2)  ← peer: common, media, file-explorer, timeline
                                       optional: video-renderer-wasm
@stoked-ui/github          (v0.0.0)  ← peer: common, media, file-explorer, timeline

@stoked-ui/media-api       (v1.0.0)  ← dep: common, common-api (standalone NestJS)
@stoked-ui/docs            (v0.1.21) ← dev: editor, file-explorer, media, timeline
@stoked-ui/stoked-mcp      (v1.0.0)  ← standalone MCP server (internal)
```

### 3.2 Internal Packages

```
@stoked-ui/docs-utils               (leaf — no workspace deps)
    └──► @stoked-ui/proptypes       (dep: docs-utils)
    └──► @stoked-ui/internal-api-docs-builder  (dep: docs-utils, docs-markdown)

@stoked-ui/docs-markdown             (leaf)
@stoked-ui/internal-test-utils       (leaf)
eslint-plugin-stoked-ui              (leaf)
```

### 3.3 Build Order (Turborepo `^build`)

1. `@stoked-ui/common`
2. `@stoked-ui/common-api`, `@stoked-ui/media` (parallel)
3. `@stoked-ui/file-explorer`, `@stoked-ui/file-explorer-v2` (parallel)
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
| **common** | `packages/sui-common` | Utilities: `LocalDb`, `GrokLoader`, `Colors`, `FetchBackoff`, `MimeType`, `ProviderState`, `SocialLinks`, `UserMenu`, hooks (`useResize`) | `src/index.tsx` |
| **media** | `packages/sui-media` | Media management: `MediaFile`, `WebFile`, `App`, `Stage`, `WebFileFactory`, `MediaViewer`, `MediaCard`, `ThumbnailStrip`, FileSystemApi, zip, React Query hooks, abstractions (`IRouter`, `IAuth`, `IPayment`) | `src/index.ts` |
| **file-explorer** | `packages/sui-file-explorer` | File tree v1: `FileExplorer`, `FileExplorerBasic`, `FileExplorerTabs`, `FileElement`, `useFile` hook, DnD via `@atlaskit/pragmatic-drag-and-drop`, built on `@mui/x-tree-view` | `src/index.ts` |
| **file-explorer-v2** | `packages/sui-file-explorer-v2` | File tree v2: `FileExplorerV2`, `CustomTreeItem`, `TransitionComponent`, `DotIcon`, v1↔v2 adapters (`fileBaseToFileItem`, `fileItemToFileBase`), DnD via `@atlaskit/pragmatic-drag-and-drop`. Standalone with no `@stoked-ui/*` peer deps. | `src/index.ts` |
| **timeline** | `packages/sui-timeline` | Animation timeline: `Timeline`, `Engine`, `Controller`, `TimelineCursor`, `TimelineLabels`, `TimelinePlayer`, `TimelineTrack`, `TimelineProvider`, interaction via `interactjs` | `src/index.ts` |
| **editor** | `packages/sui-editor` | Video/project editor: `Editor`, `EditorFile`, `EditorEngine`, `Controllers`, `EditorView`, `EditorProvider`, `EditorAction`, `EditorTrack`, forms via `react-hook-form` + `yup` | `src/index.ts` |
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
| **stoked-mcp** | `packages-internal/stoked-mcp` | `tsc` | MCP server for blog & license/product workflows (`@modelcontextprotocol/sdk`, `zod`) |
| **docs-utils** | `packages-internal/docs-utils` | `tsc` | Documentation build utilities |
| **api-docs-builder** | `packages-internal/api-docs-builder` | `tsc` | API reference doc generation (react-docgen, Babel AST, remark) |
| **proptypes** | `packages-internal/proptypes` | `tsc` | TypeScript → PropTypes code generation |
| **markdown** | `packages-internal/markdown` | pre-built | Markdown parser (marked, prismjs), webpack loader |
| **eslint-plugin** | `packages-internal/eslint-plugin-stoked-ui` | none | Custom ESLint rules |
| **video-validator** | `packages-internal/sui-video-validator` | `tsup` | Frame comparison validation CLI (pixelmatch, Sharp, FFmpeg) |
| **test-utils** | `packages-internal/test-utils` | `tsc` | Test adapters: enzyme, @testing-library, mocha, karma, playwright |
| **envinfo** | `packages-internal/sui-envinfo` | custom | CLI for environment info reporting |
| **feedback** | `packages-internal/feedback` | claudia | Serverless Lambda for page ratings/comments |
| **rsc-builder** | `packages-internal/rsc-builder` | none | React Server Components builder utility |
| **netlify-plugin-cache-docs** | `packages-internal/netlify-plugin-cache-docs` | none | Netlify build plugin for docs caching |

---

## 5. Documentation Site (`docs/`)

**Package:** `stokedui-com` (v0.1.0-alpha.5, private)

- **Tech:** Next.js 13.5.1 (Pages Router, static export to `docs/export/`)
- **Dev:** `pnpm docs:dev` → `localhost:5199`
- **API Routes:** auth (login, OAuth, impersonate, API keys, CLI auth), blog (`[slug]`), licenses, invoices, users
- **Key deps:** AWS SDK, Emotion, MUI v5 (full suite), `@docsearch/react`, `@react-oauth/google`, MongoDB, Stripe, final-form, markdown-to-jsx, SST
- **Workspace deps:** common, docs, editor, file-explorer, file-explorer-v2, media, timeline, github, docs-markdown
- **Build output:** `docs/export/` (static site, served via CloudFront)

---

## 6. Key Technologies

### Frontend
- **React 18.3.1** — pinned across all packages
- **Material UI v5** (`@mui/material` 5.17.1) — component foundation
- **MUI X Tree View** (`@mui/x-tree-view` 7.22.2) — base for file explorers
- **Emotion** — CSS-in-JS (`@emotion/styled` 11.8.1)
- **Framer Motion 12.4.10** — animations (common package)
- **InteractJS 1.10.11** — drag/resize interactions (timeline)
- **Atlaskit Pragmatic DnD** — drag-and-drop (file explorers v1 + v2)
- **React Query** (`@tanstack/react-query` 5.x) — server state management (media)
- **react-hook-form** + **yup** — form handling (editor)
- **Next.js 13.5** — documentation site (Pages Router, static export)

### Backend
- **NestJS 10** — API framework (media-api)
- **MongoDB/Mongoose 8** — database
- **Passport + JWT** — authentication
- **Stripe** — payment/licensing
- **AWS S3** — file storage
- **AWS SES** — email, **AWS SNS** — SMS
- **FFmpeg** (`fluent-ffmpeg`) — video processing
- **Sharp** — image processing/thumbnails
- **Nostr** (`nostr-tools`) — decentralized content integration

### AI / Tooling
- **MCP SDK** (`@modelcontextprotocol/sdk` 1.26.0) — Model Context Protocol server for blog/license workflows
- **Zod** — runtime schema validation (stoked-mcp)

### Infrastructure
- **SST v3** (Ion/Pulumi) — AWS IaC
- **AWS Lambda** (Node.js 20.x) — serverless compute
- **API Gateway V2** — HTTP API routing
- **CloudFront + S3** — static site hosting with edge functions
- **Route 53** — DNS (zones for stoked-ui.com, stokedconsulting.com, stokedui.com)

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
- **Rust** (edition 2021) — video renderer core
- **wasm-bindgen** + **wasm-pack** — WASM compilation
- **web-sys** — browser API bindings
- **rayon** — parallel processing, **tokio** — async runtime

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
| Custom Babel (`scripts/build.mjs`) | All `sui-*` UI packages (common, media, file-explorer, file-explorer-v2, timeline, editor, github, docs, common-api) | `build/modern/` (ESM), `build/node/` (CJS), `build/stable/` (ES6) + types via `scripts/buildTypes.mjs` |
| NestJS CLI + webpack | `sui-media-api` | `dist/` (server), `dist-lambda/` (Lambda bundle) |
| Plain `tsc` | `docs-utils`, `proptypes`, `test-utils`, `stoked-mcp` | `build/` or `dist/` |
| `tsup` (CJS + ESM + dts) | `video-validator` | `dist/` |
| Cargo + wasm-pack | `sui-video-renderer` | `pkg/` (WASM + JS + types) |
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
pnpm deploy:prod      # Build media-api → dotenvx → sst deploy --stage production
pnpm deploy           # SST deploy (default stage, requires ROOT_DOMAIN env)
pnpm docs:deploy      # Deploy docs site
```

---

## 8. Infrastructure (SST v3 / AWS)

**App:** `stoked-ui`, AWS `us-east-1`
**Config:** `sst.config.ts` → imports `infra/` (index, api, site, domains, secrets, envVars)

**Mandatory env vars:** `ROOT_DOMAIN`, `MONGODB_URI` (exits if missing)

**SST Secrets:** `MONGODB_URI`, `ROOT_DOMAIN`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`

**Resources:**

| Resource | Type | Details |
|----------|------|---------|
| StaticSite | S3 + CloudFront | Serves `docs/export`. Edge functions: URL rewrites for stokedconsulting.com, CORS headers for media. Cache: 1yr immutable assets, no-cache HTML. |
| MediaApi Lambda | API Gateway V2 `$default` | `packages/sui-media-api/dist/lambda.bootstrap.handler`. Node 20.x, 1024MB, 29s. Linked: `MONGODB_URI`, `JWT_SECRET`, `BLOG_API_TOKEN`, `INVOICE_API_KEY`. SES send permission. |
| Subscribe Lambda | `POST /subscribe` | `api/subscribe.subscribe` — email subscription with UUID verification token |
| Verify Lambda | `GET /verify` | `api/subscribe.verify` — email verification |
| SMS Lambda | `POST /smss` | `api/sms.handler` — SNS SMS (E.164 format validation) |

**Domains:**
- `stoked-ui.com` (Route53 zone `Z007684515CR7EDIISGDG`)
- `stokedconsulting.com` (Route53 zone `Z2CYVWQGVIX8W6`)
- `stokedui.com` (Route53 zone `Z01533641XDJN0XULMW1A`)
- API subdomain: `api.{primaryDomain}`

---

## 9. Entry Points & Critical Paths

### Package Entry Points

| Package | Entry | Build Output |
|---------|-------|-------------|
| `@stoked-ui/common` | `packages/sui-common/src/index.tsx` | `build/`, `build/modern/`, `build/node/` |
| `@stoked-ui/common-api` | `packages/sui-common-api/src/index.ts` | `build/`, `build/modern/`, `build/node/` |
| `@stoked-ui/media` | `packages/sui-media/src/index.ts` | `build/`, `build/modern/`, `build/node/` |
| `@stoked-ui/file-explorer` | `packages/sui-file-explorer/src/index.ts` | `build/`, `build/modern/`, `build/node/` |
| `@stoked-ui/file-explorer-v2` | `packages/sui-file-explorer-v2/src/index.ts` | `build/`, `build/modern/`, `build/node/` |
| `@stoked-ui/timeline` | `packages/sui-timeline/src/index.ts` | `build/`, `build/modern/`, `build/node/` |
| `@stoked-ui/editor` | `packages/sui-editor/src/index.ts` | `build/`, `build/modern/`, `build/node/` |
| `@stoked-ui/github` | `packages/sui-github/src/index.ts` | `build/`, `build/modern/`, `build/node/` |
| `@stoked-ui/docs` | `packages/sui-docs/src/index.js` | `build/` (legacy bundle primary) |
| `@stoked-ui/media-api` | `packages/sui-media-api/src/main.ts` | `dist/` (NestJS), `dist-lambda/` (Lambda) |
| `@stoked-ui/stoked-mcp` | `packages-internal/stoked-mcp/src/index.ts` | `dist/index.js` (bin: `stoked-mcp`) |
| Docs site | `docs/pages/_app.js` | `docs/export/` (static) |

### User-Facing Entry Points

| Entry Point | Path/URL | Purpose |
|-------------|----------|---------|
| Docs site | `stoked-ui.com` / `pnpm docs:dev` (port 5199) | Product showcase and documentation |
| API Gateway | `api.stoked-ui.com/v1/*` | NestJS media-api routes |
| Subscribe | `api.stoked-ui.com/subscribe` | Email subscription |

### Infrastructure Critical Files

| File | Purpose |
|------|---------|
| `sst.config.ts` | SST app definition — imports `infra/` |
| `infra/index.ts` | Exports `createSite`, `createApi`, `getDomainInfo` |
| `infra/api.ts` | API Gateway + Lambda definitions + secrets |
| `infra/site.ts` | Static site (CloudFront) with edge functions |
| `infra/domains.ts` | Domain routing + Route53 zone IDs |
| `infra/secrets.ts` | SST secret management |
| `infra/envVars.ts` | Environment variable verification |

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
| `docs/next.config.mjs` | Next.js config (static export, webpack aliases, markdown loader) |

---

## 10. Workspace Configuration

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
```

### TypeScript Path Aliases (`tsconfig.json`)
```
@stoked-ui/common             → packages/sui-common/src
@stoked-ui/common-api         → packages/sui-common-api/src
@stoked-ui/media              → packages/sui-media
@stoked-ui/file-explorer      → packages/sui-file-explorer/src
@stoked-ui/timeline           → packages/sui-timeline
@stoked-ui/editor             → packages/sui-editor
@stoked-ui/github             → packages/sui-github
@stoked-ui/docs               → packages/sui-docs/src
@stoked-ui/docs-utils         → packages-internal/docs-utils/src
@stoked-ui/docs-markdown      → packages/sui-internal-markdown/src
@stoked-ui/internal-test-utils → packages/test-utils
@stoked-ui/video-renderer-wasm → packages/sui-editor/src/WasmPreview/wasm-module.d.ts
```

### Key Environment Variables

- `ROOT_DOMAIN` — Primary domain (stoked-ui.com, stokedconsulting.com) — **mandatory**
- `MONGODB_URI` — MongoDB connection string (SST secret) — **mandatory**
- `JWT_SECRET` — Authentication token signing (SST secret)
- `BLOG_API_TOKEN` — Blog API authentication (SST secret)
- `INVOICE_API_KEY` — Invoice API key (SST secret)
- `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` — Stripe integration
- `AUTH_AUTO_DOMAINS` — Auto-approved auth domains
- `NOSTR_RELAYS` / `NOSTR_NPUBS` — Nostr integration config

---

## 11. Patterns & Conventions

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

**Exception:** `@stoked-ui/file-explorer-v2` has no `@stoked-ui/*` peer deps — standalone with only MUI/React peers. Provides adapters (`fileBaseToFileItem`, `fileItemToFileBase`) for v1 interop.

### MUI v5 Foundation
Components extend MUI v5 patterns: `styled()`, `useTheme()`, `sx` prop, theme customization. File explorers wrap `@mui/x-tree-view`.

### State Management
React Context + Provider pattern throughout: `EditorProvider`, `DocsProvider`, `TimelineProvider`. No external state library (Redux, Zustand) in stoked-ui packages.

### NestJS Convention
Standard NestJS modular architecture: Mongoose schemas as models, DTOs with `class-validator`, Swagger auto-generation, JWT + Passport auth, Lambda deployment via `@codegenie/serverless-express`.

### Naming
- **npm scope:** `@stoked-ui/<name>`
- **Directory:** `packages/sui-<name>`
- **Build output:** `build/` (Babel packages), `dist/` (API packages, tsc/tsup)

### Resolution Overrides
Critical pinned versions in root `package.json`:
- React: `18.3.1` (exact)
- MUI: `5.17.1` (pnpm overrides)
- `@emotion/styled`: `11.8.1`
- `@interactjs/*`: `1.10.11`
- `webpack`: `>=5.104.1`

---

## 12. Project Feature Branches (`projects/`)

Completed or in-progress feature branches managed as worktrees:

| Directory | Feature |
|-----------|---------|
| `add-backend-video-processing-documentation` | Video processing docs |
| `add-new-products-and-dynamic-products-menu` | Product catalog expansion |
| `build-multi-platform-blog-system` | Multi-platform blog (Nostr) |
| `build-social-links-component` | Social links component |
| `complete-rust-wasm-video-renderer` | Rust/WASM renderer completion |
| `file-explorer-v2` | MUI X Tree View v2 integration (recently integrated) |
| `implement-full-text-search-with-deploy-time-reindexing` | Search infrastructure |
| `implement-stripe-license-key-system-api` | Stripe licensing API |
| `migrate-file-explorer-to-mui-x-tree-view` | File explorer migration |
| `migrate-media-components-to-sui-media-package-with-nestjs-api` | Media package consolidation |
| `product-mgmt-square-pricing` | Product management / Square pricing |

---

## 13. Tracked Packages (`.stokd/meta/config.json`)

```json
[
  "packages/sui-common",
  "packages/sui-common-api",
  "packages/sui-docs",
  "packages/sui-editor",
  "packages/sui-file-explorer",
  "packages/sui-file-explorer-v2",
  "packages/sui-github",
  "packages/sui-media",
  "packages/sui-media-api",
  "packages/sui-timeline"
]
```
