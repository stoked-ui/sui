# SC_TEST: @stoked-ui/media-api Testing Strategy

**Package:** `@stoked-ui/media-api`
**Priority:** Medium
**Stack:** NestJS 10.3 / TypeScript 5.4 / Jest 29 / ts-jest 29 / Mongoose 8 / AWS SDK v3 / Sharp / fluent-ffmpeg / Stripe / Passport-JWT
**Generated:** 2026-05-21 | **Refreshed:** 2026-06-22 (re-verified against source and a live `pnpm jest` run — **8 suites / 103 tests green**; inventory, config drift, and gap list re-confirmed unchanged)

This document describes the testing strategy for the `packages/sui-media-api` NestJS application — a media-component API providing CRUD, multipart uploads to S3, metadata extraction, and thumbnail/sprite generation. Per the package guardrails (`AGENTS.md`, `CLAUDE.md`, `.stokd/meta/SC_CONTEXT.md`, and `AX-REPO-MEDIA-API-BOUNDARY`), this API is reserved for media-component endpoints; non-media business routes belong in `docs/pages/api/*`.

---

## 1. Current Test Inventory

> **Live baseline (verified 2026-06-22):** `pnpm --filter @stoked-ui/media-api test` → **Test Suites: 8 passed, Tests: 103 passed**, ~14 s. (One benign warning: "A worker process has failed to exit gracefully" — a teardown leak, most likely the S3/JWT timers or an un-closed Nest test app; run with `--detectOpenHandles` when hardening, but it does not fail the suite.) Note this count is the **unit** config only; `test/uploads-e2e.spec.ts` is not discovered by either config's default invocation — see §2.

### Unit Tests (8 files in `src/`)

| File | Source under test (LOC) | Depth |
|------|-----------|-------|
| `src/s3/s3.service.spec.ts` (685 LOC) | `s3.service.ts` (586 LOC) | **Excellent** — full S3 + presigned-URL coverage with mocked AWS SDK |
| `src/uploads/uploads.service.spec.ts` (762 LOC) | `uploads.service.ts` (704 LOC) | **Excellent** — initiate/status/parts/complete/abort/sync flows |
| `src/uploads/uploads.controller.spec.ts` (338 LOC) | `uploads.controller.ts` (352 LOC) | **Good** — controller delegation |
| `src/auth/auth.service.spec.ts` (160 LOC) | `auth.service.ts` (178 LOC) | **Good** — register/login/validateToken, domain auto-role |
| `src/media/thumbnail-generation.service.spec.ts` (96 LOC) | `thumbnail-generation.service.ts` (488 LOC) | **Moderate** — VTT + S3 URL building; FFmpeg-bound paths skipped |
| `src/media/metadata/metadata-extraction.service.spec.ts` (80 LOC) | `metadata-extraction.service.ts` (238 LOC) | **Moderate** — tool validation + MIME routing |
| `src/media/media.service.spec.ts` (50 LOC) | `media.service.ts` (472 LOC) | **Shallow** — only `should be defined` + `getInfo()` (2 tests) |
| `src/health/health.controller.spec.ts` (26 LOC) | `health.controller.ts` (33 LOC) | Complete for scope |

### E2E Tests (1 file)

| File | Description |
|------|-------------|
| `test/uploads-e2e.spec.ts` (346 LOC) | Multipart upload happy paths + resume/abort/duplicate/error cases |

### Configuration

- **Unit Jest config** inline in `package.json` → `rootDir: src`, `testRegex: .*\.spec\.ts$`, `testEnvironment: node`, ts-jest with `diagnostics: false` (type errors do **not** fail the suite — type-checking is the separate `pnpm typescript` gate).
- **E2E Jest config** in `test/jest-e2e.json` → `rootDir: .`, `testRegex: .e2e-spec.ts$`. **Known drift:** the only E2E file is `test/uploads-e2e.spec.ts` (single dash, `.spec.ts`), which the `.e2e-spec.ts$` regex does **not** match — so `pnpm test:e2e` currently discovers **zero** tests, and `test/uploads-e2e.spec.ts` instead runs under the unit config (its `rootDir: src` does not include `test/`, so in practice the e2e suite only runs when invoked directly). See §2 "Fix to existing config".
- **Scripts:** `pnpm test`, `pnpm test:cov`, `pnpm test:ci` (`--ci --coverage --maxWorkers=2`), `pnpm test:e2e`, `pnpm test:watch`, `pnpm test:debug`.

### Gap Summary — files with **zero tests**

