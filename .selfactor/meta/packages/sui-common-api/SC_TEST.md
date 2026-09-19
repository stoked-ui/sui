# Testing Strategy: `@stoked-ui/common-api`

> **Generated:** 2026-05-21 | **Refreshed:** 2026-06-06; **re-verified 2026-06-22** for v0.6.0 (re-read `base.model.ts`, `image.model.ts`, `defaultSchemaOptions.ts`, `stdschema.decorator.ts`, `package.json`, both tsconfigs against the v0.6.0 `SC_MODULE.md`) | **Meta version:** 0.6.0
> **Package:** `packages/sui-common-api` (`@stoked-ui/common-api` v0.1.0)
> **Priority:** Medium
> **Source entry:** `packages/sui-common-api/src/index.ts`
> **Axioms:** `packages/sui-common-api/.axioms.md` (9 active: `AX-MOD-SUICOMMONAPI-001…009`)
>
> **2026-06-22 re-verification result — NO DRIFT.** All six known bugs are still present at the exact lines cited in §4.2 (`base.model.ts:102` dislikeScore-uses-likes; `:103-104` `.length` on Number props → `NaN`; `:82-89` `addToSet('uniqueViews', …)` on a Number; `image.model.ts:68` `Array.from(userId)` char-split; `:76-77` `like()` writes `this.dislikes` + `markModified('likeSet')`; `:65,73` `(cb, userId)` signature). `swapId` (27 lines) and `StdSchema`/`mergeOptions`/`cloneDeep` (29 lines) are byte-for-byte as described. Still **0 committed tests, no `test` script, no test runner** in `package.json` — so `pnpm --filter @stoked-ui/common-api test` still errors (missing script), and the `AX-MOD-SUICOMMONAPI-008` acceptance check cannot pass until §2 lands. This plan is unchanged and current.

`@stoked-ui/common-api` is the **server-side schema + DTO layer** for every Stoked UI NestJS API service. It ships 12 Mongoose models (each as a `class` + `Schema` + `*Feature: ModelDefinition` triple), two schema decorators (`@StdSchema`, `DefaultSchemaOptions`/`swapId`), and the multipart-upload wire DTOs. It has **no controllers, services, or providers** — it is pure schema/contract code consumed today by `@stoked-ui/media-api` via `MongooseModule.forFeature([...])`.

> **Backend-only (`AX-MOD-SUICOMMONAPI-002`).** Depends on `@nestjs/mongoose`, `@nestjs/swagger`, `class-validator`, `mongoose`. Test environment is **Node**, never `jsdom`.

---

## 1. Current State (verified 2026-06-06)

| Item | Status |
|---|---|
| Test runner | **None configured** — no `jest`/`ts-jest` in `devDependencies`, no `jest.config.js`, no `jest` key in `package.json`, no `test` script |
| Committed tests | **0** (`find src -name '*.test.*' -o -name '*.spec.*'` → empty) |
| Coverage | **0%** |
| `typescript` script | `tsc -p tsconfig.json` — passes today; `experimentalDecorators` + `emitDecoratorMetadata` enabled, `types: ["node"]` |
| Build | Babel pipeline (`build:modern`→`node`→`stable`→`types`→`copy-files`); ignores `*.test.*` / `*.spec.*` / `*.d.ts` (`scripts/build.mjs`) |
| Closest analog with tests | `packages/sui-media-api` — same NestJS/Mongoose stack (see §1.1) |

`AX-MOD-SUICOMMONAPI-008` ("existing tests must pass before merge") already names this file as the source of truth and declares the test globs `src/**/__tests__/**/*.{ts,tsx}`, `src/**/*.test.{ts,tsx}`, `src/**/*.spec.{ts,tsx}` with acceptance check `pnpm --filter @stoked-ui/common-api test`. That `test` script must be added (see §2). Until it exists, `pnpm --filter @stoked-ui/common-api test` **errors** (missing script) rather than running zero tests.

### 1.1 The `sui-media-api` precedent (verified — read carefully, it is partly the model and partly NOT)

`sui-media-api` is the only in-tree NestJS/Mongoose package with tests (8 `*.spec.ts` files). Verified facts:

- **Runner & naming (COPY THIS):** Jest + `ts-jest` ^29.1.2, files named **`*.spec.ts`**, `testRegex: ".*\\.spec\\.ts$"`, `testEnvironment: "node"`, `rootDir: "src"`.
- **Config location (COPY THIS):** the Jest config is the **`jest` key inside `packages/sui-media-api/package.json`** — there is **no `jest.config.js`** (only `test/jest-e2e.json` for a separate e2e run). `transform` is `ts-jest` with `{ diagnostics: false, tsconfig: { jsx: "react", allowJs: true } }`. `test` script is simply `"jest"`.
- **DB strategy (DO *NOT* COPY — this is the key divergence):** media-api **mocks** its Mongoose models and collaborators with `Test.createTestingModule({ providers: [{ provide: …, useValue: {…} }] })`. It has **no `mongodb-memory-server` dependency** and never connects to a real Mongo. That is correct *there* because the schema is not the unit under test — the service logic is. **Here the schema *is* the unit under test, so mocking the model would test nothing.** This package must run real schemas against an in-memory Mongo (§5.1). This is a deliberate, justified divergence, aligned with `AX-CANDIDATE-REPO-NO-MOCKED-DB-IN-TESTS` (account-wide preference for real DBs over mocked models).

---

## 2. Test Framework & Tooling

### Framework: Jest + `ts-jest` + `mongodb-memory-server`, **`.spec.ts` naming**

> **⚠️ Use `.spec.ts`, NOT `.test.ts`. This is the single most important decision in this file.**
> The umbrella Mocha CI gate globs **`packages/**/*.test.{js,ts,tsx}`** (root `package.json` → `test:unit`, `test:coverage`, `test:coverage:ci`, all verified 2026-06-06) and excludes **only** `packages/pigment-css-react/**`. That suite runs under Babel + jsdom (`.mocharc.js`). A `*.test.ts` file added here would be swept into the umbrella Mocha and force NestJS-decorator + Mongoose-ESM + `mongodb-memory-server` code through a jsdom/Babel context — **breaking the CI gate**. `.spec.ts` files are invisible to that glob, exactly like `sui-media-api`. (`sui-media`/`sui-common` are the only sanctioned `.test.ts` Jest islands and are a known friction source — do not add a third.)

### devDependencies to add

```jsonc
{
  "jest": "^29.7.0",
  "ts-jest": "^29.1.2",
  "@types/jest": "^29.5.0",
  "mongodb-memory-server": "^9.1.0",
  "reflect-metadata": "^0.2.0"
}
```

`jest`/`ts-jest` pinned to match `sui-media-api`. `mongodb-memory-server` and `reflect-metadata` are the two additions over the media-api precedent — the first because the schema *is* the unit under test, the second because the model classes rely on emitted decorator metadata at import time.

### Jest config

Two valid placements — pick one:

1. **`jest` key in `package.json`** — mirrors the `sui-media-api` precedent exactly.
2. **`jest.config.js`** — easier to comment; shown below.

