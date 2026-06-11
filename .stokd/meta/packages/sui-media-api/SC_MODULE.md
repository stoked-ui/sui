# Module: @stoked-ui/media-api

> **Generated:** 2026-05-05 (fresh) | **Last upgraded:** 2026-05-21 (meta v0.3.0 → v0.4.0) | **Last refreshed:** 2026-06-06 (timed refresh — re-verified against source; one correction: the `blog`/`clients`/`users` subtrees are now empty leftover directories)
> **Meta version:** 0.4.0
> **Verification (2026-06-06):** Controllers (`auth`/`media`/`uploads`/`health`), the 10 `/media`, 8 `/uploads`, and 3 `/auth` routes, the `generate-thumbnail`/`generate-sprites` "Work Item 3.1" placeholders, upload constants (`DEFAULT_CHUNK_SIZE = 10 MiB`, `MAX_URLS_PER_REQUEST = 50`, `SESSION_EXPIRATION_DAYS = 7`, `MULTIPART_URL_EXPIRY = 1h`), the `^(video|image)\/[a-z0-9.+-]+$` MIME regex, the CORS default list, Swagger servers (`localhost:3001/v1`, `api.sui.stokd.cloud/v1`, `JWT-auth`), the JWT secret chain (`Resource` → `import('sst')` → `JWT_SECRET` → `'dev-secret-change-me'`, `7d`), the `AUTH_AUTO_DOMAINS` code-default-vs-`.env.example` mismatch, and the Lambda binary content-type list all confirmed unchanged. `MediaService` remains in-memory (`Map<string, MediaEntity>`). **Drift corrected this refresh:** the formerly-dormant `src/blog`, `src/clients`, `src/users`, and `src/blog/dto` are now *empty, untracked* leftover directories — the `21d04d615f refactor: remove business APIs from media stack` commit removed their contents (previously `blog/dto` held files); `git ls-files` returns nothing for all three. The e2e config `testRegex` (`.e2e-spec.ts$`) still does not match `test/uploads-e2e.spec.ts`, so that suite runs under the unit config (see SC_TEST.md §2).
> **Package location:** `packages/sui-media-api`
> **NPM name:** `@stoked-ui/media-api` (v1.0.0)
> **Runtime:** NestJS 10.3 / TypeScript 5.4 / Express 5 / MongoDB (Mongoose 8) / AWS S3 / `ffmpeg` + `sharp`
> **Standard server entry:** `src/main.ts` → `src/app.ts` (`Server.start()`)
> **Lambda entry:** `src/lambda.ts` → `src/lambda.bootstrap.ts` (handler via `@codegenie/serverless-express`)
> **Build artifact:** `dist/main.js`
> **Companion docs:** `.stokd/meta/packages/sui-media-api/SC_TEST.md`, `packages/sui-media-api/.axioms.md`

---

## 1. Responsibility

`@stoked-ui/media-api` is the **dedicated NestJS backend for the Stoked UI media-component surface**. It is *not* a generic application API — by repository guardrail (`AGENTS.md`, `CLAUDE.md`, `SC_CONTEXT.md`) any business/domain endpoints (products, clients, licenses, invoices, non-media users) belong in `docs/pages/api/*`, never here.

Its scope is exactly six concerns:

1. **Media CRUD** — list / get / create / update / soft-delete / hard-delete / restore for the `Media` document set, with filtering, search, sorting, and pagination (`MediaController`).
2. **Resumable multipart uploads** — initiate / status / sync / additional presigned URLs / mark-part-completed / complete / abort / list-active backed by S3 multipart and Mongo upload sessions (`UploadsController` + `UploadsService`).
3. **S3 operations** — typed wrapper over the AWS SDK v3 client for `Get`/`Put`/`Head`/`Delete`/`DeleteObjects` plus the multipart commands (`Create`/`UploadPart`/`Complete`/`Abort`/`ListParts`) and `getSignedUrl` presigning (`S3Service`).
4. **Metadata extraction** — `ffmpeg`/`ffprobe` + `sharp` orchestrated through `MetadataExtractionService` and `VideoProcessingService`.
5. **Thumbnail and sprite-sheet generation** — single-frame thumbnails plus VTT-backed scrubbing sprite sheets for video (`ThumbnailGenerationService`).
6. **JWT auth surface** — `register` / `login` / `me` plus a `JwtStrategy`, `JwtAuthGuard`, `RolesGuard`, and a media-scoped `AuthGuard` that supports a `x-user-id` dev fallback (`AuthModule` + `media/guards/auth.guard.ts`).

