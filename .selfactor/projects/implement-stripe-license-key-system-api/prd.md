# Product Requirements Document (Sequential)

## 0. Source Context
**Derived From:** Feature Brief (`projects/implement-stripe-license-key-system-api/pfb.md`)
**Technical Spec:** `/Users/stoked/.claude/plans/glistening-pondering-tide.md`
**Feature Name:** Stripe License Key System API
**PRD Owner:** Brian Stoker
**Last Updated:** 2026-02-23

### Feature Brief Summary
Implement a Stripe-powered license key system API in the stoked-ui backend (NestJS + MongoDB + AWS Lambda via SST). The system enables users to purchase product licenses ($10/year) via Stripe Checkout, receive license keys by email (SES), and activate/validate/deactivate those keys from client applications. The API is product-agnostic, supporting Flux as the first licensed product with architecture ready for additional desktop apps. Backend only -- no Swift/client work.

---

## 1. Objectives & Constraints

### Objectives
- Deliver a fully functional license key API handling the complete lifecycle: checkout, key generation, activation, validation, deactivation, renewal, and expiration.
- Process Stripe payment events via webhooks to automatically create and manage licenses.
- Send license keys to customers via AWS SES upon successful purchase.
- Build the system generically so any product (not just Flux) can be onboarded by adding a row to the `product` collection.
- Maintain offline-friendliness: clients validate once on activation and trust a local cache, only re-validating when the grace period nears expiration.
- Follow existing codebase patterns (`@StdSchema`, `SchemaFactory`, `ModelDefinition` exports, NestJS module structure) for consistency.

### Constraints
- **Lambda + rawBody**: The Lambda is deployed behind API Gateway v2 via SST. Stripe webhook signature verification requires `rawBody: true` in `NestFactory.create`, which stores a copy of the body buffer for all routes.
- **29-second timeout**: Stripe webhook processing (create license + send SES email) must complete within the Lambda's 29-second timeout.
- **Serverless adapter**: The `@codegenie/serverless-express` adapter handles Lambda integration; `rawBody` must be compatible with this adapter.
- **SST secrets**: `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` must be provisioned via SST's `sst.Secret` mechanism.
- **No JWT auth on license endpoints**: License endpoints use license key + hardware ID as their authentication mechanism, not JWT tokens.
- **Backend only**: No Swift/macOS client implementation. No Stripe Dashboard configuration (manual ops step). No admin UI.
- **No comprehensive test suite**: Manual curl-based verification is the stated approach. Testability is a design consideration but a full test suite is not a deliverable.

---

## 1.5 Required Toolchain

> All tools below must be installed and verified before implementation begins.

| Tool | Min Version | Install Command | Verify Command |
|------|------------|-----------------|----------------|
| Node.js | 20+ | `nvm install 20` | `node --version` |
| pnpm | 8+ | `npm install -g pnpm` | `pnpm --version` |
| NestJS CLI | 10+ | `pnpm add -g @nestjs/cli` | `nest --version` |
| MongoDB | 7+ | Already provisioned (Atlas/remote) | `mongosh --version` (optional, for local testing) |
| Stripe CLI | 1.19+ | `brew install stripe/stripe-cli/stripe` | `stripe --version` |
| AWS CLI | 2+ | `brew install awscli` | `aws --version` |
| SST | 3+ | Already in repo devDependencies | `npx sst version` |
| TypeScript | 5.4+ | Already in repo devDependencies | `npx tsc --version` |

---

## 2. Execution Phases

> Phases below are ordered and sequential.
> A phase cannot begin until all acceptance criteria of the previous phase are met.

---

## Phase 1: Foundation -- Mongoose Models & Database Registration
**Purpose:** Establish the data layer that all subsequent phases depend on. The `License` and `Product` models define the schema contracts that the service layer, controller layer, and Stripe integration all consume. Without stable, exported, and registered models, no API logic can be built.

### 1.1 Create License Model

Create `packages/sui-common-api/src/models/license.model.ts` following the established model pattern used by `blogPost.model.ts` and `invoice.model.ts`.

**Implementation Details**
- **File to create:** `packages/sui-common-api/src/models/license.model.ts`
- **Pattern to follow:** `packages/sui-common-api/src/models/invoice.model.ts` (standalone model using `@StdSchema(DefaultSchemaOptions)`, not extending `BaseModel` or `File`)
- **Class name:** `License`
- **Document type:** `LicenseDocument = HydratedDocument<License>`
- **Status enum type:** `LicenseStatus = 'pending' | 'active' | 'expired' | 'revoked'`
- **Required fields:**
  - `key` (string, unique, indexed) -- format `FLUX-XXXX-XXXX-XXXX`
  - `email` (string, indexed) -- purchaser email from Stripe
  - `productId` (string, indexed) -- e.g. `"flux"`
  - `hardwareId` (string, nullable, sparse index) -- SHA-256 of device identifier
  - `machineName` (string, nullable) -- human-readable machine name
  - `status` (string enum: `pending | active | expired | revoked`, default: `pending`, indexed)
  - `activatedAt` (Date, optional)
  - `expiresAt` (Date, optional)
  - `gracePeriodDays` (number, default: 14)
  - `stripeCustomerId` (string, indexed)
  - `stripeSubscriptionId` (string, indexed)
  - `deactivationCount` (number, default: 0)
  - `activationHistory` (string array, default: []) -- audit trail of hardware IDs
- **Schema export:** `LicenseSchema = SchemaFactory.createForClass(License)`
- **Indexes:**
  - Unique index on `key`
  - Compound index on `email + productId`
  - Sparse index on `hardwareId`
  - Index on `stripeSubscriptionId`
  - Compound index on `status + expiresAt` (for expiration queries)
- **Feature export:** `LicenseFeature: ModelDefinition = { name: License.name, schema: LicenseSchema }`
- Import `DefaultSchemaOptions` from `../decorators/defaultSchemaOptions` and `StdSchema` from `../decorators/stdschema.decorator`

**Acceptance Criteria**

_Structural (code exists and is correct):_
- AC-1.1.a: When `License` class is defined --> it has all 13 required fields (`key`, `email`, `productId`, `hardwareId`, `machineName`, `status`, `activatedAt`, `expiresAt`, `gracePeriodDays`, `stripeCustomerId`, `stripeSubscriptionId`, `deactivationCount`, `activationHistory`)
- AC-1.1.b: When `status` field is defined --> it uses enum constraint with values `pending`, `active`, `expired`, `revoked` and defaults to `pending`
- AC-1.1.c: When `LicenseSchema` is created --> it has unique index on `key`, compound index on `email + productId`, sparse index on `hardwareId`, and index on `stripeSubscriptionId`

_Executable (verified by running a command):_
- AC-1.1.d: `pnpm --filter @stoked-ui/common-api typescript` exits 0 (model compiles without errors)

**Acceptance Tests**
- Test-1.1.a: Verify file exists and exports `License`, `LicenseDocument`, `LicenseSchema`, `LicenseFeature`, and `LicenseStatus`
- Test-1.1.b: Verify `@Prop` decorators include correct types, defaults, and index configurations
- Test-1.1.c: Verify `@StdSchema(DefaultSchemaOptions)` decorator is applied to the class
- Test-1.1.d: Verify schema indexes are defined after `SchemaFactory.createForClass`

