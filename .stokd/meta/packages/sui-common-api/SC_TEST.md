# Testing Strategy: `@stoked-ui/common-api`

**Package:** `packages/sui-common-api`
**Priority:** Medium
**Current Coverage:** 0% — no committed tests, no `jest` config, no `test` script in `package.json`
**Target Coverage:** 70% statements / 65% branches / 80% functions / 70% lines

> **Backend-only.** This package depends on `@nestjs/mongoose`, `@nestjs/swagger`, `class-validator`, and `mongoose`. Test environment is **Node**, never `jsdom`. See `.axioms.md` → `AX-MOD-SUICOMMONAPI-002`.

---

## 1. What Should Be Tested

### 1.1 Critical Paths (P0)

| Area | Why Critical | Source |
|------|--------------|--------|
| `swapId` transform | Every model's `toJSON`/`toObject` flows through this — a bug here corrupts every API response shape. Documented as wire-format contract in `AX-MOD-SUICOMMONAPI-003`. | `src/decorators/defaultSchemaOptions.ts:1-27` |
| `StdSchema` decorator + `mergeOptions` | Registers schema metadata via the version-sensitive deep import `@nestjs/mongoose/dist/storages/type-metadata.storage.js`. Cited in `AX-MOD-SUICOMMONAPI-007`. | `src/decorators/stdschema.decorator.ts:18-29` |
| `BaseModelSchema` instance methods | `like`, `dislike`, `view`, `delete`, `updateScore`, `addToSet`, `removeFromArray` are engagement primitives shared by all content models. Multiple known bugs. | `src/models/base.model.ts:49-106` |
| `InitiateUploadDto` validation | Guards the multipart upload entry point. Validation rules are multi-client wire contract per `AX-MOD-SUICOMMONAPI-005`. | `src/dtos/upload.dto.ts:19-68` |
| `UploadSession` virtuals | `progress`, `completedPartsCount`, `uploadedBytes` drive the resumable-upload UI. Only count `status === "completed"`. | `src/models/uploadSession.model.ts:160-180` |
| Model inheritance chain | `BaseModel` → `File` → `Media`/`Image`/`Video`/`BlogPost`. Methods are manually copied (`MediaSchema.methods = BaseModelSchema.methods` at `media.model.ts:95`) — easy to miss. | Multiple files |
| Production index declarations | Performance contract per `AX-MOD-SUICOMMONAPI-006`: 8 indexes on `MediaSchema`, TTL on `UploadSessionSchema.expiresAt`, etc. | `media.model.ts`, `uploadSession.model.ts`, `license.model.ts`, `blogPost.model.ts` |

### 1.2 Known Bugs (write failing tests first; fix after)

| # | Location | Issue |
|---|----------|-------|
| 1 | `base.model.ts:102` | `dislikeScore = this.likes.length * 0.7` — should reference `this.dislikes.length`. |
| 2 | `base.model.ts:103-104` | `this.views.length` and `this.uniqueViews.length` are `undefined`: both fields are `@Prop({ type: Number })`, not arrays. Result: `score = NaN`. |
| 3 | `base.model.ts:82-89` | `view()` calls `this.addToSet("uniqueViews", userId)` on a Number field. Throws at runtime once a number is constructed via `new Set(<number>)`. |
| 4 | `image.model.ts:68` | `this.dislikes = Array.from(userId)` splits a string into characters (`"abc"` → `["a","b","c"]`). Should be `Array.from(dislikeSet)`. |
| 5 | `image.model.ts:76` | `this.dislikes = Array.from(userId)` in `like()` writes to the wrong field; `markModified("likeSet")` references a non-existent path. Should write `this.likes = Array.from(likeSet)` and `markModified("likes")`. |
| 6 | `image.model.ts:65,73` | `Image.like/dislike` use callback-first signature `(cb, userId)` vs `BaseModel`'s `(userId, save)`. Polymorphism break for any caller treating an `Image` as `BaseModel`. |

### 1.3 Edge Cases

**`swapId`:**
- `null`, `undefined`, primitive (string/number/boolean) inputs pass through untouched
- Deeply nested objects (3+ levels)
- Already has `id` (must not overwrite)
- `_id` is a `mongoose.Types.ObjectId` instance (needs `.toString()`)
- Object with only `_id` and no other fields
- Mixed arrays of objects + primitives
- Empty `{}`, empty `[]`
- Top-level array

