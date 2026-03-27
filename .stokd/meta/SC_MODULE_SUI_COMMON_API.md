# SC_MODULE — sui-common-api

> **Generated:** 2026-03-17 | **Meta version:** 0.2.0
> **Package:** `@stoked-ui/common-api` v0.1.0
> **Location:** `packages/sui-common-api`

---

## Module Name

`@stoked-ui/common-api` — Server-side Mongoose schemas, NestJS decorators, and validated DTOs shared across all backend API packages.

---

## Responsibility

This is the shared data model layer for all Stoked UI backend services. It provides:

1. **Mongoose schemas** — 12 model classes defining the MongoDB document structure for every domain entity (users, clients, products, licenses, invoices, media files, blog posts, upload sessions)
2. **NestJS schema decorator** — `@StdSchema()` standardizes schema creation with consistent `_id → id` transforms, timestamps, and virtuals
3. **Upload DTOs** — Request/response classes with `class-validator` decorators for the S3 multipart upload flow, including Swagger documentation
4. **Content scoring** — `BaseModel` provides a shared like/dislike/view/score system inherited by all content entities
5. **Access control primitives** — Per-document `canAccess`, `canEdit`, `denyAccess` arrays and `publicity` enum on every content model
6. **Re-exported domain types** — `PublicityType` and `EmbedVisibilityType` from `@stoked-ui/common` for backend convenience

Design intent: centralize all MongoDB schema definitions so backend packages never duplicate model code. Models defined here are registered via `MongooseModule.forFeature()` in consumer NestJS modules. Nothing in this package imports from other `@stoked-ui/*` packages except `@stoked-ui/common` (peer dependency for shared types).

---

## Public Interfaces / Entry Points

### Main barrel: `src/index.ts`

#### Models (`src/models/`)

Each model exports a class, a Mongoose schema (`SchemaFactory.createForClass()`), a `ModelDefinition` feature constant (for `MongooseModule.forFeature()`), and a `HydratedDocument` type alias.

| Export | Source | Description |
|--------|--------|-------------|
| `BaseModel`, `BaseModelSchema` | `src/models/base.model.ts` | Abstract base — `likes[]`, `dislikes[]`, `views`, `uniqueViews`, `score`, `publicity`, `deleted`, `canAccess[]`, `canEdit[]`, `denyAccess[]`, `tokens`. Methods: `like()`, `dislike()`, `view()`, `delete()`, `updateScore()`, `addToSet()`, `removeFromArray()` |
| `File`, `FileSchema`, `FileFeature` | `src/models/file.model.ts` | Extends `BaseModel` — `title`, `description`, `author`, `owners[]`, `tags[]`, `file` (path/URL), `originalName`, `hash`, `size`, `mimeType`, `bucket`, `region`, `rating`, `price` |
| `Image`, `ImageSchema`, `ImageFeature` | `src/models/image.model.ts` | Extends `File` — `width`, `height`, `aspectRatio`, `avatar`, `cover`, `paidThumbnail`, metadata failure tracking. Virtual: `mediaType = "image"` |
| `Video`, `VideoSchema`, `VideoFeature` | `src/models/video.model.ts` | Extends `File` — `duration`, `codec`, `container`, `bitrate`, `moovAtomPosition`, `width`, `height`, `aspectRatio`, `thumbnail`, `thumbs[]`, `paidThumbnail`, `paidPreview`, `scenes[]`, `sceneTimeCodes[]`, scrubber sprite config, stream recording metadata (`recordingSessionId`, `streamPeakViewers`, etc.), playback issue tracking. Virtual: `mediaType = "video"` |
| `Media`, `MediaSchema`, `MediaFeature` | `src/models/media.model.ts` | Extends `File` — unified media abstraction with embed visibility (`public`/`authenticated`/`private`), data source metadata for external imports (Google Photos, OneDrive, Amazon Photos). Complex compound indexes for sorted queries |
| `UploadSession`, `UploadSessionSchema`, `UploadSessionFeature` | `src/models/uploadSession.model.ts` | Multipart upload tracking — `userId`, `uploadId` (S3), `s3Key`, `bucket`, `region`, `filename`, `mimeType`, `totalSize`, `chunkSize`, `totalParts`, `hash`, `status` (pending/in_progress/completed/aborted/expired), `parts[]` array with etag/status, `expiresAt`. Virtuals: `progress`, `completedPartsCount`, `uploadedBytes`. TTL index for auto-cleanup |
| `BlogPost`, `BlogPostSchema`, `BlogPostFeature` | `src/models/blogPost.model.ts` | Extends `File` — `body`, `slug` (unique), `status` (draft/published/archived), `date`, `source` (native/nostr/import), `nostrEventId`, `targetSites[]`, `authors[]`, `image`. Text search indexes |
| `Invoice`, `InvoiceSchema`, `InvoiceFeature` | `src/models/invoice.model.ts` | Billing record — `configId`, `customer`, `startDate`, `endDate`, nested week/task structure. Indexes: customer + date |
| `License`, `LicenseSchema`, `LicenseFeature` | `src/models/license.model.ts` | Subscription license — `key` (unique), `email`, `productId`, `status`, `hardwareId`, `machineName`, Stripe fields (`stripeCustomerId`, `stripeSubscriptionId`), `activatedAt`, `expiresAt`, `gracePeriodDays`, `deactivationCount`, `activationHistory[]`. Multiple lookup indexes |
| `Product`, `ProductSchema`, `ProductFeature` | `src/models/product.model.ts` | Subscription product — `productId`, `name`, `description`, `keyPrefix`, Stripe fields (`stripeProductId`, `stripePriceId`), `price`, `currency`, `licenseDurationDays`, `gracePeriodDays`, `trialDurationDays`, `purchaseUrl` |
| `Client`, `ClientSchema`, `ClientFeature` | `src/models/client.model.ts` | Organization record — `name`, `slug` (unique), `contactEmail`, `active` |
| `User`, `UserSchema`, `UserFeature` | `src/models/user.model.ts` | User account — `email` (unique), `password` (hash), `name`, `role` (admin/client/agent), `client` ref, `agents[]` refs, `aliases[]`, `avatarUrl`, `active` |

