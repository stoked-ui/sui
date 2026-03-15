# Stoked UI — Codebase Recommendations

> Generated: 2026-03-03 | Updated: 2026-03-14 | Meta version: 0.2.0
> Scope: Full monorepo analysis — 10 workspace packages, docs, infra, CLI
> Packages analyzed: `packages/sui-common`, `packages/sui-common-api`, `packages/sui-docs`, `packages/sui-editor`, `packages/sui-file-explorer`, `packages/sui-github`, `packages/sui-media`, `packages/sui-media-api`, `packages/sui-timeline`, `packages/sui-video-renderer`

---

## Table of Contents

1. [Critical Security Issues](#1-critical-security-issues)
2. [Code Quality Improvements](#2-code-quality-improvements)
3. [Architecture Suggestions](#3-architecture-suggestions)
4. [Missing Tests & Documentation](#4-missing-tests--documentation)
5. [Performance Opportunities](#5-performance-opportunities)
6. [Infrastructure & Deployment](#6-infrastructure--deployment)
7. [Workspace Package Assessment](#7-workspace-package-assessment)

---

## 1. Critical Security Issues

### 1.1 No Rate Limiting on Auth Endpoints — CRITICAL

**Files:** `docs/pages/api/auth/login.ts`, `docs/pages/api/auth/register.ts`, `docs/pages/api/auth/google.ts`

No rate limiting exists on any authentication endpoint across the entire stack. All 12 auth routes under `docs/pages/api/auth/` accept unlimited requests. Brute-force attacks against login, spam registration, and API key validation abuse are unmitigated.

**Extends to:** `api/subscribe.ts` (email subscription), `api/sms.ts` (SMS sending), API key validation in `docs/src/modules/auth/apiKeyStore.ts`

**Fix:** Add rate limiting middleware to Next.js API routes. Options:
- `next-rate-limit` or custom middleware using Redis/in-memory store
- IP-based limits: 5 req/min for login, 3 req/hour for registration
- For Lambda endpoints (`api/`): use API Gateway throttling in `infra/api.ts`

### 1.2 Wildcard CORS in API Gateway — CRITICAL

**File:** `infra/api.ts:7-11`

```typescript
cors: {
  allowOrigins: ["*"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
},
```

Wildcard CORS allows requests from any origin. While individual Lambda handlers (subscribe, sms) have origin validation, the gateway-level wildcard undermines defense-in-depth.

**Fix:** Replace `["*"]` with explicit domain list from `infra/domains.ts`.

### 1.3 Origin Validation Bypass — HIGH

**File:** `api/sms.ts:14-19`

```typescript
if (!process.env.ROOT_DOMAIN?.includes(event.headers.origin.replace('https://', ''))) {
```

Uses `.includes()` substring matching — `evil-stoked-ui.com` passes if `ROOT_DOMAIN` contains `stoked-ui.com`. Does not handle missing headers, `http://` scheme, or port numbers.

**File:** `api/subscribe.ts:16-23` — Better implementation using `domains.includes(origin)` against an explicit array, but still string-based with no URL parsing.

**Fix:** Parse origins as URLs and compare hostnames against an explicit allowlist.

### 1.4 Hardcoded AWS Account ID — HIGH

**Files:** `infra/api.ts:47,59`, `infra/site.ts:72`

AWS account ID `883859713095` is embedded in IAM ARN strings in multiple infrastructure files.

```typescript
// Current (bad)
resources: ["arn:aws:ses:us-east-1:883859713095:identity/*"]

// Recommended — derive from SST context
resources: [`arn:aws:ses:${$app.providers.aws.region}:${aws.getCallerIdentity().accountId}:identity/*`]
```

### 1.5 Overly Permissive IAM — HIGH

**File:** `infra/api.ts` — SMS Lambda has `sns:Publish` on `resources: ["*"]`. Allows publishing to **any** SNS topic in the account.

**Fix:** Restrict to a specific topic ARN or phone-number resource pattern.

### 1.6 Malformed IAM ARN Pattern — MEDIUM

**File:** `infra/api.ts:59`

```typescript
resources: ["arn:aws:ses:us-east-1:883859713095:identity/!*"]
```

`!*` is not valid ARN glob syntax. Should be `*`.

### 1.7 In-Memory User Storage in Media API AuthService — HIGH

**File:** `packages/sui-media-api/src/auth/auth.service.ts:34-46`

Users are stored in an in-memory `Map`, not persisted to MongoDB. All user registrations are lost on process restart. The code includes an explicit comment acknowledging this is temporary.

**Fix:** Implement a `UserSchema` using Mongoose models from `@stoked-ui/common-api` (which already defines `user.model.ts`).

### 1.8 Impersonation Endpoint — No Server-Side Audit Log — MEDIUM

**File:** `docs/pages/api/auth/impersonate.ts`

The impersonation implementation has proper role-based access control (admin/agent only, with agent-to-user relationship verification). However, there is no server-side audit log. A compromised admin account could impersonate users with no persistent trace.

**Fix:** Log all impersonation events to MongoDB with timestamp, actor, target, and IP.

### 1.9 AUTH_TRANSFER_SECRET Reuses JWT_SECRET — LOW

**File:** `docs/src/modules/auth/session.ts:12`

```typescript
const AUTH_TRANSFER_SECRET = process.env.AUTH_TRANSFER_SECRET || process.env.JWT_SECRET || 'dev-secret-change-me';
```

Cross-origin session transfer and JWT signing share the same secret. Should ideally be separate in production to limit blast radius if one is compromised.

### 1.10 Resolved: JWT Secret Handling — FIXED

**File:** `docs/src/modules/auth/authStore.ts:53-58`

Previously flagged as using a dev fallback without production guard. Now correctly throws at startup if `JWT_SECRET` is missing in production:

```typescript
const JWT_SECRET = process.env.JWT_SECRET || (() => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET environment variable is required in production');
  }
  return 'dev-secret-change-me';
})();
```

### 1.11 Resolved: Cookie Security — CORRECT

**File:** `docs/src/modules/auth/session.ts`

Session cookies properly implement: HttpOnly, SameSite=Lax, Secure flag in production, and time-limited cross-origin transfer tokens (5min TTL with audience validation).

---

## 2. Code Quality Improvements

### 2.1 TypeScript Strict Mode Disabled Across All Packages — HIGH

Root `tsconfig.x.json` has `strict: true`, but every package overrides with `noImplicitAny: false`. Some packages have additional relaxations:

| Package | Disabled Checks |
|---------|----------------|
| `sui-media-api` | Standalone tsconfig: `noImplicitAny: false`, `strictNullChecks: false` |
| `sui-file-explorer` | `strict: false` (explicit override) |
| `sui-common`, `sui-common-api` | `strictPropertyInitialization: false` |
| All others | `noImplicitAny: false` (overrides root strict) |

**Recommendation:** Enable `noImplicitAny: true` incrementally — start with leaf packages (`sui-common`, `sui-github`) and work inward.

### 2.2 Console.log Statements in Production Code — HIGH

**32 files** across shipped packages contain `console.log` statements:

| Package | Files with console.log | Notable |
|---------|----------------------|---------|
| `sui-file-explorer` | 3 | DnD plugin, File component |
| `sui-media` | 6 | MediaFile, MediaCard, hooks, benchmarks |
| `sui-editor` | 6 | DetailView, WASM, keyboard, audio |
| `sui-common` | 7 | LocalDb, GrokLoader, SocialLinks, Colors, Types |
| `sui-timeline` | 3 | Engine, TrackActions, ProviderFunctions |
| `sui-github` | 2 | GithubEvents, GithubCalendar |
| `sui-media-api` | 1 | main.ts (disables console.log globally) |

**Exception:** `sui-timeline/src/utils/logger.ts` provides a structured logging wrapper — this is intentional. Benchmark files are also acceptable.

**Fix:** Replace debug `console.log` calls with the structured logger from `sui-timeline` or remove. Add ESLint `no-console` rule enforcement without overrides.

### 2.3 Missing `await` on Database Operations — CRITICAL

**File:** `api/subscribe.ts:53,133`

```typescript
collection.updateOne({ email }, { $set: { verificationToken } });  // Missing await!
```

Both `updateOne()` calls are fire-and-forget. Verification tokens may not be saved before the verification email is sent.

### 2.4 MongoDB Client Type Mismatch — HIGH

**File:** `api/lib/mongodb.ts:10-18`

The cached `global._mongoClientPromise` is a `Promise<MongoClient>`, but the `else` branch assigns it to a `MongoClient` variable. This causes runtime method-not-found errors.

### 2.5 Inconsistent Error Response Formats

**Files:** `api/subscribe.ts`, `api/sms.ts`

Some handlers return `{ message: "..." }`, others return `{ error: "..." }`. No standard error envelope.

**Fix:** Create a shared `apiResponse(statusCode, body)` helper with consistent shape.

### 2.6 Sensitive Data in CloudWatch Logs — HIGH

**File:** `api/subscribe.ts:18`

Full `event` object (including headers, body, and auth tokens) is logged.

**Fix:** Log only non-sensitive fields: `console.info('Origin check failed', { origin: event.headers.origin })`.

### 2.7 No Input Validation on Lambda API Endpoints

**File:** `api/subscribe.ts:32-38` — Email only checked for existence, not format.

**File:** `api/sms.ts:33` — Phone regex `^\+\d{11,15}$` is not accurate for E.164 (should be `^\+[1-9]\d{1,14}$`).

### 2.8 API Route Typo

**File:** `infra/api.ts:103`

```typescript
api.route("POST /smss", sendSms.arn);  // Should be /sms
```

### 2.9 In-Memory Media Store Not Wired to MongoDB

**File:** `packages/sui-media-api/src/media/media.service.ts`

MediaService uses in-memory `Map` for CRUD despite Mongoose models being imported and `database.module.ts` being configured. Comment states: "Currently uses in-memory storage — will be replaced with database in future phases."

**File:** `packages/sui-media-api/src/uploads/uploads.service.ts` — Same pattern: `private sessions: Map<string, UploadSession> = new Map()`.

### 2.10 Missing ApiKeyGuard Implementation

**File:** `packages/sui-media-api/src/invoices/invoices.controller.ts`

References `ApiKeyGuard` but no implementation file exists.

### 2.11 Dual Auth Path in `withAuth` — Inconsistent Error Codes

**File:** `docs/src/modules/auth/withAuth.ts`

Supports both API key (`sk_*` prefix) and JWT authentication but returns generic 401/403 without distinguishing which method failed.

**Fix:** Return `WWW-Authenticate` header indicating accepted schemes and specific error codes (e.g., `token_expired`, `key_revoked`).

---

## 3. Architecture Suggestions

### 3.1 Unify API Key Infrastructure

API key management exists in two places:
- `docs/src/modules/auth/apiKeyStore.ts` — Docs site API key CRUD (MongoDB-backed, solid implementation with `crypto.randomBytes(32)` entropy and `sk_` prefix)
- `packages/sui-media-api/src/invoices/invoices.controller.ts` — References `ApiKeyGuard` (not implemented)

**Fix:** Extract API key validation into `@stoked-ui/common-api` as a shared module.

### 3.2 API Handlers: Extract Shared Middleware

`api/subscribe.ts` and `api/sms.ts` duplicate origin validation, CORS headers, error formatting, and JSON parsing.

```
api/lib/
  mongodb.ts         → (exists) connection pooling
  domains.ts         → (exists) domain list
  middleware.ts      → NEW: origin validation, CORS, error envelope
  validation.ts      → NEW: email, phone, content-type validators
```

### 3.3 Lambda Timeout Configuration

**File:** `infra/api.ts`

Only `MediaApi` has an explicit timeout (29s). Standalone Lambdas use AWS default (3s), which may be too short for MongoDB Atlas operations.

**Fix:** Set explicit timeouts: 10s for subscribe/verify (DB + SES), 5s for SMS.

### 3.4 Missing CORS Response Headers on Lambda Functions

Lambda functions validate origins but don't always return CORS headers. Browser requests may fail even from valid origins.

### 3.5 No Request ID Tracing

API handlers have no correlation IDs for distributed request tracing.

**Fix:** Pass through `x-request-id` header or generate one, include in all log entries.

### 3.6 Env Var Validation is Incomplete

**File:** `sst.config.ts:5`

Only `ROOT_DOMAIN` and `MONGODB_URI` validated at startup. Other required variables (`STRIPE_SECRET_KEY`, etc.) are not checked.

**Note:** `infra/secrets.ts` properly uses SST Secrets for `MONGODB_URI`, `ROOT_DOMAIN`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and `JWT_SECRET`. The issue is that Lambda function environment bindings may not reference all required secrets.

### 3.7 NestJS Media API: Consolidate Storage Backend

Three services use parallel in-memory `Map` stores: AuthService, MediaService, and UploadsService. The database module and Mongoose models exist but aren't wired to services.

### 3.8 Share API Client Types Between CLI and Server

**Files:** `packages-internal/stoked-cli/src/client.rs`, `docs/src/modules/openapi/docsApiOpenApiSpec.ts`

The Rust CLI and docs API both have independent API definitions. The docs API already generates OpenAPI specs (`docs/pages/api/openapi.ts` via `getDocsApiOpenApiSpec()`), and the media API has NestJS Swagger (`packages/sui-media-api/docs/openapi.yaml`).

**Fix:** Generate Rust client from the existing OpenAPI specs via `openapi-generator`.

### 3.9 stoked-mcp Package Appears Empty

**Directory:** `packages-internal/stoked-mcp/`

This package contains only build artifacts (`.turbo/`, `dist/`, empty `src/__tests__/`). If the MCP server has been deprecated or relocated, remove the package from the workspace. If planned, scaffold it properly.

---

## 4. Missing Tests & Documentation

### 4.1 Test Coverage Gaps

**149 test files** across the monorepo. Coverage by package:

| Package | Test Files | Framework | Status |
|---------|-----------|-----------|--------|
| `sui-common` | 3 | Jest | SocialLinks tested; LocalDb, Colors, Types untested |
| `sui-common-api` | 0 | — | **No tests at all** — 12 model files untested |
| `sui-docs` | 0 | — | **No tests** |
| `sui-editor` | 40 | Mocha + Jest | Good: integration, TypeScript, hooks, component tests |
| `sui-file-explorer` | 20 | Jest | Good: DnD plugin, components, TypeScript specs |
| `sui-github` | 35 | Mocha | Integration + TypeScript validation |
| `sui-media` | 11 | Jest | Best coverage: 80% threshold enforced |
| `sui-media-api` | 9 | Jest (NestJS) | Service specs + 1 E2E; no auth-to-media integration test |
| `sui-timeline` | 1 | Jest | Theme augmentation only; Engine logic untested |
| `sui-video-renderer` | 6 | Cargo | Blend accuracy, transform, effects, browser integration |
| `docs/` | 15 | Mocha | New: cdnStorage, contactUser, invoiceNormalization tests |
| `api/` | 0 | — | **No tests** — subscribe, sms, mongodb handlers |
| `packages-internal/stoked-cli` | 0 | — | **No tests** — Rust CLI needs `#[cfg(test)]` modules |

**Priority test additions:**
1. `api/subscribe.ts` + `api/sms.ts` — origin validation, MongoDB operations, SES/SNS integration
2. `api/lib/mongodb.ts` — connection type mismatch bug makes this critical
3. `packages/sui-common-api` — model validation, decorator behavior
4. `packages/sui-timeline/src/Engine/` — core playback engine logic
5. `packages-internal/stoked-cli` — command routing, auth flow, profile management
6. `docs/pages/api/auth/*` — auth endpoint behavior (login, register, impersonation)
7. `packages/sui-media-api` — integration test: register -> login -> upload -> query

### 4.2 Missing Documentation

| Item | Status |
|------|--------|
| Root `.env.example` | **Missing** — document all required env vars |
| `SECURITY.md` | **Missing** — standard security disclosure policy |
| Architecture diagram | **Missing** — no formal C4 or dependency graph |
| `CODEOWNERS` | **Minimal** — only one global owner |
| CLI user documentation | **Missing** — `stoked-cli` has 55KB+ of commands but no user-facing docs |
| API key management docs | **Missing** — new system undocumented |

**Resolved:** OpenAPI documentation now exists for both APIs:
- Docs API: `docs/pages/api/openapi.ts` (dynamic generation)
- Media API: `packages/sui-media-api/docs/openapi.yaml` (with CI validation via `scripts/validate-openapi.ts`)

### 4.3 Missing ESLint Config

**Packages without explicit ESLint config** (inherit from root):
- `sui-common-api`
- `sui-docs`
- `sui-video-renderer`

### 4.4 Inconsistent ESLint Rules Across Packages

| Rule | sui-common | sui-editor | sui-media | sui-timeline |
|------|-----------|-----------|----------|-------------|
| `import/no-cycle` | `off` | `error` | `error` | `off` |

Circular dependency detection should be consistent. Recommend `error` for all packages.

---

## 5. Performance Opportunities

### 5.1 MongoDB Connection Health

**File:** `api/lib/mongodb.ts`

Connection is cached globally (good), but no health checks, connection timeout configuration, or retry logic. Combined with the type mismatch bug (section 2.4), the connection may silently fail.

### 5.2 Lambda Cold Start Optimization

Standalone Lambda functions (`subscribe.ts`, `sms.ts`) import MongoDB client at module level but don't use connection pooling or provisioned concurrency. Consider:
- Provisioned concurrency for latency-sensitive flows
- Connection keepalive settings for MongoDB
- `context.callbackWaitsForEmptyEventLoop = false`

### 5.3 NestJS API: Production Console Suppression

**File:** `packages/sui-media-api/src/main.ts`

Globally disables `console.log`, `console.info`, `console.debug` in production. This prevents emergency debugging.

**Fix:** Replace with a structured logger (e.g., `@nestjs/pino`) with configurable log levels.

### 5.4 NestJS API: Good — Redis Caching Middleware Present

**File:** `packages/sui-media-api/src/performance/caching.middleware.ts`

The media API has Redis-based caching with configurable TTL per endpoint type:
- Metadata: 5-min cache
- Thumbnails: 30-min cache
- File lists: 2-min cache
- Search: 1-min cache
- Cache invalidation pattern support

This is well-implemented. No action needed.

### 5.5 NestJS API: No Database Index Definitions

Mongoose schemas define fields but no explicit indexes for frequently queried fields (tags, author, mediaType, status).

**Fix:** Add indexes to schemas:
```typescript
@Prop({ index: true })
author: string;
```

### 5.6 DnD Tree Operations — Potential Redundant Traversals

**File:** `packages/sui-file-explorer/src/internals/plugins/useFileExplorerDnd/`

The DnD plugin handles tree mutations. If `removeItem()` and `insertChild()`/`insertBefore()`/`insertAfter()` each traverse the full tree independently, moving an item requires two full traversals.

**Fix:** Combine into a single `moveItem()` that removes and inserts in one pass.

---

## 6. Infrastructure & Deployment

### 6.1 Add Dependency Audit to CI

No `pnpm audit` step in CI workflows. Security vulnerabilities in transitive dependencies won't be caught.

**Fix:** Add to `.github/workflows/ci.yml`:
```yaml
- name: Security audit
  run: pnpm audit --audit-level=high
```

### 6.2 Add Pre-Commit Hooks

No `.husky/` directory, no pre-commit configuration found. All quality gates rely on CI. Given the sensitive credentials in the project, local pre-commit hooks would catch issues faster.

**Fix:** Install `husky` with `lint-staged` for linting/formatting, and `detect-secrets` or GitHub push protection for secret scanning.

### 6.3 Build Entry Point Inconsistency

Most UI packages have `"main": "src/index.ts"` (source), while `sui-media-api` correctly uses `"main": "dist/main.js"`. Consumers relying on `main` for built output will get uncompiled TypeScript.

### 6.4 Docker Production Hardening

**File:** `packages/sui-media-api/Dockerfile`

Solid multi-stage build (non-root user, tini for PID 1, health check). Two improvements:

1. **Pin base image digest** — `node:18-alpine` should use `@sha256:...` to prevent supply chain drift
2. **Consider Node.js 20** — workflows already use `nodejs20.x` for Lambda; align Docker

### 6.5 Resolved: CI Concurrency Controls — IMPLEMENTED

**File:** `.github/workflows/deploy-site.yml`

Production deploy workflows now have concurrency groups:
```yaml
concurrency:
  group: deploy-site-production
  cancel-in-progress: true
```

`publish-packages.yml` also has `concurrency: publish-packages-main`. The main `ci.yml` does not have concurrency controls (low priority since it's non-destructive).

### 6.6 Stoked CLI — No CI Build Pipeline

**Directory:** `packages-internal/stoked-cli/`

The Rust CLI is feature-complete (auth, blog, clients, products, invoices, deliverables commands) but has no CI workflow for build, test, or release.

**Fix:** Add GitHub Actions workflow with `cargo test` and `cargo build --release`. Consider `cross` for cross-compilation.

### 6.7 Good: CodeQL and Supply Chain Security Present

**Files:** `.github/workflows/codeql.yml`, `.github/workflows/scorecards.yml`

SAST and OSSF Scorecard workflows are configured. Also: `claude-code-review.yml` for AI-assisted code review.

---

## 7. Workspace Package Assessment

### 7.1 `sui-common` — Shared React Utilities [medium priority]

**Status:** Active, 3 test files

**Components:** SocialLinks (with platform registry), useResize hook, Types utilities, LocalDb (IndexedDB), GrokLoader, Colors, MimeType, ProviderState.

**Top priorities:**
1. Add tests for LocalDb, ProviderState, MimeType (untested core utilities)
2. Enable `noImplicitAny: true` (leaf package, good starting point)
3. Remove 7 `console.log` calls from production code

### 7.2 `sui-common-api` — Shared Data Models [high priority]

**Status:** Active, 0 test files

**Models:** base, video, user, file, image, client, invoice, license, media, product, blogPost, uploadSession (12 model files). Decorators: stdschema, defaultSchemaOptions.

**Top priorities:**
1. **Add test suite** — model validation, decorator behavior, schema generation
2. Wire models to NestJS services (AuthService, MediaService use in-memory Maps instead)
3. Add ESLint config (currently inherits from root only)

### 7.3 `sui-docs` — Documentation Utilities [low priority]

**Status:** Active, 0 test files

**Top priorities:**
1. Add basic tests for documentation generation utilities

### 7.4 `sui-editor` — Video/Audio Editor [medium priority]

**Status:** Active, 40 test files (best test coverage by file count)

**Key areas:** EditorEngine, DetailView, WASM Preview, keyboard controls, AudioPlayer, AnimationController.

**Top priorities:**
1. Remove 6 `console.log` calls from production code
2. Add unit tests for EditorEngine logic (integration tests exist but no focused engine tests)
3. WASM preview integration is complex — ensure error boundaries exist

### 7.5 `sui-file-explorer` — File Tree Component [medium priority]

**Status:** Active, 20 test files. No v2 package — v2 exists only as planning docs in `.stokd/projects/`.

**Key areas:** DnD plugin (`useFileExplorerDnd`), file validation, export utilities, MUI X DnD adapters.

**Top priorities:**
1. Remove 3 `console.log` calls from DnD plugin and File component
2. Add error boundary around DnD operations
3. `tsconfig.json` has `strict: false` (explicit) — most permissive of all packages

### 7.6 `sui-github` — GitHub Integration [low priority]

**Status:** Active, 35 test files

**Components:** GithubEvents, GithubCalendar.

**Top priorities:**
1. Remove 2 `console.log` calls
2. Enable `noImplicitAny: true` (leaf package, low risk)

### 7.7 `sui-media` — Media Components [high priority]

**Status:** Active, 11 test files, **80% coverage threshold enforced** (only package with thresholds)

**Key areas:** MediaCard, MediaViewer, MediaFile, FileSystemApi, hooks (useMediaUpload), abstractions (Auth, Payment, Queue, Router, KeyboardShortcuts).

**Top priorities:**
1. Remove 6 `console.log` calls from production code
2. This package is the model for test coverage — extend threshold enforcement to other packages

### 7.8 `sui-media-api` — NestJS Media API [critical priority]

**Status:** Active, 9 test files + 1 E2E

**Architecture:** Well-modularized NestJS with auth, media, uploads, S3, health modules. Has Redis caching middleware, OpenAPI spec generation with CI validation, JWT + RBAC guards.

**Top priorities:**
1. **Migrate AuthService from in-memory to MongoDB** (section 1.7)
2. **Migrate MediaService from in-memory to MongoDB** (section 2.9)
3. **Migrate UploadsService from in-memory to MongoDB**
4. Implement missing `ApiKeyGuard` (section 2.10)
5. Add database indexes (section 5.5)
6. Add integration test: register -> login -> upload -> query
7. Replace global console suppression with structured logger (section 5.3)

### 7.9 `sui-timeline` — Timeline Engine [medium priority]

**Status:** Active, 1 test file (theme augmentation only)

**Key areas:** Engine (playback control), TimelineLabels, TimelineProvider, structured logger utility.

**Top priorities:**
1. **Add tests for Engine logic** — core playback engine is untested
2. Remove 3 `console.log` calls (excluding the structured logger in `utils/logger.ts`)
3. Promote `logger.ts` as the shared logging solution for all packages

### 7.10 `sui-video-renderer` — Rust/WASM Video Renderer [low priority]

**Status:** Active, 6 Rust test files

**Architecture:** Cargo workspace with compositor, CLI, and wasm-preview modules. WASM output aliased as `@stoked-ui/video-renderer-wasm` in webpack. Has benchmark suite with regression checking.

**Top priorities:**
1. Add ESLint config for any TypeScript wrapper code
2. Document WASM build process (currently in CLAUDE.md memory, not in package README)

---

## Summary — Priority Matrix

| Priority | Issue | Section |
|----------|-------|---------|
| **P0 — Immediate** | Add `await` to MongoDB operations in `api/subscribe.ts` | 2.3 |
| **P0 — Immediate** | Fix MongoDB client type mismatch in `api/lib/mongodb.ts` | 2.4 |
| **P0 — Immediate** | Add rate limiting to auth endpoints | 1.1 |
| **P1 — This Sprint** | Fix wildcard CORS in API Gateway | 1.2 |
| **P1 — This Sprint** | Fix origin validation bypass in `api/sms.ts` | 1.3 |
| **P1 — This Sprint** | Migrate AuthService to MongoDB persistence | 1.7 |
| **P1 — This Sprint** | Remove hardcoded AWS account ID | 1.4 |
| **P1 — This Sprint** | Restrict SNS IAM permissions | 1.5 |
| **P1 — This Sprint** | Stop logging sensitive event data | 2.6 |
| **P1 — This Sprint** | Fix malformed IAM ARN pattern | 1.6 |
| **P1 — This Sprint** | Add audit logging for impersonation | 1.8 |
| **P2 — Next Sprint** | Add tests for Lambda API handlers | 4.1 |
| **P2 — Next Sprint** | Add tests for `sui-common-api` models | 7.2 |
| **P2 — Next Sprint** | Add tests for timeline Engine logic | 7.9 |
| **P2 — Next Sprint** | Migrate MediaService + UploadsService to MongoDB | 2.9 |
| **P2 — Next Sprint** | Enable TypeScript strict mode incrementally | 2.1 |
| **P2 — Next Sprint** | Remove 32 console.log calls from production code | 2.2 |
| **P2 — Next Sprint** | Add pre-commit hooks (husky + secret scanning) | 6.2 |
| **P2 — Next Sprint** | Add dependency audit to CI | 6.1 |
| **P2 — Next Sprint** | Unify API key infrastructure | 3.1 |
| **P2 — Next Sprint** | Create root `.env.example` | 4.2 |
| **P3 — Backlog** | Extract shared Lambda middleware | 3.2 |
| **P3 — Backlog** | Add CORS headers to Lambda functions | 3.4 |
| **P3 — Backlog** | Add request ID tracing | 3.5 |
| **P3 — Backlog** | Share API types between CLI and server via OpenAPI | 3.8 |
| **P3 — Backlog** | Add database indexes to media API | 5.5 |
| **P3 — Backlog** | Add DnD error boundary in file-explorer | 7.5 |
| **P3 — Backlog** | Standardize error response formats | 2.5 |
| **P3 — Backlog** | Lambda cold start optimization | 5.2 |
| **P3 — Backlog** | Add CI pipeline for stoked-cli | 6.6 |
| **P3 — Backlog** | Resolve or remove empty stoked-mcp package | 3.9 |
| **P3 — Backlog** | Standardize ESLint `import/no-cycle` rule | 4.4 |
| **P4 — Future** | Replace console suppression with structured logging | 5.3 |
| **P4 — Future** | Pin Docker base image digests + upgrade to Node 20 | 6.4 |
| **P4 — Future** | Optimize DnD tree traversals | 5.6 |
| **P4 — Future** | Promote timeline logger as shared solution | 7.9 |
