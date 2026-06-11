# Stoked UI — User Flow Classification

> **Generated:** 2026-05-21 (upgrade 0.3.0 → 0.4.0) | **Refreshed:** 2026-06-06 (timed refresh — re-verified API/route topology end-to-end; added §1.6 consulting service-line discovery, cited the `useAllProducts()` → `GET /api/products/public` data source for the product menu/index grid) | **Meta version:** 0.4.0
> **Repository:** `@stoked-ui/sui`
> **Root:** `/opt/worktrees/stoked-ui/stoked-ui-main`

A "flow" here = an end-to-end user journey that crosses one or more views (`SC_VIEWS.md`) and one or more product surfaces (`SC_PRODUCT_STOKED_UI_SUI.md`). Flows are derived from Next.js page routes (`docs/pages/**`), API routes (`docs/pages/api/**` + `packages/sui-media-api/src/**`), Lambda handlers (`api/**`), docs modules (`docs/src/modules/**`, e.g. `auditBot`), package components (`packages/*/src/**`), and the Rust CLI (`packages/sui-video-renderer/cli/src/main.rs`).

All flows reference the single product doc in this repo:
**Products:** `SC_PRODUCT_STOKED_UI_SUI.md` — `@stoked-ui/sui`.

Flows are grouped by domain:

1. Marketing & content discovery
2. Account & authentication
3. Commerce & licensing
4. Editor & timeline (component product flows)
5. File explorer & media flows
6. CDN admin
7. Consulting / business operations (admin)
8. Blog publishing
9. Customer feedback & lead capture (incl. consulting audit bot)
10. GitHub widgets / activity
11. Developer & contributor flows
12. CLI / native tooling
13. Webhooks & system events

---

## 1. Marketing & Content Discovery

### 1.1 Visit Home & Pick a Product

- **Actor:** Anonymous visitor
- **Goal:** Land on the marketing site, sample one of the live component demos, navigate to a product
- **Entry points:** Direct URL (`/`), referral, search engine, Discord/social link
- **Steps:**
  1. Browser hits `docs/pages/index.tsx`.
  2. Site-wide chrome (header/banner/footer) renders via §1.1 *Home Page* of `SC_VIEWS.md`.
  3. `RandomHome` (`docs/src/components/home/RandomHome.tsx`) randomly mounts one of `HeroEditor` / `HeroTimeline` / `HeroFileExplorer` / `HeroFlux` / `HeroStokedUi` / rusty-editor demo (intersection-observer gated).
  4. User clicks a product card (or the header product menu, populated by `useAllProducts()` in `docs/src/products.tsx` → `GET /api/products/public`) → routes to a §2 showcase or §3 docs MDX shell.
  5. Optional: `NewsletterToast` opens; user submits email → `POST api/subscribe` (Lambda `api/subscribe.ts`).
- **Views:** §1.1 Home, §2 Product Showcase pages (`HeroEditor`, `HeroTimeline`, `HeroFileExplorer`, `HeroFlux`, `HeroStokedUi`, `HeroGithub`), §8 Embedded Showcase / Hero Components
- **Products:** SC_PRODUCT_STOKED_UI_SUI.md

### 1.2 Browse Public Product Detail

- **Actor:** Anonymous visitor
- **Goal:** Read marketing detail for a single product (Editor / Timeline / FileExplorer / Media / GitHub / Flux)
- **Entry points:** `/products`, `/products/[slug]` link, header product menu
- **Steps:**
  1. `docs/pages/products/index.tsx` renders the product index card grid from `useAllProducts()` (`docs/src/products.tsx` → `GET /api/products/public`, `docs/pages/api/products/public.ts`, live products only, `stoked-ui` excluded).
  2. User clicks a product → `docs/pages/products/[product-slug].tsx` resolves the slug and calls `GET /api/products/public/[slug]` (`docs/pages/api/products/public/[slug].ts`).
  3. `PublicProductDetailPage` renders hero + features + doc list + CTA.
  4. CTA either deep-links into §3 product MDX docs, the §2 hero showcase, or §3.1 Pricing.
- **Views:** §1.2 Products Index, §1.3 Public Product Detail, §2 Showcase
- **Products:** SC_PRODUCT_STOKED_UI_SUI.md
- **Note:** Some products use a bespoke marketing page instead of the generic `PublicProductDetailPage`: **Stokd Cloud** renders `StokdCloudProductPage` → `StokdCloudPitch` (`docs/src/modules/products/StokdCloudProductPage.tsx`, `StokdCloudPitch.tsx`, copy in `stokdCloudContent.ts`) at both `/products/stokd-cloud` (`docs/pages/products/stokd-cloud/index.js`) and `/consulting/products/stokd-cloud` (`docs/pages/consulting/products/stokd-cloud.tsx`); **Mac Mixer** uses `MacMixerProductPage` (SC_VIEWS §20). These pages skip the `GET /api/products/public/[slug]` fetch and render static module content.

### 1.3 Read Product Documentation

- **Actor:** Developer / evaluator
- **Goal:** Read MDX docs for a `@stoked-ui/*` package, run live `Demo` examples, copy code
- **Entry points:** `/timeline/docs/...`, `/editor/docs/...`, `/file-explorer/docs/...`, `/media/docs/...`, `/github/docs/...`
- **Steps:**
  1. Per-product docs route (e.g., `docs/pages/timeline/docs/getting-started/installation.tsx`) renders `AppLayoutDocs`.
  2. `AppNavDrawer` lists sibling pages; `AppTableOfContents` mirrors headings.
  3. `MarkdownDocs` (`docs/src/modules/components/MarkdownDocs.js`) hydrates MDX with `<Demo>`, `<HighlightedCode>`, `<CodeSandbox>` / `<StackBlitz>`.
  4. User toggles light/dark, copies a code block (`CodeCopyButton`), opens a sandbox, or launches a CodeSandbox/StackBlitz.
- **Views:** §3 Product Documentation Shell, §15 Docs Package Primitives (`Demo`, `DemoEditor`, `DemoSandbox`, `CodeSandbox`, `StackBlitz`, `HighlightedCode`, `MarkdownElement`)
- **Products:** SC_PRODUCT_STOKED_UI_SUI.md

### 1.4 Read Blog Index → Post

- **Actor:** Anonymous visitor
- **Goal:** Discover and read a blog post
- **Entry points:** `/blog`, header link, post share URL
- **Steps:**
  1. `docs/pages/blog/index.tsx` calls `GET /api/blog/public` (`docs/pages/api/blog/public.ts`) for published-only posts.
  2. `BlogPostList` renders cards (avatar, tags, date); user filters by tag (client-side) or paginates.
  3. User clicks → `docs/pages/blog/[slug].tsx` calls `GET /api/blog/public?slug=...` (or static-prop fetch); `BlogContainer` renders title + authors + MDX body.
- **Views:** §1.8 Blog Index & Post
- **Products:** SC_PRODUCT_STOKED_UI_SUI.md

### 1.5 Subscribe to Newsletter / Confirm Subscription

