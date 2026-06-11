# Stoked UI — Codebase Overview

> **Generated:** 2026-05-21 (upgraded 0.3.0 → 0.4.0) · **Refreshed:** 2026-06-06 (timed re-verification — no codebase drift, HEAD `29ec514149`; prior same-day: audit-bot lead-gen pass + baseline; earlier: 2026-05-28) | **Meta version:** 0.4.0
> **Repository:** `@stoked-ui/sui` v0.1.0-alpha.5 (private monorepo root)
> **Root:** `/opt/worktrees/stoked-ui/stoked-ui-main`
> **Package manager:** pnpm 10.5.1 (enforced via `preinstall: npx only-allow pnpm`)
> **Workspace packages tracked in meta v0.4.0:** 11 — `sui-cdn`, `sui-common`, `sui-common-api`, `sui-docs`, `sui-editor`, `sui-file-explorer`, `sui-github`, `sui-media`, `sui-media-api`, `sui-timeline`, `sui-video-renderer`
> **Docs app framework (installed):** Next.js **13.5.11** (manifest `next@^13.5.1`, Pages Router) · port **5199**

---

## 1. Repository Purpose

Stoked UI is a pnpm / Turborepo / Lerna monorepo that produces a media-centric React component suite (timeline editor, file explorer, video editor, GitHub widgets, CDN/file browser), a NestJS media API, a Next.js 13.5 documentation + marketing + admin site, a Rust→WASM video renderer, and the SST (AWS) infrastructure that deploys it all to `sui.stokd.cloud` / `consulting.stokd.cloud`.

The repo ships three product surfaces:

1. **`@stoked-ui/*` npm packages** — Reusable React libraries built on MUI v5, published to npm under the `@stoked-ui` scope.
2. **`stokedui-com` (`docs/`)** — Next.js 13.5 (Pages Router; `next@^13.5.1`, installed 13.5.11) documentation + marketing + admin app (port **5199**) that consumes the packages and hosts non-media business APIs at `docs/pages/api/*`. This surface also hosts the consulting site (`docs/pages/consulting/**`, e.g. `ai/`, `front-end/`, `back-end/`, `devops/`, `full-stack/`) and the **audit-bot lead-gen agent** (`docs/pages/api/audit/{turn.ts, save-lead.ts}` → `docs/src/modules/auditBot/*`), a playbook-driven conversational funnel for `consulting.stokd.cloud` that performs a live, SSRF-guarded audit of a visitor-supplied URL, captures the lead, emails a branded report via SES, and notifies Brian (Telegram + BCC).
3. **AWS deployment via SST v4** — CloudFront sites, API Gateway v2 + Lambda surface, CDN buckets, ACM certs, and supporting Lambdas in `api/`. Entry: `sst.config.ts` → `infra/index.ts`.

A native Rust crate (`packages/sui-video-renderer`) compiles to WASM and is consumed by `@stoked-ui/editor` for in-browser video preview/rendering.

---

## 2. Top-Level Layout

```
stoked-ui-main/
├── packages/                    Public @stoked-ui/* workspace packages
│   ├── sui-cdn/                 Embeddable CDN/S3 file browser component
│   ├── sui-common/              Shared client utilities (LocalDb, Mime, FetchBackoff, hooks)
│   ├── sui-common-api/          Shared server utilities (NestJS, Mongoose models, DTOs, decorators)
│   ├── sui-docs/                Documentation building blocks (Demo, CodeSandbox, MDX helpers)
│   ├── sui-editor/              Video/animation editor (uses file-explorer + timeline + media)
│   ├── sui-file-explorer/       File explorer + drag-and-drop (forked from @mui/x-tree-view)
│   ├── sui-github/              GitHub calendar / events / commits / branch components
│   ├── sui-media/               Framework-agnostic media abstractions, players, hooks, FileSystemApi
│   ├── sui-media-api/           NestJS API (media CRUD, metadata, thumbnails, S3, Mongo, Lambda)
│   ├── sui-timeline/            Animation/scrubber timeline engine + UI
│   ├── sui-video-renderer/      Rust workspace (compositor + wasm-preview + cli) → WASM
│   ├── stoked-ui-project-1/     Project sandbox
│   └── zero-runtime/            Pigment CSS zero-runtime CSS-in-JS experiment
│
├── packages-internal/           Private workspace packages
│   ├── stoked-cli/, stoked-mcp/                   Rust CLI + MCP server tooling
│   ├── api-docs-builder/, docs-utils/, markdown/  Documentation pipeline
│   ├── proptypes/, react-docgen-types/            Docgen support
│   ├── eslint-plugin-stoked-ui/                   House lint rules
│   ├── test-utils/                                Internal test harness
│   ├── sui-envinfo/, sui-video-validator/         Diagnostic / validation
│   ├── cdn/, cdn-sui/                             Vite CDN admin apps
│   ├── feedback/, IndexAutogen/, rsc-builder/, netlify-plugin-cache-docs/, markdownlint-rule-mui/
│
├── docs/                        Next.js 13.5 site (`stokedui-com`, port 5199)
│   ├── pages/api/**             Business / domain endpoints (non-media)
│   ├── src/, scripts/, data/, translations/, public/, work-items/
│
├── api/                         Standalone Lambda handler entrypoints
│   ├── auth/, lib/, promos.ts, sms.ts, subscribe.ts
│
├── infra/                       SST stack definitions
│   ├── api.ts, cdn-site.ts, cert.ts, domains.ts, envVars.ts, secrets.ts, site.ts, index.ts
│
├── projects/                    Stokd project orchestration artifacts (state.mjs, build-state.mjs, orchestrate.workflow.js, prd.md)
├── benchmark/                   Browser benchmarks (workspace package)
├── test/                        Karma / Playwright / e2e harness + fixtures
├── scripts/                     Build, release, codegen, sizing scripts
├── netlify/                     Netlify functions
├── examples/                    Standalone consumer examples
├── sst.config.ts                SST entrypoint
├── turbo.json                   Turborepo task graph
├── lerna.json                   Independent versioning configuration
├── pnpm-workspace.yaml          Workspace globs + onlyBuiltDependencies allowlist
├── nx.json                      NX cache config (used by zero-runtime targets)
└── .stokd/                      Stokd governance + context
    ├── meta/                    Context files (this directory): SC_OVERVIEW, SC_AXIOMS, SC_MODULES, …
    └── projects/<slug>/         Per-project PRDs + phase plans (governed task/project workflow)
```

