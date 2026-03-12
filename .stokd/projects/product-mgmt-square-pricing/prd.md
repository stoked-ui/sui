# Product Requirements Document

## Product Management System — Square Pricing, Promos & Enhanced Fields

**Version:** 1.0
**Date:** 2026-02-28
**Status:** Draft

---

## 1. Overview

### 1.1 Problem Statement

The existing product management system (`docs/pages/api/products/`) manages product catalog records in MongoDB but lacks three capabilities required to operate products commercially:

1. **No pricing configuration.** Products cannot be linked to Square subscription pricing. The current system links products to Stripe via `stripePriceId` in `licenseStore.ts`, but Square is the intended payment processor for product subscriptions going forward, and no Square pricing model exists.

2. **No promotional pricing.** There is no mechanism for admins to create promo codes that offer discounts, free trial extensions, or fixed-amount reductions at checkout. This prevents marketing campaigns and customer acquisition strategies.

3. **Incomplete product identity fields.** Products have an `icon` string (an icon name) but no actual logo image URL. There is also no field to link a product to its GitHub repository. Both are required for public product display pages and for establishing product credibility.

### 1.2 Goals

- Add `logoUrl` (required), `githubRepo` (optional), `pricing` object (Square monthly subscription config), and `promos` array to the product schema.
- Build a Square API client module following the same singleton lazy-init pattern as `docs/src/modules/license/stripeClient.ts`.
- Build a promo code system with CRUD API, discount type variants, expiry and usage-limit enforcement, and checkout application.
- Update all product API endpoints to validate, persist, and expose the new fields.
- Update the admin UI (`ProductsPage.tsx`, `ProductDetailPage.tsx`) to surface logo upload, GitHub repo input, pricing configuration, and promo management.
- Update the public product listing endpoint to expose `logoUrl` and pricing summary fields.

### 1.3 Success Metrics

- A product cannot be created via `POST /api/products` without a valid `logoUrl`.
- A Square catalog item ID and monthly price can be set per product and persisted to MongoDB.
- A promo code applied at checkout reduces the payable amount per its configured type and passes Square's discount API.
- The public endpoint `GET /api/products/public` returns `logoUrl` and `pricing.monthlyPriceCents` for each live product.
- All four new fields (`logoUrl`, `githubRepo`, `pricing`, `promos`) round-trip correctly through `PATCH /api/products/[id]`.
- The admin product list card renders the product logo thumbnail.

---

## 2. User Stories

All stories are from the perspective of an authenticated admin user (JWT role `admin`).

**US-01 — Required Logo on Create**
As an admin, when I create a new product, I must supply a logo image so that the product is visually identifiable in the public catalog from the moment it goes live.

**US-02 — Logo Upload from Admin UI**
As an admin, I want to upload a logo image file from the product create dialog and have it stored to S3 (reusing the existing CDN bucket), so I receive a CDN URL without managing S3 directly.

**US-03 — GitHub Repo Link**
As an admin, I want to associate a GitHub repository URL with a product so that customers and contributors can find the source code from the public product page.

**US-04 — Set Square Monthly Price**
As an admin, I want to configure a monthly subscription price (in cents) for a product and link it to a Square catalog item ID, so that Square can generate a checkout link for that product.

**US-05 — Sync Square Catalog**
As an admin, I want to trigger a sync that creates or updates the Square catalog item and variation for a product's pricing, so that Square's catalog always reflects what is in our database.

**US-06 — Square Webhook Processing**
As a system operator, I want Square payment events (subscription activated, payment completed, subscription cancelled) to be processed by a webhook handler so that product access can be granted or revoked automatically.

**US-07 — Create Promo Code**
As an admin, I want to create a promo code with a discount type (percentage, fixed amount, or free trial days), an optional expiry date, and an optional per-code usage limit, so that I can run time-bounded promotions.

**US-08 — Product-Scoped Promos**
As an admin, I want to restrict a promo code to one or more specific products, so that a "50% off Flux" promo cannot be applied to an unrelated product.

**US-09 — Apply Promo at Checkout**
As a customer, I want to enter a promo code during checkout so that the discount is applied before I am sent to Square's payment screen.

**US-10 — Validate Promo**
As a customer, when I submit an invalid, expired, or exhausted promo code, I want to receive a clear error message so I know the code cannot be used.

**US-11 — View Pricing on Public Listing**
As a website visitor, I want to see each product's monthly price on the public product listing, so that I can evaluate affordability before signing up.

**US-12 — Logo Thumbnail in Admin Card**
As an admin browsing the product list, I want to see a small logo thumbnail on each product card so that I can visually identify products at a glance.

---

## 3. Technical Requirements

### 3.1 Schema Changes

#### 3.1.1 Product Document — New Fields

The MongoDB `products` collection document gains the following fields. All new fields are optional at the database level except `logoUrl`, which the POST API enforces as required at creation time.

```typescript
// New top-level fields on the product document
logoUrl: string;          // Required on create. CDN URL of the product logo image.
githubRepo?: string;      // Optional. Full HTTPS URL to the GitHub repository.

pricing?: {
  monthlyPriceCents: number;        // Price in cents for a monthly subscription, e.g. 4900 = $49.00
  squareCatalogItemId?: string;     // Square catalog item ID after sync
  squareCatalogVariationId?: string;// Square catalog item variation ID after sync
  currency: string;                 // ISO 4217, default 'USD'
  syncedAt?: Date;                  // Timestamp of last successful Square sync
};

promos?: PromoCode[];
```

#### 3.1.2 PromoCode Subdocument

```typescript
interface PromoCode {
  code: string;                     // Unique within the product's promos array. Uppercase, alphanumeric + dash.
  discountType: 'percentage' | 'fixed_amount' | 'free_trial_days';
  discountValue: number;            // Percentage (0–100), cents, or number of days respectively.
  applicableProductIds: string[];   // Empty array means valid for all products.
  expiresAt?: Date;                 // If omitted, never expires.
  maxUses?: number;                 // If omitted, unlimited uses.
  usedCount: number;                // Incremented atomically on each valid redemption.
  active: boolean;                  // Admin can deactivate without deleting.
  createdAt: Date;
  updatedAt: Date;
}
```

Promo codes live as a subdocument array on each product for product-scoped promos, and also in a top-level `promo_codes` collection for global promos.

#### 3.1.3 MongoDB Index Requirements

- `products` collection: compound index on `{ "promos.code": 1 }` (sparse) for promo lookup.
- `promo_codes` collection: unique index on `{ code: 1 }` for global code lookup.