**`InitiateUploadDto` validation:**
- `totalSize = 0` and negative — rejected by `@Min(1)`
- `chunkSize` at exact boundaries: `5242880` (5 MiB, S3 minimum) and `104857600` (100 MiB)
- `chunkSize = 5242879` and `104857601` — rejected
- `mimeType` accepts: `video/mp4`, `video/webm`, `video/quicktime`, `video/x-matroska`, `image/png`, `image/svg+xml`, `image/webp`
- `mimeType` rejects: `application/pdf`, `audio/mp3`, `text/plain`, `Video/MP4` (uppercase), `video/` (no subtype)
- `GetMoreUrlsDto.partNumbers`: 0 items (below `ArrayMinSize(1)`), 51 items (above `ArrayMaxSize(50)`)
- `PartCompletionDto.etag`: empty string rejected

**`UploadSession` virtuals:**
- `progress` returns `0` when `totalParts === 0` (division-by-zero guard at `uploadSession.model.ts:161`)
- `progress` rounds to nearest integer (`Math.round`)
- `completedPartsCount` and `uploadedBytes` ignore `pending`, `uploading`, `failed` parts

**Schema defaults to verify:**
- `BaseModel.publicity` → `'private'`
- `File.rating` → `'nc17'`
- `Media.embedVisibility` → `'private'`
- `Media.hasPlaybackIssues` → `false`
- `UploadSession.status` → `'pending'`
- `UploadSession.region` → `'us-east-1'`
- `Image.type` → `'image'`

**`StdSchema` / `mergeOptions`:**
- Empty `{}` and `undefined` options
- Custom options override defaults (e.g., `timestamps: false`)
- `cloneDeep` prevents mutation leaking across calls — call `StdSchema()` twice and verify `DefaultSchemaOptions` is unmodified

### 1.4 Integration Points

- `TypeMetadataStorage.addSchemaMetadata()` registration in `StdSchema`
- `SchemaFactory.createForClass()` output for each model produces correct paths
- Method-copy patterns: `MediaSchema.methods = BaseModelSchema.methods` (`media.model.ts:95`), same idiom in `blogPost.model.ts`
- Index declarations on `MediaSchema` (8), `UploadSessionSchema` (3 incl. TTL), `LicenseSchema` (5), `BlogPostSchema` (text + compounds)
- Re-exports from `@stoked-ui/common` in `src/index.ts:9-22` (PUBLICITY/EmbedVisibility helpers)
- `*Feature: ModelDefinition` objects used by `MongooseModule.forFeature([...])` in consumers (today: `sui-media-api`)

---

## 2. Test Framework & Tooling

### Framework: Jest + `ts-jest` + `mongodb-memory-server`

Rationale: the monorepo already uses Jest across `sui-common`, `sui-media`, and `sui-media-api`. The `sui-media-api` package is the closest analog — same NestJS/Mongoose stack — so its setup is the reference.

### devDependencies to add

```jsonc
{
  "jest": "^29.0.0",
  "ts-jest": "^29.0.0",
  "@types/jest": "^29.0.0",
  "mongodb-memory-server": "^9.0.0",
  "reflect-metadata": "^0.2.0"
}
```

### `jest.config.js`

```js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/__tests__/**/*.+(ts|js)',
    '**/?(*.)+(spec|test).+(ts|js)',
  ],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      isolatedModules: true,
      tsconfig: {
        experimentalDecorators: true,
        emitDecoratorMetadata: true,
        module: 'commonjs',
        moduleResolution: 'node',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
      },
    }],
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  // Source uses `.js` extensions on relative imports — strip them so ts-jest
  // resolves the matching `.ts` file.
  moduleNameMapper: {
    '^(.*)\\.js$': '$1',
  },
  setupFiles: ['reflect-metadata'],
  testPathIgnorePatterns: ['/node_modules/', '/build/', '/dist/'],
  transformIgnorePatterns: [
    'node_modules/(?!(bson|mongodb|mongoose|@nestjs/mongoose)/)',
  ],
};
```

### `package.json` scripts

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

