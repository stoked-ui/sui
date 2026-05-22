# Stoked UI — Product Classification

> **Generated:** 2026-05-05 | **Updated:** 2026-05-21 | **Meta version:** 0.4.0
> **Repository:** `@stoked-ui/sui` v0.1.0-alpha.5
> **Root:** `/opt/worktrees/stoked-ui/stoked-ui-main`

---

## Product Name

**`@stoked-ui/sui`** — the Stoked UI monorepo product. The repository ships a single integrated product offering: a media-centric React component suite plus the documentation/marketing/admin site, the supporting Media API, and the AWS infrastructure that hosts it. Although the repo contains many packages, they are constituent surfaces of the same product (component libraries, public site, embeddable demos, native CLI, Lambda APIs) — not independent products.

### Constituent Packages

Public, published `@stoked-ui/*` packages (workspace dirs under `packages/`):

| Package dir | npm name | Role in the product |
|-------------|----------|---------------------|
| `packages/sui-common` | `@stoked-ui/common` | Shared client utilities (`LocalDb`, `Mime`, `FetchBackoff`, `UserMenu`, hooks) — foundation for every browser-side surface. |
| `packages/sui-common-api` | `@stoked-ui/common-api` | Shared NestJS server building blocks (decorators, DTOs, Mongoose models) — foundation for `sui-media-api`. |
| `packages/sui-docs` | `@stoked-ui/docs` | MDX/demo primitives (`Demo`, `CodeSandbox`, `StackBlitz`, `HighlightedCode`, `BrandingCssVarsProvider`) consumed by the Next.js docs app. |
| `packages/sui-editor` | `@stoked-ui/editor` | Video/animation editor — root product surface combining timeline + media + file-explorer + WASM renderer. |
| `packages/sui-file-explorer` | `@stoked-ui/file-explorer` | Tree/grid file explorer with drag-and-drop (forked from `@mui/x-tree-view`). |
| `packages/sui-github` | `@stoked-ui/github` | GitHub activity widgets (calendar, events, branch, commit, PR view). |
| `packages/sui-media` | `@stoked-ui/media` | Framework-agnostic media core (`MediaFile`, `WebFile`, `FileSystemApi`, `Stage`, players, `MediaGallery`, `MediaViewer`, `WebUserDirectChat`). |
| `packages/sui-media-api` | `@stoked-ui/media-api` | NestJS API for media-component endpoints (uploads, metadata, thumbnails). Runs as Express locally and as Lambda in production. |
| `packages/sui-timeline` | `@stoked-ui/timeline` | Animation/scrubber timeline engine + UI (`Engine`, `Controller`, `TimelineProvider`, `TimelinePlayer`, tracks, actions). |

Adjacent in-repo surfaces that belong to the same product but are not in the listed package set:

- **`docs/`** — Next.js 14 docs/marketing/admin app (`stokedui-com`) on port **5199**, which also hosts every non-media business API under `docs/pages/api/**`.
- **`packages/sui-cdn`**, **`packages/sui-video-renderer`** (Rust → WASM/CLI), **`packages-internal/cdn` & `cdn-sui`**, **`api/`** Lambda handlers, **`infra/`** SST stack — supporting surfaces consumed by the same product.

---

## Description

Stoked UI is an integrated, media-first product for building, demonstrating, selling, and operating browser-based video / timeline / file / GitHub-activity experiences. It bundles:

1. A React component suite (`@stoked-ui/editor`, `@stoked-ui/timeline`, `@stoked-ui/file-explorer`, `@stoked-ui/media`, `@stoked-ui/github`, `@stoked-ui/cdn`) for embedding rich media editing and visualization into host apps.
2. A documentation + marketing + commerce + admin site (`docs/`, `stokedui-com`) that showcases the components, sells licenses via Stripe, and runs the consulting business backing the product.
3. A media backend (`@stoked-ui/media-api`, NestJS) for uploads, metadata extraction, and thumbnail generation.
4. A native Rust video renderer (`packages/sui-video-renderer`) that compiles to WASM for in-browser preview/render and ships a CLI binary (`video-render`) for offline rendering of `.sue` projects.
5. SST-driven AWS infrastructure (CloudFront sites, API Gateway v2 + Lambda, certs) deploying the public surfaces to `sui.stokd.cloud` / `consulting.stokd.cloud`.