**Controllers / HTTP surface:**
- `src/media/media.controller.ts` (596 LOC) — REST CRUD, query/search, soft+hard delete, restore, metadata extract, the two placeholder routes (`generate-thumbnail`/`generate-sprites`)
- `src/auth/auth.controller.ts` (83 LOC) — register/login/me endpoints

**Guards / strategies:**
- `src/media/guards/auth.guard.ts` (79 LOC) — JWT Bearer + `x-user-id`/`?userId` dev fallback
- `src/auth/guards/jwt-auth.guard.ts` (15 LOC)
- `src/auth/guards/roles.guard.ts` (57 LOC) — role hierarchy (`reader < author < editor < admin`)
- `src/auth/strategies/jwt.strategy.ts` (59 LOC)

**Media support services:**
- `src/media/metadata/video-processing.service.ts` (356 LOC) — FFprobe parsing, codec normalization, framerate fractions

**Performance layer:**
- `src/performance/caching.middleware.ts` (262 LOC)
- `src/performance/metadata-extraction.optimization.ts` (380 LOC)

**Infrastructure / bootstrap (low test ROI but listed for completeness):**
- `src/lambda.bootstrap.ts`, `src/lambda.ts`, `lambda.entry.ts`, `src/main.ts`, `src/app.ts`, `src/openapi.module.ts`, `src/swagger.config.ts`

**Empty leftover directories** (no implementation; **do not** add tests — they should be deleted): `src/blog/` (only an empty `dto/` subfolder remains), `src/clients/`, `src/users/`. As of `21d04d615f refactor: remove business APIs from media stack` these are empty and git-untracked (`git ls-files` returns nothing for them) and nothing in them is imported by `AppModule`. They must not grow endpoints (media-API boundary rule).

**DTO validation:** none of the `class-validator`-decorated DTOs (`media/dto/*`, `uploads/dto/*`) are tested.

**Shallow test needing rewrite:**
- `src/media/media.service.spec.ts` — 472 LOC of CRUD/filter/search/pagination/soft-hard-delete/restore/extract logic untested (current spec asserts only `getInfo()` and `should be defined`).

---

## 2. Framework & Tooling

### Already configured (keep)

- **Jest 29.7** + **ts-jest 29.1** — unit runner
- **@nestjs/testing 10.3** — `Test.createTestingModule({ providers: [...] })`
- **supertest 6.3** — HTTP E2E
- Coverage via `pnpm test:cov` → output to `../coverage` (sibling of `src/`, per `coverageDirectory`)

> **Note on Node version:** mocha-based suites elsewhere in the monorepo require Node ≤ 20 (project memory: Node 26 breaks them). This package uses **Jest**, not the umbrella mocha runner, and its inline config is self-contained — but run it on the same Node 20.x the repo standardizes on to avoid native-binary (`sharp`) surprises.

### Recommended additions (only when needed)

| Tool | Purpose | Install |
|------|---------|---------|
| `mongodb-memory-server` | Bootstrapping `AppModule` for E2E without a real Mongo (the `DatabaseModule` initializes Mongoose at module init via `forRootAsync`). The repo CI for this package already runs Mongo via Docker for integration — prefer that where available, fall back to memory-server in pure-unit CI. | `pnpm add -D mongodb-memory-server` |
| `@golevelup/ts-jest` | `createMock<T>()` to avoid hand-rolling provider mocks for large interfaces | `pnpm add -D @golevelup/ts-jest` |

No other additions are required — the established stack is sufficient.

### Fix to existing config

The E2E config (`test/jest-e2e.json`) matches `*.e2e-spec.ts`, but the only E2E file is `test/uploads-e2e.spec.ts` (single dash). **Pick one** and apply consistently:
- Rename `test/uploads-e2e.spec.ts` → `test/uploads.e2e-spec.ts`, **or**
- Change the config's `testRegex` to `.*-e2e\\.spec\\.ts$` (and `.*\\.e2e-spec\\.ts$`).

New E2E files should follow whichever convention is chosen. Until fixed, `pnpm test:e2e` is silently a no-op (passes with 0 tests) — a false-green that masks E2E regressions.

---

## 3. Test File Organization & Naming

```
src/<module>/<name>.spec.ts                  # Unit — co-located, established
src/<module>/<sub>/<name>.spec.ts            # Unit — sub-services
test/<feature>.e2e-spec.ts                   # E2E — separate dir (after config fix)
```

### Proposed new test files (priority-ordered)