> Adding a `test` script satisfies the acceptance check declared in `AX-MOD-SUICOMMONAPI-008`: `pnpm --filter @stoked-ui/common-api test`.

---

## 3. Test File Organization

```
src/
├── __tests__/
│   └── index.test.ts                      # Public-API export verification
├── decorators/
│   ├── __tests__/
│   │   ├── swapId.test.ts                 # Pure function — no DB
│   │   └── stdschema.decorator.test.ts    # Metadata spy
│   └── ...
├── dtos/
│   ├── __tests__/
│   │   └── upload.dto.test.ts             # class-validator validate()
│   └── ...
└── models/
    ├── __tests__/
    │   ├── setup.ts                       # mongodb-memory-server lifecycle
    │   ├── base.model.test.ts
    │   ├── file.model.test.ts
    │   ├── image.model.test.ts
    │   ├── video.model.test.ts
    │   ├── media.model.test.ts
    │   ├── uploadSession.model.test.ts
    │   ├── blogPost.model.test.ts
    │   ├── license.model.test.ts
    │   ├── product.model.test.ts
    │   ├── invoice.model.test.ts
    │   └── user.model.test.ts
    └── ...
```

**Convention:** co-located `__tests__/` directories; file names mirror the source (`base.model.ts` → `base.model.test.ts`). Mirrors the pattern in `sui-media/src/abstractions/__tests__/` and `sui-common/src/SocialLinks/__tests__/`.

---

## 4. Mock / Stub Strategy

### 4.1 Mongoose — in-memory MongoDB

Real schema behavior (methods, virtuals, indexes, defaults, required) is the contract. Use `mongodb-memory-server`, not Mongoose mocks.

```ts
// src/models/__tests__/setup.ts
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});
```

### 4.2 NestJS metadata — spy on `TypeMetadataStorage`

`StdSchema` is a pure metadata-registration function. No NestJS container required.

```ts
import { TypeMetadataStorage } from '@nestjs/mongoose/dist/storages/type-metadata.storage.js';

const spy = jest.spyOn(TypeMetadataStorage, 'addSchemaMetadata');
```

### 4.3 `class-validator` — call `validate()` directly

```ts
import { validate } from 'class-validator';
import { InitiateUploadDto } from '../upload.dto.js';

const dto = Object.assign(new InitiateUploadDto(), {
  filename: 'test.mp4',
  mimeType: 'video/mp4',
  totalSize: 10485760,
});
expect(await validate(dto)).toHaveLength(0);
```

No HTTP layer, no `ValidationPipe`, no NestJS app context.

### 4.4 Schema methods — register a throwaway model

```ts
import mongoose from 'mongoose';
import { BaseModelSchema } from '../base.model.js';

const TestModel = mongoose.model('TestBase', BaseModelSchema);
const doc = new TestModel({ likes: [], dislikes: [], views: 0, uniqueViews: 0, score: 0 });
await doc.save();
```

### 4.5 `@stoked-ui/common` — no mocks

Re-exported helpers (`isAdminOnlyPublicity`, `PUBLICITY_TYPES`, etc.) are pure constants/functions. Treat them as real dependencies; verify only that they re-export through `src/index.ts`.

---

## 5. Coverage Targets

| Metric | Target | Rationale |
|--------|--------|-----------|
| Statements | 70% | Medium-priority package; majority is declarative `@Prop` definitions. |
| Branches | 65% | Concentrated in `swapId`, `updateScore`, and DTO validators. |
| Functions | 80% | Every exported function and schema method exercised. |
| Lines | 70% | Tracks statements. |

**Per-module breakdown:**

| Module | Target | Notes |
|--------|--------|-------|
| `decorators/defaultSchemaOptions.ts` | 95% | Small file, branching `swapId`. |
| `decorators/stdschema.decorator.ts` | 90% | `mergeOptions` + `cloneDeep` invariants. |
| `dtos/upload.dto.ts` | 85% | Every validation rule exercised. |
| `models/base.model.ts` methods | 90% | Known bugs — high regression value. |
| `models/uploadSession.model.ts` virtuals | 90% | User-facing calculations. |
| `models/image.model.ts` methods | 90% | Known bugs. |
| Other `*.model.ts` | 50% | Declarative; verify schema creates, defaults, key indexes. |

