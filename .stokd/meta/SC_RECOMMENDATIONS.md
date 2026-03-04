# Stoked UI — Codebase Recommendations

> Generated: 2026-03-03 | Scope: Full monorepo analysis
> Packages analyzed: `packages/sui-media-api`, `packages-internal/stoked-mcp`, `packages-internal/stoked-cli`, `api/`, `infra/`, `packages/sui-*`, `docs/`, CI/CD, security configs
> Requested workspace packages: `apps/code-ext`, `apps/menu-bar`, `apps/osx-desktop-widget`, `apps/slack-app`, `packages/api`, `packages/mcp-server`

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

### 1.1 Hardcoded Credentials in `.env` — CRITICAL

**File:** `.env` (repository root)

The `.env` file contains production credentials committed to version control:
- Admin password in plaintext (`AUTH_ADMIN_PASSWORD`)
- MongoDB connection string with embedded credentials
- Google OAuth client secret
- S3/CDN bucket access credentials

**Action Required:**
1. **Immediately rotate** all compromised credentials (MongoDB URI, Google OAuth secret, admin password)
2. Scrub `.env` from git history using `git filter-repo` or BFG Repo-Cleaner
3. Create `.env.example` at repository root documenting all required variables with placeholder values
4. Verify `.gitignore` patterns are catching all `.env` variants (currently: `**/.env*` — good)

### 1.2 Hardcoded AWS Account ID — HIGH

**File:** `infra/api.ts` — Lines 29, 64, 76

AWS account ID `883859713095` is embedded in IAM ARN strings. Should be derived from SST context or environment variables.

