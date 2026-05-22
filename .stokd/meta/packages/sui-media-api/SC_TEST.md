# SC_TEST: @stoked-ui/media-api Testing Strategy

**Package:** `@stoked-ui/media-api`
**Priority:** Medium
**Stack:** NestJS 10.3 / TypeScript 5.4 / Jest 29 / ts-jest 29 / Mongoose 8 / AWS SDK v3 / Sharp / fluent-ffmpeg / Stripe / Passport-JWT
**Generated:** 2026-05-21

This document describes the testing strategy for the `packages/sui-media-api` NestJS application — a media-component API providing CRUD, multipart uploads to S3, metadata extraction, and thumbnail/sprite generation. Per the package guardrails (`AGENTS.md`, `CLAUDE.md`), this API is reserved for media-component endpoints; non-media business routes belong in `docs/pages/api/*`.

---

## 1. Current Test Inventory

### Unit Tests (8 files in `src/`)

| File | Source LOC | Depth |
|------|-----------|-------|
| `src/s3/s3.service.spec.ts` | covers `s3.service.ts` (586 LOC) | **Excellent** — full S3 + presigned URL coverage with mocked AWS SDK |
| `src/uploads/uploads.service.spec.ts` | covers `uploads.service.ts` (704 LOC) | **Excellent** — initiate/status/parts/complete/abort/sync flows |
| `src/uploads/uploads.controller.spec.ts` | covers `uploads.controller.ts` (352 LOC) | **Good** — controller delegation |
| `src/auth/auth.service.spec.ts` | covers `auth.service.ts` (178 LOC) | **Good** — register/login/validateToken, domain auto-role |
| `src/media/thumbnail-generation.service.spec.ts` | covers `thumbnail-generation.service.ts` (488 LOC) | **Moderate** — VTT + S3 URL building; FFmpeg-bound paths skipped |
| `src/media/metadata/metadata-extraction.service.spec.ts` | covers `metadata-extraction.service.ts` (238 LOC) | **Moderate** — tool validation + MIME routing |
| `src/media/media.service.spec.ts` | covers `media.service.ts` (472 LOC) | **Shallow** — only `isDefined` and `getInfo()` (~50 LOC of test) |
| `src/health/health.controller.spec.ts` | covers `health.controller.ts` (33 LOC) | Complete for scope |

### E2E Tests (1 file)

| File | Description |
|------|-------------|
| `test/uploads-e2e.spec.ts` | Multipart upload happy paths + resume/abort/duplicate/error cases |

### Configuration

- Unit Jest config inline in `package.json` → `rootDir: src`, `testRegex: .*\.spec\.ts$`, `testEnvironment: node`, ts-jest with `diagnostics: false`
- E2E Jest config in `test/jest-e2e.json` → `testRegex: .e2e-spec.ts$` (note: current `test/uploads-e2e.spec.ts` uses `.spec.ts` not `.e2e-spec.ts`, so it actually runs under the unit config)
- Scripts: `pnpm test`, `pnpm test:cov`, `pnpm test:ci`, `pnpm test:e2e`, `pnpm test:watch`, `pnpm test:debug`

### Gap Summary — files with **zero tests**

**Controllers / HTTP surface:**
- `src/media/media.controller.ts` (596 LOC) — REST CRUD, query/search, soft+hard delete, restore, metadata extract
- `src/auth/auth.controller.ts` (83 LOC) — register/login endpoints

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
- `src/lambda.bootstrap.ts`, `src/main.ts`, `src/app.ts`, `src/openapi.module.ts`, `src/swagger.config.ts`

**Empty / scaffold-only directories** (no implementation yet — defer tests):
- `src/blog/` — only an empty `dto/` folder
- `src/clients/`
- `src/users/`

**DTO validation:** none of the `class-validator`-decorated DTOs (`media/dto/*`, `uploads/dto/*`) are tested.

**Shallow tests needing rewrite:**
- `src/media/media.service.spec.ts` — 472 LOC of CRUD/filter/search/pagination/soft-hard delete/restore/extract logic untested

---

## 2. Framework & Tooling