**Problem solved:** Building production-grade media editing UIs (timelines, asset libraries, video preview, render pipelines) is painful — teams either reach for monolithic SaaS editors or stitch together low-level libraries. Stoked UI provides composable, MUI-consistent React primitives plus the WASM/native renderer, the API, and the licensing/admin plumbing needed to ship these experiences.

---

## Target Audience

| Audience | What they use |
|----------|---------------|
| **Application developers** integrating editor / timeline / file-explorer / media / GitHub widgets into their own React apps | The published `@stoked-ui/*` npm packages, MDX docs at `/<product>/docs/...`, live demos under `/products/*`, MDX `<Demo>` blocks, CodeSandbox/StackBlitz launches. |
| **End users of host apps** that embed Stoked UI components | The component runtime itself — Editor (record/scrub/preview/save), Timeline, FileExplorer, MediaGallery/MediaViewer, etc. |
| **License purchasers / commercial customers** | `/pricing`, Stripe embedded checkout (`/consulting/checkout`), self-service `/consulting/{licenses, billing, settings}`, license activation/validation/deactivation APIs. |
| **Consulting clients & partners** | Auth-gated `/consulting/{home, customer, clients, deliverables, invoices, partners}` portal. |
| **Stoked UI internal admins / operators** | `/consulting/admin` dashboard, `/admin/products`, blog editor (`/blog/editor`), CDN admin (`packages-internal/cdn`, `packages-internal/cdn-sui`, embedded `CdnBrowser`), Swagger UIs. |
| **Operators of the native renderer** | `video-render` CLI (`render`, `info` subcommands) for batch / headless rendering of `.sue` projects. |
| **Repo contributors / maintainers** | pnpm/Turbo/Lerna toolchain, package build pipelines, SST deploy (`pnpm deploy:prod`), Playwright / Karma / Mocha test harness. |

---

## Entry Points / Surfaces

### Web routes (Next.js — `docs/pages/`, port 5199)

Public marketing & content:
- `/` (`docs/pages/index.tsx`) — Home with `RandomHome` hero rotation
- `/products`, `/products/[product-slug]` — Product index + public detail
- `/products/<slug>/main`, `/github` — Live showcase pages (`HeroEditor`, `HeroTimeline`, `HeroFileExplorer`, `HeroFlux`, `HeroStokedUi`, `AdvancedShowcase`, `HeroGithub`)
- `/<product>/docs/**` — Per-package MDX documentation trees (`timeline`, `editor`, `file-explorer`, `media`, `github`)
- `/pricing`, `/material-ui`, `/base-ui`, `/design-kits`, `/templates`, `/components`
- `/blog`, `/blog/[slug]` — Blog index + post
- `/about`, `/careers`, `/products/feedback`, `/subscription`, `/legal/{privacy,terms}`, `/404`
- `/cli/auth?token=...` — CLI/SDK pairing callback

Auth-gated consulting / admin:
- `/consulting/{login, home, main, customer, settings, billing, licenses, groupies, api-docs, checkout}`
- `/consulting/clients`, `/consulting/clients/[client-slug]`
- `/consulting/users`, `/consulting/invoices`, `/consulting/invoices/[id]`
- `/consulting/deliverables/[id]`, `/consulting/partners/[partnerName]`
- `/consulting/admin`, `/admin/products`, `/admin/products/[product-slug]`
- `/blog/editor`, `/blog/editor/new`, `/blog/editor/[slug]`

### HTTP APIs

Business / domain APIs (per the boundary rule, all live under `docs/pages/api/**`):
`account/*`, `auth/*` (login, register, google, session, logout, exchange, impersonate, transfer, cli/authorize, api-keys), `blog/*`, `cdn/*` (contents, folders, move, delete, permissions, export, multipart upload session/part/abort/complete, public path resolver), `chat/session/*`, `clients/*`, `deliverables/*` (incl. `proxy/[...path]`, `render`, `upload-file`), `github/*` (contributions, events, branch, commit), `invoices/*`, `licenses/*` (checkout, checkout-complete, activate/validate/deactivate, create, promo-codes), `products/*` (incl. `public/[slug]`, `feedback/{register,verify}`), `upload/blog-image`, `users/*`, `webhooks/stripe`, `logs`, `openapi`.

