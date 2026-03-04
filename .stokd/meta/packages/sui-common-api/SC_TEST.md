# Testing Strategy: `@stoked-ui/common-api`

**Package:** `packages/sui-common-api`
**Priority:** Medium
**Current Coverage:** 0% (no tests exist)
**Target Coverage:** 70% statement, 65% branch

---

## 1. What Should Be Tested

### 1.1 Critical Paths (P0)

| Area | Why Critical | Source |
|------|-------------|--------|
| `swapId` transform | Every model's `toJSON`/`toObject` flows through this — a bug here corrupts all API responses | `src/decorators/defaultSchemaOptions.ts:1-27` |
| `BaseModelSchema` instance methods | `like`, `dislike`, `view`, `delete`, `updateScore` are the core engagement logic shared across all content models (Media, BlogPost, Image, Video) | `src/models/base.model.ts:49-106` |
| `StdSchema` decorator | Ensures every model gets timestamps, virtuals, and the `swapId` transform via `TypeMetadataStorage` | `src/decorators/stdschema.decorator.ts:18-29` |
| DTO validation | `InitiateUploadDto` guards the upload entry point — bad validation = corrupted uploads or S3 abuse | `src/dtos/upload.dto.ts:19-68` |
| `UploadSession` virtuals | `progress`, `completedPartsCount`, `uploadedBytes` drive the upload resume UI | `src/models/uploadSession.model.ts:160-180` |
| Model inheritance chain | `BaseModel` -> `File` -> `Media`/`Image`/`Video`/`BlogPost` — methods must propagate correctly | Multiple files |

### 1.2 Known Bugs to Verify

| Bug | Location | Issue |
|-----|----------|-------|
| `updateScore` uses `.length` on Number fields | `base.model.ts:103-104` | `this.views.length` and `this.uniqueViews.length` are `undefined` — `views`/`uniqueViews` are `@Prop({ type: Number })`, not arrays. Score will be `NaN`. |
| `updateScore` uses `likes` for dislike score | `base.model.ts:102` | `const dislikeScore = this.likes.length * 0.7` should be `this.dislikes.length * 0.7` |
| `Image.dislike` corrupts data | `image.model.ts:68` | `this.dislikes = Array.from(userId)` splits a string into characters (`"abc"` -> `["a","b","c"]`) instead of using `Array.from(dislikeSet)` |
| `Image.like` writes to wrong field | `image.model.ts:76` | `this.dislikes = Array.from(userId)` should be `this.likes = Array.from(likeSet)`; `markModified("likeSet")` should be `markModified("likes")` |
| `Image.like`/`dislike` different signature | `image.model.ts:65,73` | These take `(cb, userId)` callback-first signature vs `BaseModel` methods that take `(userId, save)` — inconsistent API that will break callers |
| `view()` schema inconsistency | `base.model.ts:82-89` | `uniqueViews` is `@Prop({ type: Number })` but `view()` calls `this.addToSet("uniqueViews", userId)` treating it as an array. Will throw at runtime. |

### 1.3 Edge Cases

**`swapId` transform:**
- `null`, `undefined`, primitive values as input
- Deeply nested objects (3+ levels)
- Objects where `id` already exists (should not overwrite)
- Documents with only `_id` and no other fields
- Mixed arrays containing objects and primitives
- `_id` that is an ObjectId instance (needs `.toString()`)
- Empty object `{}`
- Array at the top level

**DTO validation:**
- `InitiateUploadDto.totalSize = 0` and negative values
- `InitiateUploadDto.chunkSize` at exact 5MB minimum and 100MB maximum boundaries
- `InitiateUploadDto.mimeType` rejects non-video/image types (`application/pdf`, `text/plain`, `audio/mp3`)
- `InitiateUploadDto.mimeType` rejects uppercase (`Video/MP4`)
- `InitiateUploadDto.mimeType` accepts edge cases (`image/svg+xml`, `video/x-matroska`)
- `GetMoreUrlsDto.partNumbers` with 0 items (below ArrayMinSize(1))
- `GetMoreUrlsDto.partNumbers` with 51 items (above ArrayMaxSize(50))
- `PartCompletionDto.etag` with empty string