#### DTOs (`src/dtos/upload.dto.ts`)

All DTOs use `class-validator` for validation and `@ApiProperty` / `@ApiPropertyOptional` for Swagger documentation.

| Export | Direction | Description |
|--------|-----------|-------------|
| `InitiateUploadDto` | Request | Start multipart upload — `filename`, `mimeType`, `totalSize`, optional `hash`, `chunkSize` |
| `GetMoreUrlsDto` | Request | Request presigned URLs for part numbers (max 50) |
| `PartCompletionDto` | Request | Confirm part upload with `etag` |
| `PresignedUrlDto` | Response | Part number + presigned S3 PUT URL |
| `InitiateUploadResponseDto` | Response | Session ID, uploadId, presigned URLs, expiration |
| `UploadStatusResponseDto` | Response | Upload progress and pending parts |
| `PartCompletionResponseDto` | Response | Progress update after part upload |
| `CompleteUploadResponseDto` | Response | Final response with created media ID and type |
| `ActiveUploadDto` | Response | Single upload session metadata |
| `ActiveUploadsResponseDto` | Response | List of resumable uploads |

#### Decorators (`src/decorators/`)

| Export | Source | Description |
|--------|--------|-------------|
| `StdSchema` | `src/decorators/stdschema.decorator.ts` | Class decorator — merges `DefaultSchemaOptions` with user options, registers via `TypeMetadataStorage.addSchemaMetadata()` |
| `DefaultSchemaOptions` | `src/decorators/defaultSchemaOptions.ts` | Preset: `timestamps: true`, `virtuals: true`, `toJSON`/`toObject` transforms via `swapId()` |
| `swapId` | `src/decorators/defaultSchemaOptions.ts` | Recursive transform — converts `_id → id`, removes `_id`/`__v`, handles nested populated documents |

#### Re-exports from `@stoked-ui/common`

| Export | Description |
|--------|-------------|
| `PublicityType`, `PUBLICITY_TYPES`, `ADMIN_ONLY_PUBLICITY_TYPES`, `ALL_FILTER_PUBLICITY_TYPES` | Content visibility enum and filter sets |
| `isAdminOnlyPublicity`, `isIncludedInAllFilter` | Publicity predicate helpers |
| `EmbedVisibilityType`, `DEFAULT_EMBED_VISIBILITY` | Embed access level enum |
| `PUBLIC_EMBED_VISIBILITY_TYPES`, `AUTHENTICATED_EMBED_VISIBILITY_TYPES` | Embed visibility filter sets |
| `isPublicEmbedVisibility`, `isAuthenticatedEmbedVisibility` | Embed visibility predicate helpers |

---

## Products

No dedicated product docs currently reference this module. It is consumed as backend infrastructure by API packages.

---

## Views

This module is a backend-only package — it does not render any views directly.

**Views from SC_VIEWS.md whose data layer depends on schemas defined here:**