### Already configured (keep)

- **Jest 29.7** + **ts-jest 29.1** — unit runner
- **@nestjs/testing 10.3** — `Test.createTestingModule({ providers: [...] })`
- **supertest 6.3** — HTTP E2E
- Coverage via `pnpm test:cov` → output to `../coverage` (sibling of `src/`)

### Recommended additions (only when needed)

| Tool | Purpose | Install |
|------|---------|---------|
| `mongodb-memory-server` | Bootstrapping `AppModule` for E2E without a real Mongo (the `DatabaseModule` initializes Mongoose) | `pnpm add -D mongodb-memory-server` |
| `@golevelup/ts-jest` | `createMock<T>()` to avoid hand-rolling provider mocks for large interfaces | `pnpm add -D @golevelup/ts-jest` |

No other additions are required — the established stack is sufficient.

### Fix to existing config

The E2E config (`test/jest-e2e.json`) expects `*.e2e-spec.ts`, but the current E2E lives at `test/uploads-e2e.spec.ts` (single dash). Either rename to `uploads.e2e-spec.ts` or change the config's `testRegex` to `.*-e2e\\.spec\\.ts$`. New E2E files should follow whichever convention is chosen.

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
| **`@aws-sdk/s3-request-presigner`** | `jest.mock('@aws-sdk/s3-request-presigner', () => ({ getSignedUrl: jest.fn() }))` | Already used for presigned URL tests |
| **Mongoose (when needed)** | Hand-rolled mock of model methods (`findOne`, `find`, `create`, `countDocuments`) returning `{ exec: jest.fn() }` for chainable queries | Standard NestJS pattern — `getModelToken('Name')` |
| **fluent-ffmpeg / FFprobe** | Inject mock `VideoProcessingService` at the NestJS DI level rather than mocking `child_process` (cleaner, established in `metadata-extraction.service.spec.ts`) | `provide: VideoProcessingService, useValue: { extract: jest.fn() }` |
| **Sharp** | `jest.mock('sharp', () => jest.fn(() => ({ resize: jest.fn().mockReturnThis(), jpeg: jest.fn().mockReturnThis(), toBuffer: jest.fn().mockResolvedValue(Buffer.from('')) })))` | Apply in any test that touches image processing |
| **Stripe** | `jest.mock('stripe')` — mock `checkout.sessions.create`, `webhooks.constructEvent`, `subscriptions.retrieve` (currently no Stripe-using service has tests; defer until used) | n/a |
| **`@nestjs/jwt` JwtService** | Real `JwtService` is fine for unit tests — fast and exercises actual signing logic | Use real `JwtModule.register({ secret: 'test' })` |
| **bcryptjs** | Use real implementation; fast enough for unit tests | n/a |
| **ConfigService** | `{ get: jest.fn((key, defaultValue) => defaultValue) }` for permissive defaults; override per-key when behavior matters (e.g., `JWT_SECRET`, `INVOICE_API_KEY`) | Established in every existing spec |

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

Inject the controller with a mocked service via `Test.createTestingModule`. Apply guards using `overrideGuard(...).useValue({ canActivate: () => true })` so unit tests focus on routing/delegation without simulating auth. Guard behavior is covered separately in guard specs.

---

## 5. Coverage Targets

Medium priority — focus on critical paths over total line count.

| Metric | Target |
|--------|--------|
| Statement | 70% |
| Branch | 65% |
| Function | 75% |
| Line | 70% |

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

Authentication bypass = full media-API compromise.

```
auth.guard.spec.ts
├── JWT Bearer
│   ├── valid token → request.user = { id: payload.sub, email, role, name }, returns true
│   ├── expired/invalid token → UnauthorizedException
│   └── malformed `Authorization` header (no `Bearer ` prefix) → falls through to fallback path
├── x-user-id fallback (NODE_ENV !== 'production')
│   ├── `x-user-id` header → request.user = { id: <header> }, returns true
│   ├── `?userId` query param → request.user = { id: <query> }, returns true
│   └── header takes precedence over query param
├── Production hardening (NODE_ENV === 'production')
│   ├── `x-user-id` header is ignored
│   └── `?userId` query is ignored
└── No credentials → UnauthorizedException('Authentication required')
```