`pnpm-workspace.yaml` includes: `benchmark`, `packages/*`, `packages-internal/*`, `docs`, `api`, `infra`, `test`.

---

## 3. Architecture & Package Dependency Graph

The public packages form a layered graph (arrow = "depends on"):

```
┌──────────────────────────────────────────────────────────────────────┐
│                           docs (stokedui-com)                        │
│  Next.js 13.5 · port 5199 · pages/api/* business endpoints · MUI v5 │
└──────────────────────────────────────────────────────────────────────┘
            │                │                │                │
            ▼                ▼                ▼                ▼
       sui-editor      sui-timeline     sui-file-explorer   sui-github
            │                │                │                │
            ├────────────────┼────────────────┤                │
            ▼                ▼                ▼                ▼
                          sui-media  ◄── sui-cdn (peer)
                              │
                              ▼
                         sui-common  ◄────── sui-docs (uses media/timeline/editor/file-explorer)
                              │
                              ▼
                       sui-common-api ──► sui-media-api (NestJS)
                                                │
                                                ▼
                                       MongoDB · S3 · Sharp · ffmpeg
                                       Lambda (via @codegenie/serverless-express)

       sui-video-renderer (Rust workspace)
         compositor + wasm-preview + cli
                │  wasm-pack build
                ▼
         packages/sui-video-renderer/pkg
                │  (optionalDependency, file:)
                ▼
           sui-editor  →  WasmPreview module
```

Edges verified from each `package.json`:

- **`@stoked-ui/common`** (`packages/sui-common`) — Foundation. No internal deps. Exports `LocalDb`, `Mime`, `FetchBackoff`, `UserMenu`, `useResize`, etc.
- **`@stoked-ui/common-api`** (`packages/sui-common-api`) — Depends on `@stoked-ui/common`. NestJS + Mongoose decorators/DTOs/models. Source under `src/{decorators,dtos,models}`.
- **`@stoked-ui/media`** (`packages/sui-media`) — Depends on `@stoked-ui/common`. `MediaFile`, `WebFile`, `FileSystemApi`, `Stage`, players, hooks. The `MediaCard` component (analyzed entry point) lives at `packages/sui-media/src/components/MediaCard/`.
- **`@stoked-ui/cdn`** (`packages/sui-cdn`) — No `@stoked-ui` deps; peer-depends on React. `CdnApi`, `CdnBrowser`.
- **`@stoked-ui/file-explorer`** (`packages/sui-file-explorer`) — Peer-depends on `@stoked-ui/common` and `@stoked-ui/media`. Forked from `@mui/x-tree-view` with `@atlaskit/pragmatic-drag-and-drop`.
- **`@stoked-ui/timeline`** (`packages/sui-timeline`) — Peer-depends on `@stoked-ui/common`, `@stoked-ui/file-explorer`, `@stoked-ui/media`. Exports `Engine`, `Controller`, `TimelineProvider`, `TimelineTrack`, `TimelinePlayer`.
- **`@stoked-ui/editor`** (`packages/sui-editor`) — Peer-depends on `@stoked-ui/common`, `@stoked-ui/file-explorer`, `@stoked-ui/media`, `@stoked-ui/timeline`. **Optional** `@stoked-ui/video-renderer-wasm` via `file:../sui-video-renderer/pkg`. Exports `Editor`, `EditorEngine`, `EditorProvider`, `WasmPreview`, `EditorFile`, `Controllers`.
- **`@stoked-ui/github`** (`packages/sui-github`) — Depends on `@stoked-ui/common`. `GithubCalendar`, `GithubEvents`, `GithubBranch`, `GithubCommit`.
- **`@stoked-ui/docs`** (`packages/sui-docs`) — Depends on `@stoked-ui/editor`, `@stoked-ui/file-explorer`, `@stoked-ui/media`, `@stoked-ui/timeline`. Exports declared via subpath `exports` map (e.g., `./Demo`, `./CodeSandbox`) rather than a single barrel.
- **`@stoked-ui/media-api`** (`packages/sui-media-api`) — Depends on `@stoked-ui/common`, `@stoked-ui/common-api`. NestJS app with Mongo, S3, Sharp, fluent-ffmpeg, Stripe, JWT/Passport, Swagger. Deploys via `@codegenie/serverless-express` (`src/{app.module.ts, main.ts, lambda.ts}`).
- **`sui-video-renderer`** — Rust Cargo workspace (`packages/sui-video-renderer/Cargo.toml` → `compositor`, `wasm-preview`, `cli`). Built with `cargo build --release` or `wasm-pack build` for the editor consumer.