| View | Section | Relationship |
|------|---------|-------------|
| **Clients List** (2.4) | `docs/pages/consulting/clients/index.tsx` | CRUD against `Client` schema |
| **Client Detail** (2.5) | `docs/pages/consulting/clients/[client-slug].tsx` | Reads `Client` by slug |
| **Products Management** (2.6) | `docs/pages/consulting/products/` | CRUD against `Product` schema |
| **Users Management** (2.7) | `docs/pages/consulting/users/` | CRUD against `User` schema |
| **Invoices List** (2.8) | `docs/pages/consulting/invoices/index.tsx` | Reads `Invoice` collection |
| **Invoice Detail** (2.9) | `docs/pages/consulting/invoices/[id].tsx` | Reads single `Invoice` |
| **Licenses Management** (2.13) | `docs/pages/consulting/licenses.tsx` | CRUD against `License` schema |
| **Blog Home** (3.1) | `docs/pages/blog/index.tsx` | Lists `BlogPost` documents |
| **Blog Post** (3.2) | `docs/pages/blog/[slug].tsx` | Reads `BlogPost` by slug |
| **Blog Editor** (3.3–3.5) | `docs/pages/blog/editor/` | CRUD against `BlogPost` schema |
| **MediaGallery** (7.2) | `packages/sui-media/src/components/MediaGallery/` | Reads `Media`/`Video`/`Image` documents |
| **MediaCard** (7.3) | `packages/sui-media/src/components/MediaCard/` | Renders `Video`/`Image` schema fields (publicity, thumbnail, duration, views) |
| **CDN File Browser** (11.1) | `packages-internal/cdn/src/App.jsx` | Upload flow uses `UploadSession` schema |

---

## Integration Points

### Downstream Consumers (depend on `@stoked-ui/common-api`)

| Package | Key Imports | Usage |
|---------|-------------|-------|
| `@stoked-ui/media-api` | `VideoFeature`, `ImageFeature`, `FileFeature`, `UploadSessionFeature` | `MongooseModule.forFeature()` in `DatabaseModule` — registers schemas for MongoDB operations |

### Upstream Dependencies

| Dependency | Purpose |
|------------|---------|
| `@stoked-ui/common` (peer) | `PublicityType`, `EmbedVisibilityType` and related helpers — re-exported for backend convenience |
| `@nestjs/common` | NestJS `Module` decorator and DI primitives |
| `@nestjs/mongoose` | `@Prop`, `SchemaFactory`, `TypeMetadataStorage` — schema definition infrastructure |
| `@nestjs/swagger` | `@ApiProperty`, `@ApiPropertyOptional` — Swagger documentation on DTOs |
| `class-validator` | `@IsString`, `@IsNumber`, `@IsOptional`, `@IsArray`, `@Max` — request DTO validation |
| `mongoose` | `Schema.Types`, `HydratedDocument`, `SchemaOptions` — MongoDB ODM |
| `lodash.clonedeep` | Deep-clones `DefaultSchemaOptions` in `@StdSchema()` to avoid mutation across decorators |

### Contracts

- **Model inheritance chain**: `BaseModel` → `File` → `Image`/`Video`/`Media`/`BlogPost`. Changes to `BaseModel` fields propagate to all content schemas.
- **Feature exports**: Each model exports a `{Name}Feature: ModelDefinition` constant. Consumer NestJS modules pass these to `MongooseModule.forFeature()`. Adding/removing features requires updating the consumer's feature array.
- **`swapId` transform**: All models use the `_id → id` transform via `DefaultSchemaOptions`. Clients expect `id` (not `_id`) on every response. Changing this breaks all API consumers.
- **Upload DTO shapes**: The upload DTOs define the wire format between the CDN upload client and the media-api upload controller. Shape changes require coordinated client + server updates.
- **Publicity/EmbedVisibility types**: Re-exported from `@stoked-ui/common` — the enum values are stored in MongoDB documents. Adding/removing values requires a data migration strategy.

---

## Key Source Files