**Est. 8 tests**

#### 6.2 RolesGuard — `src/auth/guards/roles.guard.ts`

```
roles.guard.spec.ts
├── No @Roles() decorator → returns true (Reflector returns undefined/[])
├── Hierarchy `reader < author < editor < admin`
│   ├── admin allowed for required=['author']
│   ├── editor allowed for required=['author']
│   ├── author allowed for required=['author']
│   ├── reader denied for required=['author']
│   └── reader allowed for required=['reader']
├── request.user missing → returns false
└── request.user.role missing → returns false
```

Note: The auth service defines additional roles (`client`, `agent`) that are **not** in `ROLE_HIERARCHY` — `getRoleLevel` returns `-1` for them. Add a regression test asserting these roles are denied access to any role-gated route.

**Est. 9 tests**

#### 6.3 MediaService — `src/media/media.service.ts` (REWRITE)

The current spec only checks `getInfo()` and `isDefined`. Rewrite to cover the 472-LOC service.

```
media.service.spec.ts (rewrite)
├── create(dto)
│   ├── generates id `media_N` (incrementing counter)
│   ├── persists to internal Map
│   ├── sets createdAt/updatedAt
│   └── returns MediaResponseDto
├── findAll(query)
│   ├── default pagination (limit 20, offset 0)
│   ├── filters: mediaType, mime, uploadedBy, publicity, rating, mediaClass, uploadSessionId
│   ├── filters: dateFrom, dateTo (inclusive bounds)
│   ├── filters: tags (comma-separated, case-insensitive)
│   ├── search: matches across title, description, file/filename, tags
│   ├── sorting: ascending and descending by sortBy field
│   ├── excludes deleted=true unless includeDeleted=true
│   └── returns total count, limit, offset alongside items
├── findOne(id)
│   ├── returns media + increments view count
│   ├── unknown id → NotFoundException
│   └── soft-deleted (deleted=true) → NotFoundException
├── update(id, dto, userId)
│   ├── updates allowed fields, refreshes updatedAt
│   ├── unknown id → NotFoundException
│   └── userId !== media.author → ForbiddenException
├── remove(id, userId, softDelete)
│   ├── soft delete: sets deleted=true, deletedAt; record stays in store
│   ├── hard delete: calls S3Service to remove file + thumbnails (using extracted keys)
│   ├── hard delete: removes from internal store
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
│   ├── records failures in metadataProcessingFailures
│   └── increments attemptCount on repeated failures (does not duplicate entries)
└── getInfo()
    ├── returns name/version/description
    └── reflects current store size
```

**Est. 22 tests**

### P1 — Implement second (HTTP surface, integration)

#### 6.4 MediaController — `src/media/media.controller.ts`

```
media.controller.spec.ts
├── GET /media/api/info → delegates to service.getInfo() (no AuthGuard)
├── GET /media → delegates to findAll, forwards query params, AuthGuard applied
├── GET /media/:id → delegates to findOne (which increments views)
├── POST /media → delegates to create, picks userId from request.user (via @UserId)
├── PATCH /media/:id → delegates to update with userId from token
├── DELETE /media/:id → soft delete by default
├── DELETE /media/:id?hard=true → softDelete=false
├── POST /media/:id/restore → delegates to restore
└── POST /media/:id/extract-metadata → delegates to extractMetadata
```

Use `overrideGuard(AuthGuard).useValue({ canActivate: () => true })` and inject a fake `request.user` via `useValue` on a custom param decorator helper (or test the param resolver separately).

**Est. 9 tests**

#### 6.5 AuthController — `src/auth/auth.controller.ts`

```
auth.controller.spec.ts
├── POST /auth/register → delegates to service.register(dto)
├── POST /auth/login → delegates to service.login(dto)
├── duplicate email → 409 (ConflictException from service)
├── invalid credentials → 401 (UnauthorizedException from service)
└── trusted-domain auto-role propagation surfaces in response
```

**Est. 5 tests**

