# SC_TEST: @stoked-ui/media-api Testing Strategy

**Package:** `@stoked-ui/media-api`
**Priority:** Medium
**Stack:** NestJS 10.3 / TypeScript 5.4 / Jest 29 / Mongoose 8 / AWS SDK v3
**Generated:** 2026-03-03

---

## 1. Current Test Inventory

### Existing Unit Tests (10 files, ~3,100 lines)

| File | Lines | Tests | Depth |
|------|-------|-------|-------|
| `src/s3/s3.service.spec.ts` | 685 | ~25 | **Excellent** — full S3 operation coverage with mocked AWS SDK |
| `src/uploads/uploads.service.spec.ts` | 762 | ~22 | **Excellent** — initiate, status, parts, complete, abort, sync, presigned URLs |
| `src/blog/blog.service.spec.ts` | 516 | ~12 | **Good** — create, findBySlug, publish, findAll, findPublic, softDelete |
| `src/nostr/nostr.service.spec.ts` | 507 | ~16 | **Excellent** — config parsing, event parsing, import, poll, lifecycle |
| `src/uploads/uploads.controller.spec.ts` | 338 | ~10 | **Good** — controller delegation verified for all endpoints |
| `src/auth/auth.service.spec.ts` | 160 | ~12 | **Good** — register, login, validateToken, domain-based role assignment |
| `src/media/thumbnail-generation.service.spec.ts` | 96 | ~5 | **Moderate** — VTT generation, S3 URL building; skips FFmpeg paths |
| `src/media/metadata/metadata-extraction.service.spec.ts` | 80 | ~4 | **Moderate** — validateTools, MIME routing, unsupported type rejection |
| `src/media/media.service.spec.ts` | 50 | 2 | **Shallow** — only `isDefined` + `getInfo()` |
| `src/health/health.controller.spec.ts` | 26 | 2 | Complete for scope |

### Existing E2E Tests (1 file)

| File | Lines | Tests | Depth |
|------|-------|-------|-------|
| `test/uploads-e2e.spec.ts` | 346 | ~16 | **Excellent** — complete upload, resume, abort, active list, duplicate, errors |

### Gap Summary

**No tests at all:**
- `src/license/license.service.ts` (203 lines — activation, validation, key generation, deactivation limits)
- `src/license/stripe.service.ts` (87 lines — checkout sessions, webhook verification, subscription retrieval)
- `src/invoices/invoices.service.ts` (75 lines — CRUD with Mongoose)
- `src/media/media.controller.ts` (597 lines — REST endpoints, auth integration)
- `src/auth/auth.controller.ts` — login/register endpoints
- `src/blog/blog.controller.ts` — blog REST endpoints
- `src/license/license.controller.ts` — license endpoints
- `src/license/stripe.controller.ts` — Stripe webhook endpoints
- `src/invoices/invoices.controller.ts` — invoice endpoints
- `src/media/guards/auth.guard.ts` (77 lines — JWT + x-user-id fallback)
- `src/auth/guards/roles.guard.ts` (57 lines — role hierarchy enforcement)
- `src/invoices/guards/api-key.guard.ts` (33 lines — API key validation)
- `src/performance/caching.middleware.ts` — HTTP caching

**Shallow tests needing rewrite:**
- `src/media/media.service.spec.ts` — all CRUD, filtering, search, pagination, soft/hard delete untested

**No E2E tests** for media CRUD, auth flow, blog endpoints, invoice endpoints, license/stripe endpoints

**No DTO validation tests** for any module

---

## 2. Framework & Tooling

### Already Configured (keep as-is)
- **Jest 29.7** with **ts-jest 29.1** — unit test runner
- **@nestjs/testing** — NestJS test module factory
- **supertest 6.3** — HTTP E2E assertions
- `jest.config` in `package.json`: `rootDir: src`, `testRegex: .*\.spec\.ts$`, `testEnvironment: node`
- `test/jest-e2e.json`: `testRegex: .e2e-spec.ts$`, root `test/`
- Scripts: `pnpm test`, `pnpm test:cov`, `pnpm test:ci`, `pnpm test:e2e`, `pnpm test:watch`

### Recommended Additions