| File | Why It Matters |
|------|---------------|
| `src/index.ts` | Barrel export — defines the public API surface. Any export addition/removal affects all consumers. |
| `src/models/base.model.ts` | Foundation class — `likes[]`, `dislikes[]`, `views`, `score`, `publicity`, access control arrays. Every content model inherits these. Contains `like()`, `dislike()`, `view()`, `delete()`, `updateScore()` methods. |
| `src/models/file.model.ts` | Base file schema — `title`, `author`, `owners[]`, `hash`, `size`, `mimeType`, `bucket`, `region`. Extended by Image, Video, Media, BlogPost. |
| `src/models/video.model.ts` | Largest schema — duration, codec, container, thumbnails, scrubber sprites, stream recording metadata, playback issues, scene tracking. Core to media-api's video CRUD. |
| `src/models/media.model.ts` | Unified media abstraction with embed visibility, external data source metadata, and complex compound indexes for sorted gallery queries. |
| `src/models/uploadSession.model.ts` | Tracks multipart upload progress with S3 integration — parts array, TTL expiration, hash-based deduplication, progress virtuals. |
| `src/models/license.model.ts` | Stripe subscription license — key management, hardware binding, activation history, grace periods. Critical for the licensing system. |
| `src/models/product.model.ts` | Stripe product catalog — pricing, duration, trial configuration. Paired with License for the subscription system. |
| `src/dtos/upload.dto.ts` | 10 DTO classes defining the S3 multipart upload wire protocol. Validated with `class-validator`, documented with Swagger decorators. |
| `src/decorators/stdschema.decorator.ts` | `@StdSchema()` decorator — merges default options (timestamps, virtuals, `swapId` transform) with per-schema overrides. |
| `src/decorators/defaultSchemaOptions.ts` | `swapId()` function — recursive `_id → id` transform that runs on every `toJSON()`/`toObject()` call. Breaking this breaks all API responses. |
| `src/models/index.ts` | Model barrel — controls which schemas are available to consumers. Must be updated when adding new models. |

---

## Change Impact

### High Impact (breaks API responses or backend startup)

| Change | Affected | Validation |
|--------|----------|------------|
| `BaseModel` field changes (add/remove/rename) | All content schemas (File, Video, Image, Media, BlogPost) | `pnpm --filter @stoked-ui/common-api typescript`; verify media-api starts and serves correct responses |
| `File` schema field changes | Image, Video, Media, BlogPost (all inherit) | Same as above; verify file upload + retrieval flows |
| `swapId()` transform logic | All API JSON responses | End-to-end API test — verify `id` field present, `_id`/`__v` absent |
| `*Feature` export removal or rename | `@stoked-ui/media-api` `DatabaseModule` | Build fails; `pnpm --filter @stoked-ui/media-api build` |
| Barrel export removals (`src/index.ts`) | All consumers | `pnpm --filter @stoked-ui/media-api build`; check docs API routes if they add imports later |
| Upload DTO shape changes (field add/remove/type change) | Upload controller + CDN upload client | End-to-end multipart upload test |

### Medium Impact (breaks specific features)

| Change | Affected | Validation |
|--------|----------|------------|
| `Video` schema field changes (thumbnails, sprite config, stream metadata) | Media gallery, video player, CDN thumbnail processing | Verify video upload, gallery display, sprite hover preview |
| `License`/`Product` schema changes | Licensing system, Stripe webhook handlers | Verify license activation, product checkout flow |
| `UploadSession` TTL or status enum changes | Resumable upload flow | Test upload initiation, resumption, and expiration |
| `BlogPost` schema changes (slug, status, source) | Blog views, Nostr integration | Verify blog CRUD, slug uniqueness, publish workflow |
| MongoDB index changes on any model | Query performance, unique constraint enforcement | Verify affected queries still work; check for duplicate key errors |
| Re-exported `PublicityType`/`EmbedVisibilityType` value changes | Content visibility filtering across all views | Verify admin/public content filtering, embed access control |

### Low Impact (isolated to specific schemas)

| Change | Affected | Validation |
|--------|----------|------------|
| `Client` schema changes | Consulting admin client views | Verify client list/detail pages |
| `User` schema changes | Auth, user management views | Verify login, role-based access |
| `Invoice` schema changes | Invoice views | Verify invoice list/detail rendering |
| `@StdSchema()` option defaults (non-transform changes) | Schema behavior | Verify timestamps, virtuals still work |
| `DefaultSchemaOptions` non-transform additions | All models | Verify no breaking side effects |

### Test Coverage

**No unit tests exist.** The `packages/sui-common-api/` directory contains no `.test.*` or `.spec.*` files.

Validation relies on:
- **Type checking:** `pnpm --filter @stoked-ui/common-api typescript`
- **Build:** `pnpm --filter @stoked-ui/common-api build`
- **Downstream build:** `pnpm --filter @stoked-ui/media-api build`
- **Manual integration testing** via the running media-api and docs site

**Gap**: All models, DTOs, decorators, and the `swapId()` transform lack unit tests. Changes require manual verification or downstream integration testing.