### 3.2 API Changes

#### 3.2.1 POST /api/products — `docs/pages/api/products/index.ts`

- Add `logoUrl` to required field validation. Reject with 400 if missing or not a non-empty string.
- Add `githubRepo` (optional) to the insert document.
- Persist `pricing` if provided in body (validated: `monthlyPriceCents` must be a positive integer, `currency` defaults to `'USD'`).
- Insert with `promos: []` default.

#### 3.2.2 PATCH /api/products/[id] — `docs/pages/api/products/[id].ts`

- Add `logoUrl`, `githubRepo`, `pricing` to the update field extraction and `$set` map.
- `pricing` patch merges into existing pricing subdocument (do not wipe `squareCatalogItemId` unless explicitly set to null).

#### 3.2.3 GET /api/products/public — `docs/pages/api/products/public.ts`

- Add `logoUrl`, `githubRepo`, `pricing.monthlyPriceCents`, `pricing.currency` to the MongoDB projection.

#### 3.2.4 New: POST /api/products/[id]/pricing/sync — Square Catalog Sync

- Admin only.
- Creates or updates the Square catalog item and pricing variation for the product.
- Persists `squareCatalogItemId`, `squareCatalogVariationId`, `syncedAt` back to MongoDB.

#### 3.2.5 New: GET|POST|PATCH|DELETE /api/promo-codes — Promo Code CRUD

- Admin-only for write operations.
- GET accepts optional query params: `?productId=` to filter, `?active=true`.
- POST creates a new global promo code in the `promo_codes` collection.
- PATCH `/api/promo-codes/[code]` updates an existing code.
- DELETE `/api/promo-codes/[code]` hard-deletes (or soft-deactivates).

#### 3.2.6 New: POST /api/promo-codes/validate

- Public endpoint (no auth required).
- Body: `{ code: string, productId: string }`.
- Returns discount details if valid; 400 with error message if invalid, expired, or exhausted.
- Does NOT increment `usedCount` — validation only.

#### 3.2.7 New: POST /api/square/checkout

- Public endpoint (email required in body).
- Body: `{ productId, email, successUrl, cancelUrl, promoCode? }`.
- Validates promo code if provided (calls validate logic).
- Creates a Square checkout link via the Square client module.
- Atomically increments `usedCount` on the promo code after successful checkout creation.

#### 3.2.8 New: POST /api/webhooks/square — Square Webhook Handler

- Must disable Next.js body parser (same pattern as `docs/pages/api/webhooks/stripe.ts`).
- Verifies Square webhook signature using `SQUARE_WEBHOOK_SIGNATURE_KEY`.
- Handles event types: `payment.completed`, `subscription.created`, `subscription.updated`, `subscription.canceled`.

#### 3.2.9 New: POST /api/upload/product-logo

- Admin-only. Reuses the base64-upload-to-S3 pattern from `docs/pages/api/upload/blog-image.ts`.
- S3 key prefix: `products/logos/`.
- Returns `{ url: string }` pointing to CDN URL.

### 3.3 Module Changes

#### 3.3.1 New: `docs/src/modules/square/squareClient.ts`

- Lazy singleton init pattern matching `stripeClient.ts`.
- Reads `SQUARE_ACCESS_TOKEN` and `SQUARE_ENVIRONMENT` (`'sandbox'` | `'production'`) from env.
- Exports:
  - `getSquareClient(): Client` — returns initialized Square SDK client.
  - `createOrUpdateCatalogItem(params): Promise<SyncResult>` — upserts item + variation.
  - `createSquareCheckoutLink(params): Promise<string>` — returns hosted payment page URL.
  - `constructSquareWebhookEvent(rawBody, signature): SquareWebhookEvent` — verifies and parses.

#### 3.3.2 New: `docs/src/modules/promo/promoStore.ts`

- Functions: `validatePromoCode`, `applyPromoCode` (increments usedCount), `createPromoCode`, `updatePromoCode`, `deletePromoCode`, `listPromoCodes`.
- Throws typed `PromoError` (with HTTP status) on validation failures, similar to `LicenseStoreError`.

### 3.4 UI Changes

#### 3.4.1 ProductsPage.tsx — `docs/src/modules/components/ProductsPage.tsx`

- Product create dialog gains: logo upload button + preview (reuses upload API), GitHub repo text field.
- `logoUrl` is required — the Create button is disabled until a logo is present.

#### 3.4.2 ProductCard.tsx — `docs/src/modules/components/ProductCard.tsx`

- Render a 40x40px logo thumbnail (via MUI `Avatar`) in the card header when `logoUrl` is present.
- Fall back to the existing icon display when `logoUrl` is absent.

#### 3.4.3 ProductDetailPage.tsx — `docs/src/modules/components/ProductDetailPage.tsx`

- Add "Identity" sub-section: logo preview with re-upload button, GitHub repo field with save.
- Add "Pricing" section (new `Paper` block): displays current price, currency, Square catalog IDs, last sync timestamp. "Set Price" inline edit + "Sync to Square" button that calls `/api/products/[id]/pricing/sync`.
- Add "Promo Codes" section (new `Paper` block): table of promo codes scoped to this product, with add/edit/deactivate/delete actions via a dialog.

#### 3.4.4 New: `docs/src/modules/components/LogoUpload.tsx`

- Shared component used in both create dialog and detail page.
- File input (hidden) triggered by a Button. Reads file as base64, calls `/api/upload/product-logo`, shows preview on success, shows error on failure.
- Props: `value: string | null`, `onChange: (url: string) => void`, `label?: string`.

#### 3.4.5 New: `docs/src/modules/components/PromoCodeDialog.tsx`

- Dialog for create/edit a promo code.
- Fields: code (auto-uppercased), discount type (Select), discount value (Number), expires at (Date), max uses (Number), active (Switch), applicable product IDs (multi-select or chip input).

---

## 4. Implementation Phases

---

### Phase 1 — Schema & API Foundation

**Goal:** All four new product fields exist in the API layer, pass validation, persist correctly, and are returned by relevant endpoints. No Square or promo logic yet.

---

**1.1 — Update POST /api/products to require logoUrl**

File: `docs/pages/api/products/index.ts`