Cross-cutting: a `HealthModule` (liveness probe), a `swagger.config.ts` that builds the OpenAPI spec from the controller decorators and mounts Swagger UI at `/v1/api/docs`, and an SST/Lambda configuration path so the same code runs as either an Express server or an API Gateway Lambda.

There are also empty leftover subdirectories on disk (`src/blog`, `src/clients`, `src/users`, and `src/blog/dto`) that survive from earlier iterations of the codebase. As of the `21d04d615f refactor: remove business APIs from media stack` commit they are **completely empty and untracked** — `git ls-files` returns nothing for any of them, and nothing in those folders is imported by `AppModule`. The active module surface is what is wired in `src/app.module.ts`: `ConfigModule`, `AuthModule`, `DatabaseModule`, `MediaModule`, `HealthModule`, `UploadsModule`.

---

## 2. Public Interfaces / Entry Points

### Runtime entry points

| Entry | File | Mode |
|---|---|---|
| Standard server (`pnpm dev` / `pnpm start:prod`) | `src/main.ts` → `Server.start()` in `src/app.ts` | Express on `PORT || 3001`, global prefix from `API_PATH_PREFIX || '/v1'`. Mounts `cookie-parser`, dynamic CORS allow-list, Swagger UI. |
| AWS Lambda handler | `src/lambda.ts` re-exports `handler` from `src/lambda.bootstrap.ts` | `@codegenie/serverless-express` wrapping a NestJS `ExpressAdapter`. Handles OPTIONS/HEAD before bootstrap. Default prefix `/api` (overridable via `API_PATH_PREFIX`). 50 s self-timeout. |
| `lambda.entry.ts` (root) | `packages/sui-media-api/lambda.entry.ts` | SST shim re-exporting the same handler. |

### HTTP surface (NestJS controllers)

All routes are prefixed by `API_PATH_PREFIX` (`/v1` standalone, `/api` Lambda default).

| Tag | Routes | Controller / Source |
|---|---|---|
| `Health` | `GET /health` | `src/health/health.controller.ts` |
| `auth` | `POST /auth/register`, `POST /auth/login`, `GET /auth/me` (JWT) | `src/auth/auth.controller.ts` |
| `Media` | `GET /media/api/info` (public), `GET /media`, `GET /media/:id`, `POST /media`, `PATCH /media/:id`, `DELETE /media/:id?hardDelete=…`, `POST /media/:id/restore`, `POST /media/:id/extract-metadata`, `POST /media/:id/generate-thumbnail` (placeholder), `POST /media/:id/generate-sprites` (placeholder) | `src/media/media.controller.ts` |
| `Uploads` | `POST /uploads/initiate`, `GET /uploads/:sessionId/status`, `POST /uploads/:sessionId/sync`, `POST /uploads/:sessionId/urls`, `POST /uploads/:sessionId/parts/:partNumber/complete`, `POST /uploads/:sessionId/complete`, `DELETE /uploads/:sessionId`, `GET /uploads/active` | `src/uploads/uploads.controller.ts` |
| `OpenAPI` | `GET /v1/api/docs` (Swagger UI HTML + assets) | `src/swagger.config.ts::setupSwaggerUI` |

Bearer JWT (`Authorization: Bearer …`) is required on every `/media` route except `GET /media/api/info`, every `/uploads` route, and `GET /auth/me`. The media-scoped `AuthGuard` additionally accepts `x-user-id` (header) or `?userId=` (query) when `NODE_ENV !== 'production'` to keep dev tooling working.

### Module surface

Wired in `src/app.module.ts`:

```
AppModule
├── ConfigModule.forRoot({ isGlobal: true })
├── AuthModule          (JWT, Passport, AuthService, AuthController, JwtStrategy)
├── DatabaseModule      (MongooseModule.forRootAsync + forFeature(...))
├── MediaModule         (MediaController, MediaService, ThumbnailGenerationService,
│                        MetadataExtractionService, VideoProcessingService, AuthGuard)
├── HealthModule        (HealthController)
└── UploadsModule       (UploadsController, UploadsService)
```

`S3Module` is imported by both `MediaModule` and `UploadsModule` and exports `S3Service`.

### Injectable services (the contract for in-process consumers)