**Verification Commands**
```bash
# File exists
test -f packages/sui-common-api/src/models/license.model.ts && echo "OK"

# Exports correct symbols
grep -q "export class License" packages/sui-common-api/src/models/license.model.ts && echo "OK"
grep -q "export type LicenseDocument" packages/sui-common-api/src/models/license.model.ts && echo "OK"
grep -q "export const LicenseSchema" packages/sui-common-api/src/models/license.model.ts && echo "OK"
grep -q "export const LicenseFeature" packages/sui-common-api/src/models/license.model.ts && echo "OK"
grep -q "export type LicenseStatus" packages/sui-common-api/src/models/license.model.ts && echo "OK"

# Has required fields
grep -q "key:" packages/sui-common-api/src/models/license.model.ts && echo "OK"
grep -q "email:" packages/sui-common-api/src/models/license.model.ts && echo "OK"
grep -q "productId:" packages/sui-common-api/src/models/license.model.ts && echo "OK"
grep -q "hardwareId:" packages/sui-common-api/src/models/license.model.ts && echo "OK"
grep -q "status:" packages/sui-common-api/src/models/license.model.ts && echo "OK"
grep -q "stripeSubscriptionId:" packages/sui-common-api/src/models/license.model.ts && echo "OK"
grep -q "deactivationCount:" packages/sui-common-api/src/models/license.model.ts && echo "OK"
grep -q "activationHistory:" packages/sui-common-api/src/models/license.model.ts && echo "OK"

# Uses correct decorator
grep -q "@StdSchema(DefaultSchemaOptions)" packages/sui-common-api/src/models/license.model.ts && echo "OK"

# TypeScript compiles
cd packages/sui-common-api && pnpm typescript && echo "OK"
```

---

### 1.2 Create Product Model

Create `packages/sui-common-api/src/models/product.model.ts` as a configuration model for each licensable product.

**Implementation Details**
- **File to create:** `packages/sui-common-api/src/models/product.model.ts`
- **Pattern to follow:** `packages/sui-common-api/src/models/invoice.model.ts` (standalone `@StdSchema` model)
- **Class name:** `Product`
- **Document type:** `ProductDocument = HydratedDocument<Product>`
- **Required fields:**
  - `productId` (string, unique, indexed) -- e.g. `"flux"`
  - `name` (string, required) -- e.g. `"Flux"`
  - `keyPrefix` (string, required) -- e.g. `"FLUX"` (used in key generation)
  - `stripePriceId` (string, required) -- links to Stripe price object
  - `licenseDurationDays` (number, default: 365)
  - `gracePeriodDays` (number, default: 14)
  - `trialDurationDays` (number, default: 30)
  - `purchaseUrl` (string, optional) -- URL to purchase page
- **Schema export:** `ProductSchema = SchemaFactory.createForClass(Product)`
- **Indexes:**
  - Unique index on `productId`
- **Feature export:** `ProductFeature: ModelDefinition = { name: Product.name, schema: ProductSchema }`

**Acceptance Criteria**

_Structural (code exists and is correct):_
- AC-1.2.a: When `Product` class is defined --> it has all 8 fields (`productId`, `name`, `keyPrefix`, `stripePriceId`, `licenseDurationDays`, `gracePeriodDays`, `trialDurationDays`, `purchaseUrl`)
- AC-1.2.b: When `productId` field is defined --> it has a unique constraint and index
- AC-1.2.c: When duration fields are defined --> they have sensible defaults (365, 14, 30)

_Executable (verified by running a command):_
- AC-1.2.d: `pnpm --filter @stoked-ui/common-api typescript` exits 0

**Acceptance Tests**
- Test-1.2.a: Verify file exports `Product`, `ProductDocument`, `ProductSchema`, `ProductFeature`
- Test-1.2.b: Verify `productId` has `unique: true` in `@Prop` decorator
- Test-1.2.c: Verify default values for `licenseDurationDays` (365), `gracePeriodDays` (14), `trialDurationDays` (30)

**Verification Commands**
```bash
# File exists
test -f packages/sui-common-api/src/models/product.model.ts && echo "OK"

# Exports correct symbols
grep -q "export class Product" packages/sui-common-api/src/models/product.model.ts && echo "OK"
grep -q "export type ProductDocument" packages/sui-common-api/src/models/product.model.ts && echo "OK"
grep -q "export const ProductSchema" packages/sui-common-api/src/models/product.model.ts && echo "OK"
grep -q "export const ProductFeature" packages/sui-common-api/src/models/product.model.ts && echo "OK"

# Has required fields
grep -q "productId:" packages/sui-common-api/src/models/product.model.ts && echo "OK"
grep -q "keyPrefix:" packages/sui-common-api/src/models/product.model.ts && echo "OK"
grep -q "stripePriceId:" packages/sui-common-api/src/models/product.model.ts && echo "OK"
grep -q "licenseDurationDays:" packages/sui-common-api/src/models/product.model.ts && echo "OK"

# Has correct defaults
grep -q "default: 365" packages/sui-common-api/src/models/product.model.ts && echo "OK"
grep -q "default: 14" packages/sui-common-api/src/models/product.model.ts && echo "OK"
grep -q "default: 30" packages/sui-common-api/src/models/product.model.ts && echo "OK"

# TypeScript compiles
cd packages/sui-common-api && pnpm typescript && echo "OK"
```

---

### 1.3 Export Models and Register in Database Module

Add both models to the barrel export in `models/index.ts` and register their Mongoose features in `database.module.ts`.

**Implementation Details**
- **File to modify:** `packages/sui-common-api/src/models/index.ts`
  - Add `export * from './license.model.js';`
  - Add `export * from './product.model.js';`
- **File to modify:** `packages/sui-media-api/src/database/database.module.ts`
  - Add `LicenseFeature` and `ProductFeature` to the import destructuring from `@stoked-ui/common-api`
  - Add both to the `MongooseModule.forFeature([...])` array alongside existing features (`VideoFeature`, `ImageFeature`, `FileFeature`, `UploadSessionFeature`, `BlogPostFeature`, `InvoiceFeature`)
- **Pattern reference:** The existing import line in `database.module.ts` imports `{ VideoFeature, ImageFeature, FileFeature, UploadSessionFeature, BlogPostFeature, InvoiceFeature }` from `@stoked-ui/common-api`

**Acceptance Criteria**

_Structural (code exists and is correct):_
- AC-1.3.a: When `models/index.ts` is read --> it contains export lines for both `license.model` and `product.model`
- AC-1.3.b: When `database.module.ts` imports from `@stoked-ui/common-api` --> the import includes `LicenseFeature` and `ProductFeature`
- AC-1.3.c: When `MongooseModule.forFeature` array is read --> it includes `LicenseFeature` and `ProductFeature`

_Executable (verified by running a command):_
- AC-1.3.d: `pnpm --filter @stoked-ui/media-api typescript` exits 0