Implementation:
- Change the required-field destructuring on line 24 from `{ productId, name, description }` to `{ productId, name, description, logoUrl }`.
- Add `logoUrl` to the validation condition on line 25: if `!productId || !name || !description || !logoUrl`.
- Return 400 with message `'productId, name, description, and logoUrl are required'`.
- Add `logoUrl` to the insert document `doc` on line 33.
- Add `githubRepo: req.body.githubRepo || null` to the insert document.
- Add `pricing: req.body.pricing || null` to the insert document.
- Add `promos: []` to the insert document.

Acceptance Criteria:
- AC-1.1.1: `POST /api/products` with body omitting `logoUrl` returns HTTP 400 with `message` containing `'logoUrl'`.
- AC-1.1.2: `POST /api/products` with valid `logoUrl` (non-empty string), `productId`, `name`, and `description` returns HTTP 201 and the response body contains `logoUrl` matching the submitted value.
- AC-1.1.3: `POST /api/products` with `githubRepo: "https://github.com/org/repo"` returns 201 and `githubRepo` in the response matches the submitted URL.
- AC-1.1.4: `POST /api/products` with `promos: [{ code: "HACK" }]` in the body returns HTTP 201 and a subsequent `GET /api/products/[id]` returns `promos` as an empty array (server ignores client-supplied promos on create).

Acceptance Tests:
```
TEST POST /api/products without logoUrl
  GIVEN admin JWT, body = { productId: "test-p1", name: "Test", description: "Desc" }
  WHEN POST /api/products
  THEN response.status === 400
   AND response.body.message includes "logoUrl"

TEST POST /api/products with logoUrl
  GIVEN admin JWT, body = { productId: "test-p2", name: "Test", description: "Desc", logoUrl: "https://cdn.example.com/logo.png" }
  WHEN POST /api/products
  THEN response.status === 201
   AND response.body.logoUrl === "https://cdn.example.com/logo.png"
   AND response.body.promos is an empty array
```

---

**1.2 — Update PATCH /api/products/[id] to handle new fields**

File: `docs/pages/api/products/[id].ts`

Implementation:
- On line 29, extend the destructure to include `logoUrl`, `githubRepo`, and `pricing`.
- In the `update` object construction block (lines 31–39), add:
  - `if (logoUrl !== undefined) update.logoUrl = logoUrl;`
  - `if (githubRepo !== undefined) update.githubRepo = githubRepo;`
  - For `pricing`: use a MongoDB `$set` with dot-notation merge to avoid overwriting existing `squareCatalogItemId` when only `monthlyPriceCents` is patched. Implement as: if `pricing` is provided, build `update['pricing.monthlyPriceCents']`, `update['pricing.currency']` individually from `pricing` fields.

Acceptance Criteria:
- AC-1.2.1: `PATCH /api/products/[id]` with `{ logoUrl: "https://cdn.example.com/new.png" }` returns 200 and the response `logoUrl` equals the new value.
- AC-1.2.2: `PATCH /api/products/[id]` with `{ pricing: { monthlyPriceCents: 4900, currency: "USD" } }` returns 200 and `pricing.monthlyPriceCents === 4900`.
- AC-1.2.3: A subsequent `PATCH` with `{ pricing: { monthlyPriceCents: 7900 } }` on a product that already has `squareCatalogItemId` does NOT clear `squareCatalogItemId` from the returned document.
- AC-1.2.4: `PATCH /api/products/[id]` with `{ githubRepo: null }` returns 200 and `githubRepo` is `null` in the response.

Acceptance Tests:
```
TEST PATCH logoUrl
  GIVEN product exists with _id = X, admin JWT
  WHEN PATCH /api/products/X body = { logoUrl: "https://cdn.example.com/new.png" }
  THEN response.status === 200
   AND response.body.logoUrl === "https://cdn.example.com/new.png"

TEST PATCH pricing does not clobber squareCatalogItemId
  GIVEN product exists with pricing.squareCatalogItemId = "CAT123", admin JWT
  WHEN PATCH /api/products/X body = { pricing: { monthlyPriceCents: 7900 } }
  THEN response.status === 200
   AND response.body.pricing.squareCatalogItemId === "CAT123"
   AND response.body.pricing.monthlyPriceCents === 7900
```

---

**1.3 — Update GET /api/products/public to expose new fields**

File: `docs/pages/api/products/public.ts`

Implementation:
- On line 14, extend the MongoDB projection to include: `logoUrl: 1`, `githubRepo: 1`, `'pricing.monthlyPriceCents': 1`, `'pricing.currency': 1`.
- Do NOT expose `pricing.squareCatalogItemId`, `pricing.squareCatalogVariationId`, or `promos` — these are internal fields.

Acceptance Criteria:
- AC-1.3.1: `GET /api/products/public` returns HTTP 200 and each product item that has a `logoUrl` set includes `logoUrl` as a non-empty string matching the value stored via the create/patch API.
- AC-1.3.2: `GET /api/products/public` returns HTTP 200 and a product with `pricing.monthlyPriceCents: 4900` and `pricing.currency: "USD"` set via PATCH returns those exact values in the public listing response item.
- AC-1.3.3: `GET /api/products/public` response items do NOT include `pricing.squareCatalogItemId` or `promos`.
- AC-1.3.4: `GET /api/products/public` does not require authentication and returns 200 for unauthenticated requests.

Acceptance Tests:
```
TEST Public endpoint exposes logoUrl and pricing summary
  GIVEN product with live: true, logoUrl set, pricing.monthlyPriceCents = 4900
  WHEN GET /api/products/public (no auth header)
  THEN response.status === 200
   AND matching product in array has logoUrl set
   AND matching product has pricing.monthlyPriceCents === 4900
   AND matching product does NOT have pricing.squareCatalogItemId
   AND matching product does NOT have promos field

TEST Public endpoint excludes hidden products
  GIVEN product with live: false
  WHEN GET /api/products/public
  THEN that product is NOT in the response array
```

---

**1.4 — Create product logo upload API endpoint**

File: `docs/pages/api/upload/product-logo.ts` (new file)

Implementation:
- Copy structure from `docs/pages/api/upload/blog-image.ts`.
- Change S3 key prefix from `blog/images/` to `products/logos/`.
- Require admin role: read Authorization header, call `verifyToken` from `docs/src/modules/auth/authStore.ts`, reject with 403 if role is not `admin`.
- Reuse same `BUCKET`, `REGION`, `CDN_BASE` env vars.
- Enforce max file size of 5MB (logos should be small).
- Accept same MIME types as blog-image: `image/jpeg`, `image/png`, `image/webp`, `image/svg+xml`.