---

## 6. Test Cases to Implement First

Ordered by risk/value. Phase 1 is fast and the highest signal per millisecond.

### Phase 1 — Pure logic (no DB)

#### `src/decorators/__tests__/swapId.test.ts`

```
describe('swapId')
  ✓ converts _id to string id on a flat object
  ✓ removes __v from output
  ✓ removes _id after conversion
  ✓ does not overwrite an existing id
  ✓ converts nested objects with _id recursively (3+ levels)
  ✓ maps arrays of documents
  ✓ handles mixed arrays (objects + primitives)
  ✓ returns null / undefined unchanged
  ✓ returns primitive string / number unchanged
  ✓ handles empty object {}
  ✓ converts an ObjectId instance via .toString()
```

#### `src/decorators/__tests__/stdschema.decorator.test.ts`

```
describe('StdSchema')
  ✓ registers schema metadata via TypeMetadataStorage.addSchemaMetadata
  ✓ default options include timestamps: true and virtuals: true
  ✓ default options install swapId on toObject and toJSON
  ✓ custom options override defaults (e.g., timestamps: false)
  ✓ accepts undefined options
  ✓ accepts empty options {}
  ✓ does not mutate DefaultSchemaOptions across calls (cloneDeep)
```

#### `src/dtos/__tests__/upload.dto.test.ts`

```
describe('InitiateUploadDto')
  describe('valid')
    ✓ video/mp4 + 10MB
    ✓ image/png
    ✓ video/webm, video/quicktime, video/x-matroska
    ✓ image/svg+xml, image/webp
    ✓ optional hash + chunkSize within bounds
    ✓ chunkSize at exact 5MB minimum
    ✓ chunkSize at exact 100MB maximum
  describe('filename')
    ✓ rejects empty / missing
  describe('mimeType')
    ✓ rejects application/pdf, audio/mp3, text/plain
    ✓ rejects uppercase Video/MP4
    ✓ rejects video/ (missing subtype)
  describe('totalSize')
    ✓ rejects 0 / negative / non-numeric
  describe('chunkSize')
    ✓ rejects 5242879 (below minimum)
    ✓ rejects 104857601 (above maximum)

describe('GetMoreUrlsDto')
  ✓ accepts 1 item / 50 items
  ✓ rejects 0 items (ArrayMinSize)
  ✓ rejects 51 items (ArrayMaxSize)
  ✓ rejects non-numeric entries

describe('PartCompletionDto')
  ✓ accepts ETag with surrounding quotes
  ✓ rejects empty etag
```

### Phase 2 — Schema methods (mongodb-memory-server)

#### `src/models/__tests__/base.model.test.ts`

```
describe('BaseModelSchema.methods')
  describe('addToSet')
    ✓ adds value to empty array
    ✓ deduplicates existing value
    ✓ marks path modified
  describe('removeFromArray')
    ✓ removes existing value
    ✓ no-op when absent (does not markModified)
  describe('like / dislike')
    ✓ adds to target array; removes from opposite
    ✓ calls updateScore
    ✓ respects save=false (no save() invocation)
  describe('view')
    ✓ increments views by 1
    ✓ BUG-3: addToSet("uniqueViews", userId) on Number field
  describe('delete')
    ✓ sets deleted=true, deletedAt≈now, publicity='deleted'
  describe('updateScore')
    ✓ BUG-1: dislikeScore uses this.likes.length
    ✓ BUG-2: this.views.length and this.uniqueViews.length are undefined → score NaN
    ✓ expected formula after fix: 1.6·likes + 0.7·dislikes + 0.1·views − 0.8·uniqueViews

describe('BaseModel schema')
  ✓ publicity defaults to 'private'
  ✓ publicity enum: public | private | paid | deleted
```

#### `src/models/__tests__/uploadSession.model.test.ts`