**Acceptance Tests**
- Test-1.3.a: Verify `models/index.ts` exports both new models
- Test-1.3.b: Verify `database.module.ts` registers both features in `MongooseModule.forFeature`
- Test-1.3.c: Verify the media-api package type-checks with the new model imports

**Verification Commands**
```bash
# Models are exported from barrel
grep -q "license.model" packages/sui-common-api/src/models/index.ts && echo "OK"
grep -q "product.model" packages/sui-common-api/src/models/index.ts && echo "OK"

# Database module imports the features
grep -q "LicenseFeature" packages/sui-media-api/src/database/database.module.ts && echo "OK"
grep -q "ProductFeature" packages/sui-media-api/src/database/database.module.ts && echo "OK"

# Features are registered in forFeature array
grep -A20 "forFeature" packages/sui-media-api/src/database/database.module.ts | grep -q "LicenseFeature" && echo "OK"
grep -A20 "forFeature" packages/sui-media-api/src/database/database.module.ts | grep -q "ProductFeature" && echo "OK"

# TypeScript compiles
cd packages/sui-media-api && pnpm typescript && echo "OK"
```

---

## Phase 2: Core API -- DTOs, License Service, and License Controller
**Purpose:** Build the application logic layer that consumers will interact with. This phase creates the request/response contracts (DTOs), the business logic (service), and the HTTP interface (controller) for the four license endpoints: activate, validate, deactivate, and checkout. The Stripe integration (Phase 3) depends on this service layer for license creation.

### 2.1 Create DTOs

Create five DTO files in `packages/sui-media-api/src/license/dto/` with a barrel export.

**Implementation Details**
- **Directory to create:** `packages/sui-media-api/src/license/dto/`
- **Pattern to follow:** `packages/sui-media-api/src/invoices/dto/create-invoice.dto.ts` (uses `class-validator` decorators + `@nestjs/swagger` `ApiProperty`)
- **Files to create:**

  **`activate-license.dto.ts`**
  - `key` (string, required) -- the license key
  - `hardwareId` (string, required) -- SHA-256 of device identifier
  - `machineName` (string, optional) -- human-readable machine name

  **`validate-license.dto.ts`**
  - `key` (string, required) -- the license key
  - `hardwareId` (string, required) -- must match the activated hardware

  **`deactivate-license.dto.ts`**
  - `key` (string, required) -- the license key
  - `hardwareId` (string, required) -- must match the activated hardware

  **`create-checkout.dto.ts`**
  - `productId` (string, required) -- e.g. `"flux"`
  - `email` (string, required, `@IsEmail()`) -- customer email for Stripe
  - `successUrl` (string, required, `@IsUrl()`) -- redirect URL after success
  - `cancelUrl` (string, required, `@IsUrl()`) -- redirect URL after cancel

  **`license-response.dto.ts`**
  - `LicenseResponseDto` class with fields: `key`, `email`, `productId`, `status`, `activatedAt`, `expiresAt`, `gracePeriodDays`, `machineName`
  - `CheckoutResponseDto` class with field: `checkoutUrl` (string)

  **`index.ts`** -- barrel export for all DTOs

**Acceptance Criteria**

_Structural (code exists and is correct):_
- AC-2.1.a: When DTO files are created --> each DTO class uses `@IsString()`, `@IsOptional()`, `@IsEmail()`, `@IsUrl()`, or `@ApiProperty()` decorators as appropriate
- AC-2.1.b: When `activate-license.dto.ts` is read --> it has `key`, `hardwareId` (required), and `machineName` (optional) fields
- AC-2.1.c: When `license-response.dto.ts` is read --> `LicenseResponseDto` contains all output fields and `CheckoutResponseDto` contains `checkoutUrl`
- AC-2.1.d: When `index.ts` is read --> it re-exports all five DTO files

_Executable (verified by running a command):_
- AC-2.1.e: `pnpm --filter @stoked-ui/media-api typescript` exits 0

**Acceptance Tests**
- Test-2.1.a: Verify all five DTO files exist in `license/dto/`
- Test-2.1.b: Verify each request DTO uses `class-validator` decorators for validation
- Test-2.1.c: Verify `index.ts` barrel export includes all DTOs
- Test-2.1.d: Verify `LicenseResponseDto` can be constructed from a `LicenseDocument`

**Verification Commands**
```bash
# All DTO files exist
test -f packages/sui-media-api/src/license/dto/activate-license.dto.ts && echo "OK"
test -f packages/sui-media-api/src/license/dto/validate-license.dto.ts && echo "OK"
test -f packages/sui-media-api/src/license/dto/deactivate-license.dto.ts && echo "OK"
test -f packages/sui-media-api/src/license/dto/create-checkout.dto.ts && echo "OK"
test -f packages/sui-media-api/src/license/dto/license-response.dto.ts && echo "OK"
test -f packages/sui-media-api/src/license/dto/index.ts && echo "OK"

# DTOs use class-validator
grep -q "IsString" packages/sui-media-api/src/license/dto/activate-license.dto.ts && echo "OK"
grep -q "IsEmail" packages/sui-media-api/src/license/dto/create-checkout.dto.ts && echo "OK"

# Barrel export works
grep -q "activate-license" packages/sui-media-api/src/license/dto/index.ts && echo "OK"
grep -q "license-response" packages/sui-media-api/src/license/dto/index.ts && echo "OK"

# TypeScript compiles
cd packages/sui-media-api && pnpm typescript && echo "OK"
```

---

### 2.2 Create License Service

Create `packages/sui-media-api/src/license/license.service.ts` with the core business logic for license lifecycle management.

**Implementation Details**
- **File to create:** `packages/sui-media-api/src/license/license.service.ts`
- **Pattern to follow:** `packages/sui-media-api/src/invoices/invoices.service.ts` (uses `@Injectable()`, `@InjectModel(License.name)`, `Model<LicenseDocument>`, `Logger`)
- **Injected dependencies:**
  - `@InjectModel(License.name) private readonly licenseModel: Model<LicenseDocument>`
  - `@InjectModel(Product.name) private readonly productModel: Model<ProductDocument>`