```typescript
// Current (bad)
resources: ["arn:aws:ses:us-east-1:883859713095:identity/*"]

// Recommended
resources: [`arn:aws:ses:${region}:${accountId}:identity/*`]
```

### 1.3 Overly Permissive IAM — HIGH

**File:** `infra/api.ts` — Lines 90-92

SMS Lambda has `sns:Publish` on `resources: ["*"]`. This allows publishing to **any** SNS topic in the account.

**Fix:** Restrict to a specific topic ARN or phone-number resource pattern.

### 1.4 Origin Validation Bypass — HIGH

**Files:** `api/sms.ts:7-19`, `api/subscribe.ts:17-23`

Origin validation uses `.includes()` substring matching:
```typescript
process.env.ROOT_DOMAIN?.includes(event.headers.origin.replace('https://', ''))
```

**Problem:** `evil-stoked-ui.com` would pass validation if `ROOT_DOMAIN` contains `stoked-ui.com`. Also does not handle missing headers, `http://` scheme, or port numbers.

**Fix:** Parse origins as URLs and compare hostnames against an explicit allowlist.

### 1.5 Default JWT Secret Fallback — MEDIUM

**File:** `docs/src/modules/auth/authStore.ts:39`

Falls back to `'dev-secret-change-me'` when `JWT_SECRET` env var is missing. If deployed without the env var set, authentication becomes trivially bypassable.

**Fix:** Throw at startup if `JWT_SECRET` is not set in production.

### 1.6 Malformed IAM ARN Pattern — MEDIUM

**File:** `infra/api.ts:76`

```typescript
resources: ["arn:aws:ses:us-east-1:883859713095:identity/!*"]
```

`!*` is not valid ARN glob syntax. Should be `*`.

### 1.7 In-Memory User Storage in AuthService — HIGH

**File:** `packages/sui-media-api/src/auth/auth.service.ts`

Users are stored in an in-memory `Map`, not persisted to MongoDB. All user registrations are lost on process restart. This includes password hashes and role assignments.

**Fix:** Implement a `UserSchema` in `@stoked-ui/common-api` and wire it through Mongoose. This is the single biggest blocker for production readiness.

### 1.8 No Rate Limiting on Auth Endpoints — HIGH

**File:** `packages/sui-media-api/src/auth/auth.controller.ts`

`POST /auth/register` and `POST /auth/login` have no rate limiting. Brute-force attacks against the login endpoint or spam registration are unmitigated.

**Fix:** Add `@nestjs/throttler` with a sensible limit (e.g., 5 requests/minute for login, 3/hour for registration).

### 1.9 NEW: API Key Store — Missing `await` on Validation Update — MEDIUM

**File:** `docs/src/modules/auth/apiKeyStore.ts:79-83`

```typescript
// Update lastUsedAt (fire-and-forget)
db.collection('api_keys').updateOne(
  { _id: apiKey._id },
  { $set: { lastUsedAt: new Date() } },
);
```

The `updateOne` promise is neither awaited nor has a `.catch()` handler. In Node.js, unhandled promise rejections can terminate the process.

**Fix:** Add `.catch(err => console.error('Failed to update lastUsedAt', err))` or properly await.

### 1.10 NEW: Impersonation Endpoint Needs Audit Logging — MEDIUM

**File:** `docs/pages/api/auth/impersonate.ts`

Admin and agent impersonation creates JWTs with `impersonatedId` claims but has no server-side audit log. A compromised admin account could impersonate users with no trace.

**Fix:** Log all impersonation events to MongoDB with timestamp, actor, target, and IP.

### 1.11 NEW: CLI Auth Flow — Token Exposure in URL — MEDIUM

**File:** `docs/pages/cli/auth.tsx:58-60`

After successful CLI authorization, the API key is passed back to the CLI callback server via URL parameters:
```typescript
window.location.href = `http://localhost:${port}/callback?key=${key}&state=${state}&email=${user.email}`;
```

API keys in URLs are logged by default in browser history and server access logs.

**Fix:** Use `POST` to the callback URL with the key in the body, or use a short-lived exchange token that the CLI server trades for the real key.

---

## 2. Code Quality Improvements

### 2.1 TypeScript Strict Mode Disabled Across UI Packages — HIGH

All 8 UI packages have `"noImplicitAny": false` in their `tsconfig.json`. Several also disable other strict checks:

| Package | Disabled Checks |
|---------|----------------|
| `sui-media-api` | `strict: false`, `strictNullChecks: false`, `strictBindCallApply: false` |
| `sui-timeline` | `strict: false` (all checks off) |
| `sui-common`, `sui-common-api` | `strictPropertyInitialization: false` |

**Exception:** `stoked-mcp` has `strict: true` — this should be the standard.

**Recommendation:** Enable strict mode incrementally — start with `noImplicitAny: true` in leaf packages (`sui-common`, `sui-github`) and work inward.

### 2.2 Missing `await` on Database Operations — CRITICAL

**File:** `api/subscribe.ts` — Lines 53, 133

```typescript
collection.updateOne({ email }, { $set: { verificationToken } });  // Missing await!
```

Both `updateOne()` calls are fire-and-forget. Verification tokens may not be saved before the verification email is sent, causing race conditions and data integrity issues.

### 2.3 MongoDB Client Type Mismatch — HIGH

**File:** `api/lib/mongodb.ts` — Lines 10-18

```typescript
let client: MongoClient;
if (!global._mongoClientPromise) {
  client = new MongoClient(uri);
  global._mongoClientPromise = client.connect(); // Returns Promise<MongoClient>
} else {
  client = global._mongoClientPromise; // Assigning Promise<MongoClient> to MongoClient!
}
```

The cached value is a `Promise<MongoClient>`, but the `else` branch assigns it to a `MongoClient` variable. This will cause runtime method-not-found errors.

### 2.4 Inconsistent Error Response Formats

**Files:** `api/subscribe.ts`, `api/sms.ts`

Some handlers return `{ message: "..." }`, others return `{ error: "..." }`. No standard error envelope.

**Fix:** Create a shared `apiResponse(statusCode, body)` helper with consistent shape:
```typescript
{ success: boolean, error?: string, data?: unknown }
```

### 2.5 Sensitive Data in CloudWatch Logs — HIGH

**File:** `api/subscribe.ts:18`

```typescript
console.info('event.headers.origin', event, domains, ...);
```

The full `event` object (including headers, body, and auth tokens) is logged.

**Fix:** Log only non-sensitive fields: `console.info('Origin check failed', { origin: event.headers.origin })`.

### 2.6 Console Statements in Production Packages

Multiple `console.log` calls found in shipped package code:

| File | Line |
|------|------|
| `packages/sui-media/src/components/MediaCard/MediaCard.tsx` | 201 |
| `packages/sui-media/src/App/AppFile/AppFile.ts` | 93 |
| `packages/sui-media/src/FileSystemApi/FileSystemApi.ts` | 45 |
| `packages/sui-media/src/components/MediaViewer/index.tsx` | 284 |

**Fix:** Replace with a structured logger or remove. ESLint already restricts `console.log` — enforce the rule without overrides.

### 2.7 No Input Validation on Lambda API Endpoints

**File:** `api/subscribe.ts:32-38`

Email is only checked for existence (`if (!email)`), not format. No email regex or library validation.

**File:** `api/sms.ts:33`

Phone regex `^\+\d{11,15}$` is not accurate for E.164 (should be `^\+[1-9]\d{1,14}$`).

### 2.8 MCP Server: Unsafe Type Coercion

**File:** `packages-internal/stoked-mcp/src/index.ts:85`

```typescript
data = { message: response.statusText } as T;  // Unsafe cast when JSON parse fails
```

Creates an incomplete object disguised as type `T`. Downstream code may access nonexistent properties.

### 2.9 API Route Typo

**File:** `infra/api.ts:103`

```typescript
api.route("POST /smss", sendSms.arn);  // Should be /sms
```

### 2.10 In-Memory Media Store Not Wired to MongoDB

**File:** `packages/sui-media-api/src/media/media.service.ts`

MediaService uses an in-memory `Map` for CRUD operations despite Mongoose models being imported and `database.module.ts` being configured. The service should use `@InjectModel()` for persistence.

### 2.11 Missing ApiKeyGuard Implementation

**File:** `packages/sui-media-api/src/invoices/invoices.controller.ts`

The invoices controller references `ApiKeyGuard` but no implementation file exists. Header-based API key validation is not enforced.

### 2.12 NEW: DnD Tree Operations — No Error Boundary

**File:** `packages/sui-file-explorer-v2/src/dnd/DndProvider.tsx`

The DnD provider handles all tree mutations (move, reorder, insert) but has no error boundary. A malformed tree structure (e.g., orphaned node, duplicate IDs) could crash the entire file explorer.

**Fix:** Wrap mutation logic in try/catch and add a React error boundary around the DnD context.

### 2.13 NEW: Dual Auth Path in `withAuth` Needs Consistent Error Codes

**File:** `docs/src/modules/auth/withAuth.ts`

The middleware supports both API key (`sk_*` prefix) and JWT authentication but returns generic 401/403 without distinguishing which auth method failed. Clients cannot differentiate between an expired JWT and a revoked API key.

**Fix:** Return `WWW-Authenticate` header indicating the accepted schemes and specific error codes (e.g., `token_expired`, `key_revoked`).

---

## 3. Architecture Suggestions

### 3.1 MCP Server: Modularize Tool Registration

**File:** `packages-internal/stoked-mcp/src/index.ts` (409 lines, 14 tools in one file)

All tool registrations live in a single monolithic file. As tools grow (especially with planned VSCode extension integration), this will become unwieldy.

```
src/
  index.ts           → server setup + transport
  tools/
    blog.ts          → Blog CRUD tools
    licenses.ts      → License/Stripe tools
  lib/
    api-client.ts    → apiRequest(), callApi(), error helpers
    validators.ts    → Shared Zod schemas
```

### 3.2 API Handlers: Extract Shared Middleware

`api/subscribe.ts` and `api/sms.ts` duplicate origin validation, CORS headers, error formatting, and JSON parsing. Extract to shared utilities:

```
api/lib/
  mongodb.ts         → (exists) connection pooling
  domains.ts         → (exists) domain list
  middleware.ts      → NEW: origin validation, CORS, error envelope
  validation.ts      → NEW: email, phone, content-type validators
```

### 3.3 Lambda Timeout Configuration

**File:** `infra/api.ts`

Only `MediaApi` has an explicit timeout (29s). The standalone Lambdas (`subscribe`, `verify`, `sendSms`) use AWS default (3s), which may be too short for MongoDB operations through Atlas.

**Fix:** Set explicit timeouts: 10s for subscribe/verify (DB + SES), 5s for SMS.

### 3.4 Missing CORS Response Headers

Lambda functions validate origins but don't return CORS headers (`Access-Control-Allow-Origin`, etc.). Browser requests will fail even from valid origins.

### 3.5 No Request ID Tracing

API handlers have no correlation IDs. When debugging distributed requests across Lambda invocations, there is no way to trace a single user request.

**Fix:** Pass through `x-request-id` header or generate one, include in all log entries.

### 3.6 Env Var Validation is Incomplete

**File:** `sst.config.ts:5`

Only `ROOT_DOMAIN` and `MONGODB_URI` are validated at startup. Other required variables (`JWT_SECRET`, `STRIPE_SECRET_KEY`, etc.) are not checked, leading to silent runtime failures.

**Fix:** Validate all required env vars per-function at deploy time using a Zod schema or similar.

### 3.7 NestJS Media API: Consolidate Storage Backend

The API has two storage patterns running in parallel: in-memory `Map` stores in AuthService and MediaService, and properly configured Mongoose models registered in `database.module.ts`. These should converge on Mongoose for all persistence.

### 3.8 MCP Server: Add Request Timeout

**File:** `packages-internal/stoked-mcp/src/index.ts`

`fetch()` calls in `apiRequest()` have no timeout. A slow or unresponsive backend will block the MCP server indefinitely.

**Fix:**
```typescript
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 30000);
const response = await fetch(url, { ...init, signal: controller.signal });
clearTimeout(timeout);
```

### 3.9 NEW: Unify API Key Infrastructure

API key management is now implemented in two places:
- `docs/src/modules/auth/apiKeyStore.ts` — docs site API key CRUD (MongoDB-backed)
- `packages/sui-media-api/src/invoices/invoices.controller.ts` — references `ApiKeyGuard` (not implemented)

**Fix:** Extract API key validation into `@stoked-ui/common-api` as a shared module so both the docs site and NestJS API use the same key format and storage.

### 3.10 NEW: Stoked CLI — Share API Client Types

**Files:** `packages-internal/stoked-cli/src/client.rs`, `packages-internal/stoked-mcp/src/index.ts`

The Rust CLI and TypeScript MCP server both implement API clients against the same backend but share no type definitions. As endpoints evolve, these will diverge.

**Fix:** Generate a shared OpenAPI spec from the NestJS API (`@nestjs/swagger`), then:
- TypeScript: generate types from OpenAPI
- Rust: generate client from OpenAPI via `openapi-generator`

---

## 4. Missing Tests & Documentation

### 4.1 Test Coverage Gaps

| Package / Area | Test Files | Status |
|---------------|-----------|--------|
| `packages/sui-common-api` | 0 | **No tests at all** — NestJS shared models/DTOs |
| `api/subscribe.ts` | 0 | **No tests** — email subscription handler |
| `api/sms.ts` | 0 | **No tests** — SMS sending handler |
| `api/lib/mongodb.ts` | 0 | **No tests** — database connection logic with type bug |
| `packages-internal/stoked-mcp` | 12 tests | Helpers tested; **no tool invocation tests, no Zod validation tests** |
| `packages/sui-common` | 1 test file | Minimal — only `platformRegistry.test.ts` |
| `packages/sui-editor` | 6 test files | TypeScript validation only; no unit tests for EditorEngine logic |
| `packages/sui-timeline` | 1 test file | Theme augmentation only |
| `packages/sui-github` | 5 test files | TypeScript validation only |
| `packages/sui-media` | 8 test files | Best coverage; 80% threshold enforced |
| `packages/sui-media-api` | 11 spec files + 1 E2E | Good NestJS service coverage, 80% threshold |
| `docs/src/modules/auth/apiKeyStore.ts` | 0 | **No tests** — new API key management |
| `docs/pages/api/auth/*` | 0 | **No tests** — new auth API routes |
| `packages/sui-file-explorer-v2/src/dnd/*` | 0 | **No tests** — new DnD system |
| `packages-internal/stoked-cli` | 0 | **No tests** — new Rust CLI (needs `#[cfg(test)]` modules) |

**Priority test additions:**
1. `docs/src/modules/auth/apiKeyStore.ts` — key generation, validation, revocation, expiry
2. `packages/sui-file-explorer-v2/src/dnd/treeOps.ts` — pure functions, highly testable
3. `api/subscribe.ts` — origin validation, email validation, MongoDB operations, SES integration
4. `api/sms.ts` — phone validation, origin check, SNS integration
5. `packages/sui-common-api` — full test infrastructure setup
6. `packages-internal/stoked-mcp` — tool invocation tests, Zod schema edge cases
7. `packages/sui-media-api` — integration tests for auth-to-media flow (register -> login -> upload -> query)

### 4.2 Missing Documentation

| Item | Status |
|------|--------|
| Root `.env.example` | **Missing** — document all required env vars with placeholder values |
| `SECURITY.md` | **Missing** — standard security disclosure policy |
| Lambda API endpoint documentation | **Missing** — no OpenAPI/Swagger spec for `api/` handlers |
| Architecture diagram | **Missing** — SC_OVERVIEW.md has ASCII art but no formal C4 or similar |
| `CODEOWNERS` | **Minimal** — only one global owner, no team-based ownership |
| MCP Server tool usage examples | **Missing** — README lists tools but no example invocations |
| NestJS API deployment guide | **Exists** in markdown docs but references Docker setup that may be stale |
| CLI auth flow documentation | **Missing** — new `stoked-cli` has no user-facing docs |
| API key management documentation | **Missing** — new system undocumented |

### 4.3 Missing ESLint Config

**Package:** `packages/sui-common-api` has no `.eslintrc` file, unlike all other packages.

### 4.4 stoked-mcp: Missing Integration Tests

The MCP server test suite (`mcp-server.spec.ts`, 237 lines) covers HTTP helpers and endpoint path mapping but has zero tests for:
- Actual tool handler execution
- Zod schema validation (rejection of invalid inputs)
- Server startup and MCP transport connection
- End-to-end tool call -> API response flow

---

## 5. Performance Opportunities

### 5.1 MCP Server: No Pagination Limits

**File:** `packages-internal/stoked-mcp/src/index.ts:241-242`

```typescript
limit: z.number().int().min(1).optional()
```

No `.max()` constraint. A client could request `limit=1000000`, hammering the backend.

**Fix:** Add `.max(100)` to all pagination parameters.

### 5.2 MCP Server: JSON Pretty-Printing Overhead

**File:** `packages-internal/stoked-mcp/src/index.ts:97`

```typescript
text: JSON.stringify(data, null, 2)
```

Pretty-printing with 2-space indentation adds ~30% payload overhead for large responses (e.g., blog post listings with embedded markdown).

**Fix:** Use `JSON.stringify(data)` (compact) for production, keep pretty-print for debugging only.

### 5.3 No Response Caching in MCP Server

Read-only operations (`list_blog_posts`, `list_tags`, `list_authors`, `list_license_products`) hit the backend on every call. Adding a TTL-based in-memory cache (even 60s) for these would reduce backend load significantly during typical Claude conversations.

### 5.4 MongoDB Connection Health

**File:** `api/lib/mongodb.ts`

Connection is cached globally (good), but there are no health checks, connection timeout configuration, or retry logic for transient failures. The type mismatch bug (section 2.3) means the connection may silently fail.

### 5.5 Lambda Cold Start Optimization

Standalone Lambda functions (`subscribe.ts`, `sms.ts`) import MongoDB client at module level but don't use connection pooling or provisioned concurrency. For latency-sensitive email verification flows, consider:
- Provisioned concurrency for the verify function
- Connection keepalive settings for MongoDB
- `context.callbackWaitsForEmptyEventLoop = false` for faster cold starts

### 5.6 NestJS API: Production Console Suppression

**File:** `packages/sui-media-api/src/app.ts`

```typescript
if (process.env.NODE_ENV === 'production') {
  console.log = () => {};
  console.info = () => {};
  console.debug = () => {};
}
```

Globally disabling console in production is aggressive and prevents emergency debugging. Replace with a structured logger (e.g., `@nestjs/pino`) with configurable log levels.

### 5.7 NestJS API: No Database Index Definitions

Mongoose schemas define fields but no explicit index definitions for frequently queried fields (tags, author, mediaType, status). MongoDB will do collection scans on these queries.

**Fix:** Add indexes to schemas:
```typescript
@Schema()
export class Media {
  @Prop({ index: true })
  author: string;

  @Prop({ index: true })
  mediaType: string;
}
```

### 5.8 NEW: DnD Tree Operations — Redundant Tree Traversals

**File:** `packages/sui-file-explorer-v2/src/dnd/treeOps.ts`

`removeItem()` and `insertChild()`/`insertBefore()`/`insertAfter()` each do a full recursive tree traversal. When moving an item, both are called sequentially — two full traversals.

**Fix:** Combine into a single `moveItem(tree, sourceId, targetId, position)` that removes and inserts in one pass.

---

## 6. Infrastructure & Deployment

### 6.1 Add Dependency Audit to CI

No `pnpm audit` step in any CI workflow. Security vulnerabilities in transitive dependencies won't be caught automatically.

**Fix:** Add to `.github/workflows/ci.yml`:
```yaml
- name: Security audit
  run: pnpm audit --audit-level=high
```

### 6.2 Add Pre-Commit Secret Scanning

No git-secrets, detect-secrets, or similar pre-commit hook to prevent accidental credential commits. Given the existing `.env` leak (section 1.1), this is urgent.

**Fix:** Install `detect-secrets` or enable GitHub push protection for secret scanning.

### 6.3 Build Entry Point Inconsistency

Most UI packages have `"main": "src/index.ts"` (pointing to source), while `sui-media-api` correctly uses `"main": "dist/main.js"`. Consumers relying on `main` for the built output will get uncompiled TypeScript.

### 6.4 Inconsistent npm Scripts

| Script | Expected | Actual (sui-media) |
|--------|----------|-------------------|
| `typescript` | `tsc -p tsconfig.json` | `pnpm build` (non-standard) |

Standardize across all packages so `turbo run typescript` behaves consistently.

### 6.5 Docker Production Hardening

**File:** `packages/sui-media-api/Dockerfile`

The Docker setup is solid (multi-stage build, non-root user, tini for PID 1, health check). Two improvements:

1. **Pin base image digest** — `node:18-alpine` should use a digest (`node:18-alpine@sha256:...`) to prevent supply chain drift
2. **Add `--no-cache` to apk** — `apk add --no-cache ffmpeg` is used (good), but ensure the final stage also runs `rm -rf /var/cache/apk/*`

### 6.6 CI Workflow: Missing Concurrency Controls

**File:** `.github/workflows/ci.yml`

No `concurrency` group is defined. Pushing multiple commits rapidly can trigger overlapping CI runs that waste resources and potentially deploy conflicting artifacts.

**Fix:**
```yaml
concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true
```

### 6.7 NEW: Stoked CLI — No CI Build or Release Pipeline

**Directory:** `packages-internal/stoked-cli/`

The Rust CLI has pre-compiled binaries in `target/release/` but no CI workflow to build, test, or release them. Cross-platform binaries (Linux, macOS-arm64) are not automated.

**Fix:** Add a GitHub Actions workflow:
```yaml
- uses: actions-rs/cargo@v1
  with:
    command: test
- uses: actions-rs/cargo@v1
  with:
    command: build
    args: --release
```

Consider using `cross` for cross-compilation or GitHub's matrix strategy for multi-platform builds.

---

## 7. Workspace Package Assessment

### 7.1 `apps/code-ext` (VSCode Extension) — **Does Not Exist** [critical]

The `apps/code-ext` directory is not present in the repository. References to a VSCode extension appear in project PRDs and documentation (`docs/data/stokd-cloud/docs/vscode-extension/`), indicating this is planned but not yet scaffolded.

**Recommendations for creation:**
- Use `@vscode/vsce` for packaging and `yo code` for scaffolding
- Place WebSocket client code in a shared package if the MCP server will also use it
- Implement `ExtensionContext.secrets` for credential storage — never use `vscode.workspace.getConfiguration()` for tokens
- Add `activationEvents` scoping to minimize extension load time
- Include E2E tests using `@vscode/test-electron`
- Add a `webpack.config.js` for bundling (VSCode extensions must be single-file for marketplace)

### 7.2 `apps/menu-bar` (Menu Bar App) — **Does Not Exist** [low]

No directory or references found. This is a scaffold-level item.

**Recommendations for creation:**
- Consider Electron with `menubar` npm package, or Tauri for lighter footprint
- Share API client code with `stoked-mcp` via a common `@stoked-ui/api-client` package
- If macOS-only, consider Swift + `NSStatusItem` instead of Electron for native feel

### 7.3 `apps/osx-desktop-widget` (macOS Widget) — **Does Not Exist** [medium]

No `Package.swift`, `.xcodeproj`, or Swift source files found in the repository.

**Recommendations for creation:**
- Use WidgetKit + SwiftUI (requires Xcode project, not buildable via pnpm/turbo)
- Create as a standalone Xcode project under `apps/osx-desktop-widget/`
- Add a `Makefile` or shell script for CI integration (`xcodebuild -scheme Widget -sdk macosx`)
- Communicate with the NestJS API via `URLSession` — share API schemas via OpenAPI codegen
- Widget timeline providers should cache aggressively (WidgetKit limits refresh frequency)

### 7.4 `apps/slack-app` (Slack App) — **Does Not Exist** [medium]

No directory or Slack-related configuration found. The monorepo does have Slack Bolt (`@slack/bolt`) as a root dependency.

**Recommendations for creation:**
- Use Bolt.js (`@slack/bolt`) for event handling (dependency already present)
- Share authentication and API client code with `stoked-mcp`
- Implement proper Slack signature verification (`x-slack-signature`) for webhook security
- Consider Socket Mode for development, HTTP mode for production
- Add to the existing SST infrastructure as a Lambda function

### 7.5 `packages/api` (NestJS API) — **Maps to `packages/sui-media-api`** [critical]

This package exists at `packages/sui-media-api/` (12,648+ LOC). Fully analyzed above.

**Top priorities:**
1. Migrate AuthService from in-memory to MongoDB (section 1.7)
2. Migrate MediaService from in-memory to MongoDB (section 2.10)
3. Add rate limiting (section 1.8)
4. Enable TypeScript strict mode (section 2.1)
5. Implement the missing `ApiKeyGuard` (section 2.11)
6. Add database indexes (section 5.7)

### 7.6 `packages/mcp-server` (MCP Server) — **Maps to `packages-internal/stoked-mcp`** [critical]

This package exists at `packages-internal/stoked-mcp/` (409 LOC main, 237 LOC tests). Fully analyzed above.

**Top priorities:**
1. Add request timeout to `apiRequest()` (section 3.8)
2. Add pagination max limits (section 5.1)
3. Add tool invocation tests (section 4.4)
4. Fix unsafe type coercion (section 2.8)
5. Modularize tool registration as tools grow (section 3.1)

---

## Summary — Priority Matrix

| Priority | Issue | Section |
|----------|-------|---------|
| **P0 — Immediate** | Rotate compromised `.env` credentials | 1.1 |
| **P0 — Immediate** | Add `await` to MongoDB operations in `api/subscribe.ts` | 2.2 |
| **P0 — Immediate** | Fix MongoDB client type mismatch in `api/lib/mongodb.ts` | 2.3 |
| **P1 — This Sprint** | Fix origin validation bypass | 1.4 |
| **P1 — This Sprint** | Migrate AuthService to MongoDB persistence | 1.7 |
| **P1 — This Sprint** | Add rate limiting to auth endpoints | 1.8 |
| **P1 — This Sprint** | Remove hardcoded AWS account ID | 1.2 |
| **P1 — This Sprint** | Restrict SNS IAM permissions | 1.3 |
| **P1 — This Sprint** | Stop logging sensitive event data | 2.5 |
| **P1 — This Sprint** | Fix API key store missing `await` | 1.9 |
| **P1 — This Sprint** | Add tests for Lambda API handlers | 4.1 |
| **P1 — This Sprint** | Add audit logging for impersonation | 1.10 |
| **P2 — Next Sprint** | Enable TypeScript strict mode incrementally | 2.1 |
| **P2 — Next Sprint** | Modularize MCP server tools | 3.1 |
| **P2 — Next Sprint** | Add CORS headers to Lambda functions | 3.4 |
| **P2 — Next Sprint** | Add dependency audit to CI | 6.1 |
| **P2 — Next Sprint** | Create root `.env.example` | 4.2 |
| **P2 — Next Sprint** | Migrate MediaService to MongoDB | 2.10 |
| **P2 — Next Sprint** | Add MCP request timeout | 3.8 |
| **P2 — Next Sprint** | Add pre-commit secret scanning | 6.2 |
| **P2 — Next Sprint** | Add MCP tool invocation tests | 4.4 |
| **P2 — Next Sprint** | Unify API key infrastructure | 3.9 |
| **P2 — Next Sprint** | Add tests for apiKeyStore and DnD treeOps | 4.1 |
| **P2 — Next Sprint** | Fix CLI auth token exposure in URL | 1.11 |
| **P3 — Backlog** | Scaffold `apps/code-ext` VSCode extension | 7.1 |
| **P3 — Backlog** | Scaffold `apps/slack-app` | 7.4 |
| **P3 — Backlog** | Add response caching to MCP server | 5.3 |
| **P3 — Backlog** | Add pagination max limits | 5.1 |
| **P3 — Backlog** | Standardize error response formats | 2.4 |
| **P3 — Backlog** | Add request ID tracing | 3.5 |
| **P3 — Backlog** | Lambda cold start optimization | 5.5 |
| **P3 — Backlog** | Add database indexes | 5.7 |
| **P3 — Backlog** | Share API types between CLI and MCP server | 3.10 |
| **P3 — Backlog** | Add DnD error boundary | 2.12 |
| **P3 — Backlog** | Optimize DnD tree traversals | 5.8 |
| **P3 — Backlog** | Scaffold `apps/osx-desktop-widget` | 7.3 |
| **P3 — Backlog** | Add CI pipeline for stoked-cli | 6.7 |
| **P4 — Future** | Scaffold `apps/menu-bar` | 7.2 |
| **P4 — Future** | Replace console suppression with structured logging | 5.6 |
| **P4 — Future** | Pin Docker base image digests | 6.5 |
| **P4 — Future** | Add CI concurrency controls | 6.6 |