```js
// packages/sui-common-api/jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',              // server-side only — never jsdom
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',         // .spec.ts ONLY (keeps out of the umbrella Mocha glob)
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      diagnostics: false,               // match media-api: don't fail on type errors in tests
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
  // Source uses `.js` suffixes on relative ESM imports (e.g. `from './file.model.js'`).
  // Strip them so ts-jest resolves the sibling `.ts`. The leading ./ or ../ anchor
  // prevents rewriting node_modules specifiers. (media-api needs no such mapper.)
  moduleNameMapper: { '^(\\.{1,2}/.*)\\.js$': '$1' },
  setupFiles: ['reflect-metadata'],     // load before decorated classes import
  testPathIgnorePatterns: ['/node_modules/', '/build/', '/dist/'],
  // mongoose/bson/mongodb/@nestjs/mongoose ship ESM — let ts-jest transform them.
  transformIgnorePatterns: ['node_modules/(?!(bson|mongodb|mongoose|@nestjs/mongoose)/)'],
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

Adding `test` satisfies `AX-MOD-SUICOMMONAPI-008`'s acceptance check `pnpm --filter @stoked-ui/common-api test`.

### ⚠️ tsconfig must exclude test files (or the `typescript` acceptance check breaks)

`tsconfig.json` (used by `pnpm --filter @stoked-ui/common-api typescript`) currently has `include: ["src/**/*"]` and only `exclude: ["**/*.test.tsx"]` (verified). With `.spec.ts` files present, `tsc -p tsconfig.json` pulls them in and **fails on Jest globals** (`describe`, `it`, `expect`, `jest`) because `types: ["node"]` omits `@types/jest`. Extend the exclude **before** adding any test:

```jsonc
// packages/sui-common-api/tsconfig.json
"exclude": ["**/*.test.tsx", "src/**/*.spec.ts", "src/**/*.spec.tsx", "src/**/__tests__/**"]
```

`tsconfig.build.json` already excludes `src/**/*.spec.ts*` and `src/**/*.test.ts*` (verified), so the **type build** is safe — but a non-suffixed helper (e.g. `__tests__/db.setup.ts`) is only covered by the `__tests__/**` glob above, which is why it is included.

---

## 3. Test File Organization

Co-located `__tests__/` directories; file names mirror the source with a **`.spec.ts`** suffix:

```
src/
├── __tests__/
│   └── index.spec.ts                       # Public-API export verification
├── decorators/
│   └── __tests__/
│       ├── swapId.spec.ts                   # Pure function — no DB
│       └── stdschema.decorator.spec.ts      # Metadata spy
├── dtos/
│   └── __tests__/
│       └── upload.dto.spec.ts               # class-validator validate()
└── models/
    └── __tests__/
        ├── db.setup.ts                      # mongodb-memory-server lifecycle (no .spec suffix)
        ├── base.model.spec.ts
        ├── file.model.spec.ts
        ├── image.model.spec.ts
        ├── video.model.spec.ts
        ├── media.model.spec.ts
        ├── uploadSession.model.spec.ts
        ├── blogPost.model.spec.ts
        ├── license.model.spec.ts
        ├── product.model.spec.ts
        ├── invoice.model.spec.ts
        ├── client.model.spec.ts
        └── user.model.spec.ts
```

**Convention:** mirror the source filename, swap the extension to `.spec.ts`. Helper/setup files that are not suites carry no `.spec` suffix and must live under `__tests__/` (covered by the tsconfig exclude above and ignored by `testRegex`).

---

## 4. What Should Be Tested

### 4.1 Critical Paths (P0)

| Area | Why Critical | Source |
|------|--------------|--------|
| `swapId` transform | Every model's `toJSON`/`toObject` flows through it — a bug corrupts **every** API response shape. Wire-format contract per `AX-MOD-SUICOMMONAPI-003` and repo `AX-REPO-SWAP-ID-WIRE-FORMAT`. | `src/decorators/defaultSchemaOptions.ts:1-27` |
| `StdSchema` + `mergeOptions` + `cloneDeep` | Registers schema metadata via the version-sensitive deep import `@nestjs/mongoose/dist/storages/type-metadata.storage.js`. Compatibility boundary per `AX-MOD-SUICOMMONAPI-007`. | `src/decorators/stdschema.decorator.ts:1-29` |
| `BaseModelSchema` instance methods | `like`, `dislike`, `view`, `delete`, `updateScore`, `addToSet`, `removeFromArray` — engagement primitives shared by all content models. **Multiple known bugs (§4.2).** | `src/models/base.model.ts:49-106` |
| `InitiateUploadDto` validation | Guards the multipart-upload entry point; multi-client wire contract per `AX-MOD-SUICOMMONAPI-005`. | `src/dtos/upload.dto.ts:19-68` |
| `UploadSession` virtuals | `progress`, `completedPartsCount`, `uploadedBytes` drive the resumable-upload UI; count only `status === "completed"`. | `src/models/uploadSession.model.ts:160-180` |
| Inheritance + method-copy chain | `BaseModel → File → Media/Image/Video/BlogPost`. `Media` copies methods by reference (`MediaSchema.methods = BaseModelSchema.methods`, `media.model.ts:95`); `BlogPost` does the same — silent to lose. | multiple files |
| Production index declarations | Performance contract per `AX-MOD-SUICOMMONAPI-006`: 8 indexes on `MediaSchema`, TTL on `UploadSessionSchema.expiresAt`, unique on `License.key` / `BlogPost.slug` / `Product.productId` / `Client.slug` / `User.email`. | `media.model.ts`, `uploadSession.model.ts`, `license.model.ts`, `blogPost.model.ts`, `product.model.ts` |

### 4.2 Known Bugs (TDD: write the failing `.spec.ts` first, see it RED, then fix → GREEN — per Axiom 5)

All six re-confirmed present in source at the 2026-06-06 re-read, with exact line references.

| # | Location | Issue |
|---|----------|-------|
| 1 | `base.model.ts:102` | `const dislikeScore = this.likes.length * 0.7` — references `likes`; should be `this.dislikes.length`. |
| 2 | `base.model.ts:103-104` | `this.views.length` and `this.uniqueViews.length` are `undefined` — both are `@Prop({ type: Number })` (lines 37-41), not arrays → `score` becomes `NaN`. |
| 3 | `base.model.ts:82-89` | `view()` calls `this.addToSet("uniqueViews", userId)` → `new Set(this.uniqueViews)` on a Number field; throws `TypeError: number is not iterable` once `uniqueViews` holds a number. |
| 4 | `image.model.ts:68` | `dislike()`: `this.dislikes = Array.from(userId)` splits the user-id **string** into characters (`"abc"` → `["a","b","c"]`); the constructed `dislikeSet` (line 66-67) is never used. Should be `Array.from(dislikeSet)`. |
| 5 | `image.model.ts:76-77` | `like()` writes the **wrong field** (`this.dislikes = Array.from(userId)`) and `markModified("likeSet")` targets a non-existent path. Should set `this.likes = Array.from(likeSet)` and `markModified("likes")`. |
| 6 | `image.model.ts:65,73` | `like`/`dislike` use a callback-first signature `(cb, userId)` that diverges from `BaseModel`'s `(userId, save)` — polymorphism break for any caller treating an `Image` as a `BaseModel`. |

### 4.3 Edge Cases

**`swapId` (`defaultSchemaOptions.ts`):**
- `null`, `undefined`, and primitive (string/number/boolean) inputs pass through untouched
- Deeply nested objects (3+ levels) convert recursively
- Already has `id` → must **not** overwrite (guard `ret._id && !ret.id`, line 10)
- `_id` is a `mongoose.Types.ObjectId` instance → converted via `.toString()`
- Object with only `_id` and no other fields
- Mixed arrays of objects + primitives; top-level array; empty `{}` / empty `[]`
- `Date`-valued fields survive intact (object-typed but must not be mangled — note: the recursion descends into every object-typed value, so this is a real regression risk)

**`InitiateUploadDto` (`upload.dto.ts:19-68`):**
- `totalSize = 0` / negative → rejected by `@Min(1)`
- `chunkSize` at exact boundaries `5242880` (5 MiB, S3 min) and `104857600` (100 MiB); reject `5242879` and `104857601`
- `mimeType` accepts `video/mp4`, `video/webm`, `video/quicktime`, `video/x-matroska`, `image/png`, `image/svg+xml`, `image/webp` (regex `/^(video|image)\/[a-z0-9.+-]+$/`)
- `mimeType` rejects `application/pdf`, `audio/mp3`, `text/plain`, `Video/MP4` (uppercase), `video/` (no subtype)
- `GetMoreUrlsDto.partNumbers`: 0 items (`@ArrayMinSize(1)`), 51 items (`@ArrayMaxSize(50)`), non-numeric entries (`@IsNumber({}, { each: true })`)
- `PartCompletionDto.etag`: empty string rejected (`@IsNotEmpty`)

**`UploadSession` virtuals (`uploadSession.model.ts:160-180`):**
- `progress` returns `0` when `totalParts === 0` (div-by-zero guard, line 161)
- `progress` `Math.round`s (1/3 parts → `33`)
- `completedPartsCount` / `uploadedBytes` ignore `pending`, `uploading`, `failed` parts

**Schema defaults to verify (read straight from `@Prop` declarations):**
- `BaseModel.publicity` → `'private'`; enum `public|private|paid|deleted` (line 31)
- `File.rating` → `'nc17'`; enum `ga|nc17`
- `Image.type` → `'image'` (line 14); `mediaType` virtual → `'image'` (line 61-63)
- `Video.type` → `'video'`; `mediaType` virtual → `'video'`; `thumbnailGenerationFailed`/`isStreamRecording`/`scrubberGenerated`/`scrubberGenerationFailed` → `false`
- `Media.embedVisibility` → `'private'` (line 75, enum `public|authenticated|private`); `Media.hasPlaybackIssues` → `false` (line 55)
- `UploadSession.status` → `'pending'` (line 104); `UploadSession.region` → `'us-east-1'` (line 68); part `status` default `'pending'`
- `License.status` → `'pending'`; `gracePeriodDays` → `14`; `deactivationCount` → `0`
- `Product.licenseDurationDays` → `365`; `gracePeriodDays` → `14`; `trialDurationDays` → `30`; `currency` → `'usd'`
- `BlogPost.status` → `'draft'`; `source` → `'native'`; `targetSites` → `['sui.stokd.cloud']`
- `Client.active` → `true`; `User.role` → `'client'` (TS union only — **no Mongoose `enum`**, so invalid roles are NOT rejected at the DB layer — assert this gap explicitly); `User.active` → `true`

**`StdSchema` / `mergeOptions` (`stdschema.decorator.ts`):**
- `undefined` and empty `{}` options (`options ?? {}`, line 22)
- Custom options override defaults (e.g. `timestamps: false`)
- `cloneDeep` isolation — call `StdSchema()` twice and assert `DefaultSchemaOptions` itself is unmodified (mutation must not leak across calls; the whole point of `cloneDeep(stdOptions)` on line 21)

### 4.4 Integration Points

- `TypeMetadataStorage.addSchemaMetadata()` registration inside `StdSchema` (line 24)
- `SchemaFactory.createForClass()` produces the expected paths per model
- Method-copy idiom: `MediaSchema.methods = BaseModelSchema.methods` (`media.model.ts:95`), same in `blogPost.model.ts`
- Index declarations: `MediaSchema` (8 — `media_text_search`, `media_views_date`, `media_author_date`, `media_type_date`, `media_price_date`, `media_publicity_date`, `media_score_date`, `media_duration` sparse), `UploadSessionSchema` (3 incl. TTL `expireAfterSeconds: 0` on `expiresAt`, compound `(userId,status,expiresAt)`, `(hash,status)`), `LicenseSchema` (5), `BlogPostSchema` (text + compounds + unique slug + sparse nostrEventId)
- Re-exports from `@stoked-ui/common` (`src/index.ts:9-22`) — PUBLICITY / EmbedVisibility constants + helpers
- `*Feature: ModelDefinition` objects consumed by `MongooseModule.forFeature([...])` in `sui-media-api`

---

## 5. Mock / Stub Strategy

### 5.1 Mongoose — in-memory MongoDB (no model mocks)

Real schema behavior (methods, virtuals, indexes, defaults, `required`) **is** the contract under test, so it cannot be mocked away. Use `mongodb-memory-server`. This is the deliberate divergence from `sui-media-api` (which mocks models because its services, not schemas, are the unit there — see §1.1), and it aligns with `AX-CANDIDATE-REPO-NO-MOCKED-DB-IN-TESTS`.

```ts
// src/models/__tests__/db.setup.ts
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
  const { collections } = mongoose.connection;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
});
```

### 5.2 NestJS metadata — spy, no container

`StdSchema` is a pure metadata-registration function; no Nest app context is needed (unlike media-api, which spins up `Test.createTestingModule`).

```ts
import { TypeMetadataStorage } from '@nestjs/mongoose/dist/storages/type-metadata.storage.js';
const spy = jest.spyOn(TypeMetadataStorage, 'addSchemaMetadata');
```

### 5.3 `class-validator` — call `validate()` directly

```ts
import { validate } from 'class-validator';
import { InitiateUploadDto } from '../upload.dto.js';

const dto = Object.assign(new InitiateUploadDto(), {
  filename: 'test.mp4', mimeType: 'video/mp4', totalSize: 10485760,
});
expect(await validate(dto)).toHaveLength(0);   // no HTTP, no ValidationPipe, no Nest app
```

### 5.4 Schema methods — register a throwaway model

```ts
import mongoose from 'mongoose';
import { BaseModelSchema } from '../base.model.js';

const TestModel = mongoose.model('TestBase', BaseModelSchema);
const doc = new TestModel({ likes: [], dislikes: [], views: 0, uniqueViews: 0, score: 0 });
```

### 5.5 `@stoked-ui/common` re-exports — no mocks

`isAdminOnlyPublicity`, `PUBLICITY_TYPES`, etc. are pure constants/functions. Use them as real; only assert they re-export through `src/index.ts`.

---

## 6. Coverage Targets

Medium priority; the file is mostly declarative `@Prop` definitions, so meaningful coverage concentrates in the small amount of behavioral code (`swapId`, `updateScore`, DTO validators, virtuals).

| Metric | Target | Rationale |
|--------|--------|-----------|
| Statements | 70% | Majority of LOC is declarative schema. |
| Branches | 65% | Concentrated in `swapId`, `updateScore`, DTO validators. |
| Functions | 80% | Every exported function + schema method exercised. |
| Lines | 70% | Tracks statements. |

**Per-module:**

| Module | Target | Notes |
|--------|--------|-------|
| `decorators/defaultSchemaOptions.ts` | 95% | Small, heavily-branched `swapId`. |
| `decorators/stdschema.decorator.ts` | 90% | `mergeOptions` + `cloneDeep` isolation. |
| `dtos/upload.dto.ts` | 85% | Every validation rule. |
| `models/base.model.ts` methods | 90% | Known bugs — high regression value. |
| `models/uploadSession.model.ts` virtuals | 90% | User-facing calculations. |
| `models/image.model.ts` methods | 90% | Known bugs. |
| Other `*.model.ts` | 50% | Declarative; verify create, defaults, key indexes. |

> Do **not** add a hard `coverageThreshold` gate until the first suites land green and the numbers stabilize; a premature gate blocks incremental adoption.

---

## 7. Test Cases to Implement First

Ordered by risk/value. Phase 1 is pure logic — highest signal per millisecond, no DB startup.

### Phase 1 — Pure logic (no DB)

#### `src/decorators/__tests__/swapId.spec.ts`
```
describe('swapId')
  ✓ converts _id to string id on a flat object
  ✓ removes __v and _id from output
  ✓ does not overwrite an existing id
  ✓ converts nested objects recursively (3+ levels)
  ✓ maps arrays of documents; handles mixed arrays (objects + primitives)
  ✓ returns null / undefined / primitive (string|number) unchanged
  ✓ handles empty object {} and empty array []
  ✓ converts an ObjectId instance via .toString()
  ✓ preserves Date-valued fields
```

#### `src/decorators/__tests__/stdschema.decorator.spec.ts`
```
describe('StdSchema')
  ✓ registers metadata via TypeMetadataStorage.addSchemaMetadata
  ✓ default options include timestamps:true and virtuals:true
  ✓ default options install swapId on toObject and toJSON
  ✓ custom options override defaults (e.g. timestamps:false)
  ✓ accepts undefined and empty {} options
  ✓ does NOT mutate DefaultSchemaOptions across calls (cloneDeep isolation)
```

#### `src/dtos/__tests__/upload.dto.spec.ts`
```
describe('InitiateUploadDto')
  valid: video/mp4+10MB · image/png · video/webm|quicktime|x-matroska · image/svg+xml|webp
         · optional hash+chunkSize · chunkSize at exact 5MB min · at exact 100MB max
  filename: rejects empty/missing
  mimeType: rejects application/pdf, audio/mp3, text/plain, Video/MP4 (uppercase), video/ (no subtype)
  totalSize: rejects 0 / negative / non-numeric
  chunkSize: rejects 5242879 (below min) and 104857601 (above max)
describe('GetMoreUrlsDto')  ✓ 1 item · 50 items · reject 0 · reject 51 · reject non-numeric
describe('PartCompletionDto') ✓ accepts quoted ETag · rejects empty etag
```

### Phase 2 — Schema behavior (mongodb-memory-server)

#### `src/models/__tests__/base.model.spec.ts`
```
addToSet         ✓ adds to empty · dedupes · markModified
removeFromArray  ✓ removes existing · no-op when absent (no markModified)
like / dislike   ✓ adds to target, removes from opposite · calls updateScore · save=false skips save()
view             ✓ increments views by 1 · BUG-3: addToSet('uniqueViews',…) on Number throws
delete           ✓ deleted=true, deletedAt≈now, publicity='deleted'
updateScore      ✓ BUG-1 dislikeScore uses this.likes.length (line 102)
                 ✓ BUG-2 this.views.length / this.uniqueViews.length undefined → NaN (lines 103-104)
                 ✓ post-fix formula intent: 1.6·likes + 0.7·dislikes + 0.1·views − 0.8·uniqueViews
schema           ✓ publicity defaults 'private' · enum public|private|paid|deleted
```

#### `src/models/__tests__/uploadSession.model.spec.ts`
```
progress           ✓ 0 when totalParts===0 · counts only 'completed' · rounds (1/3 → 33)
completedPartsCount/uploadedBytes ✓ ignore pending|uploading|failed
schema             ✓ status default 'pending' · region default 'us-east-1' · part status default 'pending'
                   ✓ rejects missing required: userId|uploadId|s3Key|bucket|filename|mimeType|totalSize|chunkSize|totalParts|expiresAt
indexes            ✓ TTL on expiresAt (expireAfterSeconds:0) · (userId,status,expiresAt) · (hash,status)
```

#### `src/models/__tests__/image.model.spec.ts`
```
✓ creates valid Image inheriting File+BaseModel · type default 'image' · mediaType virtual 'image'
KNOWN BUGS
  ✓ BUG-4 dislike() Array.from(userId) splits string into characters (line 68)
  ✓ BUG-5 like() writes this.dislikes; markModified('likeSet') hits no path (lines 76-77)
  ✓ BUG-6 like/dislike signature is (cb,userId), not (userId,save) (lines 65,73)
```

### Phase 3 — Remaining model schemas (create, defaults, inheritance, indexes)

```
video.model.spec.ts   ✓ type 'video' · mediaType virtual 'video' · *Failed/scrubber* default false
                      ✓ container enum mp4|mov|webm|mkv · moovAtomPosition enum start|end
media.model.spec.ts   ✓ inherits File+BaseModel · methods copied from BaseModelSchema (are functions, line 95)
                      ✓ embedVisibility default 'private' enum public|authenticated|private · hasPlaybackIssues false
                      ✓ 8 indexes incl. media_text_search weights {title:10,tags:5,description:1} · media_duration sparse
blogPost.model.spec.ts✓ inherits File+BaseModel + copied methods · status 'draft' · source 'native'
                      ✓ targetSites ['sui.stokd.cloud'] · slug+body required · unique slug · sparse nostrEventId
license.model.spec.ts ✓ status 'pending' enum · gracePeriodDays 14 · deactivationCount 0 · unique key
                      ✓ indexes (email,productId) · sparse(hardwareId) · stripeSubscriptionId · (status,expiresAt)
product.model.spec.ts ✓ licenseDurationDays 365 · gracePeriodDays 14 · trialDurationDays 30 · currency 'usd' · unique productId
invoice.model.spec.ts ✓ nested weeks/tasks subdocs · weeks default [] · required configId/customer/totalHours
                      ✓ compound invoice_customer_date · invoice_config_date
file.model.spec.ts    ✓ extends BaseModel (all base fields) · rating 'nc17' enum ga|nc17 · bucket indexed
client.model.spec.ts  ✓ active default true · unique slug · required name/contactEmail
user.model.spec.ts    ✓ role default 'client' (NO db enum — invalid role accepted) · active default true · unique email
```

### Phase 4 — Public API surface

#### `src/__tests__/index.spec.ts`
```
models barrel    ✓ classes {Base|File|Image|Video|Media|UploadSession|BlogPost|License|Product|Invoice|Client|User}
                 ✓ matching *Schema and *Feature (ModelDefinition {name,schema}) objects
DTO barrel       ✓ request DTOs {Initiate|GetMoreUrls|PartCompletion}
                 ✓ response DTOs {Presigned|InitiateUploadResponse|UploadStatus|PartCompletionResponse|CompleteUpload|ActiveUpload|ActiveUploads}
decorators barrel✓ StdSchema, DefaultSchemaOptions, swapId
common re-exports✓ PUBLICITY_TYPES, ADMIN_ONLY_PUBLICITY_TYPES, ALL_FILTER_PUBLICITY_TYPES, isAdminOnlyPublicity,
                   isIncludedInAllFilter, DEFAULT_EMBED_VISIBILITY, PUBLIC/AUTHENTICATED_EMBED_VISIBILITY_TYPES,
                   isPublicEmbedVisibility, isAuthenticatedEmbedVisibility
```

---

## 8. Implementation Notes

### `.js` extensions in relative imports
Source files import with `.js` suffixes (`from './file.model.js'`) for ESM (verified across all model files and the three barrels). The `moduleNameMapper` rule `'^(\\.{1,2}/.*)\\.js$': '$1'` rewrites only **relative** specifiers so ts-jest resolves the `.ts` source (the leading `./`/`../` anchor avoids rewriting `node_modules` paths). Mirror the convention in test imports: `from '../base.model.js'`. (media-api needs no such mapper, which is why its `jest` key omits one.)

### Decorator metadata
`@StdSchema`/`@Prop` rely on `reflect-metadata` + `experimentalDecorators` + `emitDecoratorMetadata`. The config enables both in the ts-jest tsconfig override and loads `reflect-metadata` via `setupFiles`. An `undefined` metadata lookup in a test almost always means `setupFiles` didn't run before the decorated class imported.

### ESM transformation
`mongoose`, `bson`, `mongodb`, `@nestjs/mongoose` ship ESM — `transformIgnorePatterns` lets ts-jest transform them.

### BUG-3 will throw, not assert-false
`view()` → `addToSet('uniqueViews', …)` → `new Set(this.uniqueViews)` on a Number value throws `TypeError`. The Phase-2 test must wrap it in `expect(() => …).toThrow()` (RED), then the fix (schema change to an ObjectId array, or method change) flips it GREEN.

### BUG-6 polymorphism
`BaseModelSchema.methods.like/dislike` are `(userId, save=true)`; `ImageSchema.methods.like/dislike` are `(cb, userId)`. Assert the current broken shape first; the fix aligns the signature to `(userId, save)`.

### Bug-fix execution order (one RED→GREEN cycle each, per Axiom 5)
1. `base.model.ts:102` — `dislikeScore` → `this.dislikes.length`.
2. `base.model.ts:103-104` — drop `.length`, use the Number props directly.
3. `base.model.ts:82-89` — fix `view()`/`uniqueViews` type mismatch (schema or method).
4. `image.model.ts:68` (dislike) — `Array.from(dislikeSet)`.
5. `image.model.ts:76-77` (like) — `this.likes = Array.from(likeSet)`, `markModified('likes')`.
6. `image.model.ts:65,73` — align `like`/`dislike` signature to `(userId, save)`.

> Per Axiom 5, record the per-criterion outcome series (e.g. `red, green`) for each bug. If a "bug" test goes GREEN before any fix, the test isn't exercising the defect — rewrite it until it's RED for the right reason. Preserve any reviewer rejection of an acceptance criterion rather than silently overwriting it.

### Estimated effort
≈ 135 cases across ~16 `.spec.ts` files. Phase 1 (~50 cases) runs in well under a second; Phases 2–3 carry `mongodb-memory-server` startup (the first `MongoMemoryServer.create()` downloads a binary — cache it in CI).

---

## 9. Acceptance Checks (gate per `AX-MOD-SUICOMMONAPI-008`)

After tests land, all of the following must pass before any merge touching this package:

```sh
pnpm --filter @stoked-ui/common-api typescript   # requires the tsconfig exclude from §2
pnpm --filter @stoked-ui/common-api test
pnpm --filter @stoked-ui/common-api build
pnpm --filter @stoked-ui/media-api typescript     # only current consumer must still compile
```

Also verify manually that:
1. No `*.test.ts` file was introduced (umbrella-Mocha-glob safety, §2).
2. `pnpm build` output under `build/` contains **no** `*.spec.*` artifacts (Babel ignore in `scripts/build.mjs`).
3. The newly-added `test` script does not get swept into the root `test:unit` / `test:coverage` Mocha run (it won't, because that run targets `*.test.*`, but confirm naming when adding files).

Any new failing `.spec.ts` blocks merge — same rule as existing tests.