- **Methods to implement:**

  **`generateKey(prefix: string): string`**
  - Uses `crypto.randomBytes()` for entropy
  - Alphabet: `ABCDEFGHJKLMNPQRSTUVWXYZ23456789` (32 chars = 5 bits each)
  - Format: `{PREFIX}-{XXXX}-{XXXX}-{XXXX}` (12 chars from alphabet = 60 bits)
  - Returns the complete key string

  **`async activate(dto: ActivateLicenseDto): Promise<LicenseResponseDto>`**
  - Find license by `key`
  - Reject if not found, expired, or revoked
  - If already active with same `hardwareId`, return success (idempotent)
  - If already active with different `hardwareId`, reject (must deactivate first)
  - If pending, set `status: 'active'`, `hardwareId`, `machineName`, `activatedAt: new Date()`
  - Push `hardwareId` to `activationHistory`
  - Return `LicenseResponseDto`

  **`async validate(dto: ValidateLicenseDto): Promise<LicenseResponseDto>`**
  - Find license by `key`
  - Reject if not found
  - Check `hardwareId` matches
  - Check `expiresAt` -- if past expiry + grace period, set `status: 'expired'` and save
  - Return `LicenseResponseDto` with current status

  **`async deactivate(dto: DeactivateLicenseDto): Promise<{ message: string }>`**
  - Find license by `key`
  - Reject if not found or not active
  - Check `hardwareId` matches
  - Check `deactivationCount < 3` -- reject with 403 if at limit (3 per year)
  - Clear `hardwareId`, `machineName`, set `status: 'pending'`
  - Increment `deactivationCount`
  - Return success message

  **`async createLicense(email: string, productId: string, stripeCustomerId: string, stripeSubscriptionId: string): Promise<License>`**
  - Look up product by `productId` to get `keyPrefix` and `licenseDurationDays`
  - Generate key using `generateKey(product.keyPrefix)`
  - Create license document with `status: 'pending'`, `expiresAt` set to now + `licenseDurationDays`
  - Handle unique key collision by retrying (up to 3 attempts)
  - Return the created license document

  **`async renewLicense(stripeSubscriptionId: string): Promise<void>`**
  - Find license by `stripeSubscriptionId`
  - Look up associated product for `licenseDurationDays`
  - Extend `expiresAt` by `licenseDurationDays` from now
  - If status was `expired`, set back to `active` (if `hardwareId` is present) or `pending`

  **`async findBySubscriptionId(stripeSubscriptionId: string): Promise<LicenseDocument | null>`**
  - Simple query helper for webhook processing

- **Error handling:** Use NestJS exceptions (`NotFoundException`, `ForbiddenException`, `BadRequestException`, `ConflictException`)

**Acceptance Criteria**

_Structural (code exists and is correct):_
- AC-2.2.a: When `license.service.ts` is read --> it is decorated with `@Injectable()` and injects both `License` and `Product` models
- AC-2.2.b: When `generateKey()` is called --> it produces keys in `{PREFIX}-XXXX-XXXX-XXXX` format using only the 32-char unambiguous alphabet
- AC-2.2.c: When `activate()` is called with an already-active license on a different hardware --> it throws a `ConflictException`
- AC-2.2.d: When `deactivate()` is called and `deactivationCount >= 3` --> it throws a `ForbiddenException`
- AC-2.2.e: When `createLicense()` generates a duplicate key --> it retries up to 3 times before throwing

_Executable (verified by running a command):_
- AC-2.2.f: `pnpm --filter @stoked-ui/media-api typescript` exits 0

**Acceptance Tests**
- Test-2.2.a: Verify `generateKey` uses `crypto.randomBytes` and the 32-char alphabet
- Test-2.2.b: Verify `activate` sets `status` to `active` and records `hardwareId`
- Test-2.2.c: Verify `deactivate` enforces the 3-per-year limit
- Test-2.2.d: Verify `validate` checks `hardwareId` match and expiration
- Test-2.2.e: Verify `createLicense` looks up `Product` for `keyPrefix` and `licenseDurationDays`
- Test-2.2.f: Verify `renewLicense` extends `expiresAt` by the product's `licenseDurationDays`

**Verification Commands**
```bash
# File exists
test -f packages/sui-media-api/src/license/license.service.ts && echo "OK"

# Injectable decorator
grep -q "@Injectable()" packages/sui-media-api/src/license/license.service.ts && echo "OK"

# Injects both models
grep -q "InjectModel(License.name)" packages/sui-media-api/src/license/license.service.ts && echo "OK"
grep -q "InjectModel(Product.name)" packages/sui-media-api/src/license/license.service.ts && echo "OK"

# Key methods exist
grep -q "generateKey" packages/sui-media-api/src/license/license.service.ts && echo "OK"
grep -q "async activate" packages/sui-media-api/src/license/license.service.ts && echo "OK"
grep -q "async validate" packages/sui-media-api/src/license/license.service.ts && echo "OK"
grep -q "async deactivate" packages/sui-media-api/src/license/license.service.ts && echo "OK"
grep -q "async createLicense" packages/sui-media-api/src/license/license.service.ts && echo "OK"
grep -q "async renewLicense" packages/sui-media-api/src/license/license.service.ts && echo "OK"

# Uses crypto for key generation
grep -q "crypto" packages/sui-media-api/src/license/license.service.ts && echo "OK"

# Uses unambiguous alphabet
grep -q "ABCDEFGHJKLMNPQRSTUVWXYZ23456789" packages/sui-media-api/src/license/license.service.ts && echo "OK"

# Deactivation limit check
grep -q "deactivationCount" packages/sui-media-api/src/license/license.service.ts && echo "OK"

# TypeScript compiles
cd packages/sui-media-api && pnpm typescript && echo "OK"
```

---

### 2.3 Create License Controller

Create `packages/sui-media-api/src/license/license.controller.ts` with the four license endpoints.

**Implementation Details**
- **File to create:** `packages/sui-media-api/src/license/license.controller.ts`
- **Pattern to follow:** `packages/sui-media-api/src/invoices/invoices.controller.ts` (uses `@Controller()`, `@ApiTags()`, `@Post()`, `@HttpCode()`, `@Body(ValidationPipe)`)
- **Controller decorator:** `@Controller('licenses')`
- **API tags:** `@ApiTags('Licenses')`
- **No auth guards** on license endpoints (they use key + hardwareId as auth)
- **Endpoints:**

  **`POST /v1/licenses/activate`**
  - `@Post('activate')`, `@HttpCode(HttpStatus.OK)`
  - Body: `ActivateLicenseDto`
  - Returns: `LicenseResponseDto`
  - Delegates to `licenseService.activate(dto)`

  **`POST /v1/licenses/validate`**
  - `@Post('validate')`, `@HttpCode(HttpStatus.OK)`
  - Body: `ValidateLicenseDto`
  - Returns: `LicenseResponseDto`
  - Delegates to `licenseService.validate(dto)`

  **`POST /v1/licenses/deactivate`**
  - `@Post('deactivate')`, `@HttpCode(HttpStatus.OK)`
  - Body: `DeactivateLicenseDto`
  - Returns: `{ message: string }`
  - Delegates to `licenseService.deactivate(dto)`

  **`POST /v1/licenses/checkout`**
  - `@Post('checkout')`, `@HttpCode(HttpStatus.OK)`
  - Body: `CreateCheckoutDto`
  - Returns: `CheckoutResponseDto`
  - Delegates to `stripeService.createCheckoutSession(dto)` (injected from Phase 3; for now, inject `LicenseService` only and add Stripe later)

- **Constructor injection:** `constructor(private readonly licenseService: LicenseService)`

**Acceptance Criteria**

_Structural (code exists and is correct):_
- AC-2.3.a: When `license.controller.ts` is read --> it defines four `@Post()` endpoints at paths `activate`, `validate`, `deactivate`, `checkout`
- AC-2.3.b: When each endpoint is read --> it uses `@Body(ValidationPipe)` for input validation
- AC-2.3.c: When the controller is defined --> it uses `@Controller('licenses')` and `@ApiTags('Licenses')`
- AC-2.3.d: When endpoints are defined --> none use `@UseGuards(AuthGuard)` (license key is the auth mechanism)