Media-component APIs (NestJS, `packages/sui-media-api/src/**`):
- Local entry: `packages/sui-media-api/src/main.ts` → `Server.start()` (default port 3001, base path `/v1`).
- Lambda entry: `packages/sui-media-api/src/lambda.ts` (+ `lambda.bootstrap.ts`) via `@codegenie/serverless-express`.
- Modules: `media`, `uploads`, `auth` (media-scoped only), `health`. Swagger UI at `/v1/api/docs` (`packages/sui-media-api/src/swagger.config.ts`).
- **Boundary:** `sui-media-api` is reserved for media-component endpoints — non-media business routes belong in `docs/pages/api/*` (see `.stokd/meta/SC_CONTEXT.md`, `CLAUDE.md`, `AGENTS.md`).

### Standalone Lambda handlers (`api/`)

Wired into SST API Gateway v2 by `infra/api.ts`:
- `api/auth/google.ts` — Google OAuth verification
- `api/subscribe.ts` — Newsletter signup + SES confirm
- `api/sms.ts` — SNS SMS dispatch
- `api/promos.ts` — Legacy promo entry points

### Component entry points (consumer-facing)

- `packages/sui-editor/src/index.ts` — `Editor` (default), `EditorEngine`, `EditorProvider`, `WasmPreview`, `EditorFile`, `Controllers`
- `packages/sui-timeline/src/index.ts` — `Engine`, `Controller`, `TimelineProvider`, `TimelinePlayer`, `Timeline`, tracks/actions
- `packages/sui-file-explorer/src/index.ts` — `FileExplorer`, `FileExplorerBasic`, `FileDropzone`, `FileExplorerTabs`
- `packages/sui-media/src/index.ts` — `MediaFile`, `WebFile`, `FileSystemApi`, `Stage`, `MediaGallery`, `MediaViewer`, players, hooks
- `packages/sui-github/src/index.ts` — `GithubCalendar`, `GithubEvents`, `GithubBranch`, `GithubCommit`, `PullRequestView`
- `packages/sui-cdn/src/index.ts` — `CdnApi`, `CdnBrowser`
- `packages/sui-docs/*` — Subpath exports per primitive (`./Demo`, `./CodeSandbox`, etc.)

### CLI

- `video-render` (Rust binary, `packages/sui-video-renderer/cli/src/main.rs`)
  - `render --input project.sue --output video.mp4 [--quality --resolution --format --codec --fps --threads --progress]`
  - `info --input project.sue`

### Internal Vite operations apps

- `packages-internal/cdn/src/main.jsx` — Legacy CDN admin
- `packages-internal/cdn-sui/src/main.jsx` — Thin wrapper rendering `CdnBrowser` from `@stoked-ui/cdn`

### Infrastructure / startup

- `sst.config.ts` → `infra/index.ts` (`createSite`, `createCdnSite`, `createCdnSuiSite`, `createApi`)
- `pnpm dev` (Turbo watch graph), `pnpm docs:dev` (port 5199), `pnpm deploy:prod` (SST → AWS profile `stokd-cloud`)
- `pnpm video-renderer:build-wasm` / `pnpm build:wasm` — Builds `packages/sui-video-renderer/pkg/` consumed by editor as `@stoked-ui/video-renderer-wasm` (file dep)

### Webhooks

- `POST /api/webhooks/stripe` (`docs/pages/api/webhooks/stripe.ts`) — Stripe event reconciliation
- SES bounce/confirm flows triggered out of `api/subscribe.ts` and `docs/pages/api/products/feedback/register.ts`

---

## Flows

All user flows in `.stokd/meta/SC_FLOWS.md` belong to this product. Grouped by domain:

### Marketing & content discovery
- **1.1 Visit Home & Pick a Product**
- **1.2 Browse Public Product Detail**
- **1.3 Read Product Documentation**
- **1.4 Read Blog Index → Post**
- **1.5 Subscribe to Newsletter / Confirm Subscription**

### Account & authentication
- **2.1 Email + Password Sign-Up & Sign-In**
- **2.2 Google OAuth Sign-In**
- **2.3 Sign Out**
- **2.4 Authorize CLI / External Tool via API Key**
- **2.5 Manage API Keys**
- **2.6 Admin Impersonation**
- **2.7 Update Account Settings**

### Commerce & licensing
- **3.1 View Pricing & Start Checkout**
- **3.2 Complete Stripe Embedded Checkout**
- **3.3 Activate / Deactivate / Validate License**
- **3.4 View Licenses & Billing (Self-Service)**
- **3.5 Apply / Manage Promo Codes**

### Editor & timeline (component product flows)
- **4.1 Edit a Project in the Stoked UI Editor**
- **4.2 Record a Capture in the Editor**
- **4.3 Render & Save Versions**
- **4.4 Drive a Standalone Timeline**

### File explorer & media
- **5.1 Browse / Manipulate Files in `FileExplorer`**
- **5.2 Watch / Browse Media in `MediaGallery` + `MediaViewer`**
- **5.3 Upload Media to Server (Media API)**
- **5.4 Extract Video Metadata Locally**

### CDN admin
- **6.1 Browse / Upload via `CdnBrowser`**
- **6.2 Resume / Abort Multipart Upload**

### Consulting / business operations (admin)
- **7.1 Manage Products (Admin)**
- **7.2 Manage Clients & Deliverables**
- **7.3 Open / Share Deliverable**
- **7.4 Manage Users (Admin)**
- **7.5 Invoicing**
- **7.6 Customer Dashboard / Groupies / Partner Portal**
- **7.7 Browse Docs Business API (Swagger)**

### Blog publishing
- **8.1 Author / Publish Blog Post**

### Customer feedback
- **9.1 Submit Product Feedback**
- **9.2 Chat / Direct Messaging**

### GitHub widgets / activity
- **10.1 Render Repo Activity (Calendar / Branch / Commits / Events)**

### Developer & contributor
- **11.1 Bootstrap Local Dev Environment**
- **11.2 Build & Publish Packages**
- **11.3 Deploy to AWS via SST**
- **11.4 Run Tests**

### CLI / native tooling
- **12.1 Render `.sue` Project from CLI**
- **12.2 Inspect Project Metadata from CLI**
- **12.3 Try Media API in Swagger**

### Webhooks & system events
- **13.1 Stripe Webhook → License Reconciliation**
- **13.2 SES Subscribe-Confirm Email**
- **13.3 SMS Notifications (Lambda)**
- **13.4 Centralized Logging Endpoint**

---

## Modules

All module docs in `.stokd/meta/packages/*` support this product. Per-module contribution:

| Module doc | Contribution to the product |
|------------|------------------------------|
| `.stokd/meta/packages/sui-common/SC_MODULE.md` | Foundational client utilities used everywhere — `LocalDb` (IndexedDB) backs editor save/version/recording flows; `Mime`, `FetchBackoff`, `useResize` are consumed across packages; `UserMenu`, `GrokLoader`, `SocialLinks` are shared chrome rendered in the docs app. |
| `.stokd/meta/packages/sui-common-api/SC_MODULE.md` | Server foundation — NestJS decorators, validation DTOs, and Mongoose model patterns reused by `sui-media-api` and (indirectly) by `docs/pages/api/*` business endpoints. |
| `.stokd/meta/packages/sui-docs/SC_MODULE.md` | Documentation primitives (`Demo`, `DemoEditor`, `DemoSandbox`, `CodeSandbox`, `StackBlitz`, `HighlightedCode`, `MarkdownElement`, `BrandingCssVarsProvider`) that drive the per-product MDX docs trees and live demos in the Next.js site. |
| `.stokd/meta/packages/sui-editor/SC_MODULE.md` | The flagship component — `Editor`, `EditorEngine`, `EditorProvider`, `WasmPreview`, `EditorFile`, `EditorView`, `EditorControls`, `DetailView`, `EditorFileTabs`, `EditorScreener`. Drives editor flows §4.1–4.3 and the home/products `EditorShowcase`. |
| `.stokd/meta/packages/sui-file-explorer/SC_MODULE.md` | Tree/grid file UI used both standalone (§5.1, file-explorer showcase) and embedded inside the editor's `EditorFileTabs`. Includes `FileDropzone` for external file ingestion. |
| `.stokd/meta/packages/sui-github/SC_MODULE.md` | GitHub activity widgets (`GithubCalendar`, `GithubEvents`, `GithubBranch`, `GithubCommit`, `PullRequestView`) — drives flow §10.1 and the `/github` showcase. Backed by `docs/pages/api/github/*`. |
| `.stokd/meta/packages/sui-media/SC_MODULE.md` | Framework-agnostic media core — `MediaFile`, `WebFile`, `FileSystemApi`, `Stage`, players, `MediaGallery`/`MediaViewer`/`MediaCard`, `WebUserDirectChat`, `extractVideoMetadata`. Underpins the editor, the media product surface, and the chat flow. |
| `.stokd/meta/packages/sui-media-api/SC_MODULE.md` | NestJS server-side surface for media — uploads (multipart S3 sessions), metadata extraction (Sharp + fluent-ffmpeg), thumbnails, persistence to MongoDB. Runs as Express locally (`pnpm --filter @stoked-ui/media-api dev`, port 3001) and as Lambda in production (`lambda.ts`). |
| `.stokd/meta/packages/sui-timeline/SC_MODULE.md` | Animation/scrubber timeline primitives (`Engine`, `Controller`, `Timeline`, `TimelinePlayer`, `TimelineLabels`, `TimelineTrackArea`, `TimelineTrack`, `TimelineAction`, `TimelineCursor`, `TimelineTime`, `TimelineScrollResizer`). Drives flow §4.4 standalone and powers the timeline rail inside `Editor`. |

Adjacent supporting modules not in the listed package set but part of the same product:
- `packages/sui-cdn` — Embeddable `CdnBrowser` consumed by both internal Vite apps and the docs admin.
- `packages/sui-video-renderer` — Rust workspace producing the WASM preview consumed by `@stoked-ui/editor` and the `video-render` CLI binary.

---

## Operational Boundaries

### Critical guardrails (from `.stokd/meta/SC_CONTEXT.md`, `CLAUDE.md`, `AGENTS.md`)

- **Media-API boundary:** `packages/sui-media-api` is **media-component endpoints only**. New non-media business routes (products, clients, licenses, invoices, users, non-media auth) MUST go in `docs/pages/api/*`, never in `sui-media-api`.
- **Local dev port:** Docs site runs on **port 5199** (never 3000). Media API runs on port 3001.
- **AWS profile:** All deploys use `--profile stokd-cloud`. The default AWS profile is a customer production account and must not be used for Stoked UI work (`deploy:prod` script enforces via `dotenvx run -- sst deploy --stage production`).
- **No `git stash`, no branch switching** in workflows that touch this repo.

### External integrations

| Capability | Integration |
|------------|-------------|
| OAuth | Google OAuth 2.0 (`@react-oauth/google`, `google-auth-library`) — `/api/auth/google`, Lambda `api/auth/google.ts` |
| Auth tokens | JWT via `jsonwebtoken` / Passport JWT in NestJS; client persists token to `localStorage["auth"]` |
| Payments | Stripe Checkout (embedded) + Customer Portal + Webhooks (`POST /api/webhooks/stripe`) |
| Email | AWS SES (newsletter, feedback verification) via `api/subscribe.ts` |
| SMS | AWS SNS via Lambda `api/sms.ts` |
| Search | DocSearch (`@docsearch/react`) on docs pages |
| GitHub data | GitHub REST/GraphQL through `docs/pages/api/github/*` (contributions, events, branch, commit) |
| Image processing | Sharp 0.34 in `sui-media-api` |
| Video processing | fluent-ffmpeg in `sui-media-api`; Rust compositor + `wasm-bindgen` for WASM preview |

