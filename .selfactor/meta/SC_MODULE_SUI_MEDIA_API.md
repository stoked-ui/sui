# SC_MODULE: sui-media-api

> **Generated:** 2026-03-21 | **Meta version:** 0.2.0
> **Package:** `@stoked-ui/media-api`
> **Location:** `packages/sui-media-api/`

---

## Module Name

`sui-media-api` — the standalone NestJS REST API service that backs all media component data operations in the Stoked UI platform.

---

## Responsibility

`sui-media-api` is the dedicated server-side service for media asset management. Its design intent is to be the **sole backend** for media-component endpoints — a hard boundary enforced in [`CLAUDE.md`](../../CLAUDE.md): non-media business routes (products, clients, licenses, invoices, users) are explicitly prohibited here and must live under `docs/pages/api/*`.

Primary responsibilities:

1. **Media CRUD** — create, read, update, soft-delete, hard-delete, and restore media records (image, video, album). Owner-scoped authorization enforces `media.author === userId` on all mutating operations.
2. **Resumable multipart S3 uploads** — orchestrate the full S3 multipart lifecycle: initiate → presigned part URLs → per-part completion → sync-with-S3 → finalize (or abort). Supports resume after network interruption with 7-day session expiry.
3. **Metadata extraction** — ffprobe/ffmpeg-powered extraction of video codec, bitrate, framerate, duration, dimensions, moov-atom position, audio codec/bitrate/channels, and image EXIF/dimensions. Child processes are spawned with a 60-second timeout.
4. **Thumbnail and sprite sheet generation** — `ThumbnailGenerationService` wraps `fluent-ffmpeg` + `sharp` for frame extraction and sprite assembly; endpoints are defined but not yet wired to a persistent media record (stub, Work Item 3.1).
5. **JWT authentication** — email+password register/login; role assignment via trusted email domains; Passport JWT strategy validation.
6. **S3 operations** — presigned URL generation, object HEAD checks, single and bulk deletes, CloudFront/S3/path-style URL key extraction.
7. **Dual deployment targets** — runs as a standard Express/NestJS HTTP server (local/Docker/Kubernetes) and as an AWS Lambda handler via `@codegenie/serverless-express`.

---

## Public Interfaces / Entry Points

### Runtime Entry Points

| Mode | File | Description |
|------|------|-------------|
| Standard server | `src/main.ts` → `src/app.ts` (`Server` class) | Bootstraps NestJS, configures CORS, sets global prefix from `API_PATH_PREFIX` (default `/v1`), mounts Swagger UI at `/api/docs`, listens on `PORT` (default `3001`) |
| AWS Lambda | `lambda.entry.ts` → `src/lambda.ts` → `src/lambda.bootstrap.ts` | Exports `handler`; wraps NestJS/Express via `@codegenie/serverless-express`; fast-paths OPTIONS/HEAD before cold-start bootstrap for CORS; 50-second internal timeout guard |

### REST Controllers

All routes are prefixed by the global prefix (`/v1` for server, `/api` for Lambda).

#### `MediaController` — `src/media/media.controller.ts`

Base path: `{prefix}/media`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `GET` | `/media/api/info` | None | API name, version, in-memory media count |
| `GET` | `/media` | JWT | List media — filters: `mediaType`, `mime`, `uploadedBy`, `publicity`, `rating`, `mediaClass`, `uploadSessionId`, `dateFrom`, `dateTo`, `search`, `tags`; sort by any field with `-` prefix for descending; offset + cursor pagination |
| `GET` | `/media/:id` | JWT | Fetch single item; increments `views` counter |
| `POST` | `/media` | JWT | Create media record (called after upload completes); body: `CreateMediaDto` |
| `PATCH` | `/media/:id` | JWT + owner | Update metadata; enforces `author === userId`; body: `UpdateMediaDto` |
| `DELETE` | `/media/:id` | JWT + owner | Soft delete (default) or hard delete (`?hardDelete=true`); hard delete removes S3 main file + all thumbnails |
| `POST` | `/media/:id/restore` | JWT + owner | Restore a soft-deleted record |
| `POST` | `/media/:id/extract-metadata` | None | Trigger ffprobe extraction; updates entity fields in-place (`codec`, `bitrate`, `framerate`, `duration`, `width`, `height`, `audioCodec`, `exifData`, etc.) |
| `POST` | `/media/:id/generate-thumbnail` | None | **Stub** — always throws `BadRequestException` (Work Item 3.1) |
| `POST` | `/media/:id/generate-sprites` | None | **Stub** — always throws `BadRequestException` (Work Item 3.1) |

#### `UploadsController` — `src/uploads/uploads.controller.ts`

