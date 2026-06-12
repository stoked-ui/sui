# SC_AXIOMS.md — Repo-Global Invariants

> **Generated:** 2026-05-21 | **Updated:** 2026-06-06 (TIMED REFRESH — re-verified existing axioms against the codebase; appended `AX-REPO-AUDIT-BOT-BEST-EFFORT`, `AX-REPO-WASMLAYER-CONTRACT`, `AX-REPO-CDN-API-CONTRACT`; added candidate blocks for the `.sue` round-trip format and Mongoose ref/registration matching) | **Meta version:** 0.4.0
> **Scope:** Repository-wide invariants for `@stoked-ui/sui`. Module-scoped
> axioms live in each package's `.axioms.md`. Product-scoped axioms live in
> `.stokd/meta/SC_PRODUCT_*.md`. Legacy numbered axioms continue to live in
> `~/.stokd/SC_AXIOMS.md` and are not duplicated here.
>
> Editing rules:
> - Append only. Never reuse an `AX-REPO-*` ID.
> - Every active axiom MUST declare at least one Acceptance Check.
> - Promote a candidate to active only when the metadata shows it is truly
>   repo-wide. Otherwise leave it as a `<!-- stokd-axiom-candidate -->` block
>   with the reason it could not yet be promoted.

---

## AX-REPO-DOCS-PORT-5199: Docs / Marketing / Admin App Runs On Port 5199
The Next.js docs/marketing/admin app (`docs/`, package name `stokedui-com`) is the single canonical web surface for this product and MUST run on port **5199** in local development; tooling, CORS, deep links, and demo embeds assume this port and no other (in particular not 3000, which collides with `sui-media-api`).

### Acceptance Checks
- `pnpm docs:dev` boots and the home page is reachable at `http://localhost:5199`.
- `grep -rE "localhost:3000|127\.0\.0\.1:3000" docs/src docs/pages` returns no docs-app references that replace the canonical 5199 origin.
- manual: confirm no new tooling, README, or CORS config adds a non-5199 docs-app origin.

## AX-REPO-MEDIA-API-BOUNDARY: `sui-media-api` Is Media-Endpoints Only
`packages/sui-media-api` MUST host only media-component endpoints (uploads, metadata, thumbnails, media auth/health). Any non-media business route — products, clients, licenses, invoices, users, non-media auth, blog, deliverables, CDN admin, chat, webhooks — MUST be implemented under `docs/pages/api/**`. This is codified in `.stokd/meta/SC_CONTEXT.md`, `CLAUDE.md`, and `AGENTS.md`.

### Acceptance Checks
- `pnpm --filter @stoked-ui/media-api typescript`
- manual: any new controller/module added under `packages/sui-media-api/src/**` belongs to a media domain (media, uploads, media-auth, health) — non-media domains are rejected in review.
- manual: any new endpoint owned by a non-media domain lands under `docs/pages/api/**`.

## AX-REPO-AWS-PROFILE-STOKED: Deploys Target The `stokd-cloud` AWS Profile
All AWS deployments for this product MUST flow through `pnpm deploy:prod` (`dotenvx run -- sst deploy --stage production`) with `AWS_PROFILE=stokd-cloud`. The default / ambient AWS profile points at a customer production account and MUST NOT be used for any Stoked UI infrastructure, S3, Lambda, CloudFormation, SST, SNS, SES, or Cognito command.

### Acceptance Checks
- manual: `aws sts get-caller-identity --profile stokd-cloud` returns the Stoked UI account before any SST/CloudFormation command.
- `grep -nE "AWS_PROFILE|--profile" package.json infra` shows only `stokd-cloud` as the deploy profile.
- manual: no deploy/infra script is added that omits the explicit `--profile stokd-cloud` (or env-equivalent) selector.

## AX-REPO-WASM-RENDERER-DEP: Editor Depends On Built WASM Renderer
`@stoked-ui/editor` dynamically imports `@stoked-ui/video-renderer-wasm`, which is a file dependency on `packages/sui-video-renderer/pkg/`. The docs app's `docs/next.config.mjs` MUST keep `experiments.asyncWebAssembly: true` and the `@stoked-ui/video-renderer-wasm` alias pointing at that `pkg/` directory. Editor preview / render flows MUST NOT regress when the WASM build is present; `EditorEngine.ts` MUST keep auto-detecting the bundler vs. web target.