Acceptance Criteria:
- AC-1.4.1: `POST /api/upload/product-logo` with a valid admin JWT, valid base64 PNG, and valid `contentType` returns 200 with a `url` field containing the CDN URL with path prefix `products/logos/`.
- AC-1.4.2: `POST /api/upload/product-logo` without a JWT returns 401.
- AC-1.4.3: `POST /api/upload/product-logo` with a client-role JWT returns 403.
- AC-1.4.4: `POST /api/upload/product-logo` with a file exceeding 5MB returns 400 with a message about file size.

Acceptance Tests:
```
TEST Logo upload by admin succeeds
  GIVEN admin JWT, 200KB PNG as base64
  WHEN POST /api/upload/product-logo body = { file: <base64>, filename: "logo.png", contentType: "image/png" }
  THEN response.status === 200
   AND response.body.url starts with "https://cdn.stokedconsulting.com/products/logos/"

TEST Logo upload rejected without auth
  GIVEN no Authorization header
  WHEN POST /api/upload/product-logo
  THEN response.status === 401

TEST Logo upload rejected for client role
  GIVEN JWT with role = "client"
  WHEN POST /api/upload/product-logo
  THEN response.status === 403
```

---

**1.5 — Create MongoDB indexes for new fields**

File: `docs/src/modules/db/migrations/001-product-new-fields-indexes.ts` (new file, run-once script)

Implementation:
- Create a standalone script (not a Next.js API route) that connects via `getDb()` and applies:
  - `db.collection('products').createIndex({ "promos.code": 1 }, { sparse: true })`
  - `db.collection('promo_codes').createIndex({ code: 1 }, { unique: true })`
  - `db.collection('promo_codes').createIndex({ "applicableProductIds": 1 })`
- Script is idempotent (MongoDB `createIndex` is safe to re-run).
- Export a `runMigration()` function; also support direct execution via `tsx`.

Acceptance Criteria:
- AC-1.5.1: Running the migration script twice produces no errors (idempotency).
- AC-1.5.2: After migration, `db.collection('products').indexInformation()` includes an index on `promos.code`, and a `find({ "promos.code": "TEST" }).explain()` query shows the index is used (IXSCAN stage, not COLLSCAN).
- AC-1.5.3: After migration, inserting two documents with the same `code` value into `promo_codes` causes the second insert to throw a duplicate key error (E11000), proving the unique index is enforced.

---

### Phase 2 — Square Pricing Integration

**Goal:** Admins can set a monthly price per product and sync it to Square's catalog. Square checkout links can be generated. Square webhooks are handled.

---

**2.1 — Create Square client module**

File: `docs/src/modules/square/squareClient.ts` (new file)

Implementation:
- Install `square` npm package in `docs/package.json`.
- Export `SquareClientError` class extending `Error` with a `status: number` property (mirrors `LicenseStoreError`).
- Export `getSquareClient(): Client` — reads `SQUARE_ACCESS_TOKEN` env var, initializes Square SDK `Client` with `environment: process.env.SQUARE_ENVIRONMENT === 'production' ? Environment.Production : Environment.Sandbox`. Caches instance in module-level variable.
- Export `createOrUpdateCatalogItem(params: { productId: string; name: string; monthlyPriceCents: number; currency: string; existingItemId?: string; existingVariationId?: string; }): Promise<{ catalogItemId: string; catalogVariationId: string }>`.
  - Uses Square Catalog API `UpsertCatalogObject`. If `existingItemId` provided, includes `id` in the upsert to update in place.
  - The item variation type is `SUBSCRIPTION` with a `MONTHLY` cadence.
  - Returns the Square-assigned IDs.
- Export `createSquareCheckoutLink(params: { productId: string; email: string; catalogVariationId: string; successUrl: string; cancelUrl: string; discountAmountCents?: number; }): Promise<string>`.
  - Uses Square Checkout API to create a hosted payment link.
  - Applies inline discount if `discountAmountCents` provided.
  - Returns the `url` from the Square checkout response.
- Export `constructSquareWebhookEvent(rawBody: Buffer, signature: string, notificationUrl: string): SquareWebhookEvent`.
  - Validates HMAC-SHA256 signature using `SQUARE_WEBHOOK_SIGNATURE_KEY`.
  - Throws `SquareClientError(400, ...)` on signature mismatch.

Acceptance Criteria:
- AC-2.1.1: `getSquareClient()` throws `SquareClientError` with status 500 if `SQUARE_ACCESS_TOKEN` env var is unset.
- AC-2.1.2: `createOrUpdateCatalogItem` called with no `existingItemId` returns `catalogItemId` and `catalogVariationId` as non-empty strings (verified against Square sandbox).
- AC-2.1.3: `createOrUpdateCatalogItem` called with an existing `existingItemId` upserts (does not create a duplicate item in Square sandbox).
- AC-2.1.4: `constructSquareWebhookEvent` with a tampered body throws `SquareClientError` with status 400.

---

**2.2 — Create Square catalog sync endpoint**

File: `docs/pages/api/products/[id]/pricing/sync.ts` (new file)

Implementation:
- Admin-only, wrapped with `withAuth`.
- POST only.
- Fetches the product from MongoDB by `id`.
- Returns 400 if product has no `pricing.monthlyPriceCents` set.
- Calls `createOrUpdateCatalogItem` passing existing IDs if present.
- PATCH the product document with `{ 'pricing.squareCatalogItemId': itemId, 'pricing.squareCatalogVariationId': variationId, 'pricing.syncedAt': new Date() }`.
- Returns the updated product document.

Acceptance Criteria:
- AC-2.2.1: `POST /api/products/[id]/pricing/sync` on a product without `pricing.monthlyPriceCents` returns 400.
- AC-2.2.2: `POST /api/products/[id]/pricing/sync` on a product with pricing configured returns 200 and the response includes `pricing.squareCatalogItemId` and `pricing.squareCatalogVariationId` as non-empty strings.
- AC-2.2.3: Calling sync twice on the same product does not create a second Square catalog item (same `squareCatalogItemId` returned both times).
- AC-2.2.4: `POST /api/products/[id]/pricing/sync` with client role JWT returns 403.

Acceptance Tests:
```
TEST Sync without price set returns 400
  GIVEN product with no pricing.monthlyPriceCents, admin JWT
  WHEN POST /api/products/{id}/pricing/sync
  THEN response.status === 400

TEST Sync sets Square IDs on product
  GIVEN product with pricing.monthlyPriceCents = 4900, admin JWT, Square sandbox env configured
  WHEN POST /api/products/{id}/pricing/sync
  THEN response.status === 200
   AND response.body.pricing.squareCatalogItemId is a non-empty string
   AND response.body.pricing.squareCatalogVariationId is a non-empty string
   AND response.body.pricing.syncedAt is an ISO date string
```