| Tool | Purpose | Install |
|------|---------|---------|
| `mongodb-memory-server` | In-process MongoDB for integration/E2E tests without Docker | `pnpm add -D mongodb-memory-server` |
| `@golevelup/ts-jest` | `createMock<T>()` for auto-mocking NestJS providers | `pnpm add -D @golevelup/ts-jest` |

No other tools needed — the existing stack is well-suited.

---

## 3. Test File Organization

### Naming Conventions (already established)
```
src/<module>/<name>.spec.ts          # Unit tests (co-located with source)
test/<name>-e2e.spec.ts              # E2E tests (separate directory)
test/<name>.integration.spec.ts      # Integration tests (proposed, for MongoDB-backed services)
```

### Proposed New Test Files
```
# P0 — Security, money, data integrity
src/license/license.service.spec.ts          # NEW — HIGH PRIORITY
src/media/guards/auth.guard.spec.ts          # NEW — HIGH PRIORITY
src/auth/guards/roles.guard.spec.ts          # NEW — HIGH PRIORITY
src/media/media.service.spec.ts              # REWRITE — HIGH PRIORITY

# P1 — Functionality, reliability
src/license/stripe.service.spec.ts           # NEW — MEDIUM PRIORITY
src/invoices/invoices.service.spec.ts        # NEW — MEDIUM PRIORITY
src/media/media.controller.spec.ts           # NEW — MEDIUM PRIORITY
test/media-e2e.spec.ts                       # NEW — MEDIUM PRIORITY

# P2 — Completeness
src/invoices/guards/api-key.guard.spec.ts    # NEW — LOW PRIORITY
src/auth/auth.controller.spec.ts             # NEW — LOW PRIORITY
src/blog/blog.controller.spec.ts             # NEW — LOW PRIORITY
test/auth-e2e.spec.ts                        # NEW — LOW PRIORITY
test/license-e2e.spec.ts                     # NEW — LOW PRIORITY (needs Stripe mock)
```

---

## 4. Mock/Stub Strategy

### External Dependencies

| Dependency | Mock Approach | Example |
|------------|---------------|---------|
| **AWS S3 SDK** | `jest.mock('@aws-sdk/client-s3')` — already done in `s3.service.spec.ts`; reuse pattern | Mock `S3Client.send()` |
| **Stripe** | `jest.mock('stripe')` — mock `checkout.sessions.create`, `webhooks.constructEvent`, `subscriptions.retrieve`, `customers.retrieve` | Return mock session objects |
| **Mongoose Models** | Manual mock objects with chainable query builders — established in `blog.service.spec.ts`, `nostr.service.spec.ts` | `{ findOne: jest.fn().mockReturnThis(), exec: jest.fn() }` |
| **FFmpeg/FFprobe** | Mock `child_process.spawn` or mock `VideoProcessingService` at injection level — done in `metadata-extraction.service.spec.ts` | Inject mock service |
| **Sharp** | Mock at module level: `jest.mock('sharp')` returning chainable resize/toBuffer | `jest.fn(() => ({ resize: jest.fn().mockReturnThis(), jpeg: jest.fn().mockReturnThis(), toBuffer: jest.fn() }))` |
| **nostr-tools** | Already fully mocked via `jest.mock('nostr-tools/pool')` and `jest.mock('nostr-tools/nip19')` | See `nostr.service.spec.ts` |
| **bcryptjs** | Let real impl run (fast enough for unit tests) or mock for speed | Real is fine |

### Internal Service Mocks

NestJS `Test.createTestingModule` with `useValue` mocks — the established pattern across all existing tests:

```typescript
const module: TestingModule = await Test.createTestingModule({
  providers: [
    ServiceUnderTest,
    { provide: DependencyService, useValue: { method: jest.fn() } },
    { provide: ConfigService, useValue: { get: jest.fn((k, d) => d) } },
  ],
}).compile();
```

### Guard Testing Pattern

Guards need an `ExecutionContext` mock:

```typescript
const mockRequest = { headers: {}, query: {}, user: undefined };
const mockContext = {
  switchToHttp: () => ({
    getRequest: () => mockRequest,
  }),
  getHandler: () => jest.fn(),
  getClass: () => jest.fn(),
} as unknown as ExecutionContext;
```

### Mongoose Model Mock Pattern (for LicenseService, InvoicesService)