### Acceptance Checks
- `pnpm video-renderer:build-wasm` (or `pnpm build:wasm`) produces `packages/sui-video-renderer/pkg/`.
- `pnpm --filter @stoked-ui/editor typescript`
- manual: after a fresh WASM build, the editor home/products showcase loads without falling back to a missing-WASM error in the browser console.

## AX-REPO-PNPM-MONOREPO: pnpm 10.5.1 + Turbo Build Pipeline Are Mandatory
The repository is a pnpm 10.5.1 monorepo enforced via the root `preinstall` (`only-allow pnpm`); package builds MUST go through Turbo and the Babel-driven `build:modern` → `build:node` → `build:stable` → `build:types` → `build:copy-files` pipeline defined in `scripts/build.mjs`, `scripts/buildTypes.mjs`, and `scripts/copyFiles.mjs`. Per-package ad-hoc bundlers (Rollup/Vite/tsup configured outside this pipeline) are not permitted for publishable `@stoked-ui/*` packages.

### Acceptance Checks
- `corepack pnpm@10.5.1 -v` (or equivalent) matches the version pinned in `package.json#packageManager`.
- `pnpm install` succeeds without triggering the `only-allow pnpm` guard.
- `pnpm -w build` (or `pnpm turbo run build`) green across all publishable packages.

## AX-REPO-MUI-REACT-PINS: MUI v5.17.1 / React 18.3.1 Pins Are Binding
React and MUI versions are pinned through `pnpm.overrides`: `@mui/material@5.17.1`, `@mui/system@5.17.1`, `@mui/utils@5.17.1`, `@mui/base@5.0.0-beta.40`, `react@18.3.1`, `react-dom@18.3.1`. Any code, dependency bump, or peer-dep change in this repo MUST remain compatible with these exact versions; introducing MUI v6, React 19, or removing the overrides is a governed change.

### Acceptance Checks
- `node -e "const p=require('./package.json'); console.log(p.pnpm && p.pnpm.overrides)"` shows the pins above.
- `pnpm why @mui/material` and `pnpm why react` resolve to a single, pinned version.
- `pnpm -w typescript` and `pnpm -w build` green with the pinned versions in place.

## AX-REPO-MEDIA-API-DUAL-BUNDLE: `sui-media-api` Runs As Express And Lambda
`packages/sui-media-api` MUST run identically as a NestJS Express server locally (`main.ts`, port 3001, base path `/v1`) and as an AWS Lambda function via `@codegenie/serverless-express` (`lambda.ts` + `lambda.bootstrap.ts`). Behavior — routes, DTO validation, auth, swagger surface — MUST NOT diverge across these runtimes; module wiring that breaks one runtime breaks both.

### Acceptance Checks
- `pnpm --filter @stoked-ui/media-api typescript`
- `pnpm --filter @stoked-ui/media-api build`
- manual: `pnpm --filter @stoked-ui/media-api dev` serves `/v1/api/docs` Swagger UI locally; SST deploy of the same code answers the same routes via API Gateway.

## AX-REPO-MONGODB-BUSINESS-DATA: MongoDB Is The Sole Business-Domain Store
All persistent business-domain data — products, clients, deliverables, invoices, licenses, users, blog posts, API keys, feedback, chat sessions, logs, and media metadata — MUST live in MongoDB (via Mongoose 8 / mongodb 6.12 in `docs/pages/api/**` and `sui-media-api`). The browser-side `LocalDb` (IndexedDB, `@stoked-ui/common`) is reserved for editor project / version / recording / screenshot state and MUST NOT be treated as a source of truth for any business entity.

### Acceptance Checks
- manual: any new persistence layer for a business entity uses Mongoose schemas under `packages/sui-common-api/src/models/**` (or a clearly-scoped API-local schema) and is connected through the existing `MongooseModule.forFeature([...])` pattern.
- `grep -nE "new\s+LocalDb|LocalDb\(" packages docs | grep -v editor` returns only non-business uses (screenshots, recording, project/version snapshots).
- `pnpm --filter @stoked-ui/common-api typescript` and `pnpm --filter @stoked-ui/media-api typescript`.

## AX-REPO-STRIPE-LICENSE-COMMERCE: Stripe Is The Authoritative License Backend
Stripe is the sole payment processor for license commerce in this repo. `POST /api/webhooks/stripe` (`docs/pages/api/webhooks/stripe.ts`) is the authoritative reconciliation point for license state changes; checkout, checkout-complete, activate, validate, deactivate, and promo-code flows MUST funnel state changes through Stripe + this webhook rather than mutating license records out-of-band.

