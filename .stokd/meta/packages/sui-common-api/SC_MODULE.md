# Module: @stoked-ui/common-api

> **Generated:** 2026-05-05 (refreshed 2026-06-06 for v0.4.0; prev refresh 2026-05-21) | **Meta version:** 0.4.0
> **Package location:** `packages/sui-common-api`
> **NPM name:** `@stoked-ui/common-api` (v0.1.0)
> **Source entry:** `packages/sui-common-api/src/index.ts`
> **Build artifacts:** `packages/sui-common-api/build/` (modern + node + stable + types)
> **Axioms:** `packages/sui-common-api/.axioms.md` (8 active: AX-MOD-SUICOMMONAPI-001…008)
> **Last code change:** 2026-05-22 (verified at this refresh — source matches this document)

---

## 1. Responsibility

`@stoked-ui/common-api` is the **server-side schema and DTO layer** for Stoked UI's NestJS API services. Its design intent:

1. **Backend-only**. The package depends on `@nestjs/common`, `@nestjs/mongoose`, `@nestjs/swagger`, `class-validator`, and `mongoose`. It must never be imported into a browser bundle.
2. **Shared Mongoose models** for every domain object that more than one API service might need: `BaseModel`, `File`, `Image`, `Video`, `Media`, `UploadSession`, `BlogPost`, `Invoice`, `License`, `Product`, `Client`, `User`. Each one ships as a class + `Schema` + `*Feature: ModelDefinition` triple ready for `MongooseModule.forFeature()`.
3. **A small set of decorators** (`@StdSchema`, `DefaultSchemaOptions`, `swapId`) that enforce a uniform schema shape across every model — timestamps, virtuals, and `_id → id` JSON transform.
4. **Wire-format DTOs** for the multipart upload protocol used by `@stoked-ui/media-api` upload controllers and any browser/SDK client (`InitiateUploadDto`, `GetMoreUrlsDto`, `PartCompletionDto`, plus the matching `*ResponseDto`s).
5. **Re-exports** of the client-safe interfaces from `@stoked-ui/common` (`PublicityType`, `EmbedVisibilityType`, helpers) so an API service can import all of its types from one place.

It is *not* a NestJS feature module (no controllers, services, or providers), *not* a domain-specific library, and *not* the place for HTTP routes.

---

## 2. Public Interfaces / Entry Points

The single public entry is `src/index.ts`:

```ts
// packages/sui-common-api/src/index.ts
export * from './models/index.js';
export * from './dtos/index.js';
export * from './decorators/index.js';

// Re-exports from @stoked-ui/common
export {
  type PublicityType, PUBLICITY_TYPES, ADMIN_ONLY_PUBLICITY_TYPES,
  ALL_FILTER_PUBLICITY_TYPES, isAdminOnlyPublicity, isIncludedInAllFilter,
  type EmbedVisibilityType, DEFAULT_EMBED_VISIBILITY,
  PUBLIC_EMBED_VISIBILITY_TYPES, AUTHENTICATED_EMBED_VISIBILITY_TYPES,
  isPublicEmbedVisibility, isAuthenticatedEmbedVisibility,
} from '@stoked-ui/common';
```

### Public surface by category