```typescript
const mockLicenseModel = {
  findOne: jest.fn(),
  create: jest.fn(),
  find: jest.fn(),
  countDocuments: jest.fn(),
};
// For chainable queries:
mockLicenseModel.findOne.mockReturnValue({
  exec: jest.fn().mockResolvedValue(mockLicenseDoc),
});
```

---

## 5. Coverage Targets

For **medium priority**, target practical coverage on critical paths rather than line-count chasing.

| Metric | Target | Rationale |
|--------|--------|-----------|
| **Statement** | 70% | Medium priority — focus on business logic |
| **Branch** | 65% | Cover error paths and authorization branches |
| **Function** | 75% | All public service methods should have at least one test |
| **Line** | 70% | Consistent with statement target |

### Per-Module Targets

| Module | Current Est. | Target | Notes |
|--------|-------------|--------|-------|
| `auth/` | ~80% | 85% | Already well-tested; add guard tests |
| `media/` | ~15% | 70% | **Biggest gap** — rewrite service spec, add controller spec |
| `uploads/` | ~90% | 90% | Maintain — already excellent |
| `s3/` | ~95% | 95% | Maintain — already excellent |
| `blog/` | ~75% | 80% | Add controller spec |
| `nostr/` | ~90% | 90% | Maintain — already excellent |
| `license/` | 0% | 75% | **New** — critical business logic (money, activation) |
| `invoices/` | 0% | 65% | **New** — simpler CRUD |
| `health/` | ~100% | 100% | Maintain |

Run coverage: `pnpm test:cov`

---

## 6. Critical Paths to Test

### P0 — Implement First (security, money, data integrity)

#### 6.1 LicenseService (`src/license/license.service.ts`, 203 lines)

The license system handles paid software activation. Bugs here mean revenue loss or unauthorized access.

```
license.service.spec.ts
├── generateKey(prefix)
│   ├── returns key matching format: PREFIX-XXXX-XXXX-XXXX
│   ├── uses only characters from KEY_ALPHABET (ABCDEFGHJKLMNPQRSTUVWXYZ23456789, no 0/O/1/I)
│   └── generates unique keys across 100 calls (no collisions)
├── activate(dto)
│   ├── activates a pending license → status='active', hardwareId set, activatedAt set
│   ├── idempotent — same hardwareId on active license returns unchanged response
│   ├── throws ConflictException for different hardwareId on active license
│   ├── throws BadRequestException for expired license
│   ├── throws BadRequestException for revoked license
│   ├── throws NotFoundException for unknown key
│   └── pushes hardwareId to activationHistory array
├── validate(dto)
│   ├── returns license for matching key + hardwareId
│   ├── throws ForbiddenException for hardwareId mismatch
│   ├── marks license as expired when past expiresAt + gracePeriodDays
│   ├── does NOT expire license within grace period window
│   └── throws NotFoundException for unknown key
├── deactivate(dto)
│   ├── deactivates active license → status='pending', hardwareId=null, machineName=null
│   ├── increments deactivationCount
│   ├── throws ForbiddenException when deactivationCount >= 3
│   ├── throws ForbiddenException for hardwareId mismatch
│   ├── throws BadRequestException for non-active license
│   └── throws NotFoundException for unknown key
├── createLicense(email, productId, customerId, subscriptionId)
│   ├── creates license with correct expiration = now + product.licenseDurationDays
│   ├── retries on key collision (MongoDB E11000) up to 3 times
│   ├── throws NotFoundException for unknown productId
│   └── throws BadRequestException after 3 failed key generation attempts
└── renewLicense(stripeSubscriptionId)
    ├── extends expiresAt by product.licenseDurationDays from now
    ├── reactivates expired license with existing hardwareId → status='active'
    ├── sets to pending if expired license has no hardwareId
    └── silently returns if no license found for subscription
```

**Estimated: 18 tests**

#### 6.2 AuthGuard (`src/media/guards/auth.guard.ts`, 77 lines)

Authentication bypass = full API compromise.