```
# P0 — Security & data integrity
src/media/guards/auth.guard.spec.ts          # NEW
src/auth/guards/roles.guard.spec.ts          # NEW
src/media/media.service.spec.ts              # REWRITE (currently shallow)

# P1 — Functionality / reliability
src/media/media.controller.spec.ts           # NEW
src/auth/auth.controller.spec.ts             # NEW
src/auth/strategies/jwt.strategy.spec.ts     # NEW
src/auth/guards/jwt-auth.guard.spec.ts       # NEW
src/media/metadata/video-processing.service.spec.ts  # NEW
test/media.e2e-spec.ts                       # NEW

# P2 — Completeness
src/performance/caching.middleware.spec.ts            # NEW
src/performance/metadata-extraction.optimization.spec.ts  # NEW
src/media/dto/*.spec.ts (DTO validation)              # NEW
test/auth.e2e-spec.ts                                 # NEW
```

---

## 4. Mock / Stub Strategy

### External dependencies

| Dependency | Approach | Reference / pattern |
|-----------|---------|---------------------|
| **AWS S3 SDK (`@aws-sdk/client-s3`)** | Already mocked end-to-end in `s3.service.spec.ts` — reuse pattern for any new test that hits S3 | Mock `S3Client.send()`, return canned `Bucket`/`Key`/`ETag` |
| **`@aws-sdk/s3-request-presigner`** | `jest.mock('@aws-sdk/s3-request-presigner', () => ({ getSignedUrl: jest.fn() }))` | Already used for presigned-URL tests |
| **Mongoose (when needed)** | Hand-rolled mock of model methods (`findOne`, `find`, `create`, `countDocuments`) returning `{ exec: jest.fn() }` for chainable queries; inject via `getModelToken('Name')`. For full-stack E2E prefer the package's Docker-Mongo or `mongodb-memory-server` over mocks (per repo test-strategy preference for real DBs). | Standard NestJS pattern — `getModelToken('Name')` |
| **fluent-ffmpeg / ffprobe** | Inject a mock `VideoProcessingService` / `MetadataExtractionService` at the NestJS DI level rather than mocking `child_process` (cleaner, established in `metadata-extraction.service.spec.ts`). For `video-processing.service.ts` parser tests, stub the ffprobe wrapper and feed canned ffprobe JSON. | `provide: VideoProcessingService, useValue: { extractVideoMetadata: jest.fn() }` |
| **Sharp** | `jest.mock('sharp', () => jest.fn(() => ({ resize: jest.fn().mockReturnThis(), jpeg: jest.fn().mockReturnThis(), png: jest.fn().mockReturnThis(), toBuffer: jest.fn().mockResolvedValue(Buffer.from('')) })))` | Apply in any test that touches image processing |
| **Stripe** | `jest.mock('stripe')` — `stripe` is a declared dependency but **not wired into `AppModule`**; no Stripe-using service has tests today. Defer until a Stripe flow is actually mounted here (license/billing flows live in `docs/pages/api/*`, not this package — see boundary rule). | n/a |
| **`@nestjs/jwt` JwtService** | Real `JwtService` is fine for unit tests — fast, exercises actual signing/verify logic, and is exactly what `AuthGuard`/`JwtStrategy` depend on. | `JwtModule.register({ secret: 'test-secret', signOptions: { expiresIn: '7d' } })` |
| **bcryptjs** | Use the real implementation; fast enough for unit tests. | n/a |
| **ConfigService** | `{ get: jest.fn((key, defaultValue) => defaultValue) }` for permissive defaults; override per-key when behavior matters (`JWT_SECRET`, `AUTH_AUTO_DOMAINS`, `AWS_REGION`, `MEDIA_BUCKET`). | Established in every existing spec |
| **`process.env.NODE_ENV`** | The dev/prod branch in `AuthGuard` keys off `process.env.NODE_ENV !== 'production'`. Set and restore it per-test (`const prev = process.env.NODE_ENV; … ; process.env.NODE_ENV = prev`). | Critical for the production-hardening regression tests |

### NestJS DI mock pattern (canonical)

```typescript
const module = await Test.createTestingModule({
  providers: [
    ServiceUnderTest,
    { provide: DependencyService, useValue: { method: jest.fn() } },
    { provide: ConfigService, useValue: { get: jest.fn((k, d) => d) } },
  ],
}).compile();
const service = module.get(ServiceUnderTest);
```

### Guard mock pattern

```typescript
const mockRequest: any = { headers: {}, query: {}, user: undefined };
const mockContext = {
  switchToHttp: () => ({ getRequest: () => mockRequest }),
  getHandler: () => jest.fn(),
  getClass: () => jest.fn(),
} as unknown as ExecutionContext;
```