**UploadSession virtuals:**
- `progress` when `totalParts = 0` (division by zero guard — currently returns 0, correct)
- `progress` rounding behavior at non-integer percentages
- `uploadedBytes` with mixed completed/failed/pending parts
- `completedPartsCount` ignoring parts with status `failed`, `pending`, `uploading`

**Model defaults:**
- `License.gracePeriodDays` defaults to 14
- `Product.licenseDurationDays` defaults to 365
- `BlogPost.status` defaults to `'draft'`
- `BlogPost.targetSites` defaults to `['stoked-ui.com']`
- `Media.embedVisibility` defaults to `'private'`
- `File.rating` defaults to `'nc17'`
- `BaseModel.publicity` defaults to `'private'`

**`mergeOptions` in `StdSchema`:**
- Empty options `{}`
- Undefined options
- Options that override default keys (e.g., `timestamps: false`)
- Multiple decorated classes don't share references (cloneDeep correctness)

### 1.4 Integration Points

- Schema metadata registration via `TypeMetadataStorage.addSchemaMetadata()` in `StdSchema`
- `SchemaFactory.createForClass()` output for each model — ensures `@Prop` decorators produce correct Mongoose schema paths
- `BaseModelSchema.methods` manually copied to `MediaSchema` (`media.model.ts:95`) and `BlogPostSchema` (`blogPost.model.ts:55`)
- Index definitions on `MediaSchema` (8 indexes), `BlogPostSchema` (5 indexes), `LicenseSchema` (5 indexes), `UploadSessionSchema` (3 indexes), `InvoiceSchema` (2 indexes), `ProductSchema` (1 index)
- Re-exports from `@stoked-ui/common` in `src/index.ts` (PublicityType, EmbedVisibilityType utilities)
- `ModelDefinition` feature objects (`FileFeature`, `MediaFeature`, etc.) used for NestJS module registration

---

## 2. Test Framework and Tooling

### Framework: Jest + ts-jest

Rationale: The monorepo already uses Jest across `sui-common` (jest.config.js with ts-jest), `sui-media` (jest.config.js with coverage thresholds), and `sui-media-api` (Jest with `@nestjs/testing`). Consistency matters more than marginal tooling gains. The `sui-media-api` package provides the closest testing pattern for this backend package.

### Required devDependencies

```jsonc
// Add to package.json devDependencies:
{
  "jest": "^29.0.0",
  "ts-jest": "^29.0.0",
  "@types/jest": "^29.0.0",
  "mongodb-memory-server": "^9.0.0"  // In-memory MongoDB for schema/model tests
}
```

### `jest.config.js`

```js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',  // NOT jsdom — this is server-side NestJS code
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
  // Remap .js extensions in imports to .ts source files
  moduleNameMapper: {
    '^(.*)\\.js$': '$1',
  },
  testPathIgnorePatterns: ['/node_modules/', '/build/', '/dist/'],
  // Transform bson/mongodb/mongoose (ESM) through ts-jest
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

---

## 3. Test File Organization

```
src/
├── decorators/
│   ├── __tests__/
│   │   ├── swapId.test.ts              # Pure function tests (no DB)
│   │   └── stdschema.decorator.test.ts # Decorator + metadata spy
│   ├── defaultSchemaOptions.ts
│   ├── stdschema.decorator.ts
│   └── index.ts
├── dtos/
│   ├── __tests__/
│   │   └── upload.dto.test.ts          # class-validator validation
│   ├── upload.dto.ts
│   └── index.ts
├── models/
│   ├── __tests__/
│   │   ├── setup.ts                    # mongodb-memory-server lifecycle
│   │   ├── base.model.test.ts          # Schema methods + updateScore bugs
│   │   ├── uploadSession.model.test.ts # Virtuals + indexes
│   │   ├── media.model.test.ts         # Inheritance + method copying + indexes
│   │   ├── image.model.test.ts         # like/dislike bugs + mediaType virtual
│   │   ├── video.model.test.ts         # mediaType virtual + fields
│   │   ├── blogPost.model.test.ts      # Status defaults + slug uniqueness
│   │   ├── license.model.test.ts       # Status enum + unique key
│   │   ├── product.model.test.ts       # Duration defaults + unique productId
│   │   ├── invoice.model.test.ts       # Nested subdocs (InvoiceWeek/InvoiceTask)
│   │   └── file.model.test.ts          # BaseModel extension + rating default
│   ├── base.model.ts
│   ├── file.model.ts
│   ├── ...
│   └── index.ts
└── __tests__/
    └── index.test.ts                   # Export verification (all public API)