- **Actor:** Anonymous visitor → confirmed subscriber
- **Goal:** Opt in to the mailing list and confirm via emailed link
- **Entry points:** `NewsletterToast`, `/subscription?code=&email=`
- **Steps:**
  1. User submits email → `POST /api/subscribe` (Lambda handler `api/subscribe.ts`) writes pending record + sends SES confirmation.
  2. Email link opens `docs/pages/subscription.tsx?code=...&email=...`; client calls confirmation endpoint (in `api/subscribe.ts`).
  3. Page renders state per HTTP code (200 verified / 201 already / 401 invalid / 402 system / 404 missing / 500 / no-code instructions).
- **Views:** §1.7 About / Careers / Feedback / Subscription Confirm
- **Products:** SC_PRODUCT_STOKED_UI_SUI.md

### 1.6 Discover Consulting Service Lines

- **Actor:** Anonymous visitor / prospect on the consulting origin
- **Goal:** Land on `consulting.stokd.cloud`, see a service-line pitch, browse practice-area landing pages, and convert into the audit bot (§9.3) or contact
- **Entry points:** Direct URL (`https://consulting.stokd.cloud/`, served by `docs/pages/consulting/index.js`), `/consulting/main`, service cards, header
- **Steps:**
  1. Visitor hits `docs/pages/consulting/index.js`; `WeightedMain` runs a client-side weighted lottery (SSR off) — `ai` 50, `devops` 20, `front-end`/`back-end`/`full-stack` 10 each — and dynamically mounts that service line's `main` page inside the `Home` shell.
  2. Alternatively `/consulting/main.tsx` renders `HeroConsulting` + a `ServiceCard` grid (Greenfield, Tech-Debt Remediation, Platform/Marketplace, DevOps/CI-CD, Full-Stack Modernization, …) and industry cards.
  3. Visitor opens a specific service-line landing page (`/consulting/{ai,back-end,front-end,devops,full-stack}` → `docs/pages/consulting/<service>/main.tsx`): `HeroConsulting`/`GradientText` hero, `ConsultingProofStrip`, stats/steps/opportunity `Section`s, `ServiceCard` grid.
  4. Conversion: the `/consulting/ai` page embeds `AuditBotTrigger` (`variant="hero"`) → opens the audit-bot dialog (§9.3); other pages route to `/company/contact` (static `mailto:`) or `/consulting/login` for engagement.
- **Views:** §4.2 Consulting Home, §21 Consulting Service-Line Pages, §24.1 Audit Bot Trigger, §23 Company / Contact
- **Products:** SC_PRODUCT_STOKED_UI_SUI.md
- **Note:** This is the consulting-origin counterpart to §1.1 (the product-origin home). The same `docs/` Next.js app serves both origins (`siteRouting.ts`); only the audit-bot path (§9.3) is currently transactional — the contact surface (§23) is a static `mailto:` page, not a form submission.

---

## 2. Account & Authentication

### 2.1 Email + Password Sign-Up & Sign-In

- **Actor:** Visitor → authenticated user
- **Goal:** Create an account or sign in to access the consulting portal / admin / settings
- **Entry points:** `/consulting/login`, redirect from any auth-gated page, "Sign in" CTA in `AppHeader`/`UserMenu`
- **Steps:**
  1. `docs/pages/consulting/login.tsx` renders the form (or registration sub-form) and reads any `?redirect=` capture.
  2. Submit hits `POST /api/auth/login` (`docs/pages/api/auth/login.ts`) or `POST /api/auth/register` (`docs/pages/api/auth/register.ts`); server validates against Mongo, signs a JWT.
  3. Client persists token to `localStorage["auth"]` and re-runs `GET /api/auth/session` (`docs/pages/api/auth/session.ts`) to hydrate role.
  4. Role-based redirect: admin → `/consulting/admin`, client/customer → `/consulting/customer`, default → `/consulting/home` (or `?redirect=` value).
- **Views:** §4.1 Consulting Login, §4.2 Consulting Home, §4.3 Customer Dashboard, §5.1 Admin Dashboard, §16 `UserMenu`
- **Products:** SC_PRODUCT_STOKED_UI_SUI.md

### 2.2 Google OAuth Sign-In