Base path: `{prefix}/uploads`

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/uploads/initiate` | Start multipart upload session; returns `InitiateUploadResponseDto` with first batch of presigned part URLs; default chunk size 10 MB |
| `GET` | `/uploads/:sessionId/status` | Get session state + optionally refresh presigned URLs for pending parts (`?includeUrls=false` to skip) |
| `POST` | `/uploads/:sessionId/sync` | Re-sync session against actual S3 state (for resume after interruption) |
| `POST` | `/uploads/:sessionId/urls` | Request up to 50 presigned URLs for specific part numbers |
| `POST` | `/uploads/:sessionId/parts/:partNumber/complete` | Record a completed part's ETag |
| `POST` | `/uploads/:sessionId/complete` | Finalize multipart upload; assembles S3 object; creates media document |
| `DELETE` | `/uploads/:sessionId` | Abort upload; cleans up S3 multipart parts |
| `GET` | `/uploads/active` | List current user's in-progress upload sessions |

#### `AuthController` — `src/auth/auth.controller.ts`

Base path: `{prefix}/auth`

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/auth/register` | Register with email + password + name; returns JWT + user object |
| `POST` | `/auth/login` | Authenticate; returns JWT + user object |
| `GET` | `/auth/me` | Return current user profile (JWT required via `JwtAuthGuard`) |

#### `HealthController` — `src/health/health.controller.ts`

Base path: `{prefix}/health`

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/health` | Returns `{ status: "ok", timestamp, service, version }` — no auth, used by K8s liveness probe and Lambda warm-up |

### OpenAPI / Swagger

- **Runtime UI:** `/api/docs` — served by `setupSwaggerUI()` in `src/swagger.config.ts`
- **Published spec:** `docs/openapi.json`, `docs/openapi.yaml` — regenerate with `pnpm openapi:export`
- **Postman collection:** `docs/postman-collection.json`
- **Declared servers:** `http://localhost:3001/v1` (dev) and `https://api.stoked-ui.com/v1` (prod)
- **Auth scheme:** Bearer JWT (`JWT-auth` security scheme in Swagger)

---

## Products

No product documentation files were specified for this generation. Based on the `CLAUDE.md` boundary rule, this module exclusively backs the **`sui-media`** product. `sui-editor`, `sui-timeline`, `sui-file-explorer`, and consulting-site product docs do not reference this module.

---

## Views

This module is a pure API server — it renders no views. It materially shapes the following views from `SC_VIEWS.md` by providing their data:

| View (SC_VIEWS.md ref) | Dependency on this module |
|------------------------|--------------------------|
| **7.1 MediaViewer** | `GET /media/:id` — loads individual item; `views` counter increment fires here |
| **7.2 MediaGallery** | `GET /media` — paginated listing when `source.endpoint` mode is used |
| **7.3 MediaCard** | Thumbnail + sprite URLs stored on `MediaEntity` served via S3/CDN; delete action calls `DELETE /media/:id` |
| **7.4 VideoProgressBar** | `scrubberSpriteConfig` object on the entity (totalFrames, frameWidth, interval) drives sprite frame math |
| **1.2 Product Showcase — Media** | `AdvancedShowcase` may fetch live media items via `GET /media` |
| **1.3 Media Product Docs** | Live demos embedding `MediaCard`/`MediaViewer` pull data through this API in authenticated contexts |

---

## Integration Points

### Upstream (consumes)

| Dependency | Contract |
|------------|---------|
| **AWS S3** (`@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`) | All file storage: multipart upload orchestration, presigned URL generation, object existence (HEAD), single and bulk delete. Bucket: `AWS_S3_BUCKET`. Region: `AWS_REGION`. See `src/s3/s3.service.ts`. |
| **MongoDB / Mongoose** (`mongoose`, `@nestjs/mongoose`) | Persistent store for upload sessions and media records. URI: `MONGODB_URI` env or SST `Resource.MONGODB_URI`. Schemas from `@stoked-ui/common-api`: `VideoFeature`, `ImageFeature`, `FileFeature`, `UploadSessionFeature`. See `src/database/database.module.ts`. |
| **`@stoked-ui/common-api`** | Provides Mongoose schema feature registrations consumed by `DatabaseModule`. Schema changes there propagate directly here. |
| **`@stoked-ui/common`** | Shared types and utilities. |
| **SST (Ion)** | Optional secrets injection — `Resource.MONGODB_URI` read in `database.module.ts`, wrapped in try/catch; falls back to env var if not available. |
| **ffmpeg / ffprobe** | System binaries invoked via `fluent-ffmpeg` for video/audio metadata extraction (`src/media/metadata/video-processing.service.ts`) and thumbnail/sprite generation. Paths: `FFMPEG_PATH` / `FFPROBE_PATH`. Must exist in the deployment environment (Lambda layer or Docker image). |
| **`sharp`** | Image resizing and sprite sheet assembly in `src/media/thumbnail-generation.service.ts`. Native binary — must be present in Lambda layer or Docker image. |
| **Redis** | Caching backend for `src/performance/caching.middleware.ts`. URI: `REDIS_URL`. **Not yet wired into `AppModule`** — middleware exists but is inactive. |
| **Stripe** | Listed as a dependency in `package.json` — not yet wired into any active endpoint. |