---

**2.3 — Create Square checkout endpoint**

File: `docs/pages/api/square/checkout.ts` (new file)

Implementation:
- Public endpoint (no auth required, email required in body).
- POST only.
- Body: `{ productId: string; email: string; successUrl: string; cancelUrl: string; promoCode?: string }`.
- Validates `email`, `successUrl`, `cancelUrl` using the same `isValidEmail`/`isValidUrl` helpers from `docs/src/modules/license/licenseApiUtils.ts`.
- Fetches product from MongoDB. Returns 404 if not found or not `live`.
- Returns 400 if product has no `pricing.squareCatalogVariationId` (not yet synced to Square).
- If `promoCode` provided: calls `validatePromoCode` from `promoStore.ts` (Phase 3). If invalid, returns 400.
- Calls `createSquareCheckoutLink`. If promo is valid and discount applies, passes `discountAmountCents`.
- If promo provided and checkout link created: calls `applyPromoCode` (Phase 3) to increment usedCount.
- Returns `{ checkoutUrl: string }`.

Acceptance Criteria:
- AC-2.3.1: `POST /api/square/checkout` with a valid `productId`, `email`, `successUrl`, `cancelUrl` for a live, synced product returns 200 with a `checkoutUrl` that is a valid HTTPS URL pointing to squareupsandbox.com or squareup.com.
- AC-2.3.2: `POST /api/square/checkout` with a product that has no `squareCatalogVariationId` returns 400.
- AC-2.3.3: `POST /api/square/checkout` with an invalid email returns 400.
- AC-2.3.4: `POST /api/square/checkout` with a product that is `live: false` returns 404.

---

**2.4 — Create Square webhook handler**

File: `docs/pages/api/webhooks/square.ts` (new file)

Implementation:
- Disable body parser: `export const config = { api: { bodyParser: false } }`.
- POST only.
- Read `square-signature` header. Return 400 if missing.
- Read raw body via the same `readRawBody` pattern from `docs/pages/api/webhooks/stripe.ts`.
- Call `constructSquareWebhookEvent(rawBody, signature, notificationUrl)`. Derive `notificationUrl` from `process.env.SQUARE_WEBHOOK_NOTIFICATION_URL`.
- Handle event types:
  - `payment.completed` — log payment (stub for now; license grant if applicable).
  - `subscription.created` — log subscription creation.
  - `subscription.canceled` — log cancellation.
- Return 200 for all recognized and unrecognized events (Square requires 200 to stop retries).

Acceptance Criteria:
- AC-2.4.1: `POST /api/webhooks/square` with a missing `square-signature` header returns 400.
- AC-2.4.2: `POST /api/webhooks/square` with a tampered body returns 400 (signature verification fails via `constructSquareWebhookEvent`).
- AC-2.4.3: `POST /api/webhooks/square` with a correctly signed `payment.completed` event returns 200.
- AC-2.4.4: `POST /api/webhooks/square` with an unrecognized event type returns 200 (no-op, prevents Square retries).

---

### Phase 3 — Promo Code System

**Goal:** Admins can create and manage promo codes. Customers can validate and apply them at Square checkout.

---

**3.1 — Create promoStore module**

File: `docs/src/modules/promo/promoStore.ts` (new file)

Implementation:
- Define `PromoCode` interface matching the schema in Section 3.1.2.
- Export `PromoError` class with `status: number` (pattern from `LicenseStoreError`).
- `validatePromoCode(code: string, productId: string): Promise<PromoCode>` — looks up in `promo_codes` collection first (global), then falls back to product `promos` subdocument array. Throws `PromoError(404)` if not found, `PromoError(400)` if inactive, expired, or at max uses. Throws `PromoError(400)` if `applicableProductIds` is non-empty and does not include `productId`.
- `applyPromoCode(code: string): Promise<void>` — atomically increments `usedCount` using `$inc`. Finds code in `promo_codes` collection or product subdocument. Does not re-validate (caller validates first).
- `createPromoCode(data: Omit<PromoCode, 'usedCount' | 'createdAt' | 'updatedAt'>): Promise<PromoCode>` — inserts into `promo_codes` collection. Normalizes `code` to uppercase. Throws `PromoError(409)` if code already exists.
- `updatePromoCode(code: string, updates: Partial<Pick<PromoCode, 'active' | 'expiresAt' | 'maxUses' | 'discountValue' | 'applicableProductIds'>>): Promise<PromoCode>` — finds by code, applies updates.
- `deletePromoCode(code: string): Promise<void>` — hard delete from `promo_codes` collection.
- `listPromoCodes(filters?: { productId?: string; active?: boolean }): Promise<PromoCode[]>` — queries `promo_codes` with optional filters.

Acceptance Criteria:
- AC-3.1.1: `validatePromoCode('SAVE20', 'flux')` returns the promo document if the code exists, is active, not expired, not exhausted, and either has empty `applicableProductIds` or includes `'flux'`.
- AC-3.1.2: `validatePromoCode('SAVE20', 'flux')` throws `PromoError(400)` with message about expiry when `expiresAt` is in the past.
- AC-3.1.3: `validatePromoCode('SAVE20', 'flux')` throws `PromoError(400)` when `usedCount >= maxUses`.
- AC-3.1.4: Given a promo code `SAVE20` with `usedCount: 5`, calling `applyPromoCode('SAVE20')` results in `usedCount: 6` when the document is subsequently read from the database. Two concurrent `applyPromoCode` calls on a code with `maxUses: 2, usedCount: 0` result in exactly `usedCount: 2` (not 1), confirming atomic increment.

---

**3.2 — Create promo code CRUD API**

Files:
- `docs/pages/api/promo-codes/index.ts` (new) — GET list, POST create
- `docs/pages/api/promo-codes/[code].ts` (new) — PATCH update, DELETE delete

Implementation of `index.ts`:
- `GET /api/promo-codes` — Admin only. Accepts `?productId=` and `?active=` query params. Calls `listPromoCodes`. Returns array.
- `POST /api/promo-codes` — Admin only. Validates required fields: `code`, `discountType`, `discountValue`. Calls `createPromoCode`. Returns 201 with created document.