| Service | Source | Purpose |
|---|---|---|
| `MediaService` | `src/media/media.service.ts` | Media CRUD + query/pagination logic. **Currently in-memory** (`Map<string, MediaEntity>`); database integration is the documented next phase. |
| `ThumbnailGenerationService` | `src/media/thumbnail-generation.service.ts` | Single-frame thumbnails (`fluent-ffmpeg` + `sharp`) and sprite sheets with WebVTT cues, uploaded to S3. |
| `MetadataExtractionService` | `src/media/metadata/metadata-extraction.service.ts` | Routes by MIME type to video/audio/image probing. |
| `VideoProcessingService` | `src/media/metadata/video-processing.service.ts` | `ffprobe`-based video and audio metadata extraction. |
| `S3Service` | `src/s3/s3.service.ts` | All S3 operations + multipart presigning. |
| `UploadsService` | `src/uploads/uploads.service.ts` | Upload-session state machine, S3-sync, presigned-URL batching. |
| `AuthService` | `src/auth/auth.service.ts` | Register/login/validate + JWT issuance. **In-memory user store** until a `User` schema lands. |
| `AuthGuard` (media) | `src/media/guards/auth.guard.ts` | JWT verify + dev `x-user-id` fallback; sets `request.user`. |
| `JwtAuthGuard` / `RolesGuard` | `src/auth/guards/{jwt-auth,roles}.guard.ts` | Standard Passport JWT + `@Roles(...)` enforcement. |
| `JwtStrategy` | `src/auth/strategies/jwt.strategy.ts` | Bearer-token validation strategy. |
| `@UserId()` decorator | `src/media/decorators/current-user.decorator.ts` | Param decorator that extracts `request.user.id`. |

### Persisted Mongo schemas (registered via `DatabaseModule`)

`MongooseModule.forFeature([...])` registers the four feature schemas owned by `@stoked-ui/common-api`:

- `VideoFeature`
- `ImageFeature`
- `FileFeature`
- `UploadSessionFeature`

The collections themselves live in `@stoked-ui/common-api`; this module is a consumer.

### Build / scripts

```
pnpm --filter @stoked-ui/media-api build           # nest build → dist/
pnpm --filter @stoked-ui/media-api dev             # nest start --watch
pnpm --filter @stoked-ui/media-api start:prod      # node dist/main
pnpm --filter @stoked-ui/media-api test            # jest (rootDir: src)
pnpm --filter @stoked-ui/media-api test:e2e        # jest --config test/jest-e2e.json
pnpm --filter @stoked-ui/media-api test:cov        # coverage
pnpm --filter @stoked-ui/media-api openapi:export  # nest build && tsx scripts/export-openapi.ts
pnpm --filter @stoked-ui/media-api openapi:validate
pnpm --filter @stoked-ui/media-api db:init         # ts-node scripts/init-db.ts
pnpm --filter @stoked-ui/media-api type-check      # tsc --noEmit
```

A `Dockerfile`, `docker-compose.yml`, `deploy.sh`, and `k8s/` manifests ship in the package root for self-hosted deployment.

---

## 3. Products

This module participates in the single product documented in this repo:

- **SC_PRODUCT_STOKED_UI_SUI.md** — `@stoked-ui/sui`. Inside that product, `@stoked-ui/media-api` is the server-side counterpart of `@stoked-ui/media`. The browser package's `MediaApiClient` and `UploadClient` were designed against this exact HTTP surface; the `docs/` Next.js site reaches it through the `@stoked-ui/media/server` proxy (`createMediaHandler`) so the upstream API key never reaches the browser.

There is no other product doc; the module belongs only to this product.

---

## 4. Views

This module is a backend service, so the only **first-class view it owns** is the auto-generated API documentation surface:

| View (SC_VIEWS.md ref) | Role of this module |
|---|---|
| §19.1 Swagger UI (Media API) | **Owned.** Mounted at `GET /v1/api/docs` by `setupSwaggerUI(app)` in `src/app.ts:87` (`SwaggerModule.setup('api/docs', …)` in `src/swagger.config.ts:59`); configuration in `src/swagger.config.ts` (title, contact, license, server URLs `localhost:3001/v1` + `api.sui.stokd.cloud/v1`, Bearer-JWT widget, tag groups `Health`/`Media`/`Uploads`/`auth`). The `customCss` rule that hides the top bar is part of the visible surface. |

It also **materially shapes** several browser-rendered views by providing the data contract those views read or write:

| View | How |
|---|---|
| §12.1 MediaViewer, §12.2 MediaCard, §12.3 MediaGallery (`@stoked-ui/media`) | Fed by `GET /media`, `GET /media/:id`, and the metadata/thumbnail/sprite endpoints. The hybrid metadata path in `useHybridMetadata`/`useServerThumbnail` reads the JSON shape returned by `MediaResponseDto` / `ExtractMetadataResponseDto` / `SpriteSheetResponseDto`. |
| Docs upload UI (`docs/data/media/docs/*` examples; any host-app upload surface) | Driven end-to-end by the `/uploads/*` route family — initiate, presign, complete, abort, list-active, status/sync. |
| §1.x / §2.x Docs marketing media pages and `/products/media/` | Render `MediaCard`/`MediaGallery` examples that ultimately fan out to this API for live media data. |
| §9.x Editor views (`@stoked-ui/editor`) | Indirectly: editor consumes `MediaFile` graphs that may be hydrated from records this API persists. |

The module does **not** render any docs-site page directly; consumer-side React rendering is owned by `@stoked-ui/media`.

---

## 5. Integration Points

### Upstream (this module depends on)

| Dependency | Where used | Contract |
|---|---|---|
| `@stoked-ui/common-api` (workspace:*) | `DatabaseModule.forFeature([VideoFeature, ImageFeature, FileFeature, UploadSessionFeature])` | The Mongoose feature definitions and DTO shapes are the wire contract with `@stoked-ui/common`/`@stoked-ui/media`. Any rename or schema change must land in lockstep with the browser DTOs. |
| `@stoked-ui/common` (workspace:*) | Indirect via `@stoked-ui/common-api` types | Browser-safe DTOs re-exported through `@stoked-ui/media/api/types.ts` mirror this. |
| `@nestjs/{common,core,config,jwt,mongoose,passport,platform-express,swagger}` | Framework | NestJS 10.3.x; bumping major requires lock-step Passport / Swagger version moves. |
| `mongoose` ^8 | `DatabaseModule` | Connection options: `appName: 'stoked-ui-media-api'`, retry `3 × 1000 ms`, `connectTimeoutMS: 5000`, `serverSelectionTimeoutMS: 5000`. |
| `@aws-sdk/client-s3` ^3, `@aws-sdk/s3-request-presigner` ^3 | `S3Service` | Multipart commands + presigning. URL lifetime is 1 hour (`MULTIPART_URL_EXPIRY = 60 * 60`). Region from `AWS_REGION`. |
| `@aws-sdk/client-ses` ^3 | (currently unused at controller level; available for future notifications) | — |
| `@codegenie/serverless-express` ^4 | `lambda.bootstrap.ts` | Wraps the Express adapter for API Gateway. |
| `passport`, `passport-jwt`, `@nestjs/passport`, `@nestjs/jwt` | `AuthModule`, `JwtStrategy` | JWT secret resolved (in order) from `globalThis.Resource.JWT_SECRET`, dynamic `import('sst')`, `JWT_SECRET` env, falling back to `'dev-secret-change-me'`. `expiresIn` defaults to `'7d'`. |
| `bcryptjs` ^2 | `AuthService.register/login` | Password hashing. |
| `class-validator` / `class-transformer` | All DTOs (`@Body(ValidationPipe)`) | Validation contract on every controller. |
| `cookie-parser` ^1.4 | `app.ts`, `lambda.bootstrap.ts` | Required because some flows accept session cookies. |
| `fluent-ffmpeg` ^2 + system `ffmpeg`/`ffprobe` | `ThumbnailGenerationService`, `VideoProcessingService` | Paths configurable via `FFMPEG_PATH` / `FFPROBE_PATH`. **Hard runtime requirement** — these binaries must exist in the Lambda layer / container. |
| `sharp` ^0.34 | `ThumbnailGenerationService` | Image transforms; native binary varies by platform. Lambda packaging must target Linux x64/arm64. |
| `stripe` ^17 | (declared dependency; used by inactive subtree code) | Not wired into `AppModule` today. |
| `dotenv` | `main.ts` | Env loading for the standalone server. SST resources are read separately. |
| SST `Resource` (dynamic import) | `DatabaseModule`, `AuthModule` | When deployed via SST, secrets (`MONGODB_URI`, `JWT_SECRET`) are read from the Resource binding before falling through to env. |

### Downstream (consumers)

In-tree:

- **`@stoked-ui/media`** (`packages/sui-media`) — primary client. `MediaApiClient`, `UploadClient`, `MediaApiProvider`, and the `useMedia*` hooks call this service. The Next.js App Router proxy `createMediaHandler` (`src/server/next-handler.ts`) is the recommended way to keep the API key out of browser bundles.
- **`docs/`** — marketing showcase, MDX examples (`docs/data/media/docs/*`), and product detail pages indirectly consume this API via `@stoked-ui/media`.
- **Host apps** (external) — any application that mounts `<MediaApiProvider>` against a deployed instance.

### External contracts that must hold

1. **HTTP route shape.** Adding/removing/renaming any route under `/media`, `/uploads`, or `/auth`, or changing the prefix away from `/v1`, is a breaking change for the browser client and for the Next.js proxy's catch-all (`app/api/sui-media/[[...sui]]/route.ts`).
2. **DTO field names.** `CreateMediaDto`, `UpdateMediaDto`, `QueryMediaDto`, `MediaResponseDto`, `PaginatedMediaResponseDto`, `InitiateUploadDto`, `InitiateUploadResponseDto`, `UploadStatusResponseDto`, `PartCompletionDto`/`PartCompletionResponseDto`, `CompleteUploadResponseDto`, `ActiveUploadsResponseDto`, `PresignedUrlDto`, `ExtractMetadataResponseDto`, `GenerateThumbnailDto`/`ThumbnailResponseDto`, `GenerateSpriteSheetDto`/`SpriteSheetResponseDto` are mirrored by `@stoked-ui/common`/`@stoked-ui/common-api` types and re-exported through `@stoked-ui/media`.
3. **Multipart bounds.** Default chunk size is **10 MiB** (`UploadsService::DEFAULT_CHUNK_SIZE`); S3 minimum is 5 MiB; `MAX_URLS_PER_REQUEST = 50`; sessions expire in **7 days** (`SESSION_EXPIRATION_DAYS`). The browser `UploadClient` enforces matching bounds (5 MiB ≤ chunkSize ≤ 100 MiB; 1–50 partNumbers per request). Loosening the API side without coordinating breaks both sides.
4. **MIME regex.** `InitiateUploadDto.contentType` matches `/^(video|image)\/[a-z0-9.+-]+$/`. Loosening to other types (e.g. audio) is a coordinated change with `@stoked-ui/media` and `@stoked-ui/common-api`.
5. **Auth header semantics.** Production: `Authorization: Bearer <jwt>` only. Dev: `x-user-id` header / `?userId=` query also accepted. The browser client and proxy assume this.
6. **Soft-delete default.** `DELETE /media/:id` is a soft-delete unless `?hardDelete=true`. `POST /media/:id/restore` recovers soft-deleted records. Inverting this default is a breaking change.
7. **Public route.** `GET /media/api/info` is the only `/media/*` route that does not require authentication. Locking it down breaks the docs-site "API info" surface.
8. **JWT secret resolution order.** SST `Resource` first, then env. Tests and dev fall back to `'dev-secret-change-me'`. Producing tokens in any other order silently invalidates issued tokens.
9. **CORS allow-list.** Standalone server (`app.ts`) reads `ALLOWED_ORIGINS` (comma-separated) and falls back to `http://localhost:5199,http://localhost:3000,https://sui.stokd.cloud,https://consulting.stokd.cloud,https://brianstoker.com`; any `http(s)://localhost:<port>` origin is additionally allowed when not in production (the dev branch keys off `NODE_ENV !== 'production'` **and** `SST_STAGE` not `production`/`prod`). The Lambda path (`lambda.bootstrap.ts`) uses a hand-rolled OPTIONS/HEAD short-circuit that runs before NestFactory. Removing either is a regression for the docs site at port 5199 and for any host app.
10. **OpenAPI artifact.** `openapi:export` writes the spec under `packages/sui-media-api/docs/`. The `@stoked-ui/media` client and any external SDK can be regenerated from this artifact; breaking changes must be reflected in the next export.

---

## 6. Key Source Files