```
auth.guard.spec.ts
├── JWT Bearer token
│   ├── allows request with valid JWT; sets request.user = { id, email, role, name }
│   ├── throws UnauthorizedException for expired/invalid token
│   ├── throws UnauthorizedException for malformed Authorization header
│   └── uses JWT_SECRET from ConfigService (falls back to 'dev-secret-change-me')
├── x-user-id fallback (dev mode, NODE_ENV !== 'production')
│   ├── allows request with x-user-id header; sets request.user = { id }
│   ├── allows request with ?userId query param
│   ├── rejects x-user-id header when NODE_ENV === 'production'
│   └── rejects ?userId query param when NODE_ENV === 'production'
└── no auth
    └── throws UnauthorizedException('Authentication required')
```

**Estimated: 8 tests**

#### 6.3 RolesGuard (`src/auth/guards/roles.guard.ts`, 57 lines)

```
roles.guard.spec.ts
├── allows access when no @Roles() decorator is present
├── role hierarchy: admin > editor > author > reader
│   ├── allows admin to access author-required routes
│   ├── allows editor to access author-required routes
│   ├── allows author to access author-required routes
│   ├── denies reader access to author-required routes
│   └── allows admin to access admin-required routes
├── denies access when user has no role property
└── denies access when request has no user
```

**Estimated: 8 tests**

#### 6.4 MediaService CRUD (`src/media/media.service.ts`, 472 lines) — REWRITE

The current spec only has `isDefined` and `getInfo()`. All business logic is untested.

```
media.service.spec.ts (rewrite)
├── create(dto)
│   ├── creates media entity with generated ID ('media_N')
│   ├── returns MediaResponseDto with all fields
│   └── persists to internal store
├── findAll(query)
│   ├── returns paginated results with correct total/limit/offset
│   ├── filters by mediaType ('video', 'image')
│   ├── filters by uploadedBy (author)
│   ├── filters by publicity ('public', 'private', 'paid')
│   ├── filters by rating
│   ├── filters by date range (dateFrom, dateTo)
│   ├── filters by tags (comma-separated, case-insensitive match)
│   ├── searches across title, description, file, tags
│   ├── sorts ascending and descending by sortBy field
│   └── excludes soft-deleted items by default (includeDeleted=false)
├── findOne(id)
│   ├── returns media by ID
│   ├── increments view count on each call
│   ├── throws NotFoundException for missing ID
│   └── throws NotFoundException for soft-deleted media
├── update(id, dto, userId)
│   ├── updates allowed fields and sets updatedAt
│   ├── throws NotFoundException for missing ID
│   └── throws ForbiddenException when userId !== media.author
├── remove(id, userId, softDelete)
│   ├── soft delete: marks deleted=true, sets deletedAt
│   ├── hard delete: calls S3Service.deleteMediaAndThumbnails, removes from store
│   ├── hard delete: extracts keys from thumbnail + paidThumbnail URLs
│   ├── throws NotFoundException for missing ID
│   └── throws ForbiddenException when userId !== media.author
├── restore(id, userId)
│   ├── restores soft-deleted media (deleted=false, deletedAt=undefined)
│   ├── returns unchanged media if not deleted
│   ├── throws NotFoundException for missing ID
│   └── throws ForbiddenException when userId !== media.author
├── extractMetadata(id)
│   ├── calls MetadataExtractionService with file URL and MIME type
│   ├── updates media entity with video metadata fields (codec, container, bitrate, etc.)
│   ├── updates media entity with audio metadata fields
│   ├── updates media entity with image metadata fields
│   ├── tracks extraction failure in metadataProcessingFailures array
│   └── increments attemptCount on repeated failures
└── getInfo()
    ├── returns name, version, description
    └── returns mediaCount matching store size
```

**Estimated: 22 tests**

### P1 — Implement Second (functionality, reliability)

#### 6.5 StripeService (`src/license/stripe.service.ts`, 87 lines)

```
stripe.service.spec.ts
├── createCheckoutSession(dto, product)
│   ├── creates Stripe session with correct line items (product.stripePriceId) and metadata
│   ├── returns session URL
│   ├── throws BadRequestException when Stripe returns no URL
│   └── throws BadRequestException on Stripe API error
├── constructWebhookEvent(rawBody, signature)
│   ├── returns parsed Stripe.Event for valid signature
│   └── throws BadRequestException for invalid signature
├── getSubscription(subscriptionId)
│   └── retrieves subscription by ID from Stripe
└── getCustomerEmail(customerId)
    ├── returns email for active customer
    └── throws BadRequestException for deleted customer
```