Implementation of `[code].ts`:
- `GET /api/promo-codes/[code]` — Admin only. Fetches single code from `promo_codes` collection.
- `PATCH /api/promo-codes/[code]` — Admin only. Calls `updatePromoCode`.
- `DELETE /api/promo-codes/[code]` — Admin only. Calls `deletePromoCode`. Returns 200 with `{ message: 'Promo code deleted' }`.

Acceptance Criteria:
- AC-3.2.1: `POST /api/promo-codes` with body `{ code: "save20", discountType: "percentage", discountValue: 20 }` normalizes code to `"SAVE20"` and returns 201 with `code: "SAVE20"`.
- AC-3.2.2: `POST /api/promo-codes` with the same code a second time returns 409.
- AC-3.2.3: `GET /api/promo-codes?active=true` returns only promo codes where `active === true`.
- AC-3.2.4: `DELETE /api/promo-codes/SAVE20` returns 200 and subsequent `GET /api/promo-codes/SAVE20` returns 404.

---

**3.3 — Create promo validation endpoint**

File: `docs/pages/api/promo-codes/validate.ts` (new file)

Implementation:
- Public endpoint (no auth required).
- POST only.
- Body: `{ code: string; productId: string }`.
- Calls `validatePromoCode(code, productId)`.
- On success: returns 200 with `{ valid: true, discountType, discountValue, code }`.
- On `PromoError`: returns the error's status with `{ valid: false, message }`.

Acceptance Criteria:
- AC-3.3.1: `POST /api/promo-codes/validate` with a valid code and matching productId returns 200 with `valid: true` and `discountType`, `discountValue`.
- AC-3.3.2: `POST /api/promo-codes/validate` with an expired code returns 400 with `valid: false` and a message about expiry.
- AC-3.3.3: `POST /api/promo-codes/validate` with a code not applicable to the given productId returns 400 with `valid: false`.
- AC-3.3.4: `POST /api/promo-codes/validate` does NOT increment `usedCount` on the promo code.

Acceptance Tests:
```
TEST Validate returns discount info for valid code
  GIVEN promo code "LAUNCH50" exists: discountType: "percentage", discountValue: 50, active: true, no expiry
  WHEN POST /api/promo-codes/validate body = { code: "LAUNCH50", productId: "flux" }
  THEN response.status === 200
   AND response.body.valid === true
   AND response.body.discountType === "percentage"
   AND response.body.discountValue === 50
  AND promo_codes collection usedCount for "LAUNCH50" is UNCHANGED

TEST Validate rejects expired code
  GIVEN promo code "OLD10" exists: active: true, expiresAt: 2025-01-01T00:00:00Z
  WHEN POST /api/promo-codes/validate body = { code: "OLD10", productId: "flux" }
  THEN response.status === 400
   AND response.body.valid === false
   AND response.body.message includes "expired"
```

---

**3.4 — Integrate promo application into Square checkout**

File: `docs/pages/api/square/checkout.ts` (updated from Phase 2.3)