| Surface | Exports | Source |
|---|---|---|
| Decorators | `StdSchema(options?)`, `DefaultSchemaOptions`, `swapId(doc, ret)` | `src/decorators/stdschema.decorator.ts`, `src/decorators/defaultSchemaOptions.ts` |
| Base model | `BaseModel`, `BaseModelSchema` (with methods `addToSet`, `removeFromArray`, `like`, `dislike`, `view`, `delete`, `updateScore`) | `src/models/base.model.ts` |
| Content models (extend `File`/`BaseModel`) | `File`/`FileSchema`/`FileFeature`/`FileDocument`, `Image`/…/`ImageFeature`, `Video`/…/`VideoFeature`, `Media`/…/`MediaFeature`/`MediaDocument`, `BlogPost`/…/`BlogPostFeature`/`BlogPostDocument` | `src/models/{file,image,video,media,blogPost}.model.ts` |
| Domain models | `License`/…/`LicenseFeature`/`LicenseDocument`/`LicenseStatus`, `Product`/…/`ProductFeature`/`ProductDocument`, `Invoice`/…/`InvoiceFeature`/`InvoiceDocument`, `Client`/…/`ClientFeature`/`ClientDocument`, `User`/…/`UserFeature`/`UserDocument`/`UserRole` | `src/models/{license,product,invoice,client,user}.model.ts` |
| Upload session model | `UploadSession`/`UploadSessionSchema`/`UploadSessionFeature`/`UploadSessionDocument`, types `UploadPart`, `UploadPartStatus`, `UploadSessionStatus` | `src/models/uploadSession.model.ts` |
| Media side types | `PlaybackIssue`, `MediaDataSourceMetadata` interfaces | `src/models/media.model.ts` |
| Request DTOs | `InitiateUploadDto`, `GetMoreUrlsDto`, `PartCompletionDto` (all decorated with `class-validator` rules and `@nestjs/swagger` `@ApiProperty`) | `src/dtos/upload.dto.ts` |
| Response DTOs | `PresignedUrlDto`, `InitiateUploadResponseDto`, `UploadStatusResponseDto`, `PartCompletionResponseDto`, `CompleteUploadResponseDto`, `ActiveUploadDto`, `ActiveUploadsResponseDto` | `src/dtos/upload.dto.ts` |
| Re-exported client-safe interfaces | `PublicityType` + helpers, `EmbedVisibilityType` + helpers | from `@stoked-ui/common/interfaces/*` |

There are **no NestJS controllers, no providers, no CLI commands, and no runtime entry points**. The package is library code that other NestJS apps import.

### Intended usage shape

```ts
// In a consumer NestJS app:
import { MongooseModule } from '@nestjs/mongoose';
import { MediaFeature, UploadSessionFeature, InitiateUploadDto } from '@stoked-ui/common-api';

@Module({
  imports: [MongooseModule.forFeature([MediaFeature, UploadSessionFeature])],
})
export class MediaDatabaseModule {}
```

---

## 3. Products

This module is consumed by the single product documented in this repo:

- **SC_PRODUCT_STOKED_UI_SUI.md** — `@stoked-ui/sui`. Within that product, `@stoked-ui/common-api` is loaded by API services (today: `@stoked-ui/media-api`); browser packages (`sui-editor`, `sui-timeline`, `sui-file-explorer`, `sui-media`, `sui-docs`) must not import it.

There is no other product doc; the module participates in only this one.

---

## 4. Views

This module renders no DOM and exposes no React components. It **materially shapes** the following views from `SC_VIEWS.md` by defining their server-side schema, validation, and OpenAPI metadata:

| View (SC_VIEWS.md ref) | How this module shapes it |
|---|---|
| §19.1 Swagger UI (Media API) — `/v1/api/docs` | Every DTO in `src/dtos/upload.dto.ts` carries `@ApiProperty` decorators that surface as fields, examples, and validation hints in the Swagger operation pages for the `Media` and `Uploads` tag groups. |
| §7.2 Swagger UI (Docs Business API) — `/consulting/api-docs` | Indirectly — admin/business endpoints fetch domain entities (`Client`, `User`, `Invoice`, `License`, `Product`, `BlogPost`) whose canonical schema lives here. |
| §5.2 Products Admin, §5.3 Clients Admin, §5.4 Users Admin, §5.5 Invoices Admin, §5.7 Blog Admin | The fields in each admin form/table mirror the `@Prop` declarations on the corresponding model class — e.g., `License.status`, `Product.licenseDurationDays`, `BlogPost.status/source/targetSites`, `Invoice.weeks/tasks`, `Client.slug` (unique). Note `User.role` is a TypeScript union only (no DB-level `enum`); the admin UI is the field's only effective constraint. (The §5.1 Admin Dashboard's nav cards — Clients/Products/Users/Invoices/Licenses/Blog/API Docs — front these entities.) |
| §6.3 Licenses (Account / Self-Service) | License lookup / activation status views are backed by `LicenseSchema` and its 5 indexes (`license_key_unique`, `license_email_product`, sparse `license_hardware`, `license_subscription`, `license_status_expiry`). |
| Any media list/detail view that paginates, sorts, or full-text-searches Media (showcase pages, account pages, embed surfaces) | Backed by the eight indexes declared on `MediaSchema` (text search with `title:10/tags:5/description:1`, plus compound indexes by views/author/type/price/publicity/score and a sparse index on duration). |
| Resumable upload UI (initiate / progress / resume) | Driven by `InitiateUploadDto` validation and the `UploadSession` virtuals `progress`, `completedPartsCount`, `uploadedBytes`. |