_Executable (verified by running a command):_
- AC-2.3.e: `pnpm --filter @stoked-ui/media-api typescript` exits 0

**Acceptance Tests**
- Test-2.3.a: Verify all four POST routes are defined
- Test-2.3.b: Verify each route delegates to the correct service method
- Test-2.3.c: Verify `ValidationPipe` is applied to all `@Body()` parameters
- Test-2.3.d: Verify no authentication guards are applied

**Verification Commands**
```bash
# File exists
test -f packages/sui-media-api/src/license/license.controller.ts && echo "OK"

# Controller decorator
grep -q "@Controller('licenses')" packages/sui-media-api/src/license/license.controller.ts && echo "OK"

# All four endpoints
grep -q "activate" packages/sui-media-api/src/license/license.controller.ts && echo "OK"
grep -q "validate" packages/sui-media-api/src/license/license.controller.ts && echo "OK"
grep -q "deactivate" packages/sui-media-api/src/license/license.controller.ts && echo "OK"
grep -q "checkout" packages/sui-media-api/src/license/license.controller.ts && echo "OK"

# Uses ValidationPipe
grep -q "ValidationPipe" packages/sui-media-api/src/license/license.controller.ts && echo "OK"

# No auth guards
! grep -q "UseGuards(AuthGuard)" packages/sui-media-api/src/license/license.controller.ts && echo "OK"

# TypeScript compiles
cd packages/sui-media-api && pnpm typescript && echo "OK"
```

---

## Phase 3: Stripe Integration -- Webhook Processing & Checkout Sessions
**Purpose:** Connect the license system to Stripe for payment processing. This phase creates the Stripe service (SDK wrapper for checkout sessions and webhook signature verification) and the Stripe webhook controller that creates licenses on payment, renews on subscription invoice, and handles subscription cancellation. Without this phase, there is no way to purchase or renew licenses.

### 3.1 Create Stripe Service

Create `packages/sui-media-api/src/license/stripe.service.ts` to encapsulate all Stripe SDK interactions.

**Implementation Details**
- **File to create:** `packages/sui-media-api/src/license/stripe.service.ts`
- **Dependencies:** `stripe` npm package (added in Phase 4), `@nestjs/config` `ConfigService`
- **Class:** `@Injectable() export class StripeService`
- **Constructor:**
  - Inject `ConfigService` to read `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`
  - Initialize `Stripe` client: `new Stripe(configService.get('STRIPE_SECRET_KEY'), { apiVersion: '2024-12-18.acacia' })`
- **Methods:**

  **`async createCheckoutSession(dto: CreateCheckoutDto, product: ProductDocument): Promise<string>`**
  - Look up `product.stripePriceId`
  - Create Stripe Checkout session with:
    - `mode: 'subscription'`
    - `line_items: [{ price: product.stripePriceId, quantity: 1 }]`
    - `customer_email: dto.email`
    - `success_url: dto.successUrl`
    - `cancel_url: dto.cancelUrl`
    - `metadata: { productId: dto.productId }`
  - Return `session.url`

  **`constructWebhookEvent(rawBody: Buffer, signature: string): Stripe.Event`**
  - Use `this.stripe.webhooks.constructEvent(rawBody, signature, this.webhookSecret)`
  - Throws `BadRequestException` on signature verification failure

  **`async getSubscription(subscriptionId: string): Promise<Stripe.Subscription>`**
  - Retrieve subscription details from Stripe

  **`async getCustomerEmail(customerId: string): Promise<string>`**
  - Retrieve customer email from Stripe customer object

- **Error handling:** Wrap Stripe SDK errors in NestJS exceptions with descriptive messages

**Acceptance Criteria**

_Structural (code exists and is correct):_
- AC-3.1.a: When `stripe.service.ts` is read --> it initializes a `Stripe` client using `ConfigService.get('STRIPE_SECRET_KEY')`
- AC-3.1.b: When `createCheckoutSession()` is called --> it creates a Stripe Checkout session with `mode: 'subscription'` and returns the session URL
- AC-3.1.c: When `constructWebhookEvent()` is called --> it uses `stripe.webhooks.constructEvent` with the webhook secret for signature verification
- AC-3.1.d: When Stripe SDK throws an error --> it is wrapped in a NestJS `BadRequestException`

_Executable (verified by running a command):_
- AC-3.1.e: `pnpm --filter @stoked-ui/media-api typescript` exits 0 (after `stripe` dependency is added in Phase 4)

**Acceptance Tests**
- Test-3.1.a: Verify `StripeService` is `@Injectable()` and injects `ConfigService`
- Test-3.1.b: Verify `createCheckoutSession` passes `mode: 'subscription'` to Stripe
- Test-3.1.c: Verify `constructWebhookEvent` reads the webhook secret from config
- Test-3.1.d: Verify error handling wraps Stripe errors appropriately

**Verification Commands**
```bash
# File exists
test -f packages/sui-media-api/src/license/stripe.service.ts && echo "OK"

# Injectable decorator
grep -q "@Injectable()" packages/sui-media-api/src/license/stripe.service.ts && echo "OK"

# Stripe SDK usage
grep -q "new Stripe" packages/sui-media-api/src/license/stripe.service.ts && echo "OK"
grep -q "STRIPE_SECRET_KEY" packages/sui-media-api/src/license/stripe.service.ts && echo "OK"
grep -q "STRIPE_WEBHOOK_SECRET" packages/sui-media-api/src/license/stripe.service.ts && echo "OK"

# Key methods
grep -q "createCheckoutSession" packages/sui-media-api/src/license/stripe.service.ts && echo "OK"
grep -q "constructWebhookEvent" packages/sui-media-api/src/license/stripe.service.ts && echo "OK"

# Checkout mode
grep -q "subscription" packages/sui-media-api/src/license/stripe.service.ts && echo "OK"
```

---

### 3.2 Create Stripe Webhook Controller

Create `packages/sui-media-api/src/license/stripe.controller.ts` to handle incoming Stripe webhook events.

**Implementation Details**
- **File to create:** `packages/sui-media-api/src/license/stripe.controller.ts`
- **Controller decorator:** `@Controller('webhooks')`
- **API tags:** `@ApiTags('Webhooks')`
- **Single endpoint:**

  **`POST /v1/webhooks/stripe`**
  - `@Post('stripe')`, `@HttpCode(HttpStatus.OK)`
  - Access raw body via `@Req() req` -- the `rawBody` property is available when `rawBody: true` is enabled in NestFactory
  - Read `stripe-signature` header via `@Headers('stripe-signature')`
  - Call `stripeService.constructWebhookEvent(req.rawBody, signature)` to verify and parse the event
  - Handle event types:

    **`checkout.session.completed`:**
    - Extract `customer`, `subscription`, `customer_email`, and `metadata.productId` from the session
    - Check for existing license with same `stripeSubscriptionId` (idempotency)
    - Call `licenseService.createLicense(email, productId, customerId, subscriptionId)`
    - Send license key email via SES (`@aws-sdk/client-ses` `SendEmailCommand`)
    - Log success

    **`invoice.payment_succeeded`:**
    - Extract `subscription` from the invoice
    - Only process if `billing_reason === 'subscription_cycle'` (skip initial payment -- handled by checkout)
    - Call `licenseService.renewLicense(subscriptionId)`
    - Log renewal

    **`customer.subscription.deleted`:**
    - Extract `id` (subscription ID)
    - Find license by subscription ID
    - Do NOT immediately expire -- let the license expire naturally at `expiresAt`
    - Log cancellation

  - Return `{ received: true }` for all events (including unhandled event types)