### Acceptance Checks
- `grep -rnE "stripe\.(checkout|customers|subscriptions|webhooks)" docs/pages/api` shows license/billing flows going through the official Stripe SDK.
- manual: any new license-mutation endpoint either calls Stripe or is triggered by the Stripe webhook handler; out-of-band license mutations are rejected in review.
- manual: `POST /api/webhooks/stripe` signature verification is preserved (no `--ignore-signature` style bypass).

## AX-REPO-FLOWS-GOVERNED: User Flows Are A Governed Contract
The user-facing flows enumerated in `.stokd/meta/SC_FLOWS.md` (§1–§13) — marketing/content discovery, auth, commerce/licensing, editor/timeline, file-explorer/media, CDN admin, consulting operations, blog, feedback/chat, GitHub widgets, developer/contributor, CLI/native, webhooks — constitute this product's behavioral contract. Any change that alters or removes one of these flows MUST be driven through a governed `stokd task` or `stokd project` with explicit acceptance criteria; incidental edits that silently regress a flow are not permitted.

### Acceptance Checks
- manual: PRs touching files referenced by an SC_FLOWS.md flow cite the flow ID and state the acceptance criteria.
- manual: when a flow is intentionally removed or reshaped, `.stokd/meta/SC_FLOWS.md` is updated in the same change.
- manual: `stokd task` / `stokd project` is the surface used for the governed change (not direct edits).

## AX-REPO-GIT-SAFETY: No Stash, No Branch Switch, No Hard Reset
Git workflows in this repo MUST NOT use `git stash` (forbidden by global policy), MUST NOT switch the working-tree branch via `git checkout <branch>` (use `git worktree add` instead), and MUST NOT use `git reset --hard`, `git checkout -- .`, or `git restore .` on a dirty working tree. Uncommitted work that needs preservation MUST be committed on the current branch.

### Acceptance Checks
- manual: review reflog / shell history for the session — no `git stash`, no `git checkout <branch>` on a dirty tree, no `git reset --hard`.
- manual: branch divergence is handled via `git worktree add <path> <branch>`.
- manual: any preserved in-progress work is a real commit on the current branch.

## AX-REPO-PACKAGE-BARREL: `src/index.ts` Is The Publishable Contract
Every publishable workspace package under `packages/sui-*` exposes its public API exclusively through a single `src/index.ts` barrel; consumers MUST import from the package name (e.g. `@stoked-ui/timeline`), not via deep paths (`@stoked-ui/timeline/src/...`, `@stoked-ui/timeline/internals/...`). Adding, removing, or renaming an export from a barrel is a contract change requiring a governed task with downstream consumer review.

### Acceptance Checks
- `ls packages/sui-*/src/index.ts` enumerates exactly one index file per publishable package.
- `grep -rnE "from\s+['\"]@stoked-ui/[a-z-]+/(src|internals)/" packages docs` returns no deep imports across workspace boundaries.
- `pnpm -w typescript` green after any barrel change.

## AX-REPO-BROWSER-NO-SERVER-DEPS: Browser Packages MUST NOT Import Server-Only Modules
Browser-targeted packages (`@stoked-ui/common`, `@stoked-ui/editor`, `@stoked-ui/file-explorer`, `@stoked-ui/github`, `@stoked-ui/media`, `@stoked-ui/timeline`, `@stoked-ui/cdn`, `@stoked-ui/docs`) MUST NOT import NestJS, Mongoose, AWS SDK server clients, `next/server`, or other server-only modules from their browser entry points. Server-only code in a hybrid package (e.g. `@stoked-ui/media`) MUST live behind a dedicated `/server` subpath export and remain unreachable from the default barrel.

### Acceptance Checks
- `grep -rnE "from\s+['\"](@nestjs|mongoose|@aws-sdk|next/server)" packages/sui-{common,editor,file-explorer,github,media,timeline,cdn,docs}/src` returns no hits outside `**/server/**` (or equivalent server subpath) directories.
- `pnpm -w build` green — Babel/TS compilation surfaces accidental server imports as unresolved or as SSR-incompatible code.
- manual: SSR smoke through the docs site at port 5199 does not produce server-only import errors for browser barrels.