This module owns no chrome of its own.

---

## 5. Integration Points

### Upstream (this module depends on)

| Dependency | Where used | Contract |
|---|---|---|
| `@nestjs/common` ^10.3.0 | All decorators on model classes | NestJS injection metadata. |
| `@nestjs/mongoose` ^10 | `@Prop`, `SchemaFactory.createForClass`, `ModelDefinition`, `TypeMetadataStorage` deep import in `stdschema.decorator.ts` | Schema metadata pipeline. The deep import (`@nestjs/mongoose/dist/storages/type-metadata.storage.js`) is brittle across major versions. |
| `@nestjs/swagger` ^7 | `@ApiProperty`, `@ApiPropertyOptional` on DTOs | OpenAPI generation in consumer apps. |
| `class-validator` ^0.14 | DTO validation rules | Runtime payload validation; consumers must enable `ValidationPipe` for these to fire. |
| `mongoose` ^8 | Schema construction, `HydratedDocument`, ObjectId types, instance methods | Underlying ODM. |
| `lodash.clonedeep` ^4.5 | `StdSchema` defensive clone of `DefaultSchemaOptions` | Prevents shared-reference mutation across decorated classes. |
| `@stoked-ui/common` (peer, workspace:*) | Type imports (`PublicityType`, `EmbedVisibilityType`) and re-exports of publicity/embed-visibility helpers | The peer package must remain free of NestJS/Node/React deps so this re-export path stays import-safe. |

### Downstream (consumers)

In-tree consumers (verified via `grep '@stoked-ui/common-api'`, excluding `build/`, `.open-next/`, and lockfiles):

- `packages/sui-media-api/src/database/database.module.ts` — the **only** runtime import. Registers exactly four features — `VideoFeature`, `ImageFeature`, `FileFeature`, `UploadSessionFeature` — with `MongooseModule.forFeature(...)`. The remaining exported features (`MediaFeature`, `BlogPostFeature`, `LicenseFeature`, `ProductFeature`, `InvoiceFeature`, `ClientFeature`, `UserFeature`) are exported but **not yet registered** by any in-tree service; they are referenced by ongoing PRDs in `.stokd/projects/` for future registration.
- `packages/sui-media-api/package.json` declares the `workspace:*` dependency; its controllers (transitively) consume the upload DTOs and Mongoose models for upload, media, and license endpoints.
- `docs/.open-next/server-functions/.../package.json` (build output) re-declares the same dependency — a packaging artifact, not a source consumer.

### Parallel browser-side contract (must stay in sync)

`packages/sui-common/src/interfaces/upload-types.ts` ships **plain TypeScript interfaces** named identically to this package's DTOs (`InitiateUploadDto`, etc.) for client-side use without NestJS decorators — its own header points readers here for the decorated/validated versions. The two definitions are a single wire contract split across the browser/server boundary: any change to `InitiateUploadDto` field names/optionality in `upload.dto.ts` must be mirrored in `upload-types.ts`, and vice versa. The validation *rules* (regex, min/max) live only on the server side here.

There are no external/published consumers other than what `pnpm-lock.yaml` records — this is a workspace utility package today.

### Contracts that must hold for downstream