| File | Why it matters |
|---|---|
| `src/app.module.ts` | The authoritative wiring of the active modules (`Auth`, `Database`, `Media`, `Health`, `Uploads`). Anything not imported here is dormant. |
| `src/main.ts` | Standalone-server bootstrap; mutes `console.log/info/debug/trace` in production. |
| `src/app.ts` | `Server` class: NestFactory, `cookie-parser`, dynamic CORS, global prefix, `setupSwaggerUI`. Listens on `PORT || 3001`. |
| `src/lambda.bootstrap.ts` / `src/lambda.ts` / `lambda.entry.ts` | Lambda handler. Pre-bootstrap OPTIONS/HEAD path, 50 s self-timeout, `serverlessExpress` binary content-type allow-list (`image/*`, `video/*`, `audio/*`, `application/octet-stream`). |
| `src/swagger.config.ts` | Single source of truth for the OpenAPI document — title, contact, license, servers, Bearer-JWT auth, tags. Used by both the runtime UI and the offline export script. |
| `src/database/database.module.ts` | `MongooseModule.forRootAsync` resolves URI from SST `Resource.MONGODB_URI` → `ConfigService` → env → `mongodb://localhost:27017/stoked-media`. Registers the four `@stoked-ui/common-api` feature schemas. |
| `src/auth/auth.module.ts` | JWT module factory with the SST-aware secret resolution; exports `AuthService`, `JwtModule`, `PassportModule` for downstream guards. |
| `src/auth/auth.service.ts` | Register/login/validate. **In-memory `Map<string, User>`** today; domain-based role auto-assignment via `AUTH_AUTO_DOMAINS` (code default `['stokd.cloud','sui.stokd.cloud','consulting.stokd.cloud','brianstoker.com']` → `admin`, everything else → `client`). Note: `.env.example` ships a *different* sample value (`stokedconsulting.com,stoked-ui.com,brianstoker.com`); the code default applies only when the env var is unset. |
| `src/auth/auth.controller.ts` | `RegisterDto`/`LoginDto` validation + `/auth/register`, `/auth/login`, `/auth/me`. |
| `src/auth/strategies/jwt.strategy.ts` | Passport JWT strategy. |
| `src/auth/guards/{jwt-auth,roles}.guard.ts` + `src/auth/decorators/roles.decorator.ts` | Bearer-token guard and `@Roles()` enforcement. |
| `src/media/media.module.ts` | Imports `DatabaseModule`, `S3Module`, `AuthModule`; provides + exports the four media services + `AuthGuard`. |
| `src/media/media.controller.ts` (596 lines) | Every public media route. Full Swagger annotations. The `generate-thumbnail` and `generate-sprites` handlers are placeholders that throw `BadRequestException('… requires database integration (Work Item 3.1)')` until the Mongo-backed service is wired. |
| `src/media/media.service.ts` | CRUD + filter/search/sort/pagination over an **in-memory `Map`**. The service is structured to be swappable for a Mongoose-backed implementation — every consumer goes through this service. |
| `src/media/guards/auth.guard.ts` | Bearer-token verify + dev-only `x-user-id`/`?userId=` fallback. Sets `request.user`. |
| `src/media/decorators/current-user.decorator.ts` | `@UserId()` param decorator used by `update`, `remove`, `restore`. |
| `src/media/dto/{create,update,query,media-response,extract-metadata,generate-thumbnail}.dto.ts` + `dto/index.ts` | Validation schemas; the `@ApiProperty` annotations drive the OpenAPI spec. |
| `src/media/entities/media.entity.ts` | The runtime entity wrapper used by `MediaService` (currently in-memory; mirrors the Mongo schema). |
| `src/media/thumbnail-generation.service.ts` | `fluent-ffmpeg` thumbnail extraction at a timestamp; sprite-sheet builder with WebVTT cues; `sharp` post-processing; uploads to S3 under `media/<id>/…`. `ThumbnailSize` enum: SMALL 160×90 / MEDIUM 320×180 / LARGE 640×360. |
| `src/media/metadata/metadata-extraction.service.ts` | MIME-routed extraction (video / audio / image), with timeouts and process-level error tracking. |
| `src/media/metadata/video-processing.service.ts` | `ffprobe`-based video and audio metadata extraction. |
| `src/uploads/uploads.module.ts` | Wires `S3Module` + `DatabaseModule` into the upload surface. |
| `src/uploads/uploads.controller.ts` | The eight upload endpoints. Uses `(req as any).user?.id || .sub || 'anonymous'` to resolve the actor — a small hidden contract: when the route runs without auth (dev), `'anonymous'` is the owning user id. |
| `src/uploads/uploads.service.ts` | The core upload state machine. Defines `UploadPart`, `UploadPartStatus`, `UploadSessionStatus`, `DEFAULT_CHUNK_SIZE = 10 MiB`, `MAX_URLS_PER_REQUEST = 50`, `SESSION_EXPIRATION_DAYS = 7`. |
| `src/uploads/dto/index.ts` | All upload DTOs (request + response). The `InitiateUploadDto.contentType` regex `^(video\|image)\/[a-z0-9.+-]+$` is the supported-mime contract. |
| `src/s3/s3.module.ts` / `src/s3/s3.service.ts` | AWS SDK v3 client wrapper. Region defaults to `AWS_REGION` env or `us-east-1`. The same `S3Service` provides both file-level operations and multipart presigning to keep `UploadsService` simple. |
| `src/health/health.controller.ts` | `GET /health` returns `{ status, timestamp, service, version }` — used by ALB / k8s probes. |
| `src/openapi.module.ts` | Optional standalone module for generating OpenAPI in isolation (used by the export script). |
| `src/performance/{caching.middleware.ts,metadata-extraction.optimization.ts}` | HTTP caching middleware (untested) and metadata-extraction perf helpers. Not wired into `AppModule` today — opt-in. |
| `scripts/export-openapi.ts` / `scripts/validate-openapi.ts` / `scripts/init-db.ts` | Tooling. The export/validate pair is what produces the artifact under `packages/sui-media-api/docs/`. |
| `test/uploads-e2e.spec.ts` | The only e2e suite; covers full upload, resume, abort, active-list, duplicate, and error paths. |
| `Dockerfile` / `docker-compose.yml` / `deploy.sh` / `k8s/*` | Self-hosted deploy paths. |
| `.env.example` | Authoritative list of expected env vars. |