## AX-REPO-SWAP-ID-WIRE-FORMAT: Mongoose Models Serialize Via `swapId`
Every Mongoose model defined under `packages/sui-common-api/src/models/**` (and any other server-side package that registers `MongooseModule.forFeature([...])` with these schemas) MUST use the shared `swapId` / `DefaultSchemaOptions` plumbing that rewrites `_id` → `id` and strips `__v` on JSON serialization. Clients across the monorepo (`sui-media-api`, `docs/pages/api/*`, browser consumers via the Media API client and `LocalDb`) depend on this wire format; bypassing it changes a cross-package contract.

### Acceptance Checks
- `pnpm --filter @stoked-ui/common-api typescript` and `pnpm --filter @stoked-ui/common-api build`.
- `grep -rnE "swapId|DefaultSchemaOptions|toJSON" packages/sui-common-api/src/models` shows the helper applied to every published schema.
- manual: a `GET /v1/media/:id` response from `sui-media-api` returns `id` (not `_id`) and no `__v` field.

## AX-REPO-MEDIA-TYPE-COORDINATION: Cross-Package Media Types Bump Together
The cross-package wire types and enums exported by `@stoked-ui/media` (notably `IMediaFile`, `MediaType`, `MediaFile`, `Command`) are re-exported and consumed by `@stoked-ui/editor`, `@stoked-ui/file-explorer`, `@stoked-ui/timeline`, `@stoked-ui/cdn`, and `@stoked-ui/media-api`. Any addition, removal, or shape change to these types MUST be landed as a coordinated PR that updates every peer consumer in the same change; no consumer is allowed to drift behind.

### Acceptance Checks
- `pnpm -w typescript` green across all peer packages after the bump.
- `grep -rnE "from\s+['\"]@stoked-ui/media['\"]" packages | grep -E "MediaType|IMediaFile|MediaFile|Command"` enumerates every peer consumer touched by the change.
- manual: PR description lists every peer package updated and states why any omitted package is unaffected.

## AX-AUDIT-BOT-URL-SAFETY: Visitor-Supplied URL Fetches Pass The urlSafety Guards
Every server-side fetch of a visitor-supplied URL in the audit bot MUST pass the guards in `docs/src/modules/auditBot/urlSafety.ts`: http/https only, no embedded credentials, hostname not in the blocked set (localhost / `.local` / `.internal` / metadata), every IP being dialed classified public by `isPrivateOrReservedIp` (enforced at connect time via the undici Agent `lookup` hook in `docs/src/modules/auditBot/tools.ts`, which closes the DNS-rebinding TOCTOU), redirects re-validated hop-by-hop (never `redirect: 'follow'`), bounded by a request timeout and a streamed response-size cap.

### Acceptance Checks
- `NODE_ENV=test npx mocha docs/src/modules/auditBot/urlSafety.test.ts docs/src/modules/auditBot/tools.test.ts` exits 0.
- `grep -n "redirect: 'follow'" docs/src/modules/auditBot/tools.ts` returns no hits.
- manual: any new visitor-URL-fetching code path under `docs/src/modules/auditBot/**` imports `urlSafety` (and dials through the SSRF-safe agent) rather than re-implementing checks.

## AX-REPO-AUDIT-BOT-BEST-EFFORT: Audit Bot Loops Tools Server-Side, Validates Reports, And Treats Side Effects As Best-Effort
The consulting audit bot (`docs/src/modules/auditBot/**`, flows §9.3 / §13.5) MUST execute every LLM tool call server-side inside `runTurn` (`conversationRunner.ts`) — the browser never invokes the LLM or the `fetch_company_site` / `generate_report` / `save_lead` tools directly; untrusted model report arguments MUST pass `validateReportShape` (`reportValidation.ts`) before they reach the UI or the report mailer; and Mongo persistence (`auditStore.ts`), SES report email (`auditMailer.ts`), and Telegram notification (`notifyTelegram.ts`) MUST be best-effort side effects that log-and-continue rather than fail a chat turn. (Generalizes `AX-PROD-SUI-012`; the SSRF portion is covered by `AX-AUDIT-BOT-URL-SAFETY`.)