```
describe('UploadSession virtuals')
  describe('progress')
    ✓ returns 0 when totalParts === 0
    ✓ counts only status === 'completed'
    ✓ rounds (1/3 → 33)
  describe('completedPartsCount')
    ✓ counts only completed parts
  describe('uploadedBytes')
    ✓ sums sizes of completed parts only

describe('UploadSession schema')
  ✓ status defaults to 'pending'
  ✓ region defaults to 'us-east-1'
  ✓ rejects missing userId / uploadId / s3Key / bucket / filename / mimeType / totalSize / chunkSize / totalParts / expiresAt
  describe('indexes')
    ✓ TTL on expiresAt with expireAfterSeconds: 0
    ✓ compound (userId, status, expiresAt)
    ✓ compound (hash, status)
```

### Phase 3 — Model schemas (creation, defaults, inheritance, indexes)

#### `src/models/__tests__/image.model.test.ts`

```
describe('ImageSchema')
  ✓ creates a valid Image, inheriting File + BaseModel fields
  ✓ type defaults to 'image'
  ✓ mediaType virtual returns 'image'
  describe('KNOWN BUGS')
    ✓ BUG-4: dislike() assigns Array.from(userId) — splits string into characters
    ✓ BUG-5: like() writes to this.dislikes; markModified('likeSet') hits no path
    ✓ BUG-6: like/dislike signature is (cb, userId), not (userId, save)
```

#### `src/models/__tests__/video.model.test.ts`

```
describe('VideoSchema')
  ✓ creates a valid Video document
  ✓ type defaults to 'video', mediaType virtual returns 'video'
  ✓ thumbnailGenerationFailed / isStreamRecording / scrubberGenerated / scrubberGenerationFailed default false
  ✓ container enum: mp4 | mov | webm | mkv
  ✓ moovAtomPosition enum: start | end
```

#### `src/models/__tests__/media.model.test.ts`

```
describe('MediaSchema')
  ✓ creates a valid Media document, inherits File + BaseModel
  ✓ methods copied from BaseModelSchema (like/dislike/view/delete/updateScore are functions)
  ✓ embedVisibility defaults to 'private'; enum public | authenticated | private
  ✓ hasPlaybackIssues defaults to false
  describe('indexes (8)')
    ✓ media_text_search (title:10, tags:5, description:1)
    ✓ media_views_date
    ✓ media_author_date
    ✓ media_type_date
    ✓ media_price_date
    ✓ media_publicity_date
    ✓ media_score_date
    ✓ media_duration (sparse)
```

#### `src/models/__tests__/blogPost.model.test.ts`

```
describe('BlogPostSchema')
  ✓ inherits File + BaseModel, copies BaseModelSchema methods
  ✓ status defaults to 'draft'; enum draft | published | archived
  ✓ source defaults to 'native'; enum native | nostr | import
  ✓ targetSites defaults to ['sui.stokd.cloud']
  ✓ slug + body required, slug uniqueness enforced
  ✓ text-search index + compound (status, date) + sparse(nostrEventId)
```

#### `src/models/__tests__/license.model.test.ts`

```
describe('LicenseSchema')
  ✓ status defaults to 'pending'; enum pending | active | expired | revoked
  ✓ gracePeriodDays defaults to 14
  ✓ deactivationCount defaults to 0
  ✓ unique key constraint
  ✓ indexes: (email, productId), sparse(hardwareId), stripeSubscriptionId, (status, expiresAt)
```

#### `src/models/__tests__/product.model.test.ts`

```
describe('ProductSchema')
  ✓ licenseDurationDays defaults to 365
  ✓ gracePeriodDays defaults to 14
  ✓ trialDurationDays defaults to 30
  ✓ unique productId
```

#### `src/models/__tests__/invoice.model.test.ts`

```
describe('InvoiceSchema')
  ✓ creates Invoice with nested weeks/tasks subdocs
  ✓ weeks defaults to []
  ✓ configId / customer / totalHours required
  ✓ compound indexes invoice_customer_date, invoice_config_date
```

#### `src/models/__tests__/file.model.test.ts`

```
describe('FileSchema')
  ✓ extends BaseModel — all base fields present
  ✓ rating defaults to 'nc17'; enum ga | nc17
  ✓ bucket field is indexed
```

### Phase 4 — Public API surface

#### `src/__tests__/index.test.ts`