```

**Convention:** `__tests__/` subdirectory co-located with source modules. Filenames match `<source>.test.ts`. Matches the pattern used in `sui-media/src/abstractions/__tests__/` and `sui-common/src/SocialLinks/__tests__/`.

---

## 4. Mock / Stub Strategy

### 4.1 Mongoose — Use `mongodb-memory-server`

For model tests that need real schema behavior (methods, virtuals, indexes), use an in-memory MongoDB instance. This validates actual Mongoose behavior without external dependencies.

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

Reference this setup in `jest.config.js` via `setupFilesAfterSetup` for model test files, or import it directly in each model test file via a Jest `beforeAll`/`afterAll` pattern.

### 4.2 NestJS Metadata — Spy on `TypeMetadataStorage`

For `StdSchema` decorator tests, spy on `TypeMetadataStorage.addSchemaMetadata` rather than instantiating a full NestJS module:

```ts
import { TypeMetadataStorage } from '@nestjs/mongoose/dist/storages/type-metadata.storage';

const spy = jest.spyOn(TypeMetadataStorage, 'addSchemaMetadata');
```

This is sufficient because `StdSchema` is a pure metadata registration function — it doesn't need a running NestJS container.

### 4.3 `class-validator` — Use `validate()` Directly

For DTO tests, instantiate DTO classes and call `validate()` from `class-validator`. No HTTP layer, no NestJS pipes needed:

```ts
import { validate } from 'class-validator';
import { InitiateUploadDto } from '../upload.dto';

const dto = Object.assign(new InitiateUploadDto(), {
  filename: 'test.mp4',
  mimeType: 'video/mp4',
  totalSize: 10485760,
});
const errors = await validate(dto);
expect(errors).toHaveLength(0);
```

### 4.4 Mongoose Document Methods — Create Real Models

For `BaseModelSchema.methods` tests, register the schema with `mongoose.model()` in the in-memory DB and create actual documents. This lets us test `save()`, `markModified()`, and method chaining:

```ts
import mongoose from 'mongoose';
import { BaseModel, BaseModelSchema } from '../base.model';