### Acceptance Checks
- `NODE_ENV=test npx mocha docs/src/modules/auditBot/reportValidation.test.ts docs/src/modules/auditBot/auditMailer.test.ts docs/src/modules/auditBot/leadFields.test.ts` exits 0.
- `grep -n "validateReportShape" docs/src/modules/auditBot/conversationRunner.ts` shows report args validated before use.
- manual: `runTurn` (`conversationRunner.ts`) is the single server-side tool loop; no browser code path under `docs/src/modules/auditBot/channels/**` calls the LLM or audit tools directly.
- manual: `auditStore` / `auditMailer` / `notifyTelegram` calls in the turn path are wrapped so a thrown error is caught and logged, never propagated out of a chat turn.

## AX-REPO-WASMLAYER-CONTRACT: The `WasmLayer` JSON Shape Is A Mirrored Editor↔Renderer Contract
The untyped `WasmLayer` / `WasmTransform` JSON contract emitted by `@stoked-ui/editor` (`packages/sui-editor/src/WasmPreview/actionMapper.ts` + `types.ts`, typed by `wasm-module.d.ts`) and consumed by the Rust WASM compositor (`packages/sui-video-renderer/wasm-preview/src/lib.rs`, `PreviewRenderer.render_frame` → `convert_layer`) MUST stay mirrored: any change to a field name, `type` string (`solidColor`/`image`/`video`/`text`), or `blend_mode` string on one side MUST be applied to the other side and the editor ambient typings in the same change, because the boundary is runtime-only and produces no compile error when it drifts (silently dropped or mis-rendered layers).

### Acceptance Checks
- `pnpm --filter @stoked-ui/editor typescript`
- `grep -nE "WasmLayer|WasmTransform|blend_mode|z_index" packages/sui-video-renderer/wasm-preview/src/lib.rs` and `grep -nE "blend_mode|blendMode|zIndex|z_index|solidColor" packages/sui-editor/src/WasmPreview/actionMapper.ts packages/sui-editor/src/WasmPreview/types.ts` enumerate the same field/enum surface on both sides.
- manual: after `pnpm build:wasm`, the editor preview renders every layer type (solidColor/image/video/text) without a layer silently disappearing.

## AX-REPO-CDN-API-CONTRACT: The `/api/cdn/*` REST Contract Is Shared Across Four Surfaces
The `/api/cdn/*` REST contract (contents, folders, move, delete, permissions, export, multipart upload, public path resolver) is the single coupling point between the `@stoked-ui/cdn` client (`createCdnApi`), the docs API handlers (`docs/pages/api/cdn/**`), the legacy internal admin app (`packages-internal/cdn`), and the Vite wrapper (`packages-internal/cdn-sui`). Any change to a route's path, request, or response shape MUST update the `@stoked-ui/cdn` `CdnApi` client and both internal apps in the same change; no surface is allowed to drift behind the docs handler that owns the route.

### Acceptance Checks
- `pnpm --filter @stoked-ui/cdn typescript`
- `ls docs/pages/api/cdn` (server side, route owner) and `grep -rnE "/api/cdn" packages/sui-cdn/src/CdnApi/CdnApi.ts packages-internal/cdn/src/lib/cdnApi.js` (the two direct `/api/cdn/*` clients) enumerate both ends of the contract; `cdn-sui` consumes it transitively via `import { CdnBrowser } from '@stoked-ui/cdn'`.
- manual: a PR changing a `/api/cdn/*` route shape lists the `@stoked-ui/cdn` `createCdnApi` method and the `packages-internal/cdn` `lib/cdnApi.js` call site it updated (and re-verifies `cdn-sui` still renders).

---

## Candidates (Not Yet Promoted)

<!--
stokd-axiom-candidate
id: AX-CANDIDATE-REPO-ESM-MODULE-TYPE
suggested_targets: .stokd/meta/SC_AXIOMS.md
notes: Only `packages/sui-docs/package.json` currently declares `"type": "module"`.
The other publishable packages (sui-common, sui-common-api, sui-editor,
sui-file-explorer, sui-github, sui-media, sui-media-api, sui-timeline, sui-cdn)
build to CJS-compatible output via the Babel pipeline and do NOT declare ESM-only.
Cannot promote to a repo-wide invariant without first auditing whether ESM-only
is desired across the board.
-->