### Dormant code (present but not wired)

`src/blog/`, `src/clients/`, `src/users/`, and `src/blog/dto/` are leftovers from earlier iterations. As of the `21d04d615f refactor: remove business APIs from media stack` commit they are **empty, untracked directories** (`git ls-files` returns nothing for any of them) and nothing in those folders is imported by `AppModule`. They must not grow new endpoints (per the media-API boundary rule in `AGENTS.md` / `CLAUDE.md` / `.stokd/meta/SC_CONTEXT.md` — business/domain APIs belong in `docs/pages/api/*`). Because they are now empty and git-untracked, they can simply be deleted from disk with no contract impact.

---

## 7. Change Impact

When this module changes, the following typically need validation.

### Always validate

- **Build & types:** `pnpm --filter @stoked-ui/media-api build` and `pnpm --filter @stoked-ui/media-api type-check`. The build emits `dist/` consumed by Lambda packaging.
- **Unit tests:** `pnpm --filter @stoked-ui/media-api test` (rootDir `src`, regex `*.spec.ts`). See `.stokd/meta/packages/sui-media-api/SC_TEST.md` for the inventory and known shallow areas.
- **E2E:** `pnpm --filter @stoked-ui/media-api test:e2e` against `test/uploads-e2e.spec.ts` for any change to `UploadsService` or `S3Service`.
- **OpenAPI:** `pnpm --filter @stoked-ui/media-api openapi:export && pnpm --filter @stoked-ui/media-api openapi:validate` whenever a DTO, route, decorator, tag, or `swagger.config.ts` setting changes. The exported artifact is what the browser client and host SDKs target.
- **Browser client type-check:** `pnpm --filter @stoked-ui/media typescript`. DTO drift surfaces here first.

### Risk-specific checklists