### Downstream (consumed by)

| Consumer | What it uses |
|----------|-------------|
| `packages/sui-media` React components | Full REST API — CRUD, list, delete |
| `docs/` Next.js app upload flows | `POST /uploads/initiate` → part completions → `POST /uploads/:id/complete` |
| AWS Lambda runtime | `handler` export from `lambda.entry.ts` |
| Kubernetes cluster | HTTP on port 3001; `GET /health` for liveness/readiness |

### Auth Contract

- Most endpoints require `Authorization: Bearer <jwt>` header.
- `AuthGuard` (`src/media/guards/auth.guard.ts`) — validates JWT; extracts `userId` via `@UserId()` decorator (`src/media/decorators/current-user.decorator.ts`).
- `JwtAuthGuard` + `JwtStrategy` (`src/auth/guards/jwt-auth.guard.ts`, `src/auth/strategies/jwt.strategy.ts`) — Passport strategy; validates against `JWT_SECRET`.
- `RolesGuard` + `@Roles()` (`src/auth/guards/roles.guard.ts`, `src/auth/decorators/roles.decorator.ts`) — RBAC decorator for future fine-grained access.
- Roles: `admin | client | agent | reader | author | editor`.
- Auto-admin domains: `AUTH_AUTO_DOMAINS` env (default: `stokedconsulting.com`, `stoked-ui.com`, `brianstoker.com`) — emails from these domains get `admin` role on registration.

### CORS

Configured in `Server.start()` (`src/app.ts`). Origins from `ALLOWED_ORIGINS` env (comma-separated). Dev mode allows all `localhost:*`. Lambda handler returns CORS headers for OPTIONS/HEAD immediately before NestJS bootstrap (prevents cold-start CORS failures).

---

## Key Source Files

| File | Why it matters |
|------|---------------|
| `src/app.ts` | `Server` class — CORS policy, global prefix (`/v1`), Swagger UI mount, port binding |
| `src/lambda.bootstrap.ts` | Lambda entry — serverless-express wrapper, OPTIONS/HEAD fast path before bootstrap, 50-second internal timeout guard |
| `src/app.module.ts` | Root module — only place to add/remove top-level NestJS modules |
| `src/media/entities/media.entity.ts` | Canonical data model. All fields: video codec/bitrate/framerate/container/moov-atom, audio codec/bitrate/channels, image EXIF, scrubber sprite config, processing status, soft-delete timestamps. Maps to `ExtendedMediaItem` in `sui-media`. |
| `src/media/media.controller.ts` | All `/media/*` REST routes with full Swagger/OpenAPI decorators |
| `src/media/media.service.ts` | Business logic: CRUD, owner authorization, S3 hard-delete, metadata extraction orchestration. **Currently in-memory `Map` storage** — MongoDB wiring is pending. |
| `src/uploads/uploads.controller.ts` | Full multipart upload lifecycle routes |
| `src/uploads/uploads.service.ts` | Upload session state machine (`pending → in_progress → completed/aborted/expired`); default chunk size 10 MB; session expiry 7 days; up to 50 presigned URLs per request. **In-memory session store** — persistence pending. |
| `src/s3/s3.service.ts` | All AWS S3 SDK operations: `createMultipartUpload`, `getPresignedUploadUrls`, `completeMultipartUpload`, `abortMultipartUpload`, `listParts`/`listAllParts`, `putObject`, `deleteFile`, `deleteFiles`, `deleteMediaAndThumbnails`, `extractS3Key` (handles CloudFront, virtual-hosted, path-style URLs) |
| `src/auth/auth.service.ts` | JWT issuance, bcrypt (cost 10) password hashing, domain-based role assignment. **In-memory user store** — no User Mongoose model yet. |
| `src/auth/auth.controller.ts` | `POST /auth/register`, `POST /auth/login`, `GET /auth/me` |
| `src/auth/strategies/jwt.strategy.ts` | Passport JWT strategy — validates `JWT_SECRET`, calls `AuthService.validateToken` |
| `src/database/database.module.ts` | Mongoose async factory with SST secret fallback; registers `VideoFeature`, `ImageFeature`, `FileFeature`, `UploadSessionFeature` from `@stoked-ui/common-api` |
| `src/media/metadata/metadata-extraction.service.ts` | Orchestrates ffprobe subprocess via `spawnAsync` (60s timeout); maps raw output to `ExtractedMetadata`; updates `MediaEntity` in-place |
| `src/media/metadata/video-processing.service.ts` | ffprobe invocation; returns typed `VideoMetadata` / `AudioMetadata` |
| `src/media/thumbnail-generation.service.ts` | `generateThumbnail(videoPath, timestamp, size, bucket, keyPrefix)` → `ThumbnailResult`; `generateSpriteSheet(...)` → `SpriteSheetResult` with VTT-compatible `SpriteConfig`; uses ffmpeg + sharp |
| `src/performance/caching.middleware.ts` | Redis `@CacheResponse()` middleware — designed but not yet wired into `AppModule` |
| `src/swagger.config.ts` | `createSwaggerConfig()` — single source of truth for OpenAPI metadata; used by both runtime and `scripts/export-openapi.ts` |
| `docs/openapi.json` | Generated OpenAPI 3.x spec — authoritative API contract for external consumers; update with `pnpm openapi:export` |
| `k8s/` | Kubernetes manifests: 3-replica rolling-update Deployment (namespace `stoked`), HPA, Service, Ingress, ConfigMap, Secret, ServiceAccount; Prometheus scrape annotations on port 3001 |