```
describe('models barrel')
  ✓ exports {Base|File|Image|Video|Media|UploadSession|BlogPost|License|Product|Invoice|Client|User}Model classes
  ✓ exports corresponding *Schema and *Feature (ModelDefinition) objects
  ✓ exports MediaDocument / FileDocument / UploadSessionDocument types

describe('DTO barrel')
  ✓ exports {Initiate|GetMoreUrls|PartCompletion} request DTOs
  ✓ exports {Presigned|InitiateUploadResponse|UploadStatus|PartCompletionResponse|CompleteUpload|ActiveUpload|ActiveUploads}* response DTOs

describe('decorators barrel')
  ✓ exports StdSchema, DefaultSchemaOptions, swapId

describe('@stoked-ui/common re-exports')
  ✓ exports PUBLICITY_TYPES, ADMIN_ONLY_PUBLICITY_TYPES, ALL_FILTER_PUBLICITY_TYPES
  ✓ exports isAdminOnlyPublicity, isIncludedInAllFilter
  ✓ exports DEFAULT_EMBED_VISIBILITY, PUBLIC_EMBED_VISIBILITY_TYPES, AUTHENTICATED_EMBED_VISIBILITY_TYPES
  ✓ exports isPublicEmbedVisibility, isAuthenticatedEmbedVisibility
```

---

## 7. Implementation Notes

### Decorator metadata

Tests for `@StdSchema`/`@Prop` rely on `reflect-metadata` and TypeScript's `experimentalDecorators` + `emitDecoratorMetadata`. The `jest.config.js` above enables both in the ts-jest tsconfig override and loads `reflect-metadata` via `setupFiles`. If a metadata lookup returns `undefined` in a test, the most likely cause is that `setupFiles` did not run before the imported decorator.

### `.js` extensions in relative imports

Source files use `.js` in relative imports (`from "./file.model.js"`) for ESM compatibility. The `moduleNameMapper` rule `'^(.*)\\.js$': '$1'` rewrites those at resolve time so ts-jest finds the `.ts` source. Test files should mirror the convention — write `from '../base.model.js'`.

### ESM transformation

`mongoose`, `bson`, `mongodb`, and `@nestjs/mongoose` ship as ESM. The `transformIgnorePatterns` allow ts-jest to transform them. Matches `sui-media/jest.config.js`.

### `view()` schema mismatch (bug 3)

`BaseModel.uniqueViews` is `@Prop({ type: Number })` but `view()` calls `addToSet("uniqueViews", userId)` which does `new Set(this.uniqueViews)` on a Number. `new Set(<number>)` throws (`TypeError: number is not iterable`). The test that exercises `view()` against a real Mongoose document will throw — capture the throw, document the bug, fix it (most likely by changing the schema to `[{ type: ObjectId, ref: "UserRef" }]`).

### `Image` method polymorphism (bug 6)

`BaseModelSchema.methods.like/dislike` use `(userId, save = true)`. `ImageSchema.methods.like/dislike` use `(cb, userId)`. Code that holds a `BaseModel` reference will pass a `userId` string where a callback is expected. Tests should assert the current (broken) shape, then a fix should align the signature.

### Bug-fix execution order

Write failing tests first; fix in this order so each fix is independently reviewable:

1. `base.model.ts:102` — `dislikeScore` should reference `this.dislikes.length`.
2. `base.model.ts:103-104` — drop `.length`, use the Number directly.
3. `base.model.ts:82-89` — fix the `view()` / `uniqueViews` type mismatch (schema change or method change).
4. `image.model.ts:68` — `Array.from(dislikeSet)`.
5. `image.model.ts:76` — write `this.likes = Array.from(likeSet)`, `markModified("likes")`.
6. `image.model.ts:65,73` — align signature to `(userId, save)`.

### Estimated test count

≈ 135 cases across 14 files. Phase 1 (~50 cases) should run in well under a second; Phases 2–3 take longer due to `mongodb-memory-server` startup.

---

## 8. Acceptance Checks (per `.axioms.md` AX-MOD-SUICOMMONAPI-008)

After tests are added, the following must pass before any merge that touches this package:

```sh
pnpm --filter @stoked-ui/common-api typescript
pnpm --filter @stoked-ui/common-api test
pnpm --filter @stoked-ui/common-api build
pnpm --filter @stoked-ui/media-api typescript   # downstream consumer
```

Any new failing test added under `src/**/__tests__/` blocks merge — same rule as existing tests.