- **Constructor injection:** `constructor(private readonly stripeService: StripeService, private readonly licenseService: LicenseService, private readonly configService: ConfigService)`
- **SES email sending:** Use `@aws-sdk/client-ses` `SESClient` + `SendEmailCommand` directly (the SDK is already a dependency via `@aws-sdk/client-s3`). Send from a verified SES identity (e.g., `noreply@stoked-ui.com`). Email contains the license key in plain text with product name and basic instructions.

**Acceptance Criteria**

_Structural (code exists and is correct):_
- AC-3.2.a: When `stripe.controller.ts` is read --> it defines `POST /v1/webhooks/stripe` endpoint
- AC-3.2.b: When `checkout.session.completed` event is received --> a new license is created and an email is sent via SES
- AC-3.2.c: When `checkout.session.completed` is received for an existing `stripeSubscriptionId` --> no duplicate license is created (idempotent)
- AC-3.2.d: When `invoice.payment_succeeded` with `billing_reason: 'subscription_cycle'` is received --> the license `expiresAt` is extended
- AC-3.2.e: When `customer.subscription.deleted` is received --> the license is NOT immediately expired; it expires at its natural `expiresAt` date
- AC-3.2.f: When `stripe-signature` header is invalid --> a `BadRequestException` is thrown before any processing occurs
- AC-3.2.g: When an unhandled event type is received --> `{ received: true }` is returned without error

_Executable (verified by running a command):_
- AC-3.2.h: `pnpm --filter @stoked-ui/media-api typescript` exits 0

**Acceptance Tests**
- Test-3.2.a: Verify webhook endpoint reads `rawBody` and `stripe-signature` header
- Test-3.2.b: Verify `checkout.session.completed` handler creates a license and sends an email
- Test-3.2.c: Verify idempotent check prevents duplicate licenses for the same subscription
- Test-3.2.d: Verify `invoice.payment_succeeded` handler skips non-renewal payments
- Test-3.2.e: Verify `customer.subscription.deleted` does NOT set status to `expired`
- Test-3.2.f: Verify SES `SendEmailCommand` is constructed with correct source, destination, and message

**Verification Commands**
```bash
# File exists
test -f packages/sui-media-api/src/license/stripe.controller.ts && echo "OK"

# Controller decorator
grep -q "@Controller('webhooks')" packages/sui-media-api/src/license/stripe.controller.ts && echo "OK"

# Webhook endpoint
grep -q "stripe" packages/sui-media-api/src/license/stripe.controller.ts && echo "OK"

# Handles all three event types
grep -q "checkout.session.completed" packages/sui-media-api/src/license/stripe.controller.ts && echo "OK"
grep -q "invoice.payment_succeeded" packages/sui-media-api/src/license/stripe.controller.ts && echo "OK"
grep -q "customer.subscription.deleted" packages/sui-media-api/src/license/stripe.controller.ts && echo "OK"

# Signature verification
grep -q "stripe-signature" packages/sui-media-api/src/license/stripe.controller.ts && echo "OK"
grep -q "rawBody" packages/sui-media-api/src/license/stripe.controller.ts && echo "OK"

# SES email sending
grep -q "SendEmailCommand\|SESClient" packages/sui-media-api/src/license/stripe.controller.ts && echo "OK"

# Idempotency check
grep -q "stripeSubscriptionId" packages/sui-media-api/src/license/stripe.controller.ts && echo "OK"
```

---

## Phase 4: Infrastructure & Wiring -- Secrets, Dependencies, Module Registration
**Purpose:** Complete the deployment wiring so the license system can run in the AWS Lambda environment. This phase adds Stripe secrets to SST infrastructure, enables raw body parsing for webhook signature verification, adds the `stripe` npm dependency, creates the `LicenseModule` to tie everything together, and imports it into the application. Without this phase, the code from Phases 1-3 exists but cannot be bootstrapped or deployed.

### 4.1 Add Stripe Secrets to SST Infrastructure

Add `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` to the SST secrets configuration and link them to the MediaApi Lambda function.

**Implementation Details**
- **File to modify:** `infra/secrets.ts`
  - Add: `export const stripeSecretKey = new sst.Secret("STRIPE_SECRET_KEY", process.env.STRIPE_SECRET_KEY);`
  - Add: `export const stripeWebhookSecret = new sst.Secret("STRIPE_WEBHOOK_SECRET", process.env.STRIPE_WEBHOOK_SECRET);`
  - Follow the existing pattern of `mongoDbUri` and `rootDomain`
- **File to modify:** `infra/api.ts`
  - Import `stripeSecretKey` and `stripeWebhookSecret` from `infra/secrets`
  - Add both to the `link` array of the `MediaApi` function: `link: [mongoDbUri, jwtSecret, blogApiToken, invoiceApiKey, stripeSecretKey, stripeWebhookSecret]`
  - Add to the `environment` block (environment variables are how `ConfigService` reads them in NestJS):
    ```
    STRIPE_SECRET_KEY: stripeSecretKey.value,
    STRIPE_WEBHOOK_SECRET: stripeWebhookSecret.value,
    ```
  - Add SES permissions to the `MediaApi` function (similar to the existing Subscribe/Verify functions):
    ```
    permissions: [{
      actions: ["ses:SendEmail"],
      resources: ["arn:aws:ses:us-east-1:883859713095:identity/*"]
    }]
    ```

**Acceptance Criteria**

_Structural (code exists and is correct):_
- AC-4.1.a: When `infra/secrets.ts` is read --> it exports `stripeSecretKey` and `stripeWebhookSecret` as `sst.Secret` instances
- AC-4.1.b: When `infra/api.ts` `link` array is read --> it includes `stripeSecretKey` and `stripeWebhookSecret`
- AC-4.1.c: When `infra/api.ts` `environment` block is read --> it includes `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`
- AC-4.1.d: When `infra/api.ts` `MediaApi` function is read --> it has SES `SendEmail` permissions

_Executable (verified by running a command):_
- AC-4.1.e: `npx tsc --noEmit -p infra/tsconfig.json` exits 0 (if tsconfig exists) OR file syntax is valid

**Acceptance Tests**
- Test-4.1.a: Verify `infra/secrets.ts` exports both Stripe secrets
- Test-4.1.b: Verify `infra/api.ts` links both secrets to `MediaApi`
- Test-4.1.c: Verify `infra/api.ts` adds both secrets as environment variables
- Test-4.1.d: Verify `infra/api.ts` adds SES permissions to `MediaApi`