---

## Known Gaps (as of 2026-03-21)

| Gap | Files affected |
|-----|---------------|
| **In-memory media store** — records lost on restart, inconsistent across Lambda invocations | `src/media/media.service.ts` |
| **In-memory user store** — no User collection; users lost on restart | `src/auth/auth.service.ts` |
| **In-memory upload session store** — sessions lost on restart | `src/uploads/uploads.service.ts` |
| **Thumbnail/sprite endpoints are stubs** — always throw `BadRequestException` | `src/media/media.controller.ts` lines 471–508, 548–595 |
| **Redis caching middleware inactive** — exists but not registered in `AppModule` | `src/performance/caching.middleware.ts` |

---

## Change Impact

| Change | What to validate |
|--------|-----------------|
| `MediaEntity` fields added/removed | Update `CreateMediaDto`, `UpdateMediaDto`, `QueryMediaDto`, `MediaResponseDto`, `PaginatedMediaResponseDto` in `src/media/dto/`. Regenerate spec: `pnpm openapi:export`. Alert `sui-media` component consumers of shape change. |
| `S3Service` method signatures | Affects `MediaService.remove()` (hard delete path) and all of `UploadsService` (multipart lifecycle). Run `src/s3/s3.service.spec.ts` and `src/uploads/uploads.service.spec.ts`. |
| `AuthGuard` / JWT secret rotation | All protected endpoints break. Run full test suite: `pnpm test` + e2e `test/uploads-e2e.spec.ts`. No token revocation list exists — all live tokens are invalidated on secret change. |
| `@stoked-ui/common-api` schema changes | `DatabaseModule` re-registers schemas on next deploy. Mongoose schema/entity field mismatch causes silent nulls or runtime validation errors. |
| `lambda.bootstrap.ts` changes | Affects Lambda cold-start time and CORS preflight behavior. Verify OPTIONS returns 200 without full NestJS bootstrap. |
| ffmpeg/ffprobe binary changes | Lambda layer or Docker image must be rebuilt and redeployed. Verify `FFMPEG_PATH` / `FFPROBE_PATH` env vars point to the correct binary location in new environment. |
| Adding a new NestJS module | Register in `src/app.module.ts` `imports` array. Add Swagger tag in `src/swagger.config.ts`. Regenerate `docs/openapi.json`. Verify it does not introduce non-media business routes (CLAUDE.md boundary). |
| Port / prefix changes | `PORT` (default `3001`), `API_PATH_PREFIX` (default `/v1` for server, `/api` for Lambda). Update docs site component base URLs and Swagger server declarations in `src/swagger.config.ts`. |
| CORS origin changes | Update `ALLOWED_ORIGINS` env in deployment config. Lambda handler `lambda.bootstrap.ts` uses `origin: true` (allow all) at Lambda level; tighten if needed. |
| Deployment environment change | Verify `ALLOWED_ORIGINS`, `JWT_SECRET`, `AWS_S3_BUCKET`, `MONGODB_URI`, `FFMPEG_PATH` in new environment's secrets/config. Reference `.env.example` for complete variable list. |