const TestModel = mongoose.model('TestBaseModel', BaseModelSchema);
const doc = new TestModel({ likes: [], dislikes: [], views: 0, uniqueViews: 0, score: 0 });
await doc.save();
```

### 4.5 `@stoked-ui/common` — No Mocking

The peer dependency re-exports are pure functions and constants (`isAdminOnlyPublicity`, `PUBLICITY_TYPES`, etc.). Test them as pass-through verifications — no mocking needed.

---

## 5. Coverage Targets

| Metric | Target | Rationale |
|--------|--------|-----------|
| Statements | 70% | Medium-priority package with mostly declarative model definitions |
| Branches | 65% | Key branch coverage in `swapId`, `updateScore`, DTO validators |
| Functions | 80% | Every exported function and schema method should be exercised |
| Lines | 70% | Consistent with statement target |

**Per-module breakdown:**

| Module | Target | Notes |
|--------|--------|-------|
| `decorators/defaultSchemaOptions.ts` | 95%+ | Small file, critical `swapId` function with branching logic |
| `decorators/stdschema.decorator.ts` | 90%+ | Small file, pure logic, `mergeOptions` + cloneDeep |
| `dtos/upload.dto.ts` | 85%+ | Validation boundary — every rule must be exercised |
| `models/base.model.ts` methods | 90%+ | Shared business logic with known bugs |
| `models/uploadSession.model.ts` virtuals | 90%+ | User-facing calculations |
| `models/image.model.ts` methods | 90%+ | Known bugs in like/dislike |
| `models/*.model.ts` class definitions | 50% | Largely declarative `@Prop` schemas; test schema creation succeeds, verify key defaults and indexes |

---

## 6. Test Cases to Implement First

Ordered by risk/value. Implement in this sequence.

### Phase 1: Pure Logic (no DB, fast, highest value)

#### `src/decorators/__tests__/swapId.test.ts`

```
describe('swapId')
  ✓ converts _id to string id on a flat object
  ✓ removes __v from output
  ✓ removes _id from output after conversion
  ✓ does not overwrite existing id field
  ✓ handles nested objects with _id recursively
  ✓ handles arrays of documents (maps each element)
  ✓ handles mixed arrays (objects + primitives)
  ✓ returns null unchanged
  ✓ returns undefined unchanged
  ✓ returns primitive string unchanged
  ✓ returns primitive number unchanged
  ✓ handles empty object {}
  ✓ handles object with only _id (no other fields)
  ✓ converts _id that is an ObjectId instance via .toString()
  ✓ handles deeply nested objects (3+ levels)
```

#### `src/decorators/__tests__/stdschema.decorator.test.ts`

```
describe('StdSchema')
  ✓ registers schema metadata with TypeMetadataStorage
  ✓ applies DefaultSchemaOptions (timestamps: true, virtuals: true)
  ✓ applies swapId transform in toObject and toJSON
  ✓ merges custom options over defaults
  ✓ custom options override default values (e.g., timestamps: false)
  ✓ does not mutate DefaultSchemaOptions across multiple calls (cloneDeep)
  ✓ handles empty options {}
  ✓ handles undefined options (no argument)

describe('DefaultSchemaOptions')
  ✓ has timestamps: true
  ✓ has virtuals: true
  ✓ has toObject.transform set to swapId
  ✓ has toJSON.transform set to swapId
```

#### `src/dtos/__tests__/upload.dto.test.ts`

```
describe('InitiateUploadDto')
  describe('valid inputs')
    ✓ accepts valid video upload (video/mp4, 10MB, required fields)
    ✓ accepts valid image upload (image/png)
    ✓ accepts video/webm, video/quicktime, video/x-matroska
    ✓ accepts image/svg+xml, image/webp
    ✓ accepts optional hash string
    ✓ accepts optional chunkSize within bounds
    ✓ accepts chunkSize at exact minimum (5MB = 5242880)
    ✓ accepts chunkSize at exact maximum (100MB = 104857600)

  describe('filename validation')
    ✓ rejects empty filename
    ✓ rejects missing filename

  describe('mimeType validation')
    ✓ rejects empty mimeType
    ✓ rejects invalid mimeType (application/pdf)
    ✓ rejects audio mimeType (audio/mp3)
    ✓ rejects text mimeType (text/plain)
    ✓ rejects uppercase mimeType (Video/MP4)
    ✓ rejects mimeType without subtype (video/)

  describe('totalSize validation')
    ✓ rejects totalSize = 0
    ✓ rejects negative totalSize
    ✓ rejects non-numeric totalSize

  describe('chunkSize validation')
    ✓ rejects chunkSize below minimum (4999999 bytes)
    ✓ rejects chunkSize above maximum (104857601 bytes)

describe('GetMoreUrlsDto')
  ✓ accepts valid array of 1 part number
  ✓ accepts valid array of 50 part numbers
  ✓ rejects empty array (below ArrayMinSize(1))
  ✓ rejects array with 51 items (above ArrayMaxSize(50))
  ✓ rejects array with non-number values

describe('PartCompletionDto')
  ✓ accepts valid etag string
  ✓ accepts etag with quotes ('"abc123"')
  ✓ rejects empty etag
  ✓ rejects missing etag
```

### Phase 2: Schema Methods (requires mongodb-memory-server)

#### `src/models/__tests__/base.model.test.ts`

```
describe('BaseModelSchema methods')
  describe('addToSet')
    ✓ adds a value to an empty array field
    ✓ deduplicates when adding existing value
    ✓ marks the path as modified

  describe('removeFromArray')
    ✓ removes an existing value
    ✓ no-op when value not present (does not mark modified)
    ✓ preserves other values in array

  describe('like')
    ✓ adds userId to likes array
    ✓ removes userId from dislikes if present
    ✓ calls updateScore
    ✓ calls save when save=true (default)
    ✓ does not call save when save=false

  describe('dislike')
    ✓ adds userId to dislikes array
    ✓ removes userId from likes if present
    ✓ calls updateScore
    ✓ calls save when save=true (default)
    ✓ does not call save when save=false

  describe('view')
    ✓ increments views count by 1
    ✓ BUG: calls addToSet("uniqueViews", userId) but uniqueViews is Number, not array
    ✓ calls updateScore
    ✓ calls save when save=true

  describe('delete')
    ✓ sets deleted=true
    ✓ sets deletedAt to approximately now
    ✓ sets publicity to 'deleted'
    ✓ calls save when save=true
    ✓ does not call save when save=false

  describe('updateScore')
    ✓ BUG: this.views.length is undefined (Number has no .length) — score becomes NaN
    ✓ BUG: this.uniqueViews.length is undefined (Number has no .length)
    ✓ BUG: uses this.likes.length for dislikeScore instead of this.dislikes.length
    ✓ correct formula once bugs are fixed: (likes.length*1.6) + (dislikes.length*0.7) + (views*0.1) + (uniqueViews*-0.8)

describe('BaseModel schema')
  ✓ publicity defaults to 'private'
  ✓ publicity enum accepts: public, private, paid, deleted
  ✓ publicity rejects invalid values
```

#### `src/models/__tests__/uploadSession.model.test.ts`

```
describe('UploadSession')
  describe('progress virtual')
    ✓ returns 0 when totalParts is 0 (division by zero guard)
    ✓ returns 0 when no parts are completed
    ✓ returns 50 when 5 of 10 parts are completed
    ✓ returns 100 when all parts are completed
    ✓ rounds to nearest integer (e.g., 1/3 = 33 not 33.33)
    ✓ ignores parts with status "pending", "uploading", "failed"

  describe('completedPartsCount virtual')
    ✓ returns 0 for empty parts array
    ✓ returns 0 when all parts are pending
    ✓ counts only parts with status "completed"
    ✓ ignores parts with status "failed"

  describe('uploadedBytes virtual')
    ✓ returns 0 for empty parts array
    ✓ sums sizes of completed parts only
    ✓ ignores sizes of failed/pending parts

  describe('schema defaults')
    ✓ status defaults to "pending"
    ✓ region defaults to "us-east-1"

  describe('schema indexes')
    ✓ has TTL index on expiresAt with expireAfterSeconds: 0
    ✓ has compound index on userId+status+expiresAt
    ✓ has compound index on hash+status

  describe('required fields')
    ✓ rejects document without userId
    ✓ rejects document without uploadId
    ✓ rejects document without s3Key
    ✓ rejects document without bucket
    ✓ rejects document without filename
    ✓ rejects document without mimeType
    ✓ rejects document without totalSize
    ✓ rejects document without chunkSize
    ✓ rejects document without totalParts
    ✓ rejects document without expiresAt
```

### Phase 3: Model Schemas (validate creation, indexes, inheritance)

#### `src/models/__tests__/image.model.test.ts`

```
describe('ImageSchema')
  ✓ creates a valid Image document
  ✓ inherits fields from File and BaseModel
  ✓ type defaults to "image"
  ✓ mediaType virtual returns "image"

  describe('dislike method - KNOWN BUGS')
    ✓ BUG: Array.from(userId) splits string into characters instead of using dislikeSet
    ✓ BUG: callback-first signature (cb, userId) differs from BaseModel (userId, save)

  describe('like method - KNOWN BUGS')
    ✓ BUG: assigns to this.dislikes instead of this.likes
    ✓ BUG: markModified("likeSet") should be markModified("likes")
    ✓ BUG: callback-first signature (cb, userId) differs from BaseModel (userId, save)
```

#### `src/models/__tests__/video.model.test.ts`

```
describe('VideoSchema')
  ✓ creates a valid Video document
  ✓ inherits fields from File and BaseModel
  ✓ type defaults to "video"
  ✓ mediaType virtual returns "video"
  ✓ thumbnailGenerationFailed defaults to false
  ✓ isStreamRecording defaults to false
  ✓ scrubberGenerated defaults to false
  ✓ scrubberGenerationFailed defaults to false
  ✓ container enum accepts: mp4, mov, webm, mkv
  ✓ moovAtomPosition enum accepts: start, end
```

#### `src/models/__tests__/media.model.test.ts`

```
describe('MediaSchema')
  ✓ creates a valid Media document
  ✓ inherits fields from File and BaseModel
  ✓ copies BaseModelSchema methods (like, dislike, view, delete, updateScore)
  ✓ embedVisibility defaults to "private"
  ✓ embedVisibility enum accepts: public, authenticated, private
  ✓ hasPlaybackIssues defaults to false

  describe('indexes')
    ✓ has text search index with weights (title:10, tags:5, description:1)
    ✓ has compound index media_views_date
    ✓ has compound index media_author_date
    ✓ has compound index media_type_date
    ✓ has compound index media_price_date
    ✓ has compound index media_publicity_date
    ✓ has compound index media_score_date
    ✓ has sparse index on duration
```

#### `src/models/__tests__/blogPost.model.test.ts`

```
describe('BlogPostSchema')
  ✓ creates a valid BlogPost document
  ✓ inherits fields from File and BaseModel
  ✓ copies BaseModelSchema methods
  ✓ status defaults to "draft"
  ✓ status enum accepts: draft, published, archived
  ✓ source defaults to "native"
  ✓ source enum accepts: native, nostr, import
  ✓ targetSites defaults to ['stoked-ui.com']
  ✓ slug is required
  ✓ body is required
  ✓ enforces unique slug constraint
  ✓ has text search index with correct weights
  ✓ has compound index blogpost_status_date
  ✓ has sparse index on nostrEventId
```

#### `src/models/__tests__/license.model.test.ts`

```
describe('LicenseSchema')
  ✓ creates a valid License document
  ✓ status defaults to "pending"
  ✓ status enum accepts: pending, active, expired, revoked
  ✓ gracePeriodDays defaults to 14
  ✓ deactivationCount defaults to 0
  ✓ enforces unique key constraint
  ✓ has compound index on email+productId
  ✓ has sparse index on hardwareId
  ✓ has index on stripeSubscriptionId
  ✓ has compound index on status+expiresAt
```

#### `src/models/__tests__/product.model.test.ts`

```
describe('ProductSchema')
  ✓ creates a valid Product document
  ✓ licenseDurationDays defaults to 365
  ✓ gracePeriodDays defaults to 14
  ✓ trialDurationDays defaults to 30
  ✓ enforces unique productId constraint
```

#### `src/models/__tests__/invoice.model.test.ts`

```
describe('InvoiceSchema')
  ✓ creates a valid Invoice document with nested weeks and tasks
  ✓ weeks defaults to empty array
  ✓ configId is required
  ✓ customer is required
  ✓ totalHours is required
  ✓ has compound index invoice_customer_date
  ✓ has compound index invoice_config_date
```

#### `src/models/__tests__/file.model.test.ts`

```
describe('FileSchema')
  ✓ creates a valid File document extending BaseModel
  ✓ rating defaults to "nc17"
  ✓ rating enum accepts: ga, nc17
  ✓ inherits all BaseModel fields (likes, dislikes, publicity, etc.)
```

### Phase 4: Export Verification

#### `src/__tests__/index.test.ts`

```
describe('package exports')
  describe('models')
    ✓ exports BaseModel class and BaseModelSchema
    ✓ exports File class, FileSchema, FileFeature
    ✓ exports Image class, ImageSchema, ImageFeature
    ✓ exports Video class, VideoSchema, VideoFeature
    ✓ exports Media class, MediaSchema, MediaFeature, MediaDocument type
    ✓ exports UploadSession class, UploadSessionSchema, UploadSessionFeature
    ✓ exports BlogPost class, BlogPostSchema, BlogPostFeature
    ✓ exports License class, LicenseSchema, LicenseFeature
    ✓ exports Product class, ProductSchema, ProductFeature
    ✓ exports Invoice class, InvoiceSchema, InvoiceFeature

  describe('DTOs')
    ✓ exports InitiateUploadDto
    ✓ exports GetMoreUrlsDto
    ✓ exports PartCompletionDto
    ✓ exports PresignedUrlDto
    ✓ exports InitiateUploadResponseDto
    ✓ exports UploadStatusResponseDto
    ✓ exports PartCompletionResponseDto
    ✓ exports CompleteUploadResponseDto
    ✓ exports ActiveUploadDto
    ✓ exports ActiveUploadsResponseDto

  describe('decorators')
    ✓ exports StdSchema function
    ✓ exports DefaultSchemaOptions object
    ✓ exports swapId function

  describe('@stoked-ui/common re-exports')
    ✓ exports PUBLICITY_TYPES constant
    ✓ exports ADMIN_ONLY_PUBLICITY_TYPES
    ✓ exports ALL_FILTER_PUBLICITY_TYPES
    ✓ exports isAdminOnlyPublicity function
    ✓ exports isIncludedInAllFilter function
    ✓ exports DEFAULT_EMBED_VISIBILITY
    ✓ exports PUBLIC_EMBED_VISIBILITY_TYPES
    ✓ exports AUTHENTICATED_EMBED_VISIBILITY_TYPES
    ✓ exports isPublicEmbedVisibility function
    ✓ exports isAuthenticatedEmbedVisibility function
```

---

## 7. Implementation Notes

### Decorator Metadata Caveat

Tests for models using `@StdSchema` and `@Prop` rely on `reflect-metadata` and experimental decorators. The `jest.config.js` must enable `experimentalDecorators: true` and `emitDecoratorMetadata: true` in the ts-jest tsconfig. Add `import 'reflect-metadata'` at the top of test setup if decorator metadata isn't resolving.

### `.js` Extension in Imports

Source files use `.js` extensions in relative imports (e.g., `from "./file.model.js"`). The `moduleNameMapper` rule `'^(.*)\\.js$': '$1'` in `jest.config.js` strips these so ts-jest resolves to `.ts` files.

### ESM Dependency Transformation

`mongoose`, `bson`, `mongodb`, and `@nestjs/mongoose` ship as ESM. The `transformIgnorePatterns` in `jest.config.js` must allow these to be transformed by ts-jest. This matches the pattern from `sui-media/jest.config.js` which also excludes these from ignore.

### `view()` Method Schema Inconsistency

`BaseModel` declares `uniqueViews` as `@Prop({ type: Number })`, but `view()` calls `this.addToSet("uniqueViews", userId)` which treats it as an array. Tests should document this — it will throw at runtime when `Set` constructor receives a number.

### `Image` Method Signature Mismatch

`BaseModelSchema.methods.like/dislike` use signature `(userId: string, save = true)` while `ImageSchema.methods.like/dislike` use `(cb: () => void, userId: string)`. This is a polymorphism bug — callers using the BaseModel interface will pass wrong arguments. Tests should document this.

### Bug Fix Priority

When implementing tests, write failing tests first for the known bugs. These tests serve as regression anchors. Fix the bugs after tests are in place:

1. **`base.model.ts:102`** — `dislikeScore` should use `this.dislikes.length` not `this.likes.length`
2. **`base.model.ts:103-104`** — `views` and `uniqueViews` score terms should use the number directly, not `.length`
3. **`base.model.ts:82-89`** — `view()` calls `addToSet` on Number field `uniqueViews` — needs schema change or method fix
4. **`image.model.ts:68`** — `Array.from(dislikeSet)` not `Array.from(userId)`
5. **`image.model.ts:76`** — Assign to `this.likes`, use `Array.from(likeSet)`, `markModified("likes")`
6. **`image.model.ts:65,73`** — Align method signatures with `BaseModel` convention `(userId, save)`

### Test Execution Order

Phase 1 tests (pure logic) should run first and fast — they need no DB and provide the most signal per millisecond. Phase 2-3 tests (mongodb-memory-server) are slower due to DB setup/teardown but validate real Mongoose behavior. Phase 4 (exports) is a safety net that catches missing re-exports or broken barrel files.

Estimated test count: **~135 test cases** across 14 test files.