### Data stores

| Store | Used by |
|-------|---------|
| **MongoDB** (Mongoose 8 / mongodb 6.12) | All business domain data — products, clients, deliverables, invoices, licenses, users, blog posts, API keys, feedback, chat, logs (via `docs/pages/api/*`); media metadata (via `sui-media-api`). |
| **AWS S3** | CDN buckets (`@stoked-ui/cdn`, `docs/pages/api/cdn/*`); media uploads from `sui-media-api`; multipart upload sessions via signed URLs. |
| **IndexedDB** (browser) | `LocalDb` from `@stoked-ui/common` — editor `.sue` projects, version snapshots, `ScreenshotStore` for `extractVideoMetadata`, recording blobs. |
| **localStorage** | `auth` key (JWT bearer token) shared across docs pages, Swagger UIs, internal Vite apps. |

### Runtime constraints

- **WASM build dependency:** `@stoked-ui/editor` dynamically imports `@stoked-ui/video-renderer-wasm` (file dep on `packages/sui-video-renderer/pkg`). Editor flows degrade if the WASM build is missing. Build with `pnpm video-renderer:build-wasm` (target `web`) or `cd packages/sui-video-renderer/wasm-preview && wasm-pack build --target bundler --out-dir pkg` (bundler target). `EditorEngine.ts` auto-detects bundler vs web target.
- **Webpack config:** `docs/next.config.mjs` requires `experiments.asyncWebAssembly: true` and aliases `@stoked-ui/video-renderer-wasm` to the WASM `pkg/` directory. Changes to `next.config.mjs` require a dev-server restart (not HMR).
- **Pinned MUI / React:** `@mui/material@5.17.1`, `@mui/system@5.17.1`, `@mui/utils@5.17.1`, `@mui/base@5.0.0-beta.40`, `react@18.3.1`, `react-dom@18.3.1` (via `pnpm.overrides`).
- **Package manager:** pnpm 10.5.1 enforced via `preinstall` (`only-allow pnpm`).
- **Build pipeline per package:** Babel-driven `build:modern` → `build:node` → `build:stable` → `build:types` → `build:copy-files` (`scripts/build.mjs`, `scripts/buildTypes.mjs`, `scripts/copyFiles.mjs`). Turbo orchestrates with `dev:prepare` priming downstream watches.
- **Dual-bundle backend:** `sui-media-api` runs identically as Express (NestJS standalone) or as AWS Lambda via `@codegenie/serverless-express` adapter (`lambda.ts`).
- **Editor known issues** (carry through to flows §4.x):
  - `file.media` is a `createSettings`-Proxy — properties set via `Object.assign` don't always propagate through React state updates; detail views fall back to DOM `<video>` element for duration/width/height.
  - `extractVideoMetadata` previously blocked on empty `ScreenshotStore`; fixed by `count > 0` guard.
  - Recording audio: all sources routed through a single `AudioContext` destination (avoids per-source duplication).
  - `IDB.saveVideo` creates the version entry if missing.
  - Canvas rendering at time 0 after playback only shows one track's frame (unresolved).

### Deployment topology

- **SST v4** stack (`sst.config.ts` → `infra/index.ts`) provisions:
  - `createSite` — CloudFront StaticSite hosting Next.js docs (`stokedui-com`)
  - `createCdnSite` / `createCdnSuiSite` — CloudFront CDN sites for `cdn` / `cdn-sui` admin
  - `createApi` — API Gateway v2 routing to Lambda handlers (`api/auth/google`, `api/subscribe`, `api/sms`, `api/promos`, plus media API via `packages/sui-media-api/src/lambda.ts`)
  - TLS / domain bindings (`infra/cert.ts`, `infra/domains.ts`) for `sui.stokd.cloud` and `consulting.stokd.cloud`
  - Env vars / secrets (`infra/envVars.ts`, `infra/secrets.ts`)
- Region: `us-east-1`. AWS profile: `stokd-cloud`. Stage: `production` (via `pnpm deploy:prod`).

---

## Product Axioms