1. **Single entry**: consumers import from `@stoked-ui/common-api`, never from deep paths.
2. **`*Feature` shape**: each feature export is a `ModelDefinition` `{ name, schema }`. Renaming a class (e.g., `Media → MediaItem`) changes the registered Mongoose model name and breaks `@InjectModel(Media.name)` resolution everywhere.
3. **`swapId` JSON transform**: every API response that goes through `JSON.stringify` on a Mongoose document gets `_id` rewritten to a string `id`, and `__v` removed. Clients depend on the `id` field; do not bypass.
4. **`StdSchema` defaults**: timestamps (`createdAt`, `updatedAt`) and virtuals are enabled. Disabling either is a breaking schema change for every model.
5. **`UploadSession` part-status enum**: `"pending" | "uploading" | "completed" | "failed"` — the `progress`, `completedPartsCount`, and `uploadedBytes` virtuals only count `"completed"`. Clients (resume UI, presigned-URL refresher) depend on this exact contract.
6. **`InitiateUploadDto` mime-type regex**: `/^(video|image)\/[a-z0-9.+-]+$/`. Tightening (e.g., closed enum) or loosening (e.g., audio) is a breaking change for every upload client.
7. **Method polymorphism**: `MediaSchema.methods = BaseModelSchema.methods` and `BlogPostSchema.methods = BaseModelSchema.methods` — these schemas piggyback on `BaseModelSchema`'s `like`/`dislike`/`view`/`delete`/`updateScore`. Adding a new method to `BaseModelSchema` propagates by reference; both schemas pick it up automatically.

---

## 6. Key Source Files

| File | Why it matters |
|---|---|
| `src/index.ts` | The public surface contract. Adding/removing exports here changes the package API. |
| `src/decorators/stdschema.decorator.ts` (29 lines) | `StdSchema(options?)` class decorator. Clones `DefaultSchemaOptions`, merges callsite overrides, and registers metadata via `TypeMetadataStorage.addSchemaMetadata`. The deep import path into `@nestjs/mongoose/dist/storages/type-metadata.storage.js` is the riskiest single line in the package — it locks compatibility to specific `@nestjs/mongoose` versions. |
| `src/decorators/defaultSchemaOptions.ts` (38 lines) | `swapId` recursive transform (`_id → id`, strips `__v`, recurses through nested objects/arrays) and the `DefaultSchemaOptions` constant (`timestamps: true`, `virtuals: true`, transform installed on both `toObject` and `toJSON`). |
| `src/models/base.model.ts` (107 lines) | `BaseModel` (publicity, likes/dislikes, denyAccess/canAccess/canEdit, deleted/deletedAt, views/uniqueViews/score) and `BaseModelSchema` engagement methods. **Known bugs documented in `SC_TEST.md` §1.2:** `updateScore` uses `this.likes.length` for the dislike term, and reads `.length` on `views`/`uniqueViews` which are `Number` props (yields `NaN`); `view()` calls `addToSet("uniqueViews", userId)` against a `Number` field. |
| `src/models/file.model.ts` | `File extends BaseModel` — adds title/description/author/owners/file/url/tags/starring/price/originalName/hash/size/mime/rating/bucket/region. Source of truth for "anything stored in S3 with metadata". |
| `src/models/media.model.ts` (157 lines) | `Media extends File` — adds thumbnail variants, dimensions, duration, mediaType, location, embedVisibility (with `'private'` default), `playbackIssues`, `dataSource` (external import metadata). Owns 8 production indexes (text + 7 compound/sparse) that drive the media list/search views. Manually copies `BaseModelSchema.methods`. |
| `src/models/uploadSession.model.ts` (186 lines) | The multipart-upload state machine. 7-day expiry by convention; TTL index on `expiresAt`, compound index on `(userId, status, expiresAt)`, dedup index on `(hash, status)`. Three virtuals (`progress`, `completedPartsCount`, `uploadedBytes`) drive the resume UI. Division-by-zero guard on `progress`. |
| `src/models/image.model.ts` | `Image extends File` with avatar/cover/dimensions/aspectRatio and a per-task `metadataProcessingFailures` array. **Known bugs (SC_TEST.md §1.2):** `like`/`dislike` use a callback-first signature `(cb, userId)` that conflicts with `BaseModel`'s `(userId, save)` and overwrite the wrong field with `Array.from(userId)` (which splits a string into characters). |
| `src/models/video.model.ts` | `Video extends File` — codec/container/moovAtomPosition, scrubber-sprite metadata, stream-recording metadata (`isStreamRecording`, `streamPeakViewers`, `streamTotalViewMinutes`, `featuredUsers`), plus per-task `metadataProcessingFailures` and `playbackIssues` mirroring `Media`. |
| `src/models/blogPost.model.ts` | `BlogPost extends File` — slug (unique), body, status (`draft`/`published`/`archived`), source (`native`/`nostr`/`import`), `targetSites` (default `['sui.stokd.cloud']`), `nostrEventId` (sparse). 5 indexes: text search, status+date, targetSites+status+date, unique slug, sparse nostrEventId. |
| `src/models/license.model.ts` | Stripe-issued license records: `key` (unique), `email`, `productId`, `hardwareId`, `machineName`, `status` (`pending`/`active`/`expired`/`revoked`), `gracePeriodDays` (14), `stripeCustomerId`, `stripeSubscriptionId`, `deactivationCount`. 5 indexes for license lookup workflows. |
| `src/models/product.model.ts` | Stripe product catalog. `productId` (unique), `keyPrefix`, Stripe IDs, pricing/currency, `licenseDurationDays` (365), `gracePeriodDays` (14), `trialDurationDays` (30). |
| `src/models/invoice.model.ts` | Consulting invoice with nested `InvoiceWeek`/`InvoiceTask` subdocs. Indexes on `(customer, generatedAt)` and `(configId, generatedAt)`. |
| `src/models/client.model.ts` | Consulting client record (name/slug/contactEmail/active). Slug is unique. |
| `src/models/user.model.ts` | App user (email-unique, `role` typed `UserRole = 'admin'\|'client'\|'agent'`, `clientId` ref `Client`, `agentIds` ref `User`, `aliases`, `avatarUrl`, `active`, optional `passwordHash`). Backs admin user-management views. **Note:** `role` carries the TS union but **no Mongoose `enum`** — only `default: 'client'` is enforced at the DB layer; invalid roles are not rejected by the schema. |
| `src/dtos/upload.dto.ts` (301 lines) | Multipart upload wire format, request and response. Every field carries Swagger metadata (description, example, min/max). Validation rules: filename non-empty, mimeType matches `^(video\|image)/...$`, totalSize ≥ 1, optional chunkSize within 5 MiB–100 MiB (S3 minimum), `partNumbers` array 1–50 long. |