### Controller test pattern

Inject the controller with a mocked service via `Test.createTestingModule`. Apply guards using `overrideGuard(AuthGuard).useValue({ canActivate: () => true })` so unit tests focus on routing/delegation without simulating auth. Guard behavior is covered separately in guard specs. The `@UserId()` param decorator (`src/media/decorators/current-user.decorator.ts`) reads `request.user.id`; in controller unit tests pass the user through the mocked request rather than re-implementing the decorator.

---

## 5. Coverage Targets

Medium priority — focus on critical paths over total line count.

| Metric | Target |
|--------|--------|
| Statement | 70% |
| Branch | 65% |
| Function | 75% |
| Line | 70% |

> The package's `TEST_DOCUMENTATION.md` aspirationally claims 80% thresholds, but **no `coverageThreshold` is configured in `package.json`**, so nothing is enforced today. If you want CI to gate on coverage, add a `coverageThreshold.global` block to the inline Jest config — otherwise treat the numbers below as guidance, not a gate.

### Per-module targets

| Module | Current (est.) | Target | Notes |
|--------|---------------|--------|-------|
| `s3/` | ~95% | 95% | Maintain |
| `uploads/` | ~90% | 90% | Maintain |
| `auth/` (services) | ~75% | 80% | Add controller + guard + strategy specs |
| `media/` service | ~10% | 75% | **Biggest gap** — rewrite spec |
| `media/` controller | 0% | 70% | New spec |
| `media/` guards | 0% | 90% | Security-critical |
| `media/metadata/` | ~50% | 70% | Add `video-processing.service` |
| `health/` | ~100% | 100% | Maintain |
| `performance/` | 0% | 60% | Caching + optimization helpers |

Run: `pnpm test:cov` (output: `<package>/coverage/`).

---

## 6. Critical Paths to Test

### P0 — Implement first (auth, ownership, core data flow)

#### 6.1 AuthGuard — `src/media/guards/auth.guard.ts`

Authentication bypass = full media-API compromise. **Security-critical distinction (verified in source):** the JWT branch is entered only when the header `startsWith('Bearer ')`. A `Bearer`-prefixed-but-**invalid** token throws `UnauthorizedException` from inside the `catch` — it does **not** fall through to the `x-user-id` dev fallback. Only the *absence* of a `Bearer ` prefix reaches the fallback. Both cases must be tested.

```
auth.guard.spec.ts
├── JWT Bearer
│   ├── valid token → request.user = { id: payload.sub, email, role, name }, returns true
│   ├── Bearer-prefixed + expired/invalid token → UnauthorizedException
│   │       (assert it does NOT consult x-user-id even in dev)
│   ├── dev message includes "Token verification failed: …"; prod message is "Invalid or expired token"
│   └── no `Bearer ` prefix → skips JWT block, proceeds to fallback path
├── x-user-id fallback (NODE_ENV !== 'production')
│   ├── `x-user-id` header → request.user = { id: <header> }, returns true
│   ├── `?userId` query param → request.user = { id: <query> }, returns true
│   └── header takes precedence over query param
├── Production hardening (NODE_ENV === 'production')
│   ├── `x-user-id` header is ignored → UnauthorizedException('Authentication required')
│   └── `?userId` query is ignored → UnauthorizedException('Authentication required')
└── No credentials at all → UnauthorizedException('Authentication required')
```

**Est. 9 tests**

#### 6.2 RolesGuard — `src/auth/guards/roles.guard.ts`

`ROLE_HIERARCHY = ['reader', 'author', 'editor', 'admin']`; access granted when `userLevel >= getRoleLevel(required)` for at least one required role (`getAllAndOverride`, handler over class).

```
roles.guard.spec.ts
├── No @Roles() decorator (Reflector returns undefined/[]) → returns true
├── Hierarchy `reader < author < editor < admin`
│   ├── admin allowed for required=['author']
│   ├── editor allowed for required=['author']
│   ├── author allowed for required=['author']
│   ├── reader denied for required=['author']
│   └── reader allowed for required=['reader']
├── request.user missing → returns false
└── request.user.role missing → returns false
```

**Regression test (high-value quirk):** `UserRole = 'admin' | 'client' | 'agent' | 'reader' | 'author' | 'editor'`, but `client` and `agent` are **not** in `ROLE_HIERARCHY`, so `getRoleLevel` returns `-1`. Since `-1 >= getRoleLevel('reader') (0)` is false, **`client` and `agent` are denied every role-gated route**. Because `AuthService.determineRole` assigns `'client'` to every non-trusted-domain registration (see 6.5), this means a normal registered user cannot pass any `@Roles(...)` gate. Assert this explicitly so the behavior is intentional, not an accident.