#### 6.6 JwtStrategy — `src/auth/strategies/jwt.strategy.ts`

```
jwt.strategy.spec.ts
├── validate(payload) returns { id: payload.sub, email, role, name }
├── uses JWT_SECRET from ConfigService
└── falls back to default secret in dev when JWT_SECRET unset (verify exact fallback string)
```

**Est. 3 tests**

#### 6.7 JwtAuthGuard — `src/auth/guards/jwt-auth.guard.ts`

Thin wrapper around Passport's AuthGuard('jwt'). Test only that it extends correctly and rejects requests without `request.user` set.

**Est. 2 tests**

#### 6.8 VideoProcessingService — `src/media/metadata/video-processing.service.ts`

The high-value paths here are pure parsing helpers — testable without spawning ffprobe.

```
video-processing.service.spec.ts
├── Codec normalization (h264/avc, h265/hevc, vp8/vp9, av1) — verify mapping table
├── Framerate fraction parsing
│   ├── "30000/1001" → 29.97 (rounded)
│   ├── "30/1" → 30
│   └── "0/0" or invalid → 0 or fallback
├── Container detection from format_name
├── Pixel format / color space passthrough
└── Audio metadata: channel layout, sample rate, bitrate
```

Mock the `ffprobe` invocation at the lowest level (the wrapper around fluent-ffmpeg) and feed canned ffprobe JSON to exercise the parsers. **Do not** require a real ffprobe binary in tests.

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
├── DELETE /media/:id → soft delete; record still findable with includeDeleted=true
├── POST /media/:id/restore → 200
├── DELETE /media/:id?hard=true → S3 cleanup invoked (mock S3Service)
└── Unauthenticated request to GET /media → 401
```

Bootstrap via `Test.createTestingModule({ imports: [AppModule] })` with `DatabaseModule` overridden to use `mongodb-memory-server` (or skip Mongoose-bound modules entirely if media still uses the in-memory Map).

**Est. 10 tests**

### P2 — Implement third (completeness)

#### 6.10 Caching middleware — `src/performance/caching.middleware.ts`

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

Likely contains memoization, batching, or worker-pool helpers. Tests should cover the public surface only.

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
├── UpdateMediaDto — all fields optional, but enums still validated
├── QueryMediaDto — numeric coercion (limit/offset), date strings, comma-list parsing
├── GenerateThumbnailDto / GenerateSpriteSheetDto — positive integers, ratio bounds
├── ExtractMetadataDto — required URL + MIME
└── InitiateUploadDto — filename present, mimeType present, totalSize > 0
```

**Est. ~12 tests**

#### 6.13 E2E — Auth (`test/auth.e2e-spec.ts`)

```
auth.e2e-spec.ts
├── POST /auth/register → 201, returns access_token + user
├── POST /auth/register duplicate email → 409
├── POST /auth/register from trusted domain → role='author'
├── POST /auth/login valid → 200 with token
├── POST /auth/login wrong password → 401
└── POST /auth/login unknown email → 401
```

**Est. 6 tests**

---

## 7. Test Execution

```bash
# Unit
pnpm test                                   # All unit specs
pnpm test -- --testPathPattern=media        # Single area
pnpm test:watch                             # Watch mode
pnpm test:cov                               # Coverage report

# E2E (after fixing testRegex or renaming spec files)
pnpm test:e2e

# CI
pnpm test:ci                                # --ci --maxWorkers=2 --coverage
```

### CI notes

- Unit tests must remain hermetic — no S3, no Mongo, no ffprobe binary.
- E2E tests bootstrap `AppModule`, which pulls in `DatabaseModule` (Mongoose). For CI without Mongo, use `mongodb-memory-server` and override `MONGO_URI` in test setup, or build a `TestAppModule` that swaps `DatabaseModule` with no-op providers.
- `MediaService` and `AuthService` currently use in-memory `Map` storage — exercise full CRUD without a database in unit tests.
- `UploadsService` uses S3 — always mock `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner`.

---

## 8. Implementation Order