> **Internal import-extension inconsistency (cosmetic, build-safe):** the original models (`base`, `file`, `image`, `video`, `media`, `uploadSession`, plus `client`, `user`) use explicit `.js` extensions on relative imports; the newer domain models (`blogPost`, `invoice`, `license`, `product`) use **extensionless** relative imports. The Babel build pipeline tolerates both, and the public barrel (`models/index.ts`) re-exports every model with `.js`. Prefer `.js` for new files to match the majority and the barrel — this is style, not contract.

---

## 7. Change Impact

When this module changes, the following typically need validation:

### Always validate

- **Build** — `pnpm --filter @stoked-ui/common-api build` (modern + node + stable + types). `sui-media-api` and any future API consumer use the built artifacts.
- **Type check** — `pnpm --filter @stoked-ui/common-api typescript`.
- **Tests** — **there is no `test` script in `package.json` and no committed test files yet** (0% coverage), so `pnpm --filter @stoked-ui/common-api test` currently *errors* (missing script) rather than running zero tests. The AX-MOD-SUICOMMONAPI-008 acceptance check (`pnpm … test`) therefore cannot pass until both a `test` script and at least one suite land. See `.stokd/meta/packages/sui-common-api/SC_TEST.md` for the planned ~135 cases across 14 files; per the global TDD axiom, any code-touching task here must add the `test` script + a failing test first.
- **Downstream typescript / build** — at minimum `pnpm --filter @stoked-ui/media-api typescript`. A class-name change ripples to every `@InjectModel(<Class>.name)` call and Mongoose ref string.

### Risk-specific checklists