<!--
stokd-axiom-candidate
id: AX-CANDIDATE-REPO-TIMELINE-PIXEL-MATH
suggested_targets: .stokd/meta/SC_AXIOMS.md
notes: `packages/sui-timeline/src/utils/deal_data.ts` is the single source of
truth for pixel/time math (startLeft, scaleWidth, scale, parserTimeToPixel)
inside the timeline package (see AX-MOD-TIMELINE-003). The editor package and
the docs showcases also place cursors / action blocks against the same axis,
but this has not been audited end-to-end — promoting to a repo-wide axiom
requires confirming no editor / docs code computes positions independently.
-->

<!--
stokd-axiom-candidate
id: AX-CANDIDATE-REPO-NO-MOCKED-DB-IN-TESTS
suggested_targets: .stokd/meta/SC_AXIOMS.md
notes: User feedback on this account favors integration tests against real
databases over mocks. The repo currently has a mixed posture
(`packages/sui-media-api` uses Mongo integration via Docker; some `docs/pages/api`
handlers are unit-tested with mocked models). Cannot promote to a binding
repo-wide invariant until the test strategy in SC_TEST.md aligns.
-->

<!--
stokd-axiom-candidate
id: AX-CANDIDATE-REPO-SUE-PROJECT-FORMAT
suggested_targets: .stokd/meta/SC_AXIOMS.md
notes: The `.sue` project JSON model parsed by the native CLI
(`packages/sui-video-renderer/cli/src/project.rs`: Project / ProjectTrack /
TrackType / TrackAction / TrackTransform) is conceptually the same project file
produced/consumed by `@stoked-ui/editor` serialization and the timeline action
model — a candidate cross-package wire contract alongside
AX-REPO-MEDIA-TYPE-COORDINATION. NOT promoted: the end-to-end round-trip
(editor export → `video-render`) is unverified and the CLI currently rejects
`video` and `text` tracks (`anyhow::bail!` in `to_timeline`), so the two formats
are not yet proven identical. Promote once an editor-export → CLI-render round-trip
test exists.
-->

<!--
stokd-axiom-candidate
id: AX-CANDIDATE-REPO-MONGOOSE-REF-REGISTRATION
suggested_targets: .stokd/meta/SC_AXIOMS.md
notes: Every Mongoose ObjectId `ref` string must resolve to a model name actually
registered (via `MongooseModule.forFeature`) in whichever app `.populate()`s it.
`packages/sui-common-api` has a latent mismatch — `BaseModel`/`File`
engagement+authorship fields ref `"UserRef"` while the exported `UserFeature`
registers as `"User"` (see `.stokd/meta/packages/sui-common-api/SC_MODULE.md` §5).
NOT promoted: the invariant is currently violated and would need a cross-package
audit of every ref/registration pair (`sui-media-api`, `docs/pages/api/**`) before
it can be stated as a binding, satisfiable repo-wide rule. Promote (and fix the
mismatch) together.
-->

---

## AX-REPO-PUBLISH-NO-HOL-BLOCKING: The npm Publish Pipeline Attempts Every Selected Package Independently
The publish loop in `scripts/npmRelease.mjs publish` (driven by `publish-packages.yml`) MUST attempt every selected package independently: a per-package publish failure (e.g. a package missing its npmjs.com trusted-publisher config, as `@stoked-ui/cdn` was on 2026-06-11) is recorded and summarized, never aborts the remaining packages, and the job exits non-zero if any package failed. An exact `name@version` that already exists on the registry is skipped with a log line, not treated as an error.

### Acceptance Checks
- `node --check scripts/npmRelease.mjs` exits 0.
- sandbox: with a fake repo of three `@stoked-ui/*` packages and an `npm` shim on PATH (publish fails for the first, `view` reports the third already published), `node npmRelease.mjs publish --mode prerelease --packages '[all three]'` attempts the first two, skips the third, prints a failure summary naming only the first, and exits 1.
- manual: a `publish-packages.yml` run with one misconfigured package still publishes every other changed package and reports the failure in the job log.

---

## Cross-References

- Product axioms: `.stokd/meta/SC_PRODUCT_STOKED_UI_SUI.md` (`AX-PROD-SUI-001` … `AX-PROD-SUI-012`)
- Module axioms: `packages/*/.axioms.md`
- Guardrails: `.stokd/meta/SC_CONTEXT.md`, `CLAUDE.md`, `AGENTS.md`
- Flows / acceptance surface: `.stokd/meta/SC_FLOWS.md`
- Test inventory: `.stokd/meta/SC_TEST.md`
- Legacy global axioms (numbered): `~/.stokd/SC_AXIOMS.md`