**Est. 9 tests**

#### 6.3 MediaService — `src/media/media.service.ts` (REWRITE)

The current spec only checks `getInfo()` and `should be defined`. Rewrite to cover the 472-LOC service (in-memory `mediaStore: Map<string, …>`).

```
media.service.spec.ts (rewrite)
├── create(dto)
│   ├── generates id (internal counter), persists to mediaStore
│   ├── sets createdAt/updatedAt
│   └── returns MediaResponseDto shape
├── findAll(query)
│   ├── default pagination (limit/offset defaults)
│   ├── filters: mediaType, mime, uploadedBy, publicity, rating, mediaClass, uploadSessionId
│   ├── filters: dateFrom, dateTo (inclusive bounds)
│   ├── filters: tags (comma-separated, case-insensitive)
│   ├── search: matches across title, description, file/filename, tags
│   ├── sorting: ascending and descending by sortBy field
│   ├── excludes deleted=true unless includeDeleted=true
│   └── returns total count + limit + offset alongside items
├── findOne(id)
│   ├── returns media + increments view count
│   ├── unknown id → NotFoundException
│   └── soft-deleted (deleted=true) → NotFoundException
├── update(id, dto, userId)
│   ├── updates allowed fields, refreshes updatedAt
│   ├── unknown id → NotFoundException
│   └── userId !== owner → ForbiddenException
├── remove(id, userId, softDelete)
│   ├── soft delete: sets deleted=true + deletedAt; record stays in store; S3 NOT touched
│   ├── hard delete: calls S3Service to remove file + thumbnails (keys extracted from URLs)
│   ├── hard delete: removes from mediaStore
│   ├── unknown id → NotFoundException
│   └── non-owner → ForbiddenException
├── restore(id, userId)
│   ├── clears deleted=true / deletedAt
│   ├── no-op when not deleted
│   ├── unknown id → NotFoundException
│   └── non-owner → ForbiddenException
├── extractMetadata(id)
│   ├── delegates to MetadataExtractionService with file URL + MIME
│   ├── merges video/audio/image metadata onto entity
│   ├── records failures in the failure-tracking field
│   └── increments attemptCount on repeated failure (does NOT duplicate entries)
└── getInfo()
    ├── returns { name: '@stoked-ui/media-api', version: '0.1.0',
    │            description: 'NestJS API for Stoked UI Media Components', mediaCount }
    └── mediaCount reflects mediaStore.size after create/remove
```

> **Drift flag (fix while rewriting):** `getInfo()` hard-codes `version: '0.1.0'` while `package.json` is `1.0.0`. The existing test asserts `'0.1.0'`. Either source the version from `package.json` and update the assertion, or document that `0.1.0` is intentional. Don't lock a stale literal into the rewritten spec without deciding.

**Est. 22 tests**

### P1 — Implement second (HTTP surface, integration)

#### 6.4 MediaController — `src/media/media.controller.ts`

```
media.controller.spec.ts
├── GET /media/api/info → delegates to service.getInfo() (no AuthGuard — public route)
├── GET /media → delegates to findAll, forwards query params, AuthGuard applied
├── GET /media/:id → delegates to findOne (which increments views)
├── POST /media → delegates to create, picks userId from request.user (via @UserId)
├── PATCH /media/:id → delegates to update with userId from token
├── DELETE /media/:id → soft delete by default
├── DELETE /media/:id?hardDelete=true → hard delete (softDelete=false)
├── POST /media/:id/restore → delegates to restore
├── POST /media/:id/extract-metadata → delegates to extractMetadata
└── POST /media/:id/generate-thumbnail & /generate-sprites → currently throw
        BadRequestException('… requires database integration (Work Item 3.1)')
        — assert the placeholder behavior so activating it later is a deliberate change
```

Use `overrideGuard(AuthGuard).useValue({ canActivate: () => true })` and supply `request.user` for the `@UserId()` decorator.

**Est. 10 tests**

#### 6.5 AuthController — `src/auth/auth.controller.ts`

```
auth.controller.spec.ts
├── POST /auth/register → delegates to service.register(dto)
├── POST /auth/login → delegates to service.login(dto)
├── GET /auth/me → returns request.user (JWT-guarded)
├── duplicate email → 409 (ConflictException from service)
└── invalid credentials → 401 (UnauthorizedException from service)
```