Repo-global invariants this product depends on. These are candidates for promotion into `.stokd/meta/SC_AXIOMS.md` by the axiom-enrichment pass.

- `AX-PROD-SUI-001`: The Next.js docs/marketing/admin app (`docs/`, `stokedui-com`) is the single canonical web surface and MUST run on port **5199** in local development; no other port (e.g. 3000) is supported by tooling, links, or CORS configuration.
- `AX-PROD-SUI-002`: `packages/sui-media-api` MUST host only media-component endpoints; any non-media business route (products, clients, licenses, invoices, users, non-media auth, blog, cdn admin, deliverables) MUST be implemented under `docs/pages/api/**`.
- `AX-PROD-SUI-003`: All AWS deploys for this product MUST target the `stokd-cloud` AWS profile via `pnpm deploy:prod` (`dotenvx run -- sst deploy --stage production`); the default/ambient AWS profile points at a customer production account and MUST NOT be used.
- `AX-PROD-SUI-004`: `@stoked-ui/editor` depends on the WASM build at `packages/sui-video-renderer/pkg/` (resolved via the `@stoked-ui/video-renderer-wasm` file dep + webpack alias); editor render/preview flows MUST NOT regress when this artifact is present, and the docs app webpack config MUST keep `experiments.asyncWebAssembly: true`.
- `AX-PROD-SUI-005`: The repository is a pnpm 10.5.1 monorepo enforced by `preinstall` (`only-allow pnpm`); package builds MUST go through Turbo + the Babel-driven `build:modern` / `build:node` / `build:stable` / `build:types` / `build:copy-files` pipeline — no per-package ad-hoc bundlers.
- `AX-PROD-SUI-006`: MUI and React versions are pinned via `pnpm.overrides` (`@mui/material@5.17.1`, `@mui/system@5.17.1`, `@mui/utils@5.17.1`, `@mui/base@5.0.0-beta.40`, `react@18.3.1`, `react-dom@18.3.1`); product code MUST be compatible with these exact versions.
- `AX-PROD-SUI-007`: `sui-media-api` MUST run identically as a NestJS Express server locally (port 3001, base path `/v1`) and as an AWS Lambda function via `@codegenie/serverless-express` (`lambda.ts` + `lambda.bootstrap.ts`); behavior MUST NOT diverge across these two runtimes.
- `AX-PROD-SUI-008`: All persistent business-domain data (products, clients, deliverables, invoices, licenses, users, blog posts, API keys, feedback, chat sessions, media metadata) MUST live in MongoDB; the browser-side `LocalDb` (IndexedDB) is reserved for editor project/version/recording state and MUST NOT be treated as a source of truth for business data.
- `AX-PROD-SUI-009`: Stripe is the sole payment processor for license commerce; `POST /api/webhooks/stripe` is the authoritative reconciliation point for license state changes, and license activate/validate/deactivate flows MUST NOT bypass it.
- `AX-PROD-SUI-010`: User-facing flows enumerated in `.stokd/meta/SC_FLOWS.md` (§1–§13) constitute the product's contract; any change that alters or removes one of these flows MUST be driven through a governed `stokd task` or `stokd project` with explicit acceptance criteria, never as an incidental edit.
- `AX-PROD-SUI-011`: Git workflows for this product MUST NOT use `git stash`, MUST NOT switch the working-tree branch via `git checkout <branch>`, and MUST NOT use `git reset --hard` or `git restore .` on a dirty tree — branch divergence is handled exclusively via `git worktree add`.

---

## Cross-References

- Codebase overview: `.stokd/meta/SC_OVERVIEW.md`
- Module inventory: `.stokd/meta/SC_MODULES.md` (and per-package module docs under `.stokd/meta/packages/*/SC_MODULE.md`)
- View inventory: `.stokd/meta/SC_VIEWS.md`
- Flow / data-path inventory: `.stokd/meta/SC_FLOWS.md`
- Test inventory: `.stokd/meta/SC_TEST.md`
- Guardrails: `.stokd/meta/SC_CONTEXT.md`, `CLAUDE.md`, `AGENTS.md`
- Recommendations log: `.stokd/meta/SC_RECOMMENDATIONS.md`