- **Actor:** Visitor → authenticated user
- **Goal:** Sign in with Google (no password)
- **Entry points:** `GoogleLogin` button on `/consulting/login`, internal CDN app (`packages-internal/cdn`)
- **Steps:**
  1. User clicks Google button (rendered when `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is present).
  2. `@react-oauth/google` returns an ID token → client posts to `POST /api/auth/google` (`docs/pages/api/auth/google.ts`) which verifies with `google-auth-library`, upserts the user in Mongo, returns a JWT (Lambda equivalent at `api/auth/google.ts`).
  3. Token saved to localStorage; flow joins §2.1 step 3.
- **Views:** §4.1 Consulting Login, §17.1 Internal CDN Browser
- **Products:** SC_PRODUCT_STOKED_UI_SUI.md

### 2.3 Sign Out

- **Actor:** Authenticated user
- **Goal:** Clear session
- **Entry points:** `UserMenu` → "Sign out", session expiry
- **Steps:**
  1. Client calls `POST /api/auth/logout` (`docs/pages/api/auth/logout.ts`) to invalidate server-side state.
  2. Client clears `localStorage["auth"]`, redirects to `/consulting/login`.
- **Views:** §16 `UserMenu`, §4.1 Consulting Login
- **Products:** SC_PRODUCT_STOKED_UI_SUI.md

### 2.4 Authorize CLI / External Tool via API Key

- **Actor:** Authenticated user (via browser) on behalf of a CLI / SDK
- **Goal:** Pair a CLI process with an account, exchange for a long-lived API key
- **Entry points:** CLI prints a URL → user opens `/cli/auth?token=...`
- **Steps:**
  1. CLI requests a transient pairing token from `POST /api/auth/cli/authorize` (`docs/pages/api/auth/cli/authorize.ts`).
  2. CLI opens the browser to `docs/pages/cli/auth.tsx?token=...`; page validates the token (calls `/api/auth/cli/authorize` for status, then `POST /api/auth/exchange` (`docs/pages/api/auth/exchange.ts`) to mint an API key).
  3. Page transitions through *checking → authorizing → success* and shows the user's email; CLI polls until token is consumed.
  4. CLI persists the API key locally; server records it via `docs/pages/api/auth/api-keys/index.ts`.
- **Views:** §1.11 CLI Auth Callback
- **Products:** SC_PRODUCT_STOKED_UI_SUI.md

### 2.5 Manage API Keys

- **Actor:** Authenticated user
- **Goal:** List, create, revoke API keys for CLI / SDK integrations
- **Entry points:** Account settings or admin panel (consumes `/api/auth/api-keys`)
- **Steps:**
  1. `GET /api/auth/api-keys` (`docs/pages/api/auth/api-keys/index.ts`) lists keys.
  2. `POST /api/auth/api-keys` issues a new key (shown once).
  3. `DELETE /api/auth/api-keys/[id]` (`docs/pages/api/auth/api-keys/[id].ts`) revokes a key.
- **Views:** §6.1 Account Settings (key list region)
- **Products:** SC_PRODUCT_STOKED_UI_SUI.md

### 2.6 Admin Impersonation

- **Actor:** Admin user
- **Goal:** Temporarily act as another user for support/debugging
- **Entry points:** Admin user list "Impersonate" action
- **Steps:**
  1. Admin clicks impersonate on a row in `UsersPage`.
  2. `POST /api/auth/impersonate` (`docs/pages/api/auth/impersonate.ts`) returns a scoped token tied to the admin's session.
  3. `localStorage["auth"]` swaps to the scoped token; chrome shows an "impersonating" indicator (where wired).
  4. Restoring uses `POST /api/auth/transfer` (`docs/pages/api/auth/transfer.ts`) to swap back.
- **Views:** §5.4 Users Admin, §16 `UserMenu`
- **Products:** SC_PRODUCT_STOKED_UI_SUI.md

### 2.7 Update Account Settings

- **Actor:** Authenticated user
- **Goal:** Change name / avatar / notification preferences
- **Entry points:** `UserMenu` → "Settings" → `/consulting/settings`
- **Steps:**
  1. `docs/pages/consulting/settings.tsx` mounts `SettingsPage`; initial `GET /api/auth/session` provides the user record.
  2. User edits the form; submit calls `PATCH /api/account/settings` (`docs/pages/api/account/settings.ts`).
  3. Success alert renders; form returns to clean state.
- **Views:** §6.1 Account Settings
- **Products:** SC_PRODUCT_STOKED_UI_SUI.md

---

## 3. Commerce & Licensing

### 3.1 View Pricing & Start Checkout

- **Actor:** Anonymous visitor or authenticated user
- **Goal:** Compare licensing tiers, start checkout for a product
- **Entry points:** `/pricing`, "Buy" CTA on product detail
- **Steps:**
  1. `docs/pages/pricing.tsx` renders `HeroPricing`, `PricingTable`/`PricingList`, `PricingFAQ`.
  2. User toggles community/commercial via `LicensingModelProvider`; available tiers/products are sourced from `GET /api/licenses/products` (`docs/pages/api/licenses/products.ts` → `listLicenseProducts`).
  3. CTA hits `POST /api/licenses/checkout` (`docs/pages/api/licenses/checkout.ts`) which calls Stripe to create a checkout session (returning client secret for embedded checkout).
  4. Browser routes to `/consulting/checkout?product=...&email=...&session=...` (§7.1).
- **Views:** §1.4 Pricing, §7.1 Stripe Embedded Checkout
- **Products:** SC_PRODUCT_STOKED_UI_SUI.md

### 3.2 Complete Stripe Embedded Checkout

- **Actor:** Authenticated or guest checkout user
- **Goal:** Pay for a license via Stripe; receive activation
- **Entry points:** `/consulting/checkout?product=&email=`
- **Steps:**
  1. `docs/pages/consulting/checkout.tsx` validates query params; missing → error state.
  2. Stripe `EmbeddedCheckout` mounts using the client secret from §3.1.
  3. On success, Stripe redirects to `?session_id=...`; page calls `POST /api/licenses/checkout-complete` (`docs/pages/api/licenses/checkout-complete.ts`) to finalize the license (creates `License` doc, links promo if any).
  4. Stripe webhook `POST /api/webhooks/stripe` (`docs/pages/api/webhooks/stripe.ts`) fires asynchronously to reconcile invoice / subscription state.
  5. `CheckoutSuccess` panel renders order recap and next steps; user redirected to `/?checkout=success` or `/consulting/licenses`.
- **Views:** §7.1 Stripe Embedded Checkout, §1.1 Home (checkout-success state), §6.3 Licenses
- **Products:** SC_PRODUCT_STOKED_UI_SUI.md

### 3.3 Activate / Deactivate / Validate License

- **Actor:** Customer (CLI, build tool, or in-app)
- **Goal:** Activate a license on a machine/seat, validate at runtime, deactivate when done
- **Entry points:** SDK init, dashboard buttons, `@stoked-ui/cdn` loader
- **Steps:**
  1. Activation: `POST /api/licenses/activate` (`docs/pages/api/licenses/activate.ts`) records seat.
  2. Validation: `POST /api/licenses/validate` (`docs/pages/api/licenses/validate.ts`) returns valid/invalid + entitlements.
  3. Deactivation: `POST /api/licenses/deactivate` (`docs/pages/api/licenses/deactivate.ts`) frees the seat.
  4. Admin can mint manually via `POST /api/licenses/create` (`docs/pages/api/licenses/create.ts`).
- **Views:** §6.3 Licenses (customer), §5.1/§5.2 Admin views (admin path)
- **Products:** SC_PRODUCT_STOKED_UI_SUI.md

### 3.4 View Licenses & Billing (Self-Service)

- **Actor:** Authenticated user
- **Goal:** See active licenses, invoices, payment methods; open Stripe customer portal
- **Entry points:** `UserMenu` → "Licenses" / "Billing"; `/consulting/licenses`, `/consulting/billing`
- **Steps:**
  1. `LicensesPage` calls `GET /api/account/licenses` (`docs/pages/api/account/licenses.ts`).
  2. `BillingPage` calls `GET /api/account/billing` (`docs/pages/api/account/billing.ts`) for invoices/methods.
  3. "Open billing portal" button calls `POST /api/account/billing/portal` (`docs/pages/api/account/billing/portal.ts`); response URL opens Stripe customer portal in new tab.
- **Views:** §6.2 Billing, §6.3 Licenses, §16 `UserMenu`
- **Products:** SC_PRODUCT_STOKED_UI_SUI.md

### 3.5 Apply / Manage Promo Codes

- **Actor:** Admin or customer (during checkout)
- **Goal:** Issue or redeem a promo code
- **Entry points:** Admin promo-codes admin (consumes `/api/licenses/promo-codes`), Stripe checkout coupon field
- **Steps:**
  1. Admin: `GET/POST /api/licenses/promo-codes` (`docs/pages/api/licenses/promo-codes/index.ts`), `PATCH/DELETE /api/licenses/promo-codes/[id]` (`docs/pages/api/licenses/promo-codes/[id].ts`).
  2. Customer redemption flows through Stripe, then `checkout-complete.ts` records redemption against the license.
  3. Standalone Lambda `api/promos.ts` handles legacy promo entry points.
- **Views:** §5.1 Admin Dashboard, §7.1 Stripe Embedded Checkout
- **Products:** SC_PRODUCT_STOKED_UI_SUI.md

---

## 4. Editor & Timeline (Component Product Flows)

### 4.1 Edit a Project in the Stoked UI Editor

- **Actor:** End user of an app embedding `@stoked-ui/editor` (and the docs `EditorShowcase`)
- **Goal:** Compose tracks, scrub timeline, preview frames, set per-action props, save the project
- **Entry points:** `/products/editor/main` showcase, `EditorShowcase` on home, any host app importing `Editor`
- **Steps:**
  1. Host mounts `Editor` (`packages/sui-editor/src/Editor/Editor.tsx`); `EditorProvider` constructs `EditorEngine`, lazy-imports `@stoked-ui/video-renderer-wasm`.
  2. `EditorView` renders the canvas + shadow-DOM stage; `EditorControls` exposes transport.
  3. User drags media into `EditorFileTabs` (`FileDropzone`); `Timeline` shows tracks.
  4. User selects a track/action → `DetailView` opens; sub-views (`DetailAction`, `DetailTrack`, `DetailProject`, `DetailSettings`) edit props using `Controlled*` form primitives.
  5. User scrubs / plays; `EditorEngine` drives `WasmPreview` to render frames into the canvas.
  6. Save: `EditorEngine` serializes the project (`.sue`) and persists to `LocalDb` (IndexedDB) via `@stoked-ui/common`. Memory note: detail views fall back to DOM `<video>` for duration/width/height because `file.media` proxy doesn't always propagate through React state.
- **Views:** §9 Editor Package views (9.1–9.6), §10 Timeline (root, player, labels, track area), §11 File Explorer (FileDropzone, FileExplorerTabs)
- **Products:** SC_PRODUCT_STOKED_UI_SUI.md

### 4.2 Record a Capture in the Editor

- **Actor:** Editor user
- **Goal:** Record screen / webcam / audio into a track using `MediaRecorder`
- **Entry points:** `EditorControls` "Record" mode button
- **Steps:**
  1. User toggles record mode in `EditorControls` (`record` state).
  2. `EditorEngine` requests media streams; multiple sources are routed through a single `AudioContext` destination (memory note: shared mix avoids per-source duplication).
  3. Recorded blob is written to a new `MediaFile` and inserted into the timeline as a new action.
  4. Stop → engine returns to `paused` state; new track persisted via `LocalDb`.
- **Views:** §9.1 Editor (record state), §9.3 EditorControls, §10.1 Timeline
- **Products:** SC_PRODUCT_STOKED_UI_SUI.md

### 4.3 Render & Save Versions

- **Actor:** Editor user
- **Goal:** Save snapshot versions of a project; switch between them
- **Entry points:** `EditorScreener` version dropdown, `IDB.saveVideo`
- **Steps:**
  1. User selects "save version" → `EditorEngine` writes a new entry to `LocalDb`'s versions store. Memory note: the version entry is created if missing.
  2. `EditorScreener` lists versions; selection swaps the current `EditorFile`.
  3. Optional: Render to MP4 via WASM (in-browser) or upload to media API for server render (§5.x).
- **Views:** §9.6 EditorScreener, §9.1 Editor
- **Products:** SC_PRODUCT_STOKED_UI_SUI.md

### 4.4 Drive a Standalone Timeline

- **Actor:** End user of an app embedding `@stoked-ui/timeline`
- **Goal:** Scrub, zoom, edit tracks/actions in a timeline outside the editor
- **Entry points:** `/products/timeline/main`, `TimelineShowcase`, MDX `<Demo>` blocks in timeline docs
- **Steps:**
  1. Host mounts `Timeline` (`packages/sui-timeline/src/Timeline/Timeline.tsx`) with a `TimelineProvider`.
  2. User interacts with `TimelineLabels` (mute/solo/lock), `TimelineTrackArea` (drag/resize actions), `TimelineCursor` (scrub), `TimelineScrollResizer` (zoom).
  3. `TimelinePlayer` controls transport (rate, skip, time display).
- **Views:** §10 Timeline Package views (10.1–10.6)
- **Products:** SC_PRODUCT_STOKED_UI_SUI.md

---

## 5. File Explorer & Media Flows

### 5.1 Browse / Manipulate Files in `FileExplorer`

- **Actor:** End user
- **Goal:** Navigate a file tree, multi-select, drag-and-drop
- **Entry points:** Hosted `FileExplorer`, `FileExplorerShowcase`, MDX demos, `EditorFileTabs`
- **Steps:**
  1. Host mounts `FileExplorer`/`FileExplorerBasic` with a tree data source.
  2. User expands/collapses nodes, multi-selects, drags items (uses `@atlaskit/pragmatic-drag-and-drop`).
  3. Optional grid view via `useFileExplorerGrid` plugin (sortable headers).
  4. `FileDropzone` accepts external file drops.
- **Views:** §11 File Explorer Package views (11.1–11.5)
- **Products:** SC_PRODUCT_STOKED_UI_SUI.md

### 5.2 Watch / Browse Media in `MediaGallery` + `MediaViewer`

- **Actor:** End user of media-driven host app
- **Goal:** Browse a gallery of media, open the viewer, play
- **Entry points:** `/products/media/main`, `AdvancedShowcase`, host-app gallery surface
- **Steps:**
  1. Host mounts `MediaGallery` (`packages/sui-media/src/components/MediaGallery/MediaGallery.tsx`) with media collection.
  2. User clicks a `MediaCard`; `MediaViewer` opens.
  3. `MediaViewer` mounts `Stage` + appropriate `players/<video|audio>` element; `QualitySelector` / `NextUpHeader` handle adjacency.
  4. Close → returns to gallery.
- **Views:** §12 Media Package views (12.1–12.5)
- **Products:** SC_PRODUCT_STOKED_UI_SUI.md

### 5.3 Upload Media to Server (Media API)

- **Actor:** Authenticated user (host app)
- **Goal:** Upload a media file, receive metadata + thumbnails
- **Entry points:** Host upload UI calling `@stoked-ui/media-api`
- **Steps:**
  1. Client requests an upload session via NestJS `uploads` controller (`packages/sui-media-api/src/uploads`).
  2. Client streams parts to S3 (multipart) using returned presigned URLs.
  3. On completion, NestJS `media` controllers run Sharp + fluent-ffmpeg metadata extraction and persist to Mongo.
  4. Response includes media id, thumbnail URLs, dimensions.
  5. Locally hosted: API runs via `pnpm --filter @stoked-ui/media-api dev`. In production: Lambda via `lambda.ts`.
- **Views:** §19.1 Swagger UI (Media API) for inspection; consumer UIs are host-defined
- **Products:** SC_PRODUCT_STOKED_UI_SUI.md

### 5.4 Extract Video Metadata Locally

- **Actor:** Editor / host using `@stoked-ui/media`
- **Goal:** Compute width / height / duration / thumbnails entirely client-side
- **Entry points:** `extractVideoMetadata` invocation in `EditorEngine`/host
- **Steps:**
  1. `extractVideoMetadata` (`packages/sui-media/src/...`) creates a `ScreenshotStore` (IndexedDB).
  2. Frames captured via `<video>` + canvas; persisted with `LocalDb`.
  3. Memory note: store guards on `count > 0` to avoid blocking on empty store.
- **Views:** §9 Editor (uses metadata), §12 Media Stage
- **Products:** SC_PRODUCT_STOKED_UI_SUI.md

---

## 6. CDN Admin

### 6.1 Browse / Upload via `CdnBrowser`

- **Actor:** Authenticated user (admin or operator)
- **Goal:** Manage S3-backed CDN buckets — browse, upload, rename, delete, set permissions, export listings
- **Entry points:** Internal Vite app `/cdn` (`packages-internal/cdn`), `cdn-sui` wrapper, embedded `CdnBrowser`
- **Steps:**
  1. App mounts `CdnBrowser` (`packages/sui-cdn/src/CdnBrowser/CdnBrowser.tsx`).
  2. Auth check via `GET /api/auth/session` (Google login if missing).
  3. Listing: `GET /api/cdn/contents?prefix=...` (`docs/pages/api/cdn/contents.ts`); folders via `GET /api/cdn/folders` (`docs/pages/api/cdn/folders.ts`); user toggles list/gallery view.
  4. Upload: `POST /api/cdn/upload/initiate` (`docs/pages/api/cdn/upload/initiate.ts`) → `GET /api/cdn/upload/[sessionId]/urls` (`docs/pages/api/cdn/upload/[sessionId]/urls.ts`) → client `PUT`s parts to S3 → `POST /api/cdn/upload/[sessionId]/complete` (`docs/pages/api/cdn/upload/[sessionId]/complete.ts`). Active sessions visible via `/api/cdn/upload/active.ts`.
  5. Move/rename: `POST /api/cdn/move` (`docs/pages/api/cdn/move.ts`).
  6. Delete: `POST /api/cdn/delete` (`docs/pages/api/cdn/delete.ts`).
  7. Permissions: `GET/POST /api/cdn/permissions` (`docs/pages/api/cdn/permissions.ts`).
  8. Export listing: `GET /api/cdn/export` (`docs/pages/api/cdn/export.ts`).
  9. Public path resolution at runtime via `/api/cdn/path/[format]/[[...prefix]].ts`.
- **Views:** §13 CDN Package View (`CdnBrowser`), §17.1 Internal CDN Browser, §17.2 CDN Sui Wrapper
- **Products:** SC_PRODUCT_STOKED_UI_SUI.md

### 6.2 Resume / Abort Multipart Upload

- **Actor:** Operator
- **Goal:** Resume a partially uploaded file or abort it
- **Entry points:** `CdnBrowser` upload list (active sessions)
- **Steps:**
  1. `GET /api/cdn/upload/[sessionId]/status` (`docs/pages/api/cdn/upload/[sessionId]/status.ts`) returns part progress.
  2. Client uploads missing `PUT /api/cdn/upload/[sessionId]/part/[partNumber]` (`docs/pages/api/cdn/upload/[sessionId]/part/[partNumber].ts`).
  3. Or `POST /api/cdn/upload/[sessionId]/abort` (`docs/pages/api/cdn/upload/[sessionId]/abort.ts`) cancels.
- **Views:** §13 CdnBrowser (Upload list region), §17.1 Internal CDN Browser
- **Products:** SC_PRODUCT_STOKED_UI_SUI.md

---

## 7. Consulting / Business Operations (Admin)

### 7.1 Manage Products (Admin)

- **Actor:** Admin
- **Goal:** Create / edit product records, page lists, public privacy/terms
- **Entry points:** `/admin/products`, `/admin/products/[product-slug]`
- **Steps:**
  1. List: `ProductsPage` calls `GET /api/products` (`docs/pages/api/products/index.ts`).
  2. Create: dialog → `POST /api/products`.
  3. Detail: `ProductDetailPage` reads `GET /api/products/[id]` (`docs/pages/api/products/[id].ts`); pages list `GET/POST /api/products/[id]/pages` (`docs/pages/api/products/[id]/pages/index.ts`); per-page `PATCH/DELETE /api/products/[id]/pages/[pageId]`.
  4. Save → `PUT /api/products/[id]`.
  5. Public copy: `GET /api/products/public/[slug]/privacy` & `/terms` for marketing site rendering.
- **Views:** §5.2 Products Admin, §1.3 Public Product Detail
- **Products:** SC_PRODUCT_STOKED_UI_SUI.md

### 7.2 Manage Clients & Deliverables

- **Actor:** Admin
- **Goal:** Maintain consulting-client records, attach deliverables, link invoices and client users
- **Entry points:** `/consulting/clients`, `/consulting/clients/[client-slug]`
- **Steps:**
  1. List: `ClientsPage` → `GET /api/clients` (`docs/pages/api/clients/index.ts`).
  2. Create / edit: dialog → `POST/PUT /api/clients/[id]` (`docs/pages/api/clients/[id].ts`).
  3. Detail: `ClientDetailPage` shows deliverables (`GET/POST/PATCH/DELETE /api/deliverables/...`), invoices summary (`GET /api/invoices?clientId=...`), client users (under `/api/users`).
  4. Add deliverable: `POST /api/deliverables` (`docs/pages/api/deliverables/index.ts`); upload files via `POST /api/deliverables/upload-file` (`docs/pages/api/deliverables/upload-file.ts`).
  5. Render UX/HTML deliverable: `POST /api/deliverables/render` (`docs/pages/api/deliverables/render.ts`).
- **Views:** §5.3 Clients Admin
- **Products:** SC_PRODUCT_STOKED_UI_SUI.md

### 7.3 Open / Share Deliverable

- **Actor:** Client (with token) or admin
- **Goal:** Open a deliverable (download / link / ux / html)
- **Entry points:** `/consulting/deliverables/[id]`
- **Steps:**
  1. `DeliverableViewerPage` validates session; unauthenticated → redirect with `?redirect=`.
  2. `GET /api/deliverables/[id]` (`docs/pages/api/deliverables/[id].ts`) returns metadata + signed-content URL.
  3. UX/HTML deliverables proxy through `/api/deliverables/proxy/[...path]` (`docs/pages/api/deliverables/proxy/[...path].ts`) to keep auth/permissions enforced.
- **Views:** §5.6 Deliverable Viewer
- **Products:** SC_PRODUCT_STOKED_UI_SUI.md

### 7.4 Manage Users (Admin)

- **Actor:** Admin
- **Goal:** Create / edit / deactivate users, change roles, manage agents/aliases
- **Entry points:** `/consulting/users`
- **Steps:**
  1. `UsersPage` → `GET /api/users` (`docs/pages/api/users/index.ts`).
  2. Edit / create dialog → `POST/PUT /api/users/[id]` (`docs/pages/api/users/[id].ts`).
  3. Delete via `DELETE /api/users/[id]`.
- **Views:** §5.4 Users Admin
- **Products:** SC_PRODUCT_STOKED_UI_SUI.md

### 7.5 Invoicing

- **Actor:** Admin
- **Goal:** Browse / draft / send / mark-paid invoices
- **Entry points:** `/consulting/invoices`, `/consulting/invoices/[id]`
- **Steps:**
  1. List: `InvoiceListPage` → `GET /api/invoices` (`docs/pages/api/invoices/index.ts`); filterable by `?clientId=`.
  2. `GET /api/invoices/has-invoices` (`docs/pages/api/invoices/has-invoices.ts`) gates client-side state.
  3. Detail: `InvoiceDetailPage` → `GET /api/invoices/[id]` (`docs/pages/api/invoices/[id].ts`); status transitions (draft → sent → paid) via `PUT /api/invoices/[id]`.
- **Views:** §5.5 Invoices Admin
- **Products:** SC_PRODUCT_STOKED_UI_SUI.md

### 7.6 Customer Dashboard / Groupies / Partner Portal

- **Actor:** Customer / subscriber / partner
- **Goal:** Self-service home for non-admin authenticated users
- **Entry points:** `/consulting/home`, `/consulting/customer`, `/consulting/groupies`, `/consulting/partners/[partnerName]`
- **Steps:**
  1. `auth.session` decides the destination after login.
  2. Customer dashboard cards link to §3.4 Licenses / Billing, §6.1 Settings, §7.x products.
  3. Partner-portal currently renders a "coming soon" stub.
- **Views:** §4.2 Consulting Home, §4.3 Customer Dashboard, §4.4 Groupies, §4.5 Partner Portal
- **Products:** SC_PRODUCT_STOKED_UI_SUI.md

### 7.7 Browse Docs Business API (Swagger)

- **Actor:** Admin / engineer
- **Goal:** Explore + try docs business APIs
- **Entry points:** `/consulting/api-docs`
- **Steps:**
  1. Page loads Swagger UI Bundle from `unpkg.com/swagger-ui-dist@5.11.0`.
  2. Spec fetched from `GET /api/openapi` (`docs/pages/api/openapi.ts`); generated by `getDocsApiOpenApiSpec()`.
  3. Bearer token from `localStorage["auth"]` injected via `requestInterceptor` for try-it calls.
- **Views:** §7.2 Swagger UI (Docs Business API)
- **Products:** SC_PRODUCT_STOKED_UI_SUI.md

---

## 8. Blog Publishing

### 8.1 Author / Publish Blog Post

- **Actor:** Admin / blog author
- **Goal:** Draft, edit, publish, unpublish, and revalidate a blog post
- **Entry points:** `/blog/editor`, `/blog/editor/new`, `/blog/editor/[slug]`
- **Steps:**
  1. List: `BlogPostList` (admin variant) → `GET /api/blog` (`docs/pages/api/blog/index.ts`); tags/authors via `/api/blog/tags.ts`, `/api/blog/authors.ts`.
  2. New / edit: `BlogEditorForm` + `BlogMarkdownEditor` save via `POST /api/blog` or `PUT /api/blog/[slug]` (`docs/pages/api/blog/[slug].ts`).
  3. Image upload: `POST /api/upload/blog-image` (`docs/pages/api/upload/blog-image.ts`).
  4. Publish: `POST /api/blog/[slug]/publish` (`docs/pages/api/blog/[slug]/publish.ts`); unpublish via sibling `unpublish.ts`.
  5. Trigger ISR refresh: `POST /api/blog/revalidate` (`docs/pages/api/blog/revalidate.ts`).
- **Views:** §5.7 Blog Admin, §1.8 Blog Index & Post
- **Products:** SC_PRODUCT_STOKED_UI_SUI.md

---

## 9. Customer Feedback & Lead Capture

### 9.1 Submit Product Feedback

- **Actor:** Authenticated user (or anonymous after email verification)
- **Goal:** Send rating + free-form feedback for a product
- **Entry points:** `/products/feedback`
- **Steps:**
  1. Anonymous: user submits email → `POST /api/products/feedback/register` (`docs/pages/api/products/feedback/register.ts`) → SES verification email.
  2. User opens link → `POST /api/products/feedback/verify` (`docs/pages/api/products/feedback/verify.ts`) consumes token.
  3. Authenticated form: rating + textarea → `POST /api/products/feedback` (`docs/pages/api/products/feedback/index.ts`); page transitions to *submitted* state.
- **Views:** §1.7 About / Careers / Feedback / Subscription Confirm
- **Products:** SC_PRODUCT_STOKED_UI_SUI.md

### 9.2 Chat / Direct Messaging

- **Actor:** Authenticated user
- **Goal:** Send a direct chat message tied to a session
- **Entry points:** Embedded `WebUserDirectChat` (`@stoked-ui/media`)
- **Steps:**
  1. Client opens / creates session via `GET/POST /api/chat/session/[sessionId]` (`docs/pages/api/chat/session/[sessionId].ts`).
  2. Send: `POST /api/chat/send` (`docs/pages/api/chat/send.ts`); composer state transitions through *typing → sent*.
- **Views:** §12.4 WebUserDirectChat
- **Products:** SC_PRODUCT_STOKED_UI_SUI.md

### 9.3 Run a Consulting Audit Bot Conversation (Lead Generation)

- **Actor:** Anonymous visitor / prospect on the consulting site
- **Goal:** Get a free, LLM-driven, structured 1-page audit (AI readiness) and optionally hand over contact info so Brian follows up
- **Entry points:** `AuditBotTrigger` on `/consulting/ai` (`docs/pages/consulting/ai/main.tsx`) — `hero` / `card` / `inline` variants open the `AuditBot` dialog with `playbook="ai-readiness"`
- **Steps:**
  1. Visitor opens the dialog via `AuditBotTrigger` (`docs/src/modules/auditBot/channels/web/components/AuditBotTrigger.tsx`); `AuditBot` (`.../AuditBot.tsx`) seeds a per-playbook opening assistant message.
  2. Each visitor message POSTs `{ sessionId, playbook, history, message }` to `POST /api/audit/turn` (`docs/pages/api/audit/turn.ts`).
  3. Server `runTurn` (`docs/src/modules/auditBot/conversationRunner.ts`) calls the LM Studio / Qwen endpoint (`llmClient.ts`, model `AUDIT_MODEL`) with the playbook system prompt (`playbooks/server.ts`) and `AUDIT_TOOLS` (`tools.ts`), looping over tool calls server-side so the UI only sees clean assistant text.
  4. Tool `fetch_company_site` scrapes the visitor's company URL — SSRF-guarded via `urlSafety.ts` (blocks private/reserved IPs, validates redirects hop-by-hop) — to ground the audit.
  5. Tool `generate_report` emits the structured `AuditReport`; the runner first passes the untrusted model args through `validateReportShape` (`docs/src/modules/auditBot/reportValidation.ts`, called at `conversationRunner.ts:143`) — a malformed payload is rejected and the schema error is fed back as a tool result so the model re-calls `generate_report` with a correct shape (never reaching the UI/mailer). On a valid shape the server stamps `playbook` and returns it in the turn response; UI renders it inline via `AuditReportView` (§24.3).
  6. Tool `save_lead` marks the conversation `finished`; server extracts lead fields (`leadFields.ts`), persists the lead/transcript/report via `auditStore.ts` (Mongo, best-effort), then runs the §13.5 notify + report-email side effects.
  7. Visitor may instead (or also) submit name/email — and optionally "Book a 30-min call" (Calendly) — in the email-capture panel → `POST /api/audit/save-lead` (`docs/pages/api/audit/save-lead.ts`); response `{ ok, emailedReport }` toggles the confirmation copy.
- **Views:** §24.1 Audit Bot Trigger, §24.2 Audit Bot Dialog, §24.3 Audit Report View; hosted on §21 Consulting Service-Line Pages (`/consulting/ai`)
- **Products:** SC_PRODUCT_STOKED_UI_SUI.md
- **Note:** Three playbooks are defined in `docs/src/modules/auditBot/playbooks/index.ts` (`ai-readiness` ~5 min, `cloud-cost` ~6 min, `security` ~6 min); only `ai-readiness` is mounted in the UI today. The persistence/notify/email steps are best-effort — a Mongo/SES/Telegram blip must not fail the turn.

---

## 10. GitHub Widgets / Activity

### 10.1 Render Repo Activity (Calendar / Branch / Commits / Events)

- **Actor:** Visitor on the GitHub showcase, or host app embedding the components
- **Goal:** Show contribution heatmap, branch status, commits, events for a repo
- **Entry points:** `/github`, MDX docs in `docs/pages/github/docs/**`
- **Steps:**
  1. `GithubCalendar` calls `GET /api/github/contributions` (`docs/pages/api/github/contributions.ts`).
  2. `GithubEvents` calls `GET /api/github/events` (`docs/pages/api/github/events.ts`); filter / paginate / select event.
  3. `GithubBranch` calls `GET /api/github/branch` (`docs/pages/api/github/branch.ts`); `PullRequestView` renders for PR events.
  4. `GithubCommit` calls `GET /api/github/commit` (`docs/pages/api/github/commit.ts`).
- **Views:** §14 GitHub Package views (14.1–14.5)
- **Products:** SC_PRODUCT_STOKED_UI_SUI.md

---

## 11. Developer & Contributor Flows

### 11.1 Bootstrap Local Dev Environment

- **Actor:** Contributor
- **Goal:** Run the docs site + watch packages
- **Entry points:** Terminal in repo root
- **Steps:**
  1. `pnpm i` (pnpm 10.5.1+ enforced via `preinstall`).
  2. `pnpm video-renderer:build-wasm` (or `pnpm build:wasm`) to generate `packages/sui-video-renderer/pkg/`.
  3. `pnpm dev` for the Turbo watch graph, or `pnpm docs:dev` for just the Next.js site (port 5199).
  4. Visit `http://localhost:5199`.
- **Views:** §3 Product Documentation Shell, §1.1 Home, all hero showcases
- **Products:** SC_PRODUCT_STOKED_UI_SUI.md

### 11.2 Build & Publish Packages

- **Actor:** Maintainer
- **Goal:** Cut a release of `@stoked-ui/*` packages
- **Entry points:** Terminal in repo root
- **Steps:**
  1. `pnpm build:all` builds packages and the docs app.
  2. `pnpm release:version` bumps versions via Lerna independent mode (npmClient pnpm).
  3. `pnpm publish --recursive` publishes (root `release` script chains `build:all` → `release:version` → `deploy:prod`).
  4. Verdaccio dry-runs available for testing.
- **Views:** Terminal output (no UI)
- **Products:** SC_PRODUCT_STOKED_UI_SUI.md

### 11.3 Deploy to AWS via SST

- **Actor:** Maintainer
- **Goal:** Deploy docs site, CDN, API Gateway + Lambda to `sui.stokd.cloud` / `consulting.stokd.cloud`
- **Entry points:** Terminal in repo root
- **Steps:**
  1. `pnpm deploy:prod` runs `dotenvx run -- sst deploy --stage production` against AWS profile `stokd-cloud` (NOT default — global rule).
  2. `sst.config.ts` → `infra/index.ts` provisions: `createSite`, `createCdnSite`, `createCdnSuiSite`, `createApi` (CloudFront, API Gateway v2, Lambdas, certs).
  3. Lambda handlers `api/auth/google.ts`, `api/subscribe.ts`, `api/sms.ts`, `api/promos.ts` are bundled into the API Gateway.
  4. Media API Lambda: `packages/sui-media-api/src/lambda.ts` packages `@codegenie/serverless-express`.
- **Views:** Terminal output, post-deploy site (§1.1 Home in production)
- **Products:** SC_PRODUCT_STOKED_UI_SUI.md

### 11.4 Run Tests

- **Actor:** Contributor
- **Goal:** Validate changes
- **Entry points:** Terminal
- **Steps:**
  1. Unit: `pnpm test` (`scripts/test.mjs` orchestrator) or scoped scripts (`pnpm editor`, `pnpm timeline`, `pnpm media`, …).
  2. Browser (Karma + Mocha): per-package `karma.conf.js`.
  3. e2e: `pnpm test:e2e-website:dev` (Playwright vs `http://localhost:5199`).
  4. Lint: `pnpm eslint`, `pnpm typescript`.
- **Views:** Terminal output (Mocha/Karma/Playwright reporters)
- **Products:** SC_PRODUCT_STOKED_UI_SUI.md

---

## 12. CLI / Native Tooling

### 12.1 Render `.sue` Project from CLI

- **Actor:** Operator with a `.sue` project file
- **Goal:** Render to MP4 via the native Rust CLI
- **Entry points:** `video-render render --input project.sue --output video.mp4 [options]`
- **Steps:**
  1. CLI parses args (clap) in `packages/sui-video-renderer/cli/src/main.rs`.
  2. `Project::load` parses the `.sue` file (`packages/sui-video-renderer/cli/src/project.rs`).
  3. `RenderCommand` (`packages/sui-video-renderer/cli/src/render.rs`) builds compositor with N tracks, computes M frames over D seconds, distributes work across worker threads.
  4. `encoder.rs` + `ffmpeg.rs` write the encoded video; `audio.rs` mixes audio tracks.
  5. Progress: `indicatif` bar (text mode) or per-frame JSON events (json mode).
  6. Exit status 0 on success; anyhow error on resolution/codec/IO failure.
- **Views:** §18.1 `render` Subcommand
- **Products:** SC_PRODUCT_STOKED_UI_SUI.md

### 12.2 Inspect Project Metadata from CLI

- **Actor:** Operator
- **Goal:** Print width / height / fps / track count
- **Entry points:** `video-render info --input project.sue`
- **Steps:**
  1. `Project::load` parses file.
  2. `project.print_info()` writes summary to stdout.
- **Views:** §18.2 `info` Subcommand
- **Products:** SC_PRODUCT_STOKED_UI_SUI.md

### 12.3 Try Media API in Swagger

- **Actor:** Engineer / integrator
- **Goal:** Explore Media API endpoints and exercise them with a JWT
- **Entry points:** `GET /v1/api/docs` (NestJS, port 3001 locally / `api.sui.stokd.cloud/v1`)
- **Steps:**
  1. `setupSwaggerUI(app)` mounts Swagger UI (`packages/sui-media-api/src/app.ts:86`, `packages/sui-media-api/src/swagger.config.ts`).
  2. User pastes a Bearer JWT into the auth widget.
  3. Try-it sends a request through tag groups: `Health`, `Media`, `Uploads`, `auth`.
- **Views:** §19.1 Swagger UI (Media API)
- **Products:** SC_PRODUCT_STOKED_UI_SUI.md

---

## 13. Webhooks & System Events

### 13.1 Stripe Webhook → License Reconciliation

- **Actor:** Stripe (system)
- **Goal:** Sync subscription / invoice / payment state into Mongo
- **Entry points:** `POST /api/webhooks/stripe` (`docs/pages/api/webhooks/stripe.ts`)
- **Steps:**
  1. Stripe POSTs signed event; handler verifies signature.
  2. Switches on event type (`checkout.session.completed`, `customer.subscription.*`, `invoice.*`) and updates License/Invoice records.
  3. Writes to logs via `/api/logs` (`docs/pages/api/logs.ts`) where applicable.
- **Views:** None (server-only); admin views (§5.5 Invoices Admin) reflect the resulting state
- **Products:** SC_PRODUCT_STOKED_UI_SUI.md

### 13.2 SES Subscribe-Confirm Email

- **Actor:** SES (system) + user
- **Goal:** Verify email addresses (newsletter, feedback registration)
- **Entry points:** Lambda `api/subscribe.ts`; `docs/pages/api/products/feedback/register.ts`
- **Steps:**
  1. Service writes pending record + sends SES email with code link.
  2. User opens link; client posts to confirm endpoint; record marked verified.
- **Views:** §1.7 Subscription Confirm, §1.7 Feedback (verification states)
- **Products:** SC_PRODUCT_STOKED_UI_SUI.md

### 13.3 SMS Notifications (Lambda)

- **Actor:** Internal trigger (e.g., admin tool)
- **Goal:** Send SMS via SNS
- **Entry points:** Lambda `api/sms.ts`
- **Steps:**
  1. Caller invokes Lambda with phone + message payload.
  2. Lambda publishes to SNS via AWS SDK.
- **Views:** None (server-only)
- **Products:** SC_PRODUCT_STOKED_UI_SUI.md

### 13.4 Centralized Logging Endpoint

- **Actor:** Server / client error reporter
- **Goal:** Capture structured logs server-side
- **Entry points:** `POST /api/logs` (`docs/pages/api/logs.ts`)
- **Steps:**
  1. Caller posts structured event; route forwards to logging sink (Mongo / external).
- **Views:** None
- **Products:** SC_PRODUCT_STOKED_UI_SUI.md

### 13.5 Audit Lead Notification & Report Email

- **Actor:** Server (triggered by completion of an audit-bot conversation — §9.3)
- **Goal:** Notify Brian of a completed audit and email the 1-page report to the lead
- **Entry points:** `save_lead` tool fired inside `POST /api/audit/turn`; or `POST /api/audit/save-lead`
- **Steps:**
  1. Lead fields + report persisted to Mongo via `auditStore.ts` (`updateLeadFields`, `saveReport`).
  2. `notifyAuditCompletion` (`docs/src/modules/auditBot/notifyTelegram.ts`) pushes a Telegram message to Brian (with request origin).
  3. If the lead has both an email and a generated report, `sendAuditReportEmail` (`docs/src/modules/auditBot/auditMailer.ts`) emails the report via SES; `tryMarkReportEmailed` guarantees a single send (idempotent guard).
- **Views:** None (server-only); §24.2 Audit Bot Dialog / §24.3 Audit Report View reflect the resulting confirmation state in-dialog
- **Products:** SC_PRODUCT_STOKED_UI_SUI.md
- **Planned (defined, not yet wired):** `promoteAuditToDeliverable` (`docs/src/modules/auditBot/deliverables.ts`) is meant to mirror a completed audit report into the consulting extranet as a `deliverables` doc (`download|link|ux|html`), bridging this flow into §7.2/§7.3. As of this refresh nothing calls it — `grep -rln promoteAuditToDeliverable` returns only its own definition — so the audit→deliverable bridge is dormant, not a live flow.

---

## Cross-Cutting Notes

- **Auth model:** Token in `localStorage["auth"]`. Auth-gated pages call `/api/auth/session` on mount; missing/invalid → redirect to `/consulting/login` with `?redirect=` capture. Bearer tokens are also injected into Swagger UI try-it (`/consulting/api-docs`) and into Media API Swagger separately.
- **Boundary rule:** All non-media business APIs live under `docs/pages/api/**`. `packages/sui-media-api` is reserved for media-component endpoints (see `SC_CONTEXT.md` and `CLAUDE.md`).
- **Local dev port:** 5199 for the Next.js docs app; 3001 for the Media API. Never 3000.
- **WASM dependency:** `EditorEngine` dynamically imports `@stoked-ui/video-renderer-wasm` (file dep on `packages/sui-video-renderer/pkg`); `next.config.mjs` enables `experiments.asyncWebAssembly` and aliases the package. Editor flow §4.x will fall back gracefully if the WASM build is missing.
- **CDN flow duality:** Same `CdnBrowser` runs in `packages-internal/cdn-sui` (workspace) and embedded inside the docs admin via `apiBaseUrl="/api/cdn"`.
- **Audit bot model:** The §9.3 / §13.5 audit bot is unauthenticated (no `localStorage["auth"]`); it runs against a local LM Studio / Qwen OpenAI-compatible endpoint (`AUDIT_MODEL` / base URL via env), with tool execution looped server-side in `conversationRunner.ts`. Mongo persistence, SES report email, and Telegram notification are all best-effort and never block a chat turn.
- **Planned — media pairing & poster auto-detection (NOT yet implemented):** A governed project (`.stokd/projects/media-pairing-poster-detection/prd.md`) plans to let the CDN gallery (§6.1) and `MediaCard`/`MediaGallery` (§5.2) collapse video+image basename pairs, use the image as the video's poster, and expose the image's standalone actions via a thumbnail FAB menu. As of this refresh the implementation does **not** exist — there is no `pairMedia` util and no `posterUrl`/`pairedImage`/`posterObject` props in `packages/sui-cdn` or `packages/sui-media`; the live poster path in `MediaCard.tsx` is still server-thumbnail → first-frame canvas extraction. Treat this as planned work, not a current flow.

---

## Cross-References

- View inventory: `.stokd/meta/SC_VIEWS.md`
- Per-package module docs: `.stokd/meta/packages/<package>/SC_MODULE.md` (one per workspace package: `sui-cdn`, `sui-common`, `sui-common-api`, `sui-docs`, `sui-editor`, `sui-file-explorer`, `sui-github`, `sui-media`, `sui-media-api`, `sui-timeline`, `sui-video-renderer`)
- Codebase overview: `.stokd/meta/SC_OVERVIEW.md`
- Test inventory: `.stokd/meta/SC_TEST.md` (root) + `.stokd/meta/packages/<package>/SC_TEST.md`
- Product doc: `.stokd/meta/SC_PRODUCT_STOKED_UI_SUI.md`
- Recommendations: `.stokd/meta/SC_RECOMMENDATIONS.md`
- Guardrails: `.stokd/meta/SC_CONTEXT.md`, `CLAUDE.md`, `AGENTS.md`