### Critical boundary rule (from `.stokd/meta/SC_CONTEXT.md` and `CLAUDE.md`)

> **`sui-media-api` is reserved for media-component endpoints only.** Business/domain routes (products, clients, licenses, invoices, users, non-media auth) belong in `docs/pages/api/*`. The existing route folders confirm this: `docs/pages/api/{account, audit, auth, blog, cdn, chat, clients, deliverables, github, invoices, licenses, products, upload, users, webhooks}` plus `logs.ts`, `openapi.ts`. The `audit/` routes (`turn.ts`, `save-lead.ts`) are the consulting-site lead-gen chat surface, backed by `docs/src/modules/auditBot/*`, which is organized as **playbooks × channels × leads**:
> - **Playbooks** (`auditBot/playbooks/{ai-readiness, cloud-cost, security}` with `index.ts`, `server.ts`) — the audit verticals; each ships a `system.md` persona/instruction set.
> - **Channels** (`auditBot/channels/{web, linkedin, voice}`) — delivery surfaces; `web/components/AuditBot.tsx` is the in-page React widget.
> - **Engine + lead plumbing** — `conversationRunner.ts` (turn loop), `llmClient.ts` (OpenAI-compatible inference; defaults to LM Studio / Qwen 2.5 32B at `AUDIT_BOT_BASE_URL`), `tools.ts` + `urlSafety.ts` (SSRF-guarded URL fetch — see `AX-AUDIT-BOT-URL-SAFETY`), `leadFields.ts` (lead extraction), `reportValidation.ts` + `deliverables.ts` (report assembly), `auditMailer.ts` (SES report email, Brian BCC'd), `notifyTelegram.ts` (lead alert), `auditStore.ts` (persistence), `types.ts`.

---

## 4. Key Technologies

| Area | Stack |
|------|-------|
| Language | TypeScript 5.4, Rust 2021, JavaScript |
| UI | React 18.3.1 (pinned via `pnpm.overrides`), MUI v5 pinned to `@mui/material` 5.17.1 / `@mui/system` 5.17.1 / `@mui/utils` 5.17.1 / `@mui/base` 5.0.0-beta.40, Emotion 11 (`@emotion/styled` 11.8.1 pinned) |
| Docs app | Next.js 13.5 (Pages Router; `next@^13.5.1`), `@mui/material-nextjs` ^5.16.6, MDX, `@docsearch/react`, `react-spring`, Tailwind (`docs/tailwind.config.js`) |
| Audit bot / lead-gen | `openai` (OpenAI-compatible client → LM Studio / Qwen 2.5 by default), `undici@^6` (SSRF-safe fetch agent), `@aws-sdk/client-ses` (report email), Telegram notify |
| Build | Turborepo 2.7, NX 20.5 (Pigment/zero-runtime targets), Lerna 8 (versioning only), Babel 7 (custom `babel.config.js`), tsup 8, custom `scripts/build.mjs` (modern/node/stable targets + types + copy) |
| Backend | NestJS 10, Mongoose 8 / MongoDB 6.12, Express 5, Passport JWT, class-validator, Swagger |
| Media processing | Sharp 0.34, fluent-ffmpeg, AWS SDK v3 (S3 / SES / SNS / ACM) |
| Native | Rust workspace: `image`, `imageproc`, `fast_image_resize`, `resvg`, `tokio`, `rayon`, `wasm-bindgen`, `wasm-bindgen-futures`, `web-sys` |
| Testing | Mocha + Karma (browser), Playwright (`test:e2e-website` against port 5199), Jest (per-package, NestJS), nyc coverage, Argos visual regressions |
| Lint / Format | ESLint (airbnb + house plugin `eslint-plugin-stoked-ui`), Prettier 3, Stylelint, markdownlint-cli2, Vale |
| Infra | SST **v4.2.0** at the root (drives `sst.config.ts` → `infra/*`, installed 4.2.0) on AWS (`stokd-cloud` profile, us-east-1), CloudFront StaticSite + CdnSite, API Gateway v2, Lambda, SNS, Stripe. NB: `docs/package.json` still lists `sst@^3.6.19` as a dependency — a vestigial v3 pin that does not drive deploys (root v4 is authoritative); flagged for cleanup. |
| Identity | `@react-oauth/google`, `google-auth-library`, JWT, bcryptjs |
| Release | dotenvx, `lerna version --no-private`, `pnpm publish --recursive`, Verdaccio for dry runs |

---

## 5. Build System & Workflow

### Workspace tooling
- **pnpm 10.5.1** workspaces; the `preinstall` script blocks non-pnpm via `only-allow`. `onlyBuiltDependencies` in `pnpm-workspace.yaml` whitelists native builds (`@nestjs/core`, `aws-sdk`, `core-js`, `esbuild`, `mongodb-memory-server`, `msgpackr-extract`, `nx`, `puppeteer`, `sharp`).
- **Turborepo** orchestrates `dev`, `dev:prepare`, `build`, `test`, `lint`, `typescript` (`turbo.json`):
  - `build` depends on `^build`, caches `dist/**`, `build/**`, `.next/**` (excluding `.next/cache/**`).
  - `dev:prepare` is cached and depends on `^dev:prepare` so upstream packages publish `build/modern` + types before downstream `dev` watchers start.
  - `dev` is `persistent: true`, `cache: false`.
  - `typescript` depends on `^build`.
- **Lerna** is configured for version bumps only (`independent` mode, `npmClient: pnpm`).
- **NX** is reserved for the Pigment CSS / zero-runtime targets (`pnpm watch:zero`, `pnpm build:zero`).

### Per-package build pipeline
Most `@stoked-ui/*` packages share these scripts (verified in `packages/sui-editor/package.json:30-40`):

```
pnpm build = build:modern → build:node → build:stable → build:types → build:copy-files
```

Each step shells out to root scripts:
- `scripts/build.mjs <target>` — Babel transpile per target (`modern`, `node`, `stable`).
- `scripts/buildTypes.mjs` — emits `.d.ts` files.
- `scripts/copyFiles.mjs` — stages `package.json` + assets into `build/`.

`dev:prepare` typically runs `build:modern` + `build:types` so workspace consumers see fresh `build/modern/index.js` and `index.d.ts` before `dev` watches kick in.

### Top-level scripts (`package.json`)
- `pnpm dev` — kills stale dev services, runs `turbo run dev:prepare`, then `turbo run dev --parallel --concurrency 15`.
- `pnpm docs:dev` — Next.js dev server on **port 5199** (`docs/package.json`). Always 5199, never 3000.
- `pnpm build` — Turbo build of everything except `stokedui-com`.
- `pnpm build:all` — full Turbo build then `pnpm docs:build`.
- `pnpm build:wasm` — runs `packages/sui-video-renderer/scripts/build-wasm.sh`.
- `pnpm video-renderer:build` — `cargo build --release`.
- `pnpm video-renderer:build-wasm` — `wasm-pack build --target web --out-dir ../pkg`.
- `pnpm test` — `node scripts/test.mjs` (orchestrator over unit/karma/e2e).
- `pnpm test:e2e-website:dev` — Playwright against `http://localhost:5199`.
- `pnpm release` = `build:all` → `release:version` → `deploy:prod`.
- `pnpm deploy:prod` — `dotenvx run -- sst deploy --stage production` (uses AWS profile `stokd-cloud`).
- `pnpm clean` / `pnpm clean:build` — wipe build artifacts and lockfiles.
- Package shortcuts: `pnpm common`, `pnpm common-api`, `pnpm editor`, `pnpm file-explorer`, `pnpm github`, `pnpm media`, `pnpm media-api`, `pnpm timeline`, `pnpm docs`, `pnpm cli`.

### Turbo dev caveats
- `dev:prepare` is what unblocks live editing — without it, downstream packages won't pick up upstream type/source updates.
- A package's `dev:prepare` is required even if you only intend to edit that package, because Turbo walks `^dev:prepare` for ancestors.
- `next.config.mjs` changes require a dev-server restart (not HMR).

---

## 6. Entry Points & Critical Paths

### Application entry points

| Surface | Entry | Notes |
|---------|-------|-------|
| Docs / marketing / consulting site | `docs/pages/_app.js`, `docs/pages/_document.js` | Next.js 13.5 Pages Router, port 5199. Service worker via `docs/scripts/buildServiceWorker.js` (`build-sw`). `dev` runs `github:snapshots` then `next dev -p 5199`. |
| Business APIs | `docs/pages/api/**` | All non-media domain endpoints per the boundary rule. |
| Audit bot (consulting) | `docs/pages/api/audit/{turn.ts, save-lead.ts}` → `docs/src/modules/auditBot/*` | Playbook-driven lead-gen agent for `consulting.stokd.cloud`: `turn.ts` runs the chat loop (`conversationRunner` + `llmClient` + SSRF-guarded `tools`/`urlSafety`); `save-lead.ts` persists the lead (`auditStore`), emails the SES report (`auditMailer`), and alerts Brian (`notifyTelegram`). |
| Media API (server) | `packages/sui-media-api/src/main.ts` → `Server.start()` from `app.ts` | NestJS bootstrap; silences `console.log` in prod. |
| Media API (Lambda) | `packages/sui-media-api/src/lambda.ts` + `lambda.bootstrap.ts` | `@codegenie/serverless-express` adapter. |
| Root Lambda handlers | `api/auth/*`, `api/subscribe.ts`, `api/sms.ts`, `api/promos.ts` | Wired into SST via `infra/api.ts`. |
| Editor component | `packages/sui-editor/src/index.ts` (`Editor` default; named `EditorEngine`, `EditorProvider`, `WasmPreview`, `EditorFile`, `Controllers`) | |
| Timeline component | `packages/sui-timeline/src/index.ts` (`Engine`, `Controller`, `TimelineProvider`, `TimelinePlayer`) | |
| File explorer | `packages/sui-file-explorer/src/index.ts` (`FileExplorer`, `FileExplorerBasic`, `FileDropzone`) | |
| Media core | `packages/sui-media/src/index.ts` (`MediaFile`, `WebFile`, `FileSystemApi`, `Stage`, hooks, performance, server) | |
| WASM video renderer | `packages/sui-video-renderer/wasm-preview/` (cdylib + rlib via `wasm-bindgen`); shared logic in `compositor/`; native CLI in `cli/` | Output → `packages/sui-video-renderer/pkg/`, consumed by editor as `@stoked-ui/video-renderer-wasm`. |
| Infra deploy | `sst.config.ts` → `infra/index.ts` → `createSite`, `createApi`, `createCdnSite`, `createCdnSuiSite` | Returns `{ site, cdn, cdnSui, api }` URLs. |

### Critical runtime paths

- **Editor video pipeline:** `EditorFile` → `EditorEngine` (`packages/sui-editor/src/EditorEngine`) drives timeline state via `@stoked-ui/timeline` `Engine`, renders frames through `WasmPreview` (dynamic import of `@stoked-ui/video-renderer-wasm`; auto-detects bundler vs web target). EditorEngine requires the WASM build present at `packages/sui-video-renderer/pkg`; the webpack alias is configured in `docs/next.config.mjs` and depends on `experiments.asyncWebAssembly: true`.
- **Media metadata path:** `sui-media`'s `extractVideoMetadata` writes into a `ScreenshotStore`; consumers persist to IndexedDB via `sui-common/LocalDb`. The empty-store guard (`count > 0`) prevents the previous block on first generation.
- **MediaCard render path** (analyzed directory): `packages/sui-media/src/components/MediaCard/MediaCard.tsx` consumes `MediaCard.types.ts` and is exercised by `__tests__/MediaCard.test.tsx`. `file.media` uses a `createSettings` Proxy — properties set via `Object.assign` don't always propagate through React state updates; detail views use DOM `<video>` element fallbacks for duration/width/height. **Active work (2026-06):** the `media-pairing-poster-detection` project (PRD at `.stokd/projects/media-pairing-poster-detection/prd.md`, 5 phases) pairs video+image objects sharing a basename, uses the image as the video card's poster, collapses the redundant image card in the `sui-cdn` `CdnBrowser` gallery, and exposes the image's actions via a thumbnail FAB/menu. Recent commits (`6145267e70`, `a1a92da872`, `76a8732750`) auto-extract a first-frame thumbnail for CORS-friendly video posters across `MediaCard` and CDN videos.
- **Business API request flow:** browser → `docs/pages/api/<domain>/...` → MongoDB (`mongodb` 6.12). Stripe + Google OAuth integrate at this layer.
- **Audit-bot lead-gen flow:** `web/components/AuditBot.tsx` → `POST /api/audit/turn` → `conversationRunner` selects the playbook persona and calls `llmClient` (OpenAI-compatible; LM Studio / Qwen by default). When the model calls the URL-fetch tool, `tools.ts` dials through an SSRF-safe undici agent enforcing `urlSafety.ts` (http/https only, no private/reserved IPs, redirects re-validated hop-by-hop). On completion, `POST /api/audit/save-lead` validates and assembles the report (`reportValidation` + `deliverables`), persists the lead (`auditStore`), emails it via SES (`auditMailer`, Brian BCC'd), and pings Telegram (`notifyTelegram`).
- **Media API request flow:** client → `sui-media-api` NestJS controllers → Mongoose models → S3 / Sharp / ffmpeg. Same codebase runs locally (Nest CLI) and serverless (Lambda adapter).
- **Deployment path:** `pnpm deploy:prod` → `sst deploy --stage production` → `infra/{site,cdn-site,api,cert,domains,secrets}.ts` provisions CloudFront, API Gateway v2, Lambdas, and certs.

### Dependency pin / override notes (`package.json:267-291`)
MUI is pinned tree-wide (`@mui/material` 5.17.1, `@mui/system` 5.17.1, `@mui/utils` 5.17.1, `@mui/base` 5.0.0-beta.40). React is pinned to 18.3.1. Security overrides: `tar` ≥7.5.7, `axios` ≥1.13.5, `multer` ≥2.0.2, `glob` ≥10.5.0, `webpack` ≥5.104.1, `lodash` ≥4.17.23, `qs` ≥6.14.1, `js-yaml` ≥4.1.1, `fast-xml-parser` ≥5.3.4, `diff` ≥5.2.2, `micromatch` ≥4.0.8. `@babel/plugin-transform-destructuring` is overridden to `@minh.nguyen/plugin-transform-destructuring`. `@interactjs/*` pinned to 1.10.11.

---

## 7. Patterns & Conventions

- **Source-first imports:** packages set `main: src/index.ts` so workspace consumers import sources directly during dev; production publishes from `build/` (set via `publishConfig.directory`).
- **Subpath exports:** `sui-docs` uses an `exports` map per component (`./Demo`, `./CodeSandbox`, …) rather than a single barrel.
- **Peer-driven graph:** higher-level packages declare other `@stoked-ui/*` libs as **peer** dependencies (see `sui-editor`, `sui-timeline`, `sui-file-explorer`) so consumers control versions; their own `dependencies` stay lean.
- **Optional WASM:** `sui-editor` lists `@stoked-ui/video-renderer-wasm` as an `optionalDependency` with a `file:` path, allowing the editor to ship without the Rust artifact when not needed.
- **Boundary enforcement:** business APIs in docs, media APIs in `sui-media-api` — see `.stokd/meta/SC_CONTEXT.md` and `CLAUDE.md`.
- **Three Babel build targets per package:** `modern`, `node`, `stable` (legacy browsers). Output lands in `build/modern`, `build/node`, `build/`.
- **Lambda dual-bundle:** `sui-media-api` has both `dev`/`start` (Nest CLI) and a `lambda.ts` adapter — the same codebase runs locally and serverless.
- **AWS profile discipline:** all personal infra uses `--profile stokd-cloud`. The default AWS profile is a customer production account and must not be used for SUI work.

---

## 8. Where to Start (for new contributors)

1. Read `.stokd/meta/SC_CONTEXT.md`, project `CLAUDE.md`, and `AGENTS.md` for guardrails (media-API boundary, port 5199, AWS profile rules).
2. `pnpm i` (pnpm 10.5.1+ required).
3. `pnpm dev` for the full watch graph, or `pnpm docs:dev` for just the Next.js site on port 5199.
4. For editor work, build WASM first: `pnpm video-renderer:build-wasm` (or `pnpm build:wasm`).
5. Touch the relevant package's `src/`; Turbo's `dev:prepare` chain feeds the docs app. `next.config.mjs` changes require a dev-server restart, not HMR.
6. Before committing: `pnpm eslint`, `pnpm typescript`, `pnpm test:unit` (or scoped: `pnpm editor`, `pnpm media`, `pnpm timeline`, etc.).

---

## 9. Cross-References

- Module table: `.stokd/meta/SC_MODULES.md`
- Per-package modules: `.stokd/meta/packages/<pkg>/SC_MODULE.md` — directories present under `.stokd/meta/packages/`: `sui-cdn`, `sui-common`, `sui-common-api`, `sui-docs`, `sui-editor`, `sui-file-explorer`, `sui-github`, `sui-media`, `sui-media-api`, `sui-timeline`, `sui-video-renderer` (legacy top-level `SC_MODULE_SUI_*.md` stubs have been removed in the 0.4.0 migration)
- Views inventory: `.stokd/meta/SC_VIEWS.md`
- Flows / data paths: `.stokd/meta/SC_FLOWS.md`
- Test inventory: `.stokd/meta/SC_TEST.md` (and per-package `SC_TEST.md` under `.stokd/meta/packages/`)
- Product card: `.stokd/meta/SC_PRODUCT_STOKED_UI_SUI.md`
- Axioms: `.stokd/meta/SC_AXIOMS.md` (repo-wide `AX-REPO-*` invariants, plus `AX-AUDIT-BOT-URL-SAFETY` governing the audit-bot SSRF guards in `docs/src/modules/auditBot/{urlSafety,tools}.ts`), per-package `.axioms.md`, legacy `~/.stokd/SC_AXIOMS.md`
- Guardrails: `.stokd/meta/SC_CONTEXT.md`, `CLAUDE.md`, `AGENTS.md`
- Recommendations log: `.stokd/meta/SC_RECOMMENDATIONS.md`
- Governed project PRDs / phase plans: `.stokd/projects/<slug>/` (e.g. `media-pairing-poster-detection/{prd.md, phases/*}`); orchestration runtime state in top-level `projects/<slug>/`
- Package READMEs: each `packages/sui-*/README.md` (e.g. the new `packages/sui-cdn/README.md`)
- Meta tracking config: `.stokd/meta/config.json` (lists all 11 tracked packages; the 2026-05-28 refresh added `sui-cdn` and `sui-video-renderer`, resolving the prior drift between `config.json.packages` and the `.stokd/meta/packages/<pkg>/` directories)

---

## 10. Changes in 2026-06-06 Refresh — timed re-verification pass (meta v0.4.0)

This pass was a scheduled (timed) refresh. The repository HEAD is unchanged since the same-day audit-bot pass (`29ec514149` "chore: land in-flight work from parallel sessions"), so **no architectural, dependency, or structural drift was found**. All claims below were re-verified against the live tree and preserved:

- **Versions:** docs app `stokedui-com` manifest `next@^13.5.1` / installed **13.5.11**; root SST installed **4.2.0** while `docs/package.json` still carries the vestigial `sst@^3.6.19` (confirmed still present — flagged for cleanup in §4). Package versions: `@stoked-ui/editor` 0.1.2, `media-api` 1.0.0, `timeline` 0.1.3, `file-explorer` 0.1.2, `common` 0.1.2, `common-api` 0.1.0, `cdn` 0.1.0-alpha.5, `github` 0.1.0-alpha.11.3, `docs` 0.1.21, `media` 0.1.0-alpha.5; root `@stoked-ui/sui` 0.1.0-alpha.5.
- **Audit-bot lead-gen deps confirmed present** in `docs/package.json`: `openai@^4.77.0`, `undici@^6`, `@aws-sdk/client-ses@^3.731.1`, `archiver@^6.0.1`. The `docs/src/modules/auditBot/` module tree (`conversationRunner`, `llmClient`, `tools`+`urlSafety`, `leadFields`, `reportValidation`, `deliverables`, `auditMailer`, `notifyTelegram`, `auditStore`, `types`, plus `channels/` and `playbooks/` and co-located `*.test.ts`) and the `docs/pages/api/audit/{turn,save-lead}.ts` endpoints are all present.
- **Boundary roster intact:** `docs/pages/api/**` business domains = `account, audit, auth, blog, cdn, chat, clients, deliverables, github, invoices, licenses, products, upload, users, webhooks` + `logs.ts`, `openapi.ts` — matches §3 exactly.
- **WASM artifacts present:** `packages/sui-video-renderer/pkg/` carries `wasm_preview*` outputs (`.wasm`, `.js`, `.d.ts`); editor `optionalDependency` `@stoked-ui/video-renderer-wasm` → `file:../sui-video-renderer/pkg` intact.
- **Package rosters match:** `packages/` = 11 `sui-*` + `stoked-ui-project-1` + `zero-runtime`; `config.json.packages` lists the 11 tracked `sui-*` packages; `packages-internal/` contents match §2. No changes to `pnpm-workspace.yaml`, `turbo.json`, or the `pnpm.overrides` / `resolutions` pins in root `package.json`.

## 11. Changes in 2026-06-06 Refresh — audit-bot lead-gen pass (meta v0.4.0)

- **Documented the completed audit-bot lead-gen agent** (commit `86ed35e3d0`, landed alongside `29ec514149`). `docs/src/modules/auditBot/` grew from a thin `{conversationRunner, playbooks, auditStore}` sketch into a full **playbooks × channels × leads** agent: playbooks `{ai-readiness, cloud-cost, security}`; channels `{web, linkedin, voice}` (`web/components/AuditBot.tsx`); and engine/lead plumbing `llmClient.ts`, `tools.ts` + `urlSafety.ts`, `leadFields.ts`, `reportValidation.ts`, `deliverables.ts`, `auditMailer.ts`, `notifyTelegram.ts`, `types.ts` (each with co-located `*.test.ts`). Expanded §1, the §3 boundary rule, the §6 entry-point table, and added an audit-bot critical-path entry in §6.
- **Recorded the SSRF guard and its axiom:** visitor-supplied URL fetches now dial through an SSRF-safe undici agent enforcing `urlSafety.ts` (http/https only, no private/reserved IPs, hop-by-hop redirect re-validation, size/timeout caps), governed by the new `AX-AUDIT-BOT-URL-SAFETY` axiom in `.stokd/meta/SC_AXIOMS.md`. Cross-referenced in §9.
- **Noted the inference stack:** `llmClient.ts` uses an OpenAI-compatible endpoint (`openai` dep in `docs/package.json`), defaulting to LM Studio serving Qwen 2.5 32B-Instruct at `AUDIT_BOT_BASE_URL`; the SES report mailer (`auditMailer.ts`) reuses `@aws-sdk/client-ses` and BCCs `AUDIT_REPORT_BCC_EMAIL`.
- **Re-verified** installed Next.js (**13.5.11**), root SST (**4.2.0**, with `docs/package.json` still carrying the vestigial `sst@^3.6.19`), WASM artifacts present in both `packages/sui-video-renderer/pkg/` and `wasm-preview/pkg/`, the 11-package `config.json` roster, `pnpm-workspace.yaml`, and `turbo.json`. All preserved where accurate.

## 12. Changes in 2026-06-06 Refresh — baseline pass (meta v0.4.0)

- **Fixed two stale "Next.js 14" references** left in §2 (top-level layout) and §3 (dependency-graph diagram) — the docs app is Next.js **13.5.11** (manifest `next@^13.5.1`). The 2026-05-28 refresh corrected §1/§4/§6 but missed these; now consistent. Added the installed framework version to the header.
- **Documented the Stokd governed-project structure** now present in the tree: `.stokd/projects/<slug>/` (PRDs + phase plans) and the top-level `projects/<slug>/` orchestration artifacts (`state.mjs`, `build-state.mjs`, `orchestrate.workflow.js`, `prd.md`). Added to §2 layout and §9 cross-references.
- **Recorded the active `media-pairing-poster-detection` project** (PRD dated 2026-05-31, 5 phases) and tied it to the analyzed MediaCard critical path in §6; recent commits (`6145267e70`, `a1a92da872`, `f0015cada9`, `76a8732750`, `b09fc2ff16`) implement video first-frame/poster thumbnails across `MediaCard` and the `sui-cdn` `CdnBrowser`. The `e54d836bef` commit added the `archiver` dependency for CDN zip export (now in `docs/package.json`).
- **Flagged an SST version divergence:** the root drives deploys with SST **v4.2.0** (installed, `sst.config.ts` → `infra/*`), while `docs/package.json` still pins `sst@^3.6.19` as a vestigial dependency that does not drive deploys. Noted in §4 for cleanup.
- **Verified WASM artifacts present** in both `packages/sui-video-renderer/pkg/` and `wasm-preview/pkg/` (`wasm_preview*` outputs); editor `optionalDependency` `@stoked-ui/video-renderer-wasm` → `file:../sui-video-renderer/pkg` intact (editor v0.1.2, media-api v1.0.0).
- Re-verified the dependency graph, build pipeline, scripts, `pnpm-workspace.yaml`, `turbo.json`, and `config.json` against current manifests; preserved where accurate. Added an axioms cross-reference to §9.

## 13. Changes in 2026-05-28 Refresh (meta v0.4.0)

- **Corrected the docs-app framework version:** prior copies said "Next.js 14" throughout; the manifest is `next@^13.5.1` and the installed version is **13.5.11** (Pages Router). Updated §1, §4, §6 accordingly.
- **Recorded the audit-bot / consulting surface:** new `docs/pages/api/audit/{turn.ts, save-lead.ts}` endpoints (backed by `docs/src/modules/auditBot/{conversationRunner, playbooks, auditStore}`) and the expanded `docs/pages/consulting/**` verticals (ai, front-end, back-end, devops, full-stack). Added to §1, §3 boundary list, and §6 entry-point table.
- **Resolved the `config.json` drift the 0.4.0 doc flagged:** `sui-cdn` and `sui-video-renderer` are now listed in both `config.json.packages` and the product roster, matching the existing `.stokd/meta/packages/<pkg>/` directories (11 packages tracked).
- Verified WASM artifact presence: `packages/sui-video-renderer/pkg/` and `wasm-preview/pkg/` both contain `wasm_preview*` output; editor `optionalDependency` `@stoked-ui/video-renderer-wasm` → `file:../sui-video-renderer/pkg` is intact.
- All other architectural, dependency-graph, build-system, and pattern content re-verified against `package.json`, `docs/package.json`, `pnpm-workspace.yaml`, and per-package manifests; preserved where accurate.

## 14. Changes vs. Meta v0.3.0

- Bumped meta version 0.3.0 → 0.4.0.
- Removed dead reference to legacy `.stokd/meta/SC_MODULE_SUI_*.md` files (now deleted; see `git status`). Per-package module docs now live under `.stokd/meta/packages/<pkg>/SC_MODULE.md`.
- Added `sui-cdn` and `sui-video-renderer` to the tracked meta packages list and flagged the `config.json` drift.
- Header restructured to surface the package roster prominently rather than a single analyzed sub-directory.
- All architectural, dependency-graph, technology, build-system, entry-point, pattern, and onboarding content was verified against current `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `sst.config.ts`, and per-package manifests; preserved unchanged where accurate.