**Auto-role facts (verified):** `AuthService.determineRole(email)` returns `'admin'` for emails ending in a trusted domain (code default `['stokd.cloud','sui.stokd.cloud','consulting.stokd.cloud','brianstoker.com']`, overridable via `AUTH_AUTO_DOMAINS`) and `'client'` for everyone else. Test both branches — trusted domain → `role: 'admin'`, untrusted → `role: 'client'`. (Note `.env.example` ships a *different* sample `AUTH_AUTO_DOMAINS`; the code default only applies when the env var is unset.)

**Est. 5 tests**

#### 6.6 JwtStrategy — `src/auth/strategies/jwt.strategy.ts`

```
jwt.strategy.spec.ts
├── validate(payload) returns { id: payload.sub, email, role, name }
├── uses JWT_SECRET from ConfigService when present
└── falls back to the dev default ('dev-secret-change-me') when JWT_SECRET unset
        (verify the exact fallback string — the SST→ConfigService→env→default order is a silent contract)
```

**Est. 3 tests**

#### 6.7 JwtAuthGuard — `src/auth/guards/jwt-auth.guard.ts`

Thin wrapper around Passport's `AuthGuard('jwt')`. Test only that it extends correctly and rejects requests without a valid `request.user` populated by the strategy.

**Est. 2 tests**

#### 6.8 VideoProcessingService — `src/media/metadata/video-processing.service.ts`

The high-value paths are pure parsing helpers — testable without spawning ffprobe.

```
video-processing.service.spec.ts
├── Codec normalization (h264/avc, h265/hevc, vp8/vp9, av1) — verify mapping table
├── Framerate fraction parsing
│   ├── "30000/1001" → 29.97 (rounded)
│   ├── "30/1" → 30
│   └── "0/0" or invalid → 0 / fallback
├── Container detection from format_name
├── Pixel format / color space passthrough
└── Audio metadata: channel layout, sample rate, bitrate
```

Mock the ffprobe wrapper at the lowest level and feed canned ffprobe JSON. **Do not** require a real ffprobe binary in tests.

**Est. 8 tests**

#### 6.9 E2E — Media CRUD (`test/media.e2e-spec.ts`)

```
media.e2e-spec.ts
├── GET /media/api/info → 200, no auth
├── POST /media (with x-user-id in dev mode) → 201
├── GET /media → 200 with default pagination
├── GET /media?mediaType=video&search=sunset → filters & search
├── GET /media/:id → returns media; second call shows incremented views
├── PATCH /media/:id → 200 for owner; 403 for non-owner
├── DELETE /media/:id → soft delete; still findable with includeDeleted=true
├── POST /media/:id/restore → 200
├── DELETE /media/:id?hardDelete=true → S3 cleanup invoked (mock S3Service)
└── Unauthenticated GET /media (NODE_ENV=production) → 401
```

Bootstrap via `Test.createTestingModule({ imports: [AppModule] })`. Because `DatabaseModule` initializes Mongoose at module init, either override it with a no-op test module or back it with `mongodb-memory-server` / the package's Docker-Mongo. `MediaService` still uses the in-memory `Map`, so media CRUD itself needs no DB — the DB dependency is only `DatabaseModule` bootstrapping.

**Est. 10 tests**

### P2 — Implement third (completeness)

#### 6.10 Caching middleware — `src/performance/caching.middleware.ts`

Not wired into `AppModule` today (opt-in). Test the public surface only.

```
caching.middleware.spec.ts
├── GET request, cache miss → calls next(), captures response, stores entry
├── GET request, cache hit → short-circuits with cached body + headers
├── Non-GET request → bypasses cache, calls next()
├── Cache key derivation matches expected pattern (path + query + auth scope)
├── TTL expiration → treated as miss
└── Cache invalidation on configured triggers
```

**Est. 6 tests**

#### 6.11 Metadata-extraction optimization — `src/performance/metadata-extraction.optimization.ts`

Likely memoization / batching / worker-pool helpers; also not wired into `AppModule`. Cover the public surface only.

**Est. ~6 tests**

#### 6.12 DTO validation tests

Use `class-validator` directly:

```typescript
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

const dto = plainToInstance(CreateMediaDto, { /* fixture */ });
const errors = await validate(dto);
expect(errors).toHaveLength(0); // or assert specific failures
```