| Change | What to validate |
|---|---|
| Edit `src/index.ts` exports | Build `sui-media-api` and any other consumer to catch missing-export errors. Also check `.stokd/projects/*/prd.md` for in-flight work that names the export by string. |
| Edit `swapId` (`defaultSchemaOptions.ts`) | Affects **every** Mongoose-document JSON response across **every** API service. Run media-api integration tests; verify clients still see `id` (not `_id`) and never see `__v`. |
| Edit `DefaultSchemaOptions` (timestamps/virtuals/transform) | Same blast radius as `swapId`. Removing `timestamps` would break every list view that sorts by `createdAt`. |
| Edit `StdSchema` decorator or deep-import path | Bumping `@nestjs/mongoose` past v10 may break the `TypeMetadataStorage` deep import. Verify schema registration still produces the expected `MongooseModule.forFeature(...)` result. |
| Edit `BaseModel` fields or methods | All content models (`File`, `Image`, `Video`, `Media`, `BlogPost`) inherit; `Media` and `BlogPost` also reuse `BaseModelSchema.methods` by reference. Verify like/dislike/view/delete behavior end-to-end on at least one Media document in media-api tests. |
| Add/remove/modify `@Prop` on any model | Verify Swagger schema regeneration and migration impact (existing documents may need a backfill or `default`). For models with a `unique` index (`Client.slug`, `License.key`, `Product.productId`, `BlogPost.slug`, `User.email`), verify uniqueness is still enforced and no duplicates exist in production data. |
| Change a model's `*Feature` `name` (i.e., the class name) | Changes the registered Mongoose model name. Every `@InjectModel(X.name)` and every `ref: "X"` string across the monorepo must be updated. Grep before renaming. |
| Edit `MediaSchema` indexes (any of the 8) | Check that the production indexes match (Mongoose only creates missing ones; orphan indexes need manual cleanup). Performance regressions show up first on the public media list and search surfaces (§19.x and any showcase media views in `SC_VIEWS.md`). |
| Edit `UploadSessionSchema` (TTL or compound indexes) | Resumable-upload behavior depends on the compound `(userId, status, expiresAt)` index for active-uploads listing and on the TTL on `expiresAt`. The TTL is enforced by Mongo and runs every ~60s — extending session lifetime requires changing both `expiresAt` defaults at write-time and verifying the index option. |
| Edit `UploadSession` virtuals | Frontend resume UI shows `progress` directly; do not change the rounding, division-by-zero guard, or the `status === "completed"` filter without coordinating with the media client. |
| Edit `InitiateUploadDto` mime regex / size bounds | Every upload client (browser SDK, mobile, server-to-server) must agree. The 5 MiB lower bound is an S3 protocol requirement — do not lower it. |
| Edit `UploadPartStatus` / `UploadSessionStatus` unions | Both the literal-type union and the corresponding `enum: [...]` array on the `@Prop` must be updated together. Add an explicit migration plan for in-flight sessions with the old status. |
| Bump `@nestjs/mongoose`, `@nestjs/swagger`, `@nestjs/common`, `mongoose`, or `class-validator` | Coordinate with `sui-media-api`'s installed versions. The deep import in `stdschema.decorator.ts` is the most likely break point. |
| Bump or remove `lodash.clonedeep` | `StdSchema` calls `cloneDeep(DefaultSchemaOptions)` defensively; without it, callsite option mutations would leak across decorated classes. Replace with a structural clone only if you verify identical semantics for `transform` function references. |
| Modify the peer `@stoked-ui/common` re-exports | Confirm the re-exported names still exist in `@stoked-ui/common`'s `src/interfaces/`. Browser-only code must not creep into those files because this package bridges them into the API context. |

### Smoke tests after non-trivial changes

1. `pnpm --filter @stoked-ui/common-api build && pnpm --filter @stoked-ui/media-api typescript` — fastest guard against breaking the only current consumer.
2. Boot media-api locally and hit `/v1/api/docs` (SC_VIEWS.md §19.1) — verify the upload DTO schemas render with the expected fields, examples, and constraints.
3. Initiate → upload one part → complete a multipart upload through media-api — exercises `InitiateUploadDto`, `PartCompletionDto`, the `UploadSession` virtuals, the TTL/compound indexes, and the `swapId` JSON transform on the response.
4. Hit any media list endpoint and confirm responses contain `id` (string) and never `_id` or `__v` — exercises `swapId` across an array of `Media` documents.