**Verification Commands**
```bash
# Secrets exist
grep -q "STRIPE_SECRET_KEY" infra/secrets.ts && echo "OK"
grep -q "STRIPE_WEBHOOK_SECRET" infra/secrets.ts && echo "OK"
grep -q "stripeSecretKey" infra/secrets.ts && echo "OK"
grep -q "stripeWebhookSecret" infra/secrets.ts && echo "OK"

# Linked to MediaApi
grep -q "stripeSecretKey" infra/api.ts && echo "OK"
grep -q "stripeWebhookSecret" infra/api.ts && echo "OK"

# Environment variables set
grep -q "STRIPE_SECRET_KEY" infra/api.ts && echo "OK"
grep -q "STRIPE_WEBHOOK_SECRET" infra/api.ts && echo "OK"

# SES permissions on MediaApi
grep -q "ses:SendEmail" infra/api.ts && echo "OK"
```

---

### 4.2 Enable rawBody and Add Stripe Dependency

Enable `rawBody: true` in the NestJS bootstrap for Stripe webhook signature verification, and add the `stripe` npm package to `sui-media-api`.

**Implementation Details**
- **File to modify:** `packages/sui-media-api/src/lambda.bootstrap.ts`
  - In the `NestFactory.create()` call options object (third argument), add `rawBody: true`
  - The current options object already has `logger` and `cors` -- add `rawBody: true` as a sibling property
  - This makes `req.rawBody` available on all routes (Buffer of the raw request body)
  - The `rawBody` option is supported by NestJS 10+ and works with the Express adapter
- **File to modify:** `packages/sui-media-api/package.json`
  - Add `"stripe": "^17.0.0"` to the `dependencies` object
  - Add `"@aws-sdk/client-ses": "^3.42.0"` to `dependencies` (for SES email sending; `@aws-sdk/client-s3` is already present at `^3.42.0`, so match that version range)
- **Run:** `pnpm install` after modifying `package.json` to update the lockfile

**Acceptance Criteria**

_Structural (code exists and is correct):_
- AC-4.2.a: When `lambda.bootstrap.ts` `NestFactory.create` options are read --> `rawBody: true` is present
- AC-4.2.b: When `package.json` dependencies are read --> `stripe` is listed as a dependency
- AC-4.2.c: When `package.json` dependencies are read --> `@aws-sdk/client-ses` is listed as a dependency

_Executable (verified by running a command):_
- AC-4.2.d: `pnpm --filter @stoked-ui/media-api typescript` exits 0
- AC-4.2.e: `node -e "require('stripe')"` resolves without error (after `pnpm install`)

**Acceptance Tests**
- Test-4.2.a: Verify `rawBody: true` is in the NestFactory options
- Test-4.2.b: Verify `stripe` appears in `package.json` dependencies
- Test-4.2.c: Verify `@aws-sdk/client-ses` appears in `package.json` dependencies
- Test-4.2.d: Verify `pnpm install` succeeds without errors

**Verification Commands**
```bash
# rawBody enabled
grep -q "rawBody: true\|rawBody:true" packages/sui-media-api/src/lambda.bootstrap.ts && echo "OK"

# Stripe dependency
grep -q '"stripe"' packages/sui-media-api/package.json && echo "OK"

# SES dependency
grep -q '"@aws-sdk/client-ses"' packages/sui-media-api/package.json && echo "OK"

# pnpm install succeeds
pnpm install --filter @stoked-ui/media-api && echo "OK"

# TypeScript compiles
cd packages/sui-media-api && pnpm typescript && echo "OK"
```

---

### 4.3 Create License Module and Wire into App

Create `packages/sui-media-api/src/license/license.module.ts` to bundle the license controller, stripe controller, license service, and stripe service. Then import it into `app.module.ts`.

**Implementation Details**
- **File to create:** `packages/sui-media-api/src/license/license.module.ts`
  - Follow the pattern from `packages/sui-media-api/src/invoices/invoices.module.ts`
  - `@Module` configuration:
    - `imports: [DatabaseModule, ConfigModule]` (DatabaseModule for Mongoose models, ConfigModule for reading Stripe secrets)
    - `controllers: [LicenseController, StripeController]`
    - `providers: [LicenseService, StripeService]`
    - `exports: [LicenseService]`
  - Import `DatabaseModule` from `../database/database.module`
  - Import `ConfigModule` from `@nestjs/config`
- **File to modify:** `packages/sui-media-api/src/app.module.ts`
  - Add `import { LicenseModule } from './license/license.module';`
  - Add `LicenseModule` to the `imports` array, after `InvoicesModule`
  - Add a comment: `// LicenseModule provides Stripe-powered license key management`

**Acceptance Criteria**

_Structural (code exists and is correct):_
- AC-4.3.a: When `license.module.ts` is read --> it imports `DatabaseModule` and `ConfigModule`, registers both controllers and both services
- AC-4.3.b: When `app.module.ts` is read --> it imports `LicenseModule`
- AC-4.3.c: When `license.module.ts` exports are read --> `LicenseService` is exported (for potential use by other modules)

_Executable (verified by running a command):_
- AC-4.3.d: `pnpm --filter @stoked-ui/media-api typescript` exits 0
- AC-4.3.e: `pnpm --filter @stoked-ui/media-api build` exits 0

**Acceptance Tests**
- Test-4.3.a: Verify `license.module.ts` registers `LicenseController` and `StripeController`
- Test-4.3.b: Verify `license.module.ts` registers `LicenseService` and `StripeService`
- Test-4.3.c: Verify `app.module.ts` imports `LicenseModule`
- Test-4.3.d: Verify the full project builds successfully

**Verification Commands**
```bash
# License module exists
test -f packages/sui-media-api/src/license/license.module.ts && echo "OK"

# Module structure
grep -q "@Module" packages/sui-media-api/src/license/license.module.ts && echo "OK"
grep -q "LicenseController" packages/sui-media-api/src/license/license.module.ts && echo "OK"
grep -q "StripeController" packages/sui-media-api/src/license/license.module.ts && echo "OK"
grep -q "LicenseService" packages/sui-media-api/src/license/license.module.ts && echo "OK"
grep -q "StripeService" packages/sui-media-api/src/license/license.module.ts && echo "OK"
grep -q "DatabaseModule" packages/sui-media-api/src/license/license.module.ts && echo "OK"

# App module imports LicenseModule
grep -q "LicenseModule" packages/sui-media-api/src/app.module.ts && echo "OK"
grep -q "license.module" packages/sui-media-api/src/app.module.ts && echo "OK"

# Full build succeeds
cd packages/sui-media-api && pnpm build && echo "OK"
```

---

### 4.4 Wire Checkout Endpoint to Stripe Service

Update `license.controller.ts` to inject `StripeService` and wire the checkout endpoint, which was stubbed in Phase 2.

**Implementation Details**
- **File to modify:** `packages/sui-media-api/src/license/license.controller.ts`
  - Add `StripeService` to constructor injection
  - Inject `Product` model (or delegate to `LicenseService` to look up the product)
  - Implement the `checkout` endpoint:
    - Look up `Product` by `dto.productId`
    - If product not found, throw `NotFoundException`
    - Call `stripeService.createCheckoutSession(dto, product)`
    - Return `new CheckoutResponseDto(checkoutUrl)`

**Acceptance Criteria**