```
├── CreateMediaDto — required fields, enum validation (mediaType, publicity, rating)
├── UpdateMediaDto — all fields optional, enums still validated
├── QueryMediaDto — numeric coercion (limit/offset), date strings, comma-list parsing
├── GenerateThumbnailDto / GenerateSpriteSheetDto — positive integers, ratio bounds
├── ExtractMetadataDto — required URL + MIME
└── InitiateUploadDto — filename + contentType present; contentType matches
        /^(video|image)\/[a-z0-9.+-]+$/ (reject audio/*, reject arbitrary types);
        totalSize > 0; chunk-size bounds
```

**Est. ~12 tests**

#### 6.13 E2E — Auth (`test/auth.e2e-spec.ts`)

```
auth.e2e-spec.ts
├── POST /auth/register → 201, returns access_token + user
├── POST /auth/register duplicate email → 409
├── POST /auth/register from trusted domain → role='admin'
├── POST /auth/register from untrusted domain → role='client'
├── POST /auth/login valid → 200 with token
├── POST /auth/login wrong password → 401
├── POST /auth/login unknown email → 401
└── GET /auth/me with issued token → 200 returns user payload
```

**Est. 8 tests**

---

## 7. Test Execution

```bash
# Unit
pnpm --filter @stoked-ui/media-api test                                  # All unit specs
pnpm --filter @stoked-ui/media-api test -- --testPathPattern=media       # Single area
pnpm --filter @stoked-ui/media-api test:watch                            # Watch mode
pnpm --filter @stoked-ui/media-api test:cov                              # Coverage report

# E2E (only meaningful AFTER fixing the testRegex / filename mismatch — §2)
pnpm --filter @stoked-ui/media-api test:e2e

# CI
pnpm --filter @stoked-ui/media-api test:ci                               # --ci --maxWorkers=2 --coverage

# Type gate (separate from Jest; ts-jest has diagnostics:false)
pnpm --filter @stoked-ui/media-api typescript
```

### CI notes

- Unit tests must remain hermetic — no real S3, no real Mongo, no ffprobe/ffmpeg binary, no `sharp` native work.
- E2E bootstraps `AppModule`, which pulls in `DatabaseModule` (Mongoose). For CI without Mongo, use `mongodb-memory-server` and override the Mongo URI, or build a `TestAppModule` that swaps `DatabaseModule` for no-op providers. Where the package's Docker-Mongo is available, prefer a real DB (repo test-strategy preference).
- `MediaService` and `AuthService` use in-memory `Map` storage — exercise full CRUD without a database in unit tests.
- `UploadsService`/`S3Service` use S3 — always mock `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner`.
- `ts-jest` runs with `diagnostics: false`, so **type errors will not fail the Jest run**. Keep `pnpm typescript` as a separate required gate; do not rely on the test run to catch type drift (e.g. DTO contract changes shared with `@stoked-ui/media`).

---

## 8. Implementation Order

| Phase | File | Est. tests | Priority |
|------|------|------------|----------|
| 1 | `src/media/guards/auth.guard.spec.ts` | 9 | P0 |
| 2 | `src/auth/guards/roles.guard.spec.ts` | 9 | P0 |
| 3 | `src/media/media.service.spec.ts` (rewrite) | 22 | P0 |
| 4 | `src/media/media.controller.spec.ts` | 10 | P1 |
| 5 | `src/auth/auth.controller.spec.ts` | 5 | P1 |
| 6 | `src/auth/strategies/jwt.strategy.spec.ts` | 3 | P1 |
| 7 | `src/auth/guards/jwt-auth.guard.spec.ts` | 2 | P1 |
| 8 | `src/media/metadata/video-processing.service.spec.ts` | 8 | P1 |
| 9 | `test/media.e2e-spec.ts` | 10 | P1 |
| 10 | Fix `test/jest-e2e.json` regex / rename e2e file | — | P1 (config) |
| 11 | `src/performance/caching.middleware.spec.ts` | 6 | P2 |
| 12 | `src/performance/metadata-extraction.optimization.spec.ts` | ~6 | P2 |
| 13 | DTO validation specs | ~12 | P2 |
| 14 | `test/auth.e2e-spec.ts` | 8 | P2 |

**Estimated total new/rewritten tests: ~110**, across 13 spec files + 1 config fix.

> **TDD reminder (AX §5):** every one of these is a behavioral change to the test surface — write the test, watch it go **red** against current behavior, then (for genuine bugs surfaced, e.g. the e2e false-green or any production-hardening gap) fix to **green**. For specs that document existing correct behavior, the red→green cycle is satisfied by writing the test against an intentionally-wrong expectation first to prove the assertion actually exercises the path.