Implementation:
- This step fills in the promo code integration that was stubbed in Phase 2.3.
- After product fetch and before checkout link creation:
  - If `promoCode` is present: call `validatePromoCode(promoCode, productId)`. On `PromoError`, return 400 with the error message.
  - Compute `discountAmountCents`:
    - `percentage`: `Math.round(product.pricing.monthlyPriceCents * (promo.discountValue / 100))`
    - `fixed_amount`: `promo.discountValue` (already in cents)
    - `free_trial_days`: pass `0` discount — the trial duration is handled at the Square subscription level (pass trial period as metadata or use Square's trial period feature).
  - Pass `discountAmountCents` to `createSquareCheckoutLink`.
  - After successful checkout link creation, call `applyPromoCode(promoCode)`.
- If `promoCode` is absent: `discountAmountCents` is undefined.

Acceptance Criteria:
- AC-3.4.1: `POST /api/square/checkout` with `promoCode: "SAVE20"` (20% discount) on a product with `monthlyPriceCents: 5000` passes `discountAmountCents: 1000` to the Square checkout link creation and returns a valid `checkoutUrl`.
- AC-3.4.2: Given a promo code `SAVE20` with `usedCount: 0`, after `POST /api/square/checkout` returns 200 with a valid `checkoutUrl`, a subsequent `GET /api/promo-codes/SAVE20` returns `usedCount: 1`.
- AC-3.4.3: `POST /api/square/checkout` with a promo code that has `usedCount >= maxUses` returns 400 with a message about the promo code being exhausted.
- AC-3.4.4: `POST /api/square/checkout` with a promo code restricted to `applicableProductIds: ["flux"]` when the requested `productId` is `"editor"` returns 400.

---

### Phase 4 — UI Updates

**Goal:** The admin UI fully surfaces all new fields: logo upload, GitHub repo, pricing config with Square sync, and promo code management. The public-facing product card renders the logo and price.

---

**4.1 — Create LogoUpload component**

File: `docs/src/modules/components/LogoUpload.tsx` (new file)

Implementation:
- React functional component with props: `value: string | null`, `onChange: (url: string) => void`, `label?: string`, `disabled?: boolean`.
- Hidden `<input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml">` triggered by a MUI `Button` labeled "Upload Logo" (or `label` prop).
- On file select: read as base64 using `FileReader`. Call `apiFetch('/api/upload/product-logo', { method: 'POST', body: JSON.stringify({ file: base64, filename, contentType }) })`. On success: call `onChange(url)`. On error: display inline MUI `Alert`.
- When `value` is set: render a 64x64px MUI `Avatar` with `src={value}` and a "Change" button overlay.
- Show `CircularProgress` while upload in flight.

Acceptance Criteria:
- AC-4.1.1: Selecting a PNG file triggers the upload API call and, on success, calls `onChange` with the returned CDN URL.
- AC-4.1.2: When `value` prop is provided, a preview image is rendered with `src` equal to `value`.
- AC-4.1.3: When upload fails (API returns 4xx), an error alert is displayed and `onChange` is not called.
- AC-4.1.4: When `disabled={true}`, the upload button is disabled and clicking does not trigger file selection.

---

**4.2 — Update ProductsPage.tsx — add logo and GitHub repo to create dialog**

File: `docs/src/modules/components/ProductsPage.tsx`

Implementation:
- Import `LogoUpload` from `./LogoUpload`.
- Add state: `formLogoUrl: string`, `formGithubRepo: string`.
- In the create dialog `DialogContent`, after the URL field:
  - Add `<LogoUpload value={formLogoUrl} onChange={(url) => setFormLogoUrl(url)} label="Product Logo" />`.
  - Add a `TextField` for GitHub repo URL with `helperText='e.g. "https://github.com/stoked-ui/flux"'`.
- Update the Create button disabled condition: add `|| !formLogoUrl`.
- In `handleSave`, include `logoUrl: formLogoUrl` and `githubRepo: formGithubRepo` in the POST body.
- Reset `formLogoUrl` and `formGithubRepo` on dialog close and after successful save.
- The edit path (editingId set) does not use this dialog for logo — logo editing is on the detail page.

Acceptance Criteria:
- AC-4.2.1: The "Create" button in the Add Product dialog is disabled when `formLogoUrl` is empty, even if all other required fields are filled.
- AC-4.2.2: After uploading a logo in the create dialog, the Create button becomes enabled and the logo preview is visible.
- AC-4.2.3: A new product created via the dialog with a GitHub repo URL results in a product where `GET /api/products/[id]` returns `githubRepo` matching the entered URL.
- AC-4.2.4: Closing the dialog resets `formLogoUrl` to empty and the logo preview is cleared.

---

**4.3 — Update ProductCard.tsx — render logo thumbnail**

File: `docs/src/modules/components/ProductCard.tsx`

Implementation:
- Update `product` prop type to include `logoUrl?: string`.
- Import MUI `Avatar` from `@mui/material/Avatar`.
- In `CardContent`, before the product name `Typography`, add:
  ```tsx
  <Avatar
    src={product.logoUrl}
    alt={product.name}
    variant="rounded"
    sx={{ width: 40, height: 40, mb: 1 }}
  >
    {!product.logoUrl && product.name.charAt(0)}
  </Avatar>
  ```
- The existing icon text fallback (`product.name.charAt(0)`) shows when `logoUrl` is absent.
- Update `ProductsPage.tsx` to pass `logoUrl` from the product object to `ProductCard`.

Acceptance Criteria:
- AC-4.3.1: When a product has a `logoUrl`, the `ProductCard` renders an `<img>` with `src` equal to the `logoUrl`.
- AC-4.3.2: When a product has no `logoUrl`, the `ProductCard` renders the first letter of the product name in the Avatar.
- AC-4.3.3: A `ProductCard` rendered with `logoUrl` set and a `ProductCard` rendered without `logoUrl` both produce an Avatar element with explicit `width: 40` and `height: 40` styling, and the card's outer container has the same `minHeight` in both cases (verified via component snapshot or computed style assertion).

---

**4.4 — Update ProductDetailPage.tsx — logo re-upload and GitHub repo field**

File: `docs/src/modules/components/ProductDetailPage.tsx`

Implementation:
- Update `ProductData` interface to include `logoUrl?: string`, `githubRepo?: string`.
- Import `LogoUpload` from `./LogoUpload`.
- In the "Product Metadata" Paper section (lines 266–312), add a new "Identity" row below the existing metadata display:
  - `LogoUpload` component with `value={product.logoUrl || null}` and `onChange` handler that calls `PATCH /api/products/[id]` with `{ logoUrl: newUrl }` then calls `fetchData()`.
  - A `TextField` for `githubRepo` with a "Save" button adjacent to it that calls `PATCH /api/products/[id]` with `{ githubRepo }`.

Acceptance Criteria:
- AC-4.4.1: Uploading a new logo on the product detail page calls `PATCH /api/products/[id]` with the new `logoUrl` and refreshes the displayed product.
- AC-4.4.2: The GitHub repo text field is pre-populated with the current `githubRepo` value from the product.
- AC-4.4.3: Saving a new GitHub repo URL calls `PATCH /api/products/[id]` with `{ githubRepo }` and the updated value persists after page reload.

---

**4.5 — Add Pricing configuration section to ProductDetailPage.tsx**

File: `docs/src/modules/components/ProductDetailPage.tsx`

Implementation:
- Update `ProductData` interface to include `pricing?: { monthlyPriceCents?: number; currency?: string; squareCatalogItemId?: string; squareCatalogVariationId?: string; syncedAt?: string; }`.
- Add a new `Paper` section after the Features section titled "Pricing".
- Content:
  - Display current `monthlyPriceCents` as formatted currency (e.g., "$49.00/month") or "Not set".
  - An inline edit: clicking a pencil icon opens a row with a `TextField` (type number) for cents value and a `Select` for currency (defaulting to USD). Saving calls `PATCH /api/products/[id]` with `{ pricing: { monthlyPriceCents: value, currency } }`.
  - Display `squareCatalogItemId` and `squareCatalogVariationId` as read-only monospace text (or "Not synced").
  - Display `syncedAt` as a human-readable date.
  - A "Sync to Square" button that calls `POST /api/products/[id]/pricing/sync`. Show a loading state while syncing. On success, refresh product data. On failure, show an inline `Alert`.

Acceptance Criteria:
- AC-4.5.1: The Pricing section displays "Not set" when `pricing.monthlyPriceCents` is absent.
- AC-4.5.2: Setting a price via the inline edit and saving results in `pricing.monthlyPriceCents` being updated on the server and the display updating to show the formatted price.
- AC-4.5.3: Clicking "Sync to Square" calls `POST /api/products/[id]/pricing/sync` and, on success, the `squareCatalogItemId` and `syncedAt` fields update in the UI.
- AC-4.5.4: If "Sync to Square" fails (no price set, Square API error), an error alert is shown and the button returns to its default (non-loading) state.

---

**4.6 — Add Promo Codes section to ProductDetailPage.tsx**

File: `docs/src/modules/components/ProductDetailPage.tsx`

Implementation:
- Add state for promo code list for this product: fetch from `GET /api/promo-codes?productId={productId}` as part of `fetchData`.
- Add a "Promo Codes" `Paper` section below Pricing.
- Display a MUI `Table` with columns: Code, Type, Value, Expires, Max Uses, Used, Active, Actions.
- Each row has Edit (pencil) and Delete (trash) icon buttons.
- "Add Promo Code" button opens `PromoCodeDialog` in create mode. On save, calls `POST /api/promo-codes` with `applicableProductIds: [product.productId]` pre-set, then refreshes promo list.
- Edit button opens `PromoCodeDialog` pre-populated. On save, calls `PATCH /api/promo-codes/[code]`, then refreshes.
- Delete button shows `window.confirm`, then calls `DELETE /api/promo-codes/[code]`, then refreshes.
- Active toggle in the table calls `PATCH /api/promo-codes/[code]` with `{ active: !current }`.

Acceptance Criteria:
- AC-4.6.1: The Promo Codes section lists promo codes where `applicableProductIds` includes the current product's `productId`.
- AC-4.6.2: Creating a promo code via the "Add Promo Code" dialog results in the code appearing in the table with the correct `discountType` and `discountValue`.
- AC-4.6.3: Toggling "Active" on a promo code calls the PATCH endpoint and updates the row's active display without a full page reload.
- AC-4.6.4: Deleting a promo code via the delete button (after confirmation) removes it from the table.

---

**4.7 — Create PromoCodeDialog component**

File: `docs/src/modules/components/PromoCodeDialog.tsx` (new file)

Implementation:
- Props: `open: boolean`, `onClose: () => void`, `onSave: (data: PromoCodeFormData) => void`, `initialData?: Partial<PromoCodeFormData>`, `mode: 'create' | 'edit'`.
- `PromoCodeFormData`: `{ code: string; discountType: 'percentage' | 'fixed_amount' | 'free_trial_days'; discountValue: number; expiresAt?: string; maxUses?: number; active: boolean; applicableProductIds: string[] }`.
- Fields:
  - Code: `TextField` — auto-uppercased on change. Disabled in edit mode.
  - Discount Type: MUI `Select` with three options.
  - Discount Value: `TextField` type number. Label changes contextually: "Percentage (%)" / "Amount (cents)" / "Trial Days".
  - Expires At: `TextField` type `datetime-local`. Optional.
  - Max Uses: `TextField` type number. Optional. Placeholder "Unlimited".
  - Active: `Switch`.
- Save button disabled if `code` or `discountValue` is empty/zero.
- `onSave` called with form data; dialog does not close itself — caller controls `open`.

Acceptance Criteria:
- AC-4.7.1: Entering a lowercase code (e.g. "save20") in the Code field results in it being stored as "SAVE20" when `onSave` is called.
- AC-4.7.2: When `discountType` is `'percentage'`, the Discount Value label reads "Percentage (%)" and the `onSave` data includes `discountType: 'percentage'`.
- AC-4.7.3: The Save button is disabled when `discountValue` is 0 or the code field is empty.
- AC-4.7.4: In `mode: 'edit'`, the Code text field is disabled (code cannot be renamed).

---

## 5. Acceptance Criteria Summary

The following are the behavioral invariants that must hold across the entire system at completion:

**Product Creation:**
- A product cannot be created without `logoUrl`. All creation paths (API direct, admin UI) enforce this.

**Product Public Exposure:**
- `GET /api/products/public` exposes `logoUrl`, `pricing.monthlyPriceCents`, `pricing.currency`, and `githubRepo` for live products. Internal Square IDs and promo arrays are never exposed publicly.

**Square Pricing Flow:**
- Admin sets `pricing.monthlyPriceCents` via PATCH. Admin clicks "Sync to Square". Square catalog item is created/updated. Product document stores Square IDs. Customer can then initiate Square checkout at `POST /api/square/checkout`.

**Promo Code Lifecycle:**
- Admin creates promo via `POST /api/promo-codes`. Customer validates via `POST /api/promo-codes/validate` (read-only, no side effects). Customer applies promo at `POST /api/square/checkout`. `usedCount` increments atomically only after a successful Square checkout link is generated.

**Promo Exhaustion:**
- A promo with `maxUses: 1` and `usedCount: 1` cannot be validated — `validate` returns `valid: false` and checkout returns 400.

**Square Webhook Safety:**
- All Square webhook requests are signature-verified before processing. Unrecognized event types return 200 silently.

**Authentication:**
- All write operations on products, pricing, and promo codes require admin JWT. The Square checkout and promo validate endpoints are public. The product-logo upload endpoint requires admin JWT.

---

## 6. Environment Variables Required

The following environment variables must be added to the deployment environment and to `.env.local` for development:

| Variable | Description |
|---|---|
| `SQUARE_ACCESS_TOKEN` | Square API access token (sandbox or production) |
| `SQUARE_ENVIRONMENT` | `'sandbox'` or `'production'` |
| `SQUARE_WEBHOOK_SIGNATURE_KEY` | HMAC key from Square webhook configuration |
| `SQUARE_WEBHOOK_NOTIFICATION_URL` | The full public URL of `POST /api/webhooks/square` (used for signature verification) |

The following already-existing variables are reused by the logo upload endpoint:

| Variable | Already Used By |
|---|---|
| `BLOG_IMAGE_S3_BUCKET` | `docs/pages/api/upload/blog-image.ts` |
| `AWS_REGION` | `docs/pages/api/upload/blog-image.ts` |
| `BLOG_IMAGE_CDN_URL` | `docs/pages/api/upload/blog-image.ts` |

---

## 7. File Map

### New Files

| File Path | Purpose |
|---|---|
| `docs/pages/api/upload/product-logo.ts` | Admin-only logo upload to S3 |
| `docs/pages/api/products/[id]/pricing/sync.ts` | Square catalog sync per product |
| `docs/pages/api/square/checkout.ts` | Square checkout link generation |
| `docs/pages/api/webhooks/square.ts` | Square webhook event handler |
| `docs/pages/api/promo-codes/index.ts` | Promo code list + create |
| `docs/pages/api/promo-codes/[code].ts` | Promo code get + update + delete |
| `docs/pages/api/promo-codes/validate.ts` | Public promo code validation |
| `docs/src/modules/square/squareClient.ts` | Square SDK singleton and helpers |
| `docs/src/modules/promo/promoStore.ts` | Promo code business logic |
| `docs/src/modules/db/migrations/001-product-new-fields-indexes.ts` | One-time index migration |
| `docs/src/modules/components/LogoUpload.tsx` | Reusable logo upload UI component |
| `docs/src/modules/components/PromoCodeDialog.tsx` | Promo code create/edit dialog |

### Modified Files

| File Path | Change Summary |
|---|---|
| `docs/pages/api/products/index.ts` | Require `logoUrl`; persist new fields on create |
| `docs/pages/api/products/[id].ts` | Handle `logoUrl`, `githubRepo`, `pricing` in PATCH |
| `docs/pages/api/products/public.ts` | Expand projection to include new public fields |
| `docs/src/modules/components/ProductsPage.tsx` | Add logo upload and GitHub repo to create dialog |
| `docs/src/modules/components/ProductCard.tsx` | Render logo thumbnail in card header |
| `docs/src/modules/components/ProductDetailPage.tsx` | Add Identity, Pricing, and Promo Codes sections |