_Structural (code exists and is correct):_
- AC-4.4.a: When `license.controller.ts` constructor is read --> it injects both `LicenseService` and `StripeService`
- AC-4.4.b: When the checkout endpoint is read --> it looks up the product, calls `stripeService.createCheckoutSession`, and returns a `CheckoutResponseDto`
- AC-4.4.c: When an invalid `productId` is provided --> a `NotFoundException` is thrown

_Executable (verified by running a command):_
- AC-4.4.d: `pnpm --filter @stoked-ui/media-api typescript` exits 0

**Acceptance Tests**
- Test-4.4.a: Verify `StripeService` is injected into the controller
- Test-4.4.b: Verify checkout endpoint delegates to `stripeService.createCheckoutSession`
- Test-4.4.c: Verify product lookup with `NotFoundException` on missing product

**Verification Commands**
```bash
# StripeService injected
grep -q "StripeService" packages/sui-media-api/src/license/license.controller.ts && echo "OK"

# Checkout delegates to stripe
grep -q "createCheckoutSession" packages/sui-media-api/src/license/license.controller.ts && echo "OK"

# Product not found handling
grep -q "NotFoundException" packages/sui-media-api/src/license/license.controller.ts && echo "OK"

# TypeScript compiles
cd packages/sui-media-api && pnpm typescript && echo "OK"
```

---

## 3. Completion Criteria

The project is considered complete when:

- All Phase 1-4 acceptance criteria pass
- All verification commands from every work item exit 0
- `pnpm --filter @stoked-ui/media-api build` succeeds (full NestJS build)
- `pnpm --filter @stoked-ui/common-api typescript` succeeds (model type checking)
- The following files exist and are syntactically correct:
  - `packages/sui-common-api/src/models/license.model.ts`
  - `packages/sui-common-api/src/models/product.model.ts`
  - `packages/sui-media-api/src/license/dto/activate-license.dto.ts`
  - `packages/sui-media-api/src/license/dto/validate-license.dto.ts`
  - `packages/sui-media-api/src/license/dto/deactivate-license.dto.ts`
  - `packages/sui-media-api/src/license/dto/create-checkout.dto.ts`
  - `packages/sui-media-api/src/license/dto/license-response.dto.ts`
  - `packages/sui-media-api/src/license/dto/index.ts`
  - `packages/sui-media-api/src/license/license.service.ts`
  - `packages/sui-media-api/src/license/license.controller.ts`
  - `packages/sui-media-api/src/license/stripe.service.ts`
  - `packages/sui-media-api/src/license/stripe.controller.ts`
  - `packages/sui-media-api/src/license/license.module.ts`
- The following files are correctly modified:
  - `packages/sui-common-api/src/models/index.ts` (exports license and product models)
  - `packages/sui-media-api/src/database/database.module.ts` (registers LicenseFeature and ProductFeature)
  - `packages/sui-media-api/src/app.module.ts` (imports LicenseModule)
  - `packages/sui-media-api/src/lambda.bootstrap.ts` (rawBody: true)
  - `packages/sui-media-api/package.json` (stripe and @aws-sdk/client-ses dependencies)
  - `infra/secrets.ts` (Stripe secrets)
  - `infra/api.ts` (link secrets, environment variables, SES permissions)
- No regressions in existing endpoints (media, blog, invoices, auth, health)

---

## 4. Rollout & Validation

### Rollout Strategy
1. **Local verification:** Build the project locally with `pnpm --filter @stoked-ui/media-api build` and verify no compilation errors.
2. **Set SST secrets:** Before deploying, run:
   ```bash
   npx sst secret set STRIPE_SECRET_KEY sk_test_... --stage dev --profile stoked
   npx sst secret set STRIPE_WEBHOOK_SECRET whsec_... --stage dev --profile stoked
   ```
3. **Deploy to dev stage:** `npx sst deploy --stage dev --profile stoked`
4. **Configure Stripe webhook:** In Stripe Dashboard, add webhook endpoint `https://<dev-api-domain>/v1/webhooks/stripe` with events: `checkout.session.completed`, `invoice.payment_succeeded`, `customer.subscription.deleted`.
5. **Seed product collection:** Insert a Flux product document into MongoDB:
   ```json
   {
     "productId": "flux",
     "name": "Flux",
     "keyPrefix": "FLUX",
     "stripePriceId": "price_xxx",
     "licenseDurationDays": 365,
     "gracePeriodDays": 14,
     "trialDurationDays": 30,
     "purchaseUrl": "https://stoked-ui.com/flux/purchase"
   }
   ```
6. **Test with Stripe CLI:** `stripe trigger checkout.session.completed --override checkout_session:metadata.productId=flux`

### Post-Launch Validation
- **Endpoint health checks:**
  - `curl -X POST https://<api>/v1/licenses/activate -H 'Content-Type: application/json' -d '{"key":"FLUX-TEST-TEST-TEST","hardwareId":"abc123"}' ` -- should return 404 (no such license)
  - `curl -X POST https://<api>/v1/licenses/checkout -H 'Content-Type: application/json' -d '{"productId":"flux","email":"test@example.com","successUrl":"https://example.com/success","cancelUrl":"https://example.com/cancel"}' ` -- should return a Stripe checkout URL
- **Webhook processing:** Verify in CloudWatch logs that webhook events are received and processed without errors
- **SES email delivery:** Verify license key email arrives after a successful test checkout
- **Existing endpoint regression:** Verify `/v1/health`, `/v1/media`, `/v1/blog`, `/v1/invoices` all still respond correctly after the `rawBody: true` change
- **Rollback triggers:**
  - Existing endpoints return errors after deployment
  - Lambda cold start time exceeds 10 seconds (currently optimized)
  - Lambda memory usage exceeds 800 MB (of 1024 MB allocation)
  - SES sending failures on every attempt

---

## 5. Open Questions

1. **Email template:** What email template should be used for license key delivery? Plain text with the key, or a branded HTML template? (For initial implementation, use plain text.)
2. **Checkout productId vs priceId:** Should `POST /v1/licenses/checkout` accept a `productId` to look up `stripePriceId` from the product model, or should the client pass the Stripe price ID directly? (The spec assumes `productId` lookup.)
3. **Resend license key:** Is there a need for a "resend license key" endpoint for customers who lost their email, or will this be handled via support?
4. **Webhook path versioning:** Should the webhook endpoint be at `/v1/webhooks/stripe` or `/webhooks/stripe` (without version prefix)? The global prefix applies to all routes.
5. **CORS policy:** What CORS policy should apply to license endpoints? Desktop apps make direct HTTP calls (not browser-based), but the checkout endpoint may be called from the website.
6. **Product seeding:** Should the `product` collection be seeded via the existing `db:init` script, or managed manually via MongoDB shell?
7. **Grace period on payment failure:** What is the desired behavior when a subscription payment fails? The spec says 14 days default -- should this be configurable per product and what messaging should the API support?
8. **License listing:** Should the API support listing all licenses for an email address (e.g., for a "manage my licenses" page)?
9. **rawBody impact:** Does enabling `rawBody: true` for all routes cause issues with large file uploads in the media module? The raw body buffer doubles memory usage for request bodies. Testing with existing media upload endpoints is required.

---