---

## 9. Edge Cases & High-Risk Logic

Highest-ROI bugs cluster around these locations:

| Area | File | Why it's tricky |
|------|------|-----------------|
| Bearer-invalid vs no-prefix branch | `src/media/guards/auth.guard.ts:37-58` | A `Bearer `-prefixed invalid token **throws** and never reaches the dev fallback; only missing-prefix falls through. Must be regression-tested so the dev fallback can never be reached with a forged Bearer token. |
| `x-user-id` / `?userId` dev fallback | `src/media/guards/auth.guard.ts:62-75` | Gated on `process.env.NODE_ENV !== 'production'` — production hardening must be regression-tested (set/restore `NODE_ENV`). |
| Role hierarchy lookup | `src/auth/guards/roles.guard.ts:12-14,52-55` | `indexOf()` returns `-1` for unlisted roles. `client`/`agent` exist in `UserRole` but not in `ROLE_HIERARCHY`, so they are denied **every** role-gated route — and `client` is the default registration role. Silent allow/deny risk. |
| Auto-role domain matching | `src/auth/auth.service.ts:48-74` | Trusted domain → `'admin'`, otherwise `'client'`. Comma-split env override (`AUTH_AUTO_DOMAINS`) + lowercasing; subdomain/suffix-matching nuances. `.env.example` differs from the code default. |
| JWT secret fallback | `src/auth/strategies/jwt.strategy.ts`, `src/media/guards/auth.guard.ts`, `src/auth/auth.module.ts` | Default `'dev-secret-change-me'` in dev — must never apply in production. Resolution order SST `Resource` → `import('sst')` → `JWT_SECRET` env → default. |
| Media query filter chain | `src/media/media.service.ts` (`findAll`) | Cumulative filters (type, mime, owner, publicity, rating, tags, date range, search) — easy to short-circuit incorrectly. |
| Soft vs hard delete | `src/media/media.service.ts` (`remove`) | Hard delete must call `S3Service` with keys extracted from thumbnail/paidThumbnail URLs; soft delete must NOT touch S3. |
| Metadata failure tracking | `src/media/media.service.ts` (`extractMetadata`) | Increment `attemptCount` on an existing failure entry vs creating a new entry — duplication-bug risk. |
| ETag quote handling | `src/uploads/uploads.service.ts` | S3 returns ETags wrapped in quotes; code strips them — covered today, keep covered. |
| Multipart resume / sync | `src/uploads/uploads.service.ts` | Reconciles in-memory state with S3 `ListParts`; expired-upload detection (`SESSION_EXPIRATION_DAYS = 7`). |
| Last-part size | `src/uploads/uploads.service.ts` | Final part smaller than `DEFAULT_CHUNK_SIZE` (10 MiB) — common off-by-one source. |
| S3 URL parsing | `src/s3/s3.service.ts` | CloudFront vs virtual-hosted vs path-style URL formats. |
| Framerate fraction parsing | `src/media/metadata/video-processing.service.ts` | `"30000/1001"` → 29.97; degenerate `"0/0"`. |
| Codec normalization | `src/media/metadata/video-processing.service.ts` | h264/avc, h265/hevc, vp8/vp9, av1 aliases. |
| VTT thumbnail mapping | `src/media/thumbnail-generation.service.ts` | Frame index → row/col → x,y — already tested, keep tested. |
| Sprite-interval auto-calc | `src/media/thumbnail-generation.service.ts` | Different intervals per duration bracket. |
| Placeholder routes | `src/media/media.controller.ts` (`generate-thumbnail`/`generate-sprites`) | Currently throw `BadRequestException('… Work Item 3.1')`. Pin the placeholder so its activation is a deliberate, tested change. |
| Silent E2E no-op | `test/jest-e2e.json` testRegex vs `test/uploads-e2e.spec.ts` | `pnpm test:e2e` discovers 0 tests → false-green. Fix before relying on E2E in CI. |

---

## 10. Boundary Reminder

Per `AGENTS.md`, `CLAUDE.md`, `.stokd/meta/SC_CONTEXT.md`, and `AX-REPO-MEDIA-API-BOUNDARY`: `sui-media-api` is for **media-component endpoints only**. New non-media business routes (products, clients, licenses, invoices, users beyond media-auth, Stripe/billing) must be implemented in `docs/pages/api/*` and tested there — do not expand this package's test suite to cover them. The empty `src/blog/`, `src/clients/`, `src/users/` leftover directories must not grow endpoints or tests; they should be deleted.