**Estimated: 7 tests**

#### 6.6 InvoicesService (`src/invoices/invoices.service.ts`, 75 lines)

```
invoices.service.spec.ts
├── create(dto)
│   ├── creates invoice document with correct fields
│   └── returns InvoiceResponseDto
├── findAll(query)
│   ├── paginates with default page=1, limit=20
│   ├── filters by customer
│   ├── filters by configId
│   └── returns total count
└── findOne(id)
    ├── returns invoice by ID
    └── throws NotFoundException for missing ID
```

**Estimated: 7 tests**

#### 6.7 MediaController (`src/media/media.controller.ts`, 597 lines)

```
media.controller.spec.ts
├── GET /api/info — delegates to service.getInfo(), no auth required
├── GET / — delegates to findAll with query params, applies pagination
├── GET /:id — delegates to findOne, increments views
├── POST / — delegates to create, extracts userId from request.user
├── PATCH /:id — delegates to update with userId
├── DELETE /:id — soft delete by default
├── DELETE /:id?hard=true — passes softDelete=false
├── POST /:id/restore — delegates to restore
└── POST /:id/extract-metadata — delegates to extractMetadata
```

**Estimated: 9 tests**

#### 6.8 E2E: Media CRUD (`test/media-e2e.spec.ts`)

```
media-e2e.spec.ts
├── GET /media/api/info — returns 200 with API metadata (no auth)
├── POST /media — creates media with x-user-id header (dev mode)
├── GET /media — lists media with pagination defaults
├── GET /media?mediaType=video — filters by type
├── GET /media?search=sunset — searches across fields
├── GET /media/:id — returns single media, view count incremented
├── PATCH /media/:id — updates media (owner only)
├── DELETE /media/:id — soft deletes media
├── POST /media/:id/restore — restores soft-deleted media
├── DELETE /media/:id?hard=true — hard deletes (verifies S3 cleanup called)
└── Authorization
    ├── rejects unauthenticated requests on protected routes
    └── rejects update/delete from non-owner (403)
```

**Estimated: 12 tests**

### P2 — Implement Third (completeness)

#### 6.9 ApiKeyGuard (`src/invoices/guards/api-key.guard.ts`, 33 lines)

```
api-key.guard.spec.ts
├── allows request with valid x-api-key header matching INVOICE_API_KEY
├── throws UnauthorizedException when x-api-key header is missing
├── throws UnauthorizedException when INVOICE_API_KEY is not configured
└── throws UnauthorizedException when x-api-key doesn't match
```

**Estimated: 4 tests**

#### 6.10 AuthController E2E (`test/auth-e2e.spec.ts`)

```
auth-e2e.spec.ts
├── POST /auth/register — creates user, returns JWT + user
├── POST /auth/register — rejects duplicate email (409)
├── POST /auth/register — assigns 'author' role to trusted domains
├── POST /auth/login — returns JWT for valid credentials
├── POST /auth/login — rejects invalid password (401)
├── POST /auth/login — rejects non-existent email (401)
└── GET /auth/me — returns current user from JWT (if endpoint exists)
```

**Estimated: 6 tests**

#### 6.11 BlogController (`src/blog/blog.controller.spec.ts`)

```
blog.controller.spec.ts
├── Delegates all CRUD operations to BlogService
├── Applies correct guards (JwtAuthGuard, RolesGuard)
├── Public endpoints (findPublic) don't require auth
└── Publish/unpublish require author+ role
```

**Estimated: 6 tests**

#### 6.12 DTO Validation Tests

Validate that `class-validator` decorators reject invalid input. Can be tested by instantiating DTOs and running `validate()` from `class-validator`:

```
├── CreateMediaDto — rejects missing author, missing file, invalid mediaType enum
├── ActivateLicenseDto — rejects missing key, missing hardwareId
├── ValidateLicenseDto — rejects missing key
├── InitiateUploadDto — rejects missing filename, missing mimeType, non-positive totalSize
├── CreateBlogPostDto — rejects missing title, missing body
└── CreateInvoiceDto — rejects missing customer
```

**Estimated: 12 tests**

---

## 7. Test Execution