| Phase | File | Est. tests | Priority |
|------|------|------------|----------|
| 1 | `src/media/guards/auth.guard.spec.ts` | 8 | P0 |
| 2 | `src/auth/guards/roles.guard.spec.ts` | 9 | P0 |
| 3 | `src/media/media.service.spec.ts` (rewrite) | 22 | P0 |
| 4 | `src/media/media.controller.spec.ts` | 9 | P1 |
| 5 | `src/auth/auth.controller.spec.ts` | 5 | P1 |
| 6 | `src/auth/strategies/jwt.strategy.spec.ts` | 3 | P1 |
| 7 | `src/auth/guards/jwt-auth.guard.spec.ts` | 2 | P1 |
| 8 | `src/media/metadata/video-processing.service.spec.ts` | 8 | P1 |
| 9 | `test/media.e2e-spec.ts` | 10 | P1 |
| 10 | `src/performance/caching.middleware.spec.ts` | 6 | P2 |
| 11 | `src/performance/metadata-extraction.optimization.spec.ts` | ~6 | P2 |
| 12 | DTO validation specs | ~12 | P2 |
| 13 | `test/auth.e2e-spec.ts` | 6 | P2 |

**Estimated total new/rewritten tests: ~106**, across 13 files.

---

## 9. Edge Cases & High-Risk Logic

Highest-ROI bugs cluster around these locations:

| Area | File | Why it's tricky |
|------|------|-----------------|
| `x-user-id` / `?userId` dev fallback | `src/media/guards/auth.guard.ts:62-75` | Branch on `process.env.NODE_ENV !== 'production'` — easy to misconfigure; production hardening must be regression-tested |
| Role hierarchy lookup | `src/auth/guards/roles.guard.ts:10-14,52` | `indexOf()` returns `-1` for unlisted roles (`client`, `agent` exist in `UserRole` but not in `ROLE_HIERARCHY`) — can silently grant or deny |
| Auto-role domain matching | `src/auth/auth.service.ts:49-62` | Comma-split env override + lowercasing; subdomain matching nuances |
| JWT secret fallback | `src/auth/strategies/jwt.strategy.ts`, `src/media/guards/auth.guard.ts` | Default `dev-secret-change-me` in dev — must never apply in production |
| Media query filter chain | `src/media/media.service.ts` | Cumulative filters (type, mime, author, publicity, rating, tags, date range, search) — easy to short-circuit incorrectly |
| Soft vs hard delete | `src/media/media.service.ts` (`remove`) | Hard delete must call S3Service with keys extracted from thumbnail/paidThumbnail URLs; soft delete must NOT touch S3 |
| Metadata failure tracking | `src/media/media.service.ts` (`extractMetadata`) | Increment `attemptCount` on existing failure entry vs creating new entry — duplication bug risk |
| ETag quote handling | `src/uploads/uploads.service.ts` | S3 returns ETags wrapped in quotes — code strips them; covered today, keep covered |
| Multipart resume / sync | `src/uploads/uploads.service.ts` | Reconciles in-memory state with S3 `ListParts`; expired upload detection |
| Last-part size | `src/uploads/uploads.service.ts` | Final part is smaller than `chunkSize` — common off-by-one source |
| S3 URL parsing | `src/s3/s3.service.ts` | CloudFront vs virtual-hosted vs path-style URL formats |
| Framerate fraction parsing | `src/media/metadata/video-processing.service.ts` | `"30000/1001"` → 29.97; degenerate `"0/0"` |
| Codec normalization | `src/media/metadata/video-processing.service.ts` | h264/avc, h265/hevc, vp8/vp9, av1 aliases |
| VTT thumbnail mapping | `src/media/thumbnail-generation.service.ts` | Frame index → row/col → x,y — already tested, keep tested |
| Sprite-interval auto-calc | `src/media/thumbnail-generation.service.ts` | Different intervals per duration bracket |

---

## 10. Boundary Reminder

Per `AGENTS.md` and `CLAUDE.md` for this package: `sui-media-api` is for **media-component endpoints only**. New non-media business routes (products, clients, licenses, invoices, users beyond media-auth) must be implemented in `docs/pages/api/*` and tested there — do not expand this package's test suite to cover them.