| Change | What to validate |
|---|---|
| Add/rename/remove a route under `/media`, `/uploads`, `/auth` | OpenAPI export + diff; type-check `@stoked-ui/media`; verify `MediaApiClient`/`UploadClient` and the Next.js proxy `createMediaHandler` still compile and route correctly. |
| Change `API_PATH_PREFIX` semantics or default | Both `app.ts` (`'/v1'`) and `lambda.bootstrap.ts` (`'/api'`) defaults must remain consistent with deployed infra (`api.sui.stokd.cloud/v1`, ALB rules, SST config). |
| Edit `InitiateUploadDto` (regex, chunk-size bounds, etc.) | Cross-check against `UploadClient` in `@stoked-ui/media` and against `@stoked-ui/common-api`. Re-run e2e. The `5 MiB ≤ chunkSize ≤ 100 MiB` and `1–50 parts/request` bounds are protocol-level. |
| Modify `UploadsService` state machine | Run `uploads.service.spec.ts` and `test/uploads-e2e.spec.ts`. Check session expiry (`SESSION_EXPIRATION_DAYS = 7`) still matches S3 multipart expiration. |
| Modify `S3Service` (presigning, multipart commands) | Run `s3.service.spec.ts`. Verify `MULTIPART_URL_EXPIRY` (1 hour) still aligns with the client retry/refresh strategy. |
| Replace `MediaService` in-memory store with Mongo | Audit every controller path that returns `MediaResponseDto`; ensure soft-delete semantics, owner authorization, and view-count side-effects survive. The placeholder branches in `generate-thumbnail`/`generate-sprites` (which currently throw) should be activated as part of the same change. |
| Replace `AuthService` in-memory user store with a `User` collection | The domain-based auto-role logic (`AUTH_AUTO_DOMAINS`) and the password-hash comparison must port verbatim. JWT payload shape (`sub`/`email`/`role`/`name`) is consumed by `AuthGuard` and `@UserId()` — do not change. |
| Edit `media/guards/auth.guard.ts` | The dev-only `x-user-id` / `?userId=` fallback is a documented contract for local tooling. Removing it without notice breaks docs-site dev (port 5199) and many tests. |
| Edit `swagger.config.ts` | Re-export the OpenAPI artifact. Servers list (`localhost:3001/v1`, `api.sui.stokd.cloud/v1`) and the `JWT-auth` security scheme name are referenced by every controller's `@ApiBearerAuth('JWT-auth')`. |
| Edit `app.ts` CORS handling | Verify the docs site at `http://localhost:5199` still works in dev (allowed via both the default list and the localhost branch); verify production origins (`sui.stokd.cloud`, `consulting.stokd.cloud`, `brianstoker.com`) and any custom `ALLOWED_ORIGINS`. The dev-localhost branch is gated on `NODE_ENV`/`SST_STAGE` — do not let production fall into it. |
| Edit `lambda.bootstrap.ts` | OPTIONS/HEAD short-circuit must remain (it runs before NestFactory bootstrap). The 50 s self-timeout exists to surface hangs before API Gateway's 60 s ceiling. |
| Bump `@nestjs/*` major | Coordinate `@nestjs/swagger`, `@nestjs/passport`, `@nestjs/mongoose` lock-step. Re-run e2e and the OpenAPI export. |
| Bump `mongoose` major | Re-test schema features registered from `@stoked-ui/common-api`; check connection-string compatibility. |
| Bump `@aws-sdk/client-s3` major | Re-test multipart commands and `getSignedUrl` for both `GetObject` and `UploadPart`. |
| Bump `sharp` / `fluent-ffmpeg` / system `ffmpeg` | Re-test `ThumbnailGenerationService` and `MetadataExtractionService` end-to-end (the spec files skip the binary paths). For Lambda, rebuild any custom layer / image. |
| Edit `DatabaseModule` connection options | Reduced timeouts (`5 s`) are deliberate for serverless cold-start behavior. Increasing them affects Lambda cold-start budgets; reducing further risks false-negative connect failures. |
| Edit `JwtModule` factory | The SST → ConfigService → env → `'dev-secret-change-me'` order is the silent contract. Any reorder invalidates issued tokens for one of the environments. |

### Smoke tests after non-trivial changes

1. `pnpm --filter @stoked-ui/media-api build && pnpm --filter @stoked-ui/media-api type-check && pnpm --filter @stoked-ui/media-api test && pnpm --filter @stoked-ui/media-api test:e2e` — fastest local guard.
2. `pnpm --filter @stoked-ui/media-api openapi:export && pnpm --filter @stoked-ui/media-api openapi:validate` and review the diff under `packages/sui-media-api/docs/`.
3. `pnpm --filter @stoked-ui/media-api dev` (port 3001), then from the docs site (port 5199 — `pnpm docs:dev`) exercise:
   - `useMediaList()` against `GET /v1/media` (provide a JWT; in dev, `x-user-id` works).
   - `useMediaUpload()` end-to-end: `POST /v1/uploads/initiate` → upload one part to S3 via the presigned URL → `POST /v1/uploads/:id/parts/1/complete` → `POST /v1/uploads/:id/complete`.
   - `useResumeUpload()`: kill the upload mid-way, refresh, confirm `GET /v1/uploads/active` and `GET /v1/uploads/:id/status` resume the session.
   - `useMediaItem()` on the freshly-created record, then `useMediaDelete()` (soft-delete) and `POST /v1/media/:id/restore`.
4. Hit `GET /v1/api/docs` in the browser; confirm the Bearer-JWT widget authenticates and the four tag groups render.
5. For Lambda changes: deploy via SST to a stage, hit `GET /api/health` and one upload round-trip through the API Gateway URL; confirm cold-start logs from `lambda.bootstrap.ts` ("Bootstrap completed in …ms").