```bash
# Unit tests
pnpm test                                      # All unit tests
pnpm test -- --testPathPattern=license         # Single module
pnpm test:watch                                # Watch mode during development
pnpm test:cov                                  # Coverage report

# E2E tests (requires NestJS app bootstrap)
pnpm test:e2e

# CI pipeline
pnpm test:ci                                   # --ci --maxWorkers=2 --coverage
```

### CI Configuration Notes

- Unit tests require no external services (all mocked)
- E2E tests bootstrap the NestJS app via `AppModule`, which triggers `DatabaseModule` (MongoDB). For CI without MongoDB, either:
  - Install `mongodb-memory-server` and override `MONGODB_URI` in test setup
  - Create a `TestAppModule` that replaces `DatabaseModule` with in-memory providers
- The current in-memory storage pattern (Map-based) for `MediaService` and `UploadsService` means unit tests work without MongoDB
- Services using Mongoose (`BlogService`, `LicenseService`, `InvoicesService`, `NostrService`) require mocked models in unit tests

---

## 8. Implementation Order

| Phase | Files | Est. Tests | Priority |
|-------|-------|------------|----------|
| 1 | `license.service.spec.ts` | 18 | P0 |
| 2 | `auth.guard.spec.ts`, `roles.guard.spec.ts` | 16 | P0 |
| 3 | `media.service.spec.ts` (rewrite) | 22 | P0 |
| 4 | `stripe.service.spec.ts` | 7 | P1 |
| 5 | `invoices.service.spec.ts` | 7 | P1 |
| 6 | `media.controller.spec.ts` | 9 | P1 |
| 7 | `test/media-e2e.spec.ts` | 12 | P1 |
| 8 | `api-key.guard.spec.ts` | 4 | P2 |
| 9 | `test/auth-e2e.spec.ts` | 6 | P2 |
| 10 | `blog.controller.spec.ts` | 6 | P2 |
| 11 | DTO validation tests | 12 | P2 |

**Total new tests: ~119** across 11 new/rewritten files.

---

## 9. Edge Cases & Complex Logic Requiring Special Attention

These are areas where bugs are most likely and testing provides the highest ROI:

| Area | File | Why It's Tricky |
|------|------|----------------|
| License key generation | `license.service.ts:36-56` | Bit manipulation (5 bits per char from 8-byte buffer), collision retry |
| Grace period expiration | `license.service.ts:107-115` | Date arithmetic with `gracePeriodDays * 24 * 60 * 60 * 1000` |
| Deactivation limit | `license.service.ts:130` | `deactivationCount >= 3` boundary condition |
| S3 URL parsing | `s3.service.ts:265-302` | CloudFront vs virtual-hosted vs path-style URL formats |
| Multipart upload sync | `uploads.service.ts:638-703` | Reconciling in-memory state with S3 ListParts, detecting expired uploads |
| ETag quote stripping | `uploads.service.ts:449` | S3 returns ETags with quotes (`"abc"`), code strips them |
| Part size calculation | `uploads.service.ts:147-164` | Last part may be smaller than `chunkSize` |
| Media query filtering | `media.service.ts:52-155` | Complex filter chain (type, mime, author, publicity, rating, tags, date range, search) |
| Soft vs hard delete | `media.service.ts:204-260` | S3 cleanup on hard delete, thumbnail key extraction from URLs |
| Metadata failure tracking | `media.service.ts:354-384` | Incrementing `attemptCount` on existing failure vs creating new failure entry |
| Framerate fraction parsing | `video-processing.service.ts:311-325` | `"30000/1001"` → `29.97` |
| Codec normalization | `video-processing.service.ts:268-288` | Multiple aliases (h264/avc, h265/hevc) |
| VTT coordinate mapping | `thumbnail-generation.service.ts:415-448` | Frame index → row/col → x,y pixel coordinates |
| Sprite interval auto-calc | `thumbnail-generation.service.ts:206-215` | Different intervals based on duration brackets |
| Blog slug uniqueness | `blog.service.ts` | Auto-generated from title, collision handling |
| Nostr event dedup | `nostr.service.ts` | Slug collision resolved by appending event ID |
| Auth guard env branching | `auth.guard.ts:60-73` | `process.env.NODE_ENV !== 'production'` check for x-user-id fallback |
| Role hierarchy comparison | `roles.guard.ts:12-14` | `ROLE_HIERARCHY.indexOf()` for level comparison |
