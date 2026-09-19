# Stoked UI — View Classification

> **Generated:** 2026-05-21 (upgrade 0.3.0 → 0.4.0) | **Refreshed:** 2026-06-06 (timed refresh — verified package/route topology, added §25 template/theme demo & experiment surfaces) | **Updated:** 2026-06-22 (upgrade 0.4.0 → 0.6.0 — re-verified route/package topology against current tree; added §26 `@stoked-ui/stokd` activity-UX components and §16's `CalendarBooking`; refreshed root path) | **Meta version:** 0.6.0
> **Repository:** `@stoked-ui/sui`
> **Root:** `/opt/worktrees/stoked-ui/sui/main`

A "view" here = a top-level rendered surface a user can directly perceive — a Next.js page, a panel/dialog rendered by a workspace package, a marketing showcase block, a CLI terminal output, or an embedded Vite app screen.

All views below reference the single product doc in this repo:
**Products:** `SC_PRODUCT_STOKED_UI_SUI.md` — `@stoked-ui/sui` (covers all `packages/*` and the `docs/` Next.js site).

### Site topology (two public origins)

The single `docs/` Next.js app serves **two** public origins, resolved at request time by `docs/src/modules/utils/siteRouting.ts`:

- **`sui.stokd.cloud`** — the product/component marketing + docs surface (`STOKED_UI_ORIGIN`).
- **`consulting.stokd.cloud`** — the consulting business surface (`STOKED_CONSULTING_ORIGIN`), which also fronts the auth-gated portal/admin.

Many routes are **mirrored** across both origins. The same React view is reused, but the path is namespaced: e.g. Products Admin is reachable at both `/admin/products` and `/consulting/admin/products` (the latter re-exports the former), public product detail at `/products/<slug>` and `/consulting/products/<slug>`, and the consulting variants redirect non-public product ids back into the admin tree. Routing helpers (`toAbsoluteSitePath`, `toConsultingPublicPath`, `isConsultingPublicProductId`, `inferSiteForProductId`) decide which origin owns a given product/page. Where a view is mirrored this is called out inline rather than duplicated as a separate entry.

The view inventory is grouped by surface:

1. Docs site — public marketing pages
2. Docs site — product showcase pages
3. Docs site — product documentation (MDX) shell
4. Docs site — consulting portal (auth-required)
5. Docs site — admin / data-management views
6. Docs site — account / self-service views
7. Docs site — checkout & API-docs surfaces
8. Embedded showcase / hero components
9. Editor package views (`@stoked-ui/editor`)
10. Timeline package views (`@stoked-ui/timeline`)
11. File-explorer package views (`@stoked-ui/file-explorer`)
12. Media package views (`@stoked-ui/media`)
13. CDN package view (`@stoked-ui/cdn`)
14. GitHub package views (`@stoked-ui/github`)
15. Docs package primitives (`@stoked-ui/docs`)
16. Common-package shared chrome (`@stoked-ui/common`)
17. Internal Vite apps (`packages-internal/cdn`, `packages-internal/cdn-sui`)
18. CLI / terminal output (`packages/sui-video-renderer/cli`)
19. NestJS API documentation surface (`sui-media-api`)
20. Standalone product surfaces (Mac Mixer, Focus Capture, Media Selector, Always Listening, Stokd Cloud, Common)
21. Consulting service-line pages (AI, Back-End, Front-End, DevOps, Full-Stack)
22. Video Renderer docs site
23. Company / Contact
24. Consulting Audit Bot — AI/cloud/security audit chat widget (`docs/src/modules/auditBot`)
25. Template / theme demo & experiment surfaces (`premium-themes`, `experiments`, `performance`)
26. Stokd Activity-UX components (`@stoked-ui/stokd`)

---

## 1. Docs Site — Public Marketing Pages

All routes resolve from `docs/pages/`. Shared chrome: `AppHeader` (`docs/src/layouts/AppHeader.tsx`), optional `AppHeaderBanner`, `AppFooter`. Theming via `BrandingCssVarsProvider` (`packages/sui-docs/src/BrandingCssVarsProvider`).

### 1.1 Home Page

- **Products:** SC_PRODUCT_STOKED_UI_SUI.md
- **Location:** `docs/pages/index.tsx` (builds the random hero inline via `dynamic(() => import('./<homeChoice>/main'))`), `docs/src/components/showcase/RandomHome.tsx`, `docs/src/components/showcase/EditorHero.tsx`
- **Regions:**
  | Zone | Component |
  |------|-----------|
  | Banner | `AppHeaderBanner` |
  | Header | `AppHeader` (logo, product menu, search, theme toggle, auth menu) |
  | Hero | random hero (dynamic, SSR-disabled — picks one of the per-product `main` pages: `HeroEditor`, `HeroTimeline`, `HeroFileExplorer`, `HeroFlux`, `HeroStokedUi`, `HeroFocusCapture`, `HeroMediaSelector`, `HeroCore`, `HeroMain`/`HeroEnd`, or the `rusty-editor` `MainView` demo) |
  | Newsletter | `NewsletterToast` (NoSsr) |
  | Footer | `AppFooter` |
- **States:** initial-load (random hero selection), checkout-success (`?checkout=success` query), product-switched, mobile-swipe (`SwipeableViews`)

### 1.2 Products Index

- **Products:** SC_PRODUCT_STOKED_UI_SUI.md
- **Location:** `docs/pages/products/index.tsx`
- **Regions:** AppHeader · grid of product cards (Stoked UI, Editor, Timeline, FileExplorer, Flux, Media, Media API, GitHub, Common, Mac Mixer, Focus Capture, Media Selector, Always Listening, Stokd Cloud) · AppFooter
- **States:** loaded, alpha/beta prerelease badge per card

### 1.3 Public Product Detail (Marketing)

- **Products:** SC_PRODUCT_STOKED_UI_SUI.md (per-product view)
- **Location:** `docs/pages/products/[product-slug].tsx`, `docs/src/modules/components/PublicProductDetailPage.tsx`
- **Regions:** AppHeader · product hero · features list · documentation page list · CTA · AppFooter
- **States:** loading, loaded, not-found, error
- **Mirror (consulting origin):** `docs/pages/consulting/products/[product-slug].tsx` renders the same `PublicProductDetailPage` when `isConsultingPublicProductId(slug)`; non-public ids redirect to `/consulting/admin/products/<slug>`. Per-product legal pages live at `docs/pages/consulting/products/[product-slug]/{privacy,terms}.tsx` → `PublicLegalPage` (see §1.9).

### 1.4 Pricing

- **Products:** SC_PRODUCT_STOKED_UI_SUI.md
- **Location:** `docs/pages/pricing.tsx`, `docs/src/components/pricing/*` (`HeroPricing`, `PricingTable`, `PricingList`, `LicensingModelProvider`, `PricingWhatToExpect`, `PricingFAQ`)
- **Regions:** Banner · Header · Hero · `PricingTable` (desktop) **or** `PricingList` (mobile/tablet) · "What to expect" block · FAQ accordion · Testimonials · Footer
- **States:** desktop vs mobile responsive split, licensing model toggle (community/commercial), accordion expanded/collapsed

### 1.5 Material UI / Base UI / Design Kits / Templates

- **Products:** SC_PRODUCT_STOKED_UI_SUI.md
- **Location:** `docs/pages/material-ui.tsx`, `docs/pages/base-ui.tsx`, `docs/pages/design-kits.tsx`, `docs/pages/templates.tsx`; section components in `docs/src/components/{productMaterial,productBaseUI,productDesignKit,productTemplate}/`
- **Regions:** Hero · Reference logos · Components/Values block · Customization/Theming block · Demo block · FAQ/Testimonials · End CTA
- **States:** scrollable static showcase

### 1.6 Components Index

- **Products:** SC_PRODUCT_STOKED_UI_SUI.md
- **Location:** `docs/pages/components.tsx` (consumes `materialPages` data)
- **Regions:** Header · category-grouped grid of component links · Footer
- **States:** static (loaded)

### 1.7 About / Careers / Feedback / Subscription Confirm

- **Products:** SC_PRODUCT_STOKED_UI_SUI.md
- **Location:** `docs/pages/about.tsx`, `docs/pages/careers.tsx`, `docs/pages/products/feedback.tsx`, `docs/pages/subscription.tsx`
- **Regions:** AppHeader · hero/value/team/role-accordion or feedback form · Footer
- **States:**
  - About/Careers: static, accordion expanded/collapsed (careers)
  - Careers role pages: each open role has its own page `docs/pages/careers/<role>.js` rendering `TopLayoutCareers` with the role's `<role>.md` markdown (e.g. `react-engineer-x`, `design-engineer`, `developer-advocate`, …); static (loaded)
  - Feedback: unauthenticated (signup form), authenticated (rating + textarea), email-verification-pending (code input), submitted/success, error
  - Subscription confirm (`/subscription?code=&email=`): code 200 verified, 201 already-verified, 401 invalid token, 402 system error, 404 email-not-found, 500 error, no-code (instructions)

### 1.8 Blog Index & Post

- **Products:** SC_PRODUCT_STOKED_UI_SUI.md
- **Location:** `docs/pages/blog/index.tsx`, `docs/pages/blog/[slug].tsx`, `docs/src/modules/components/BlogPostList.tsx`
- **Regions:**
  - Index: AppHeader · `BlogPostList` (post cards with avatars, tags, date) · pagination · Footer
  - Post: AppHeader · `BlogContainer` (title, authors, MDX body, divider, back) · Footer
- **States:** loading, loaded, tag-filtered, paginated, empty (index); loading, loaded, not-found (post)

### 1.9 Legal — Privacy / Terms

- **Products:** SC_PRODUCT_STOKED_UI_SUI.md
- **Location:** `docs/pages/legal/privacy.tsx`, `docs/pages/legal/terms.tsx`, `docs/src/modules/components/PublicLegalPage.tsx`
- **Regions:** Header · Back link · static legal copy · Footer
- **States:** static (always loaded)

### 1.10 404

- **Products:** SC_PRODUCT_STOKED_UI_SUI.md
- **Location:** `docs/pages/404.tsx`, `NotFoundHero` component
- **Regions:** Banner · Header · `NotFoundHero` · Footer
- **States:** error (only state)

### 1.11 CLI Auth Callback

- **Products:** SC_PRODUCT_STOKED_UI_SUI.md
- **Location:** `docs/pages/cli/auth.tsx`
- **Regions:** AppHeader · status card · Footer
- **States:** checking (validating token), authorizing (issuing API key), success (CLI authorized, shows email), error (missing params or auth failed)

---

## 2. Docs Site — Product Showcase Pages

Each product owns a `/products/<slug>/` route that renders a near-fullscreen "Hero" component embedding a live demo of the package.

- **Products:** SC_PRODUCT_STOKED_UI_SUI.md (one showcase per package surface)
- **Location pattern:** `docs/pages/products/<slug>/main.tsx`, hero in `docs/src/components/showcase/Hero<Name>.tsx`

| Product | Route | Hero Component | File |
|---------|-------|----------------|------|
| Stoked UI | `/products/stoked-ui/` | `HeroStokedUi` | `docs/src/components/home/HeroStokedUi.tsx` |
| Editor | `/products/editor/` | `HeroEditor` | `docs/src/components/home/HeroEditor.tsx` |
| Timeline | `/products/timeline/` | `HeroTimeline` | `docs/src/components/home/HeroTimeline.tsx` |
| File Explorer | `/products/file-explorer/` | `HeroFileExplorer` | `docs/src/components/home/HeroFileExplorer.tsx` |
| Flux | `/products/flux/` | `HeroFlux` | `docs/src/components/home/HeroFlux.tsx` |
| Media | `/products/media/` | `AdvancedShowcase` / hero | `docs/src/components/home/AdvancedShowcase.tsx` |
| Media API | `/products/media-api/` | `HeroMediaSelector` (reused) | `docs/pages/products/media-api/main.tsx` → `docs/src/components/home/HeroMediaSelector.tsx` |
| GitHub | `/github/` | `HeroGithub` | `docs/src/components/home/HeroGithub.tsx` |
| Focus Capture | `/products/focus-capture/` | `HeroFocusCapture` | `docs/src/components/home/HeroFocusCapture.tsx` |
| Media Selector | `/products/media-selector/` | `HeroMediaSelector` | `docs/src/components/home/HeroMediaSelector.tsx` |
| Common | `/products/common/` | `HeroCore` | `docs/src/components/home/HeroCore.tsx` |

- **Regions:** AppHeader · Hero (live package demo) · feature `Chip` row · divider · AppFooter
- **States:** in-view (intersection observer mounts demo), out-of-view (placeholder box), interactive (user driving the embedded demo)

---

## 3. Docs Site — Product Documentation Shell (MDX)

- **Products:** SC_PRODUCT_STOKED_UI_SUI.md (per-package docs trees)
- **Location:** Per-product `docs/pages/<product>/docs/**/*.tsx` plus shared layout `docs/src/modules/components/AppLayoutDocs.tsx`, sidebar `docs/src/modules/components/AppNavDrawer.tsx`, table-of-contents `docs/src/modules/components/AppTableOfContents.tsx`, MDX renderer `MarkdownDocs` (`docs/src/modules/components/MarkdownDocs.js`)
- **Regions:**
  | Zone | Component |
  |------|-----------|
  | Header | `AppHeader` |
  | Sidebar | `AppNavDrawer` (collapsible nav tree) |
  | Main | `MarkdownDocs` rendering MDX → MDX `Demo` blocks · `<HighlightedCode>` · `<CodeSandbox>` |
  | TOC | `AppTableOfContents` (sticky right rail) |
  | Footer | `AppFooter` |
- **States:** loading, loaded, sidebar-collapsed (mobile drawer), section in-view (TOC active item highlights), demo-expanded/collapsed, code-copied, theme light/dark

Examples of trees: `docs/pages/products/editor/docs/`, `docs/pages/products/timeline/docs/`, `docs/pages/products/file-explorer/docs/`, `docs/pages/products/media/docs/`, `docs/pages/products/media-api/docs/`, `docs/pages/products/common/docs/`, `docs/pages/products/mac-mixer/docs/`, `docs/pages/products/focus-capture/docs/`, `docs/pages/products/media-selector/docs/`, `docs/pages/products/stokd-cloud/docs/`, `docs/pages/products/always-listening/docs/`, `docs/pages/video-renderer/docs/`, `docs/pages/github/docs/`.

---

## 4. Docs Site — Consulting Portal

The consulting portal is auth-gated. Token stored under localStorage `auth`. Unauthenticated visits redirect to `/consulting/login` (with `?redirect=` capture).

### 4.1 Consulting Login

- **Products:** SC_PRODUCT_STOKED_UI_SUI.md
- **Location:** `docs/pages/consulting/login.tsx`
- **Regions:** `BrandingCssVarsProvider` · AppHeader · Email/password form (`TextField` × 2 + submit) · "or" divider · `GoogleLogin` button (when `NEXT_PUBLIC_GOOGLE_CLIENT_ID` set)
- **States:** session-check loading, unauthenticated (form), submitting, error (Alert: invalid credentials, Google failure), authenticated (role-based redirect → admin/customer/client portal)

### 4.2 Consulting Home

- **Products:** SC_PRODUCT_STOKED_UI_SUI.md
- **Location:** `docs/pages/consulting/index.js` (consulting-origin root), `docs/pages/consulting/home.tsx`, `docs/pages/consulting/main.tsx`
- **Regions:** Banner · Header · weighted-random service-line hero (root) **or** random product hero (home) **or** `HeroConsulting` + service cards + industry cards (main) · Footer
- **States:** initial-load, randomized hero
- **Notes:** `consulting/index.js` picks one service-line `main` to render via a weighted lottery — `ai` 50, `devops` 20, `front-end`/`back-end`/`full-stack` 10 each (SSR off, placeholder while loading).

### 4.3 Customer Dashboard

- **Products:** SC_PRODUCT_STOKED_UI_SUI.md
- **Location:** `docs/pages/consulting/customer.tsx`
- **Regions:** Header · "Welcome, {name}" + role chip · stack of 4 `Paper` cards (Licenses, Products, Billing, Settings) · Footer
- **States:** auth-loading (`CircularProgress`), unauthenticated (redirect), authenticated, role-specific badge

### 4.4 Groupies / Newsletter Confirm

- **Products:** SC_PRODUCT_STOKED_UI_SUI.md
- **Location:** `docs/pages/consulting/groupies.tsx`
- **Regions:** Header · welcome card · Blog/Stoked-UI/Premium tile cards · Footer
- **States:** loading, authenticated, unauthenticated (redirect)

### 4.5 Partner Portal Stub

- **Products:** SC_PRODUCT_STOKED_UI_SUI.md
- **Location:** `docs/pages/consulting/partners/[partnerName].tsx`
- **Regions:** Header · partner-name heading · "coming soon" copy · Footer
- **States:** loading, coming-soon (only state)

---

## 5. Docs Site — Admin Views (data management)

All require admin role; check from localStorage `auth` and redirect to `/consulting/login` otherwise. List/detail components are dynamically imported (SSR off) from `docs/src/modules/components/`.

### 5.1 Admin Dashboard

- **Products:** SC_PRODUCT_STOKED_UI_SUI.md
- **Location:** `docs/pages/consulting/admin.tsx`
- **Regions:** Header · Container with 8 nav cards (Clients, Products, Users, Invoices, Licenses, Blog, API Docs, Settings) · Footer
- **States:** auth-loading, authenticated-admin, unauthorized (redirect)

### 5.2 Products Admin (List + Detail)

- **Products:** SC_PRODUCT_STOKED_UI_SUI.md
- **Location:**
  - List: `docs/pages/admin/products/index.tsx` → `docs/src/modules/components/ProductsPage.tsx`
  - Detail: `docs/pages/admin/products/[product-slug].tsx` → `docs/src/modules/components/ProductDetailPage.tsx`
  - **Mirror (consulting origin):** `docs/pages/consulting/admin/products/index.tsx` and `…/[product-slug].tsx` re-export the `/admin/products` views verbatim; `docs/pages/consulting/products/index.tsx` redirects to `/consulting/admin/products`.
- **Regions:** Header · Container · `ProductsPage` (toolbar + product cards/table + create dialog) **or** `ProductDetailPage` (form: id/name/fullName/description/icon/url/live/managed/hideProductFeatures/prerelease/features/promo/privacyPolicy/termsAndConditions) · Footer
- **States:** loading, loaded, empty, create-dialog-open, edit-mode, saving, validation-error, save-success, delete-confirm

### 5.3 Clients Admin (List + Detail)

- **Products:** SC_PRODUCT_STOKED_UI_SUI.md
- **Location:**
  - List: `docs/pages/consulting/clients/index.tsx` → `docs/src/modules/components/ClientsPage.tsx`
  - Detail: `docs/pages/consulting/clients/[client-slug].tsx` → `docs/src/modules/components/ClientDetailPage.tsx`
- **Regions:**
  - List: client cards (name/slug/contactEmail/active/deliverable+invoice counts) · create/edit dialog (formName, contactMode existing|new|legacy, contact fields)
  - Detail: header (title, slug chip, active toggle) · Deliverables list (type, url, version, addedAt; add/edit/delete + delete confirm dialog) · Invoices summary (date, period, totalHours, status chip → detail link) · Client users list (name, email, role, active, delete)
- **States:** loading, error, list populated, list empty, create/edit dialog open, saving, saved, delete-confirm-open, no-deliverables, no-invoices, no-users

### 5.4 Users Admin

- **Products:** SC_PRODUCT_STOKED_UI_SUI.md
- **Location:** `docs/pages/consulting/users/index.tsx` → `docs/src/modules/components/UsersPage.tsx`
- **Regions:** Header · Container with users table (name, email, role admin/client/agent, active, aliases, agentIds, avatarUrl, createdAt, edit/delete actions) · add/edit dialog · Footer
- **States:** loading, loaded, empty, create-mode, edit-mode, saving, error

### 5.5 Invoices Admin (List + Detail)

- **Products:** SC_PRODUCT_STOKED_UI_SUI.md
- **Location:**
  - List: `docs/pages/consulting/invoices/index.tsx` → `docs/src/modules/components/InvoiceListPage.tsx`
  - Detail: `docs/pages/consulting/invoices/[id].tsx` → `docs/src/modules/components/InvoiceDetailPage.tsx`
- **Regions:**
  - List: invoice rows (clientId, invoiceDate, period, totalHours, status chip draft|sent|paid); optional `?clientId=` filter
  - Detail: header (back · status chip) · invoice meta (client, period, totalHours, notes) · weekly breakdown (lineItems = hours + description, weekTotalHours)
- **States:** loading, error, populated, empty, filter-active, status-chip variant per row

### 5.6 Deliverable Viewer

- **Products:** SC_PRODUCT_STOKED_UI_SUI.md
- **Location:** `docs/pages/consulting/deliverables/[id].tsx` → `docs/src/modules/components/DeliverableViewerPage.tsx`
- **Regions:** Full-height (`100dvh`) flex container · viewer surface (loads deliverable by id; types: download/link/ux/html)
- **States:** auth-not-checked (spinner), authenticated (viewer), unauthenticated (redirect with `?redirect=`), invalid-id (null render)
- **Notes:** A completed audit-bot report can be mirrored into this viewer as a client deliverable via `promoteAuditToDeliverable` (`docs/src/modules/auditBot/deliverables.ts`, idempotent on `clientId`/`title`/`type`/`version`); the helper exists but is not yet wired into an API route or UI trigger.

### 5.7 Blog Admin (List + Editor)

- **Products:** SC_PRODUCT_STOKED_UI_SUI.md
- **Location:** `docs/pages/blog/editor.tsx`, `docs/pages/blog/editor/new.tsx`, `docs/pages/blog/editor/[slug].tsx`
- **Regions:** AppHeader · `BlogPostList` (admin variant) · `BlogEditorForm` (title/slug/tags/author/publishDate/content) · `BlogMarkdownEditor`
- **States:** loading, list populated, list empty, create-mode, edit-mode, saving, publishing/unpublishing, delete-confirm, error

---

## 6. Docs Site — Account / Self-Service Views

Auth-required user-facing views (not admin-only).

### 6.1 Account Settings

- **Products:** SC_PRODUCT_STOKED_UI_SUI.md
- **Location:** `docs/pages/consulting/settings.tsx` → `docs/src/modules/account/SettingsPage.tsx`
- **Regions:** Header · form (id read-only, email read-only, name, avatarUrl, notification preferences checkboxes: ownedProductUpdates, otherProductUpdates) · Save button (`SaveIcon`) · alerts · Footer
- **States:** loading, loaded, dirty, saving, saved, error
- **Endpoint:** `PATCH /api/account/settings`

### 6.2 Billing

- **Products:** SC_PRODUCT_STOKED_UI_SUI.md
- **Location:** `docs/pages/consulting/billing.tsx` → `docs/src/modules/account/BillingPage.tsx`
- **Regions:**
  | Zone | Content |
  |------|---------|
  | Summary | customerId, billingEmail, activeSubscriptions, amountDue |
  | Invoices Due | table — id/number/status/desc/due/amount/PDF link |
  | Payment History | similar table keyed on paidAt |
  | Payment Methods | card list — brand, last4, exp, isDefault |
  | Actions | "Open billing portal" → Stripe customer portal |
- **States:** loading, loaded, error, no-invoices, no-payment-methods, opening-portal
- **Endpoints:** `GET /api/account/billing`, `POST /api/account/billing/portal`

### 6.3 Licenses

- **Products:** SC_PRODUCT_STOKED_UI_SUI.md
- **Location:** `docs/pages/consulting/licenses.tsx` → `docs/src/modules/account/LicensesPage.tsx`
- **Regions:** Header · license tiers · usage indicators · renewal · Footer
- **States:** loading, loaded, error

---

## 7. Docs Site — Checkout & API Docs

### 7.1 Stripe Embedded Checkout

- **Products:** SC_PRODUCT_STOKED_UI_SUI.md
- **Location:** `docs/pages/consulting/checkout.tsx` → `StripeEmbeddedCheckout`, `CheckoutSuccess`
- **Regions:** `BrandingCssVarsProvider` · AppHeader · Section · Stripe iframe **or** `CheckoutSuccess` panel · AppFooter
- **States:**
  - missing-params (`product`/`email`) → error message
  - checkout active (Stripe iframe; `returnUrl=/consulting/checkout?product=…&session_id={CHECKOUT_SESSION_ID}`)
  - success (`?session_id=…` present → `CheckoutSuccess` confirmation, order recap, next steps)
  - error

### 7.2 Swagger UI (Docs Business API)

- **Products:** SC_PRODUCT_STOKED_UI_SUI.md
- **Location:** `docs/pages/consulting/api-docs.tsx`; spec from `docs/pages/api/openapi.ts`
- **Regions:** Header · Container · `<div id="swagger-ui">` (Swagger UI Bundle from `unpkg.com/swagger-ui-dist@5.11.0`, BaseLayout, scheme container hidden) · Footer
- **States:** loading (CircularProgress while CSS+JS load), authorized-admin (rendered with Bearer token interceptor), unauthorized (redirect to login), error
- **Notes:** Bearer token from localStorage `auth`; `requestInterceptor` injects `Authorization: Bearer <token>` into every try-it call.

---

## 8. Embedded Showcase / Hero Components

These are not standalone pages but reusable view-blocks reused on the home page, product pages, and inside MDX docs.

- **Products:** SC_PRODUCT_STOKED_UI_SUI.md
- **Location:** `docs/src/components/home/`, `docs/src/components/showcase/`
- **Notable views:**
  - `EditorShowcase` (`docs/src/components/home/EditorShowcase.tsx`) — embedded `Editor` with preset file
  - `EditorBackendProcessingDemo` — `Editor` driving server-side processing
  - `FileExplorerShowcase` / `FileExplorerCard` — embedded `FileExplorer`
  - `TimelineShowcase` / `ThemeTimeline` — embedded `Timeline`
  - `AdvancedShowcase` — Media demo
  - `StokedConsultingShowcase` — agency reel
  - `VideoProcessingProgress` — render-job status panel
  - `ProductsPreviews` + `ProductsSwitcher` — left rail picker + right `Showcase`
- **Regions:** title block · live demo container · supporting copy / CTAs
- **States:** in-view/out-of-view (intersection observer), interactive (demo running), placeholder (pre-mount)

---

## 9. Editor Package Views — `@stoked-ui/editor`

`packages/sui-editor/src/`. Top-level export `Editor`; engine + provider in `EditorEngine.ts`, `EditorProvider.tsx`. WASM preview swapped in via `WasmPreview` (dynamic import of `@stoked-ui/video-renderer-wasm`).

### 9.1 Editor (Root)

- **Products:** SC_PRODUCT_STOKED_UI_SUI.md
- **Location:** `packages/sui-editor/src/Editor/Editor.tsx`
- **Regions:**
  | Zone | Component |
  |------|-----------|
  | viewer | `EditorView` |
  | controls | `EditorControls` |
  | timeline | `Timeline` (from `@stoked-ui/timeline`) |
  | explorer-tabs | `EditorFileTabs` |
  | detail (overlay) | `DetailView` |
- **States:** loading, ready, fullscreen, detail-mode, file-view, minimal, record, no-labels, no-track-controls, no-snap-controls

### 9.2 EditorView (Stage)

- **Location:** `packages/sui-editor/src/EditorView/EditorView.tsx`
- **Regions:** `renderer` Canvas · `screener` `<video>` · shadow-DOM `stage` · hover-revealed `viewControls` overlay
- **States:** idle, hover (controls visible), playing, paused, previewing, error

### 9.3 EditorControls

- **Location:** `packages/sui-editor/src/EditorControls/EditorControls.tsx`
- **Regions:** play/pause/stop · rate dropdown · time display/input · `Volume` · `ViewGroup`/`ViewButton` mode toggle · version selector
- **States:** playing, paused, recording, disabled, loading

### 9.4 DetailView (Inspector Modal)

- **Location:** `packages/sui-editor/src/DetailView/DetailView.tsx`
- **Sub-views:**
  - `DetailCombined` — merged inspector
  - `DetailAction` — action props (`ControlledText`, `ControlledCoordinates`, `ControlledCheckbox`, `ControlledColor`, `ControlledCss`, `ControlledVolumeSpan`, `BlendModeSelect`)
  - `DetailTrack` — track props (name, type, volume, opacity, lock/mute/solo)
  - `DetailProject` — file metadata (name, description, author, version, duration, created, backgroundColor)
  - `DetailSettings` — editor preferences
  - `DetailBreadcrumbs` — selection navigator
- **States:** open/closed, selected-type (action|track|project|settings), editing, dirty, saving, validation-error

### 9.5 EditorFileTabs (Asset Browser)

- **Location:** `packages/sui-editor/src/EditorFileTabs/EditorFileTabs.tsx`
- **Regions:** tab strip · embedded `FileExplorer` · `FileDropzone` · file toolbar
- **States:** active-tab, loading, empty, drag-over, expanded, collapsed

### 9.6 EditorScreener (Version Selector)

- **Location:** `packages/sui-editor/src/EditorScreener/EditorScreener.tsx`
- **Regions:** version dropdown · current-version label
- **States:** loading, versioned, unversioned

---

## 10. Timeline Package Views — `@stoked-ui/timeline`

`packages/sui-timeline/src/`.

### 10.1 Timeline (Root)

- **Products:** SC_PRODUCT_STOKED_UI_SUI.md
- **Location:** `packages/sui-timeline/src/Timeline/Timeline.tsx`
- **Regions:** `TimelineLabels` (track list rail) · `TimelineControls` (transport) · `TimelineTrackArea` (scrollable grid) · `TimelineCursor` (playhead overlay) · `TimelineTime` (ruler) · empty-state notice
- **States:** loaded, empty, playing, paused, drag-active, edit-mode, multi-selected

### 10.2 TimelinePlayer

- **Location:** `packages/sui-timeline/src/TimelinePlayer/TimelinePlayer.tsx`
- **Regions:** play/pause/stop · skip prev/next · rate (0.2×–2.0×) · MM:SS time display · track navigator
- **States:** playing, paused, seeking, loading

### 10.3 TimelineLabels (Track Rail)

- **Location:** `packages/sui-timeline/src/TimelineLabels/`
- **Regions:** `TimelineLabel` rows · `TimelineTrackActions` (mute/solo/delete/rename) · `SnapControls` · `AddTrackButton`
- **States:** selected, locked, muted, solo, hovered, drag-source

### 10.4 TimelineTrackArea

- **Location:** `packages/sui-timeline/src/TimelineTrackArea/`
- **Regions:** `TimelineTrack` rows · `TimelineTrackAreaDragLines` · collapsed view variant
- **States:** expanded, collapsed, drag-active, drop-zone

### 10.5 TimelineTrack & TimelineAction

- **Location:** `packages/sui-timeline/src/TimelineTrack/TimelineTrack.tsx`, `TimelineAction/TimelineAction.tsx`
- **Regions:** label · action blocks (start/duration/preview) · DnD surface
- **States (track):** selected, locked, muted, dragging, resizing, empty
- **States (action):** selected, playing, hovered, dragging, resizing, error

### 10.6 TimelineCursor / TimelineTime / TimelineScrollResizer

- **Location:** `packages/sui-timeline/src/TimelineCursor/`, `TimelineTime/`, `TimelineScrollResizer/`
- **Regions:** vertical playhead line / tick header / horizontal+vertical resize handles
- **States:** playing/paused/seekable, zoomed scale, dragging/idle

---

## 11. File-Explorer Package Views — `@stoked-ui/file-explorer`

`packages/sui-file-explorer/src/`.

### 11.1 FileExplorer / FileExplorerBasic

- **Products:** SC_PRODUCT_STOKED_UI_SUI.md
- **Location:** `packages/sui-file-explorer/src/FileExplorer/FileExplorer.tsx`, `FileExplorerBasic/FileExplorerBasic.tsx`
- **Regions:** tree list (`ul.MuiFileExplorer-root`) · optional grid headers · selection checkbox column
- **States:** expanded, collapsed, multi-select, drag-active, drop-zone, filtered, virtualized

### 11.2 File / FileElement (Tree Item)

- **Location:** `packages/sui-file-explorer/src/File/`, `FileElement/`
- **Regions:** `FileLabel` · `FileIconContainer` · `FileExtras` (context menu/actions) · selection checkbox
- **States:** expanded/collapsed, selected, focused, disabled, locked, hovered, drag-source, drop-target

### 11.3 FileDropzone

- **Location:** `packages/sui-file-explorer/src/FileDropzone/FileDropzone.tsx`
- **Regions:** drop target with drag-over highlight
- **States:** idle, drag-over, uploading, success, error

### 11.4 FileExplorerTabs

- **Location:** `packages/sui-file-explorer/src/FileExplorerTabs/FileExplorerTabs.tsx`
- **Regions:** tabs (Files/Assets/Exports/...) · active tab content (`FileExplorer` or `FileDropzone`)
- **States:** active-tab, loading, empty

### 11.5 Grid View Plugin

- **Location:** `packages/sui-file-explorer/src/internals/plugins/useFileExplorerGrid/`
- **Regions:** `FileExplorerGridHeaders`, `FileExplorerGridColumns`, `FileExplorerGridHeaderCell`
- **States:** sorted, filtered, resizable, sortable, default

---

## 12. Media Package Views — `@stoked-ui/media`

`packages/sui-media/src/components/`.

### 12.1 MediaViewer

- **Products:** SC_PRODUCT_STOKED_UI_SUI.md
- **Location:** `packages/sui-media/src/components/MediaViewer/index.tsx`
- **Regions:** `ViewerDialog` · `MediaViewerHeader` (title/close/queue) · `MediaContainer` · `MediaViewerPrimary` (`<video>`/`<img>`) · `NextUpHeader` · `QualitySelector` · `NowPlayingIndicator`
- **States:** open/closed, fullscreen, theater-mode, normal, loading, playing, paused, error

### 12.2 MediaCard

- **Location:** `packages/sui-media/src/components/MediaCard/MediaCard.tsx`
- **Regions:** poster/thumbnail · `VideoProgressBar` · `ThumbnailStrip` (hover preview frames) · title/metadata · action buttons (play/edit/delete/public-private toggle) · selection checkbox
- **States:** hovered, selected, loading, error, play-on-hover, editing, locked

### 12.3 MediaGallery

- **Location:** `packages/sui-media/src/components/MediaGallery/MediaGallery.tsx`
- **Regions:** masonry grid of `MediaCard` · integrated `MediaViewer` overlay · loader · error alert
- **States:** loading, success, error, empty, item-selected, filtering

### 12.4 WebUserDirectChat

- **Location:** `packages/sui-media/src/components/WebUserDirectChat/WebUserDirectChat.tsx`
- **Regions:** message list · composer · status bar
- **States:** connected, disconnected, typing, message-received

### 12.5 Stage / Players

- **Location:** `packages/sui-media/src/Stage/`, `packages/sui-media/src/players/`
- **Regions:** `Stage` shadow-DOM canvas · video/audio `<video>`/`<audio>` players
- **States:** ready, playing, paused, buffering, ended, error

---

## 13. CDN Package View — `@stoked-ui/cdn`

### 13.1 CdnBrowser

- **Products:** SC_PRODUCT_STOKED_UI_SUI.md
- **Location:** `packages/sui-cdn/src/CdnBrowser/CdnBrowser.tsx`
- **Regions:**
  | Zone | Content |
  |------|---------|
  | Hero | title, search, auth status, stats |
  | Pathbar | breadcrumb directory navigation |
  | View toggle | list / gallery mode |
  | Listing | folder cards · file gallery thumbnails · file table (name/date/size/actions) |
  | Permission editor | role/user restriction panel |
  | Upload list | active upload queue |
  | Feedback | error / empty messaging |
- **States:**
  - Directory: loading, success, error, empty
  - Auth: authenticated, unauthenticated, loading, error
  - Upload: per-item uploading, complete, error
  - Rename: active-rename-path
  - Permissions: editor-open, loading, saving, clearing, ready
  - View: list-mode, gallery-mode
  - Drag: drag-active, drop-target

---

## 14. GitHub Package Views — `@stoked-ui/github`

### 14.1 GithubEvents

- **Products:** SC_PRODUCT_STOKED_UI_SUI.md
- **Location:** `packages/sui-github/src/GithubEvents/GithubEvents.tsx`
- **Regions:** event-type filter · date range picker · repo autocomplete · event list/table · pagination · sticky `MetadataDisplay` sidebar
- **Event types rendered:** `PushEvent`, `PullRequestEvent`, `IssuesEvent`, `IssueCommentEvent`, `CreateEvent`, `DeleteEvent`, `ForksEvent`, `ProjectsV2Event`, …
- **States:** loading, success, error, cached, selected-event, filter-applied, empty

### 14.2 GithubCalendar

- **Location:** `packages/sui-github/src/GithubCalendar/GithubCalendar.tsx`
- **Regions:** activity heatmap (year × week × day) via `react-activity-calendar`
- **States:** loading, success, error, hovered-cell; responsive (`windowMode`/`containerMode`)

### 14.3 GithubBranch

- **Location:** `packages/sui-github/src/GithubBranch/GithubBranch.tsx`
- **Regions:** status badge (ahead/behind/diverged/identical) · `GithubContributorsList` · `FileChanges` · embedded `PullRequestView`
- **States:** loading, success, error, private-mode

### 14.4 GithubCommit

- **Location:** `packages/sui-github/src/GithubCommit/GithubCommit.tsx`
- **Regions:** commit hash · message · author · timestamp · file changes
- **States:** loading, success, error

### 14.5 PullRequestView

- **Location:** `packages/sui-github/src/GithubEvents/EventTypes/PullRequest/PullRequestView.tsx`
- **Regions:** PR header (title, state, merge status) · `CommitsList` · `FileChanges` · review state
- **States:** open, draft, merged, closed, loading, error

---

## 15. Docs Package Primitives — `@stoked-ui/docs`

`packages/sui-docs/src/components/`. Reusable view-level primitives consumed by `docs/`.

- **Products:** SC_PRODUCT_STOKED_UI_SUI.md (used wherever MDX/doc surfaces appear)
- **Notable views and states:**
  | Component | Location | Regions | States |
  |-----------|----------|---------|--------|
  | `Demo` | `Demo.tsx` | example container | rendering, error |
  | `DemoEditor` | `DemoEditor.tsx` | `SimpleCodeEditor` + `CodeCopyButton` + `MarkdownElement` | editing, focus, copy-success |
  | `DemoSandbox` | `DemoSandbox.tsx` | iframe (CodeSandbox or StackBlitz) | loading, ready, error |
  | `CodeSandbox` | `CodeSandbox.tsx` | sandbox iframe | loading, ready, error |
  | `StackBlitz` | `StackBlitz.tsx` | StackBlitz iframe | loading, ready, error |
  | `DemoToolbar` | `DemoToolbar.tsx` | edit/sandbox/copy/share buttons | loading, ready, success, error |
  | `DemoCodeViewer` | `DemoCodeViewer/index.tsx` | code block | collapsed, expanded, copied |
  | `HighlightedCode` / `HighlightedCodeWithTabs` | `HighlightedCode*.tsx` | syntax-highlighted block, tabs | loaded, error, active-tab |
  | `MarkdownElement` / `RichMarkdownElement` | `MarkdownElement*.tsx` | rendered MDX | loading, success, error |
  | `BrandingCssVarsProvider` / `BrandingProvider` / `DocsProvider` | `BrandingCssVarsProvider/`, `branding/`, `DocsProvider/` | theme injection | light/dark/auto |

---

## 16. Common Package Shared Chrome — `@stoked-ui/common`

- **Products:** SC_PRODUCT_STOKED_UI_SUI.md
- **Notable views:**
  | Component | Location | Regions | States |
  |-----------|----------|---------|--------|
  | `UserMenu` | `packages/sui-common/src/UserMenu/UserMenu.tsx` | avatar trigger · dropdown (Dashboard/Settings/Licenses/Billing/Sign-Out) | open, closed, hovered, role-conditioned items |
  | `GrokLoader` | `packages/sui-common/src/GrokLoader/` | spinner | loading, loaded |
  | `SocialLinks` / `SocialLinkField` | `packages/sui-common/src/SocialLinks/` | link list / link editor | viewing, editing |
  | `CalendarBooking` | `packages/sui-common/src/CalendarBooking/CalendarBooking.tsx` | left mini-calendar (month nav + date grid) · right week-grid (5 business days × 30-min slots, 10:30 AM–5:30 PM) · booking-form modal (name/email/phone/company/reason + invite-email chips + "change time") | loading (per-day slot fetch), empty/past (`—` disabled slots), populated (available slots), selected (primary block w/ duration), editing (drag bottom handle 30–120 min in 15-min steps), submitting, success (confirmation banner), error |

- **`CalendarBooking` data flow:** slots fetched from `GET /api/calendar/availability?date=YYYY-MM-DD` → `{ slots: string[] }` (ISO instants), cached in sessionStorage (key `sui-availability:{date}`, 30-min TTL); booking via `POST /api/calendar/book` (form + startTime + durationMinutes + inviteEmails). All slot instants are pinned to the business timezone (`America/Chicago`) via `Intl.DateTimeFormat`, so a server slot ISO maps to the correct grid row regardless of the visitor's local zone. Not yet mounted on any docs page route.

---

## 17. Internal Vite Apps

### 17.1 Internal CDN Browser (legacy app)

- **Products:** SC_PRODUCT_STOKED_UI_SUI.md (operations tool)
- **Location:** `packages-internal/cdn/src/main.jsx`, `packages-internal/cdn/src/App.jsx`
- **Regions:** Header (auth status, logout) · breadcrumbs · folder grid · object list (kind icons V/D/A/I/?/F + `formatBytes`/`formatTimestamp`) · upload dialog · permission panel
- **States:** loading, unauthenticated (login form, optional Google OAuth), authenticated, error, idle/uploading/error per upload, rename-active
- **Endpoints:** `/api/cdn/contents`, `/api/cdn/delete`, `/api/cdn/move`, `/api/cdn/export`, `/api/cdn/folders`, `/api/cdn/permissions`, `/api/cdn/upload/*`

### 17.2 CDN Sui Wrapper

- **Location:** `packages-internal/cdn-sui/src/main.jsx`, `packages-internal/cdn-sui/src/App.jsx`
- **Regions:** thin wrapper rendering `CdnBrowser` from `@stoked-ui/cdn` with `apiBaseUrl="/api/cdn"`, auth endpoints, prefix state
- **States:** delegates to `CdnBrowser` (see §13.1)

---

## 18. CLI / Terminal Output — `packages/sui-video-renderer/cli`

CLI binary `video-render` (Rust). Source: `packages/sui-video-renderer/cli/src/main.rs`.

### 18.1 `render` Subcommand

- **Products:** SC_PRODUCT_STOKED_UI_SUI.md
- **Invocation:** `video-render render --input project.sue --output video.mp4 [--quality --resolution --format --codec --fps --threads --progress]`
- **Output regions (text mode, via `indicatif`):**
  - Startup log: "Starting render job", "Input: …", "Output: …", "Output resolution: WxH", "FPS: …", "Using N worker threads"
  - "Setting up compositor with N tracks"
  - "Rendering M frames (D.DDs duration)"
  - Progress bar with rolling 10-frame FPS average
  - Completion + elapsed time
- **Output regions (json mode):** per-frame JSON progress events
- **States:** running (progress incrementing), paused/blocked (no progress), completed, error (anyhow error: invalid resolution format, dimensions ≤ 0, IO error, codec error)

### 18.2 `info` Subcommand

- **Invocation:** `video-render info --input project.sue`
- **Output regions:** `project.print_info()` — width/height/fps/track count and other project metadata
- **States:** success, parse-error

---

## 19. NestJS Media API Documentation Surface — `@stoked-ui/media-api`

### 19.1 Swagger UI (Media API)

- **Products:** SC_PRODUCT_STOKED_UI_SUI.md
- **Location:** route `/v1/api/docs` mounted by `setupSwaggerUI(app)` in `packages/sui-media-api/src/app.ts:86`; config in `packages/sui-media-api/src/swagger.config.ts`
- **Regions:** Swagger top-bar (hidden via `customCss`) · API metadata (Title "Stoked UI Media API", description, version, contact, license MIT, servers `localhost:3001/v1` + `api.sui.stokd.cloud/v1`) · Bearer-JWT auth widget · tag groups (`Health`, `Media`, `Uploads`, `auth`) · operation list (try-it-out)
- **States:** unauthorized, authorized (JWT entered), operation-expanded, request-loading, response-rendered, error

### 19.2 OpenAPI Spec Endpoint (Docs Business API)

- **Location:** `docs/pages/api/openapi.ts`
- **Output:** JSON spec built by `getDocsApiOpenApiSpec()`; consumed by §7.2 Swagger UI
- **States:** 200 (success), 500 (generation error); auth via `withAuth` middleware

---

## 20. Standalone Product Surfaces

These are product pages with custom (non-`PublicProductDetailPage`) layouts. They live alongside the standard `/products/<slug>/` showcase routes but render bespoke marketing/landing content.

### 20.1 Mac Mixer Product Page

- **Products:** SC_PRODUCT_STOKED_UI_SUI.md
- **Location:** `docs/pages/products/mac-mixer/index.tsx` → `docs/src/modules/products/MacMixerProductPage.tsx`
- **Regions:** `BrandingCssVarsProvider` · `AppHeaderBanner` · `AppHeader` · hero (title + alpha download CTA → `https://cdn.consulting.stokd.cloud/products/mac-mixer/releases/alpha/<v>/MacMixer-<v>.pkg`) · feature grid (route mapping cards: Zoom→AirPods, etc.) · device routing diagram (`Paper` cards with `Chip` route entries) · marketing copy sections (volume control, hotkeys, security, audio quality) · `NewsletterToast` · `AppFooter`
- **States:** static (always loaded), hover (card transform), download CTA enabled/disabled
- **Mirror (consulting origin):** `docs/pages/consulting/products/mac-mixer.tsx` renders the same `MacMixerProductPage`.

### 20.2 Stokd Cloud Product Page

- **Products:** SC_PRODUCT_STOKED_UI_SUI.md
- **Location:** `docs/pages/products/stokd-cloud/main.tsx` (+ `docs/pages/consulting/products/stokd-cloud.tsx`) → `docs/src/modules/products/StokdCloudProductPage.tsx` → `docs/src/modules/products/StokdCloudPitch.tsx` (content in `stokdCloudContent.ts`)
- **Regions:** `BrandingCssVarsProvider` · `AppHeader` · `StokdCloudPitch` (bespoke pitch/landing body) · `AppFooter`
- **States:** static (loaded)
- **Notes:** `StokdCloudPitch` has a dedicated test (`StokdCloudPitch.test.tsx`). Mirrored on the consulting origin via `docs/pages/consulting/products/stokd-cloud.tsx`.

### 20.3 Focus Capture / Media Selector / Always Listening / Common

- **Products:** SC_PRODUCT_STOKED_UI_SUI.md
- **Location:** `docs/pages/products/<slug>/index.js` + `docs/pages/products/<slug>/main.tsx` (where present)
- **Slugs:** `focus-capture`, `media-selector`, `always-listening`, `common`
- **Regions:** AppHeader · `HeroContainer` · `Section` blocks with feature cards · `Divider` · AppFooter
- **States:** static (loaded), alpha-prerelease badge where applicable
- **Notes:** `media-selector` retains a legacy `main.bac.tsx` backup alongside the live `main.tsx`. `always-listening` currently renders a docs tree only (no `main.tsx`).

---

## 21. Consulting Service-Line Pages

Service-offering landing pages, one per practice area. Linked from `/consulting/main.tsx` industry/service cards.

- **Products:** SC_PRODUCT_STOKED_UI_SUI.md
- **Location:** `docs/pages/consulting/<service>/index.js` + `docs/pages/consulting/<service>/main.tsx`
- **Services:** `ai`, `back-end`, `front-end`, `devops`, `full-stack`
- **Regions:** AppHeader · `HeroContainer`/`HeroConsulting` (gradient title via `GradientText`) · `ConsultingProofStrip` · `Section` blocks (stats grid, "how we work" steps, opportunity grid) · `Grid` of `ServiceCard` items (icon · service title · `CardContent` description) · `Divider` · AppFooter
- **States:** static, hovered (card lift + title color shift to `#3399ff`)
- **Notes:** `full-stack` (greenfield product development, etc.) is the newest service line and reuses `HeroConsulting`.
- **Notes:** The `ai` page (`docs/pages/consulting/ai/main.tsx`) additionally embeds the **Consulting Audit Bot** — the hero's right rail renders `AuditBotTrigger` (`variant="hero"`) and the hero CTA / trigger opens the `AuditBot` dialog with `playbook="ai-readiness"` (see §24). `calendlyUrl` comes from `NEXT_PUBLIC_CALENDLY_URL`.

---

## 22. Video Renderer Docs Site

Standalone docs tree for the Rust → WASM video renderer outside the per-product showcase tree.

- **Products:** SC_PRODUCT_STOKED_UI_SUI.md
- **Location:** `docs/pages/video-renderer/docs/`
- **Pages:** `index.js`, `overview.js`, `quick-start.js`, `api-reference.js`, `rust-backend.js`, `wasm-frontend.js`, `nodejs-integration.js`
- **Regions:** AppHeader · `AppNavDrawer` (renderer-scoped tree) · `MarkdownDocs` body · `AppTableOfContents` · AppFooter
- **States:** loading, loaded, sidebar-collapsed (mobile), section in-view (TOC active), code-copied, theme light/dark

---

## 23. Company / Contact

- **Products:** SC_PRODUCT_STOKED_UI_SUI.md
- **Location:** `docs/pages/company/contact.js` → `TopLayoutCareers` shell consuming `docs/src/pages/company/contact/contact.md`
- **Regions:** AppHeader · MDX body (contact form / address copy) · AppFooter
- **States:** static (loaded)

---

## 24. Consulting Audit Bot — `docs/src/modules/auditBot`

An interactive lead-generation chat surface on the consulting site (`consulting.stokd.cloud`). A visitor talks to an LLM-backed agent that runs a fixed-length audit "playbook" and produces a structured 1-page report, then optionally captures the lead's email for follow-up. The web channel lives under `docs/src/modules/auditBot/channels/web/components/`; conversation orchestration (`conversationRunner.ts`, `llmClient.ts`, `tools.ts`, `playbooks/`) runs server-side behind the audit API routes. Three playbooks are defined in `docs/src/modules/auditBot/playbooks/index.ts`: `ai-readiness` (~5 min), `cloud-cost` (~6 min), `security` (~6 min). Currently only the `ai-readiness` playbook is mounted in the UI (on the `/consulting/ai` page, §21).

### 24.1 Audit Bot Trigger

- **Products:** SC_PRODUCT_STOKED_UI_SUI.md
- **Location:** `docs/src/modules/auditBot/channels/web/components/AuditBotTrigger.tsx`
- **Regions (by `variant`):**
  | Variant | Regions |
  |---------|---------|
  | `hero` | bordered card with green "live" status dot · title ("Stoked AI Readiness Audit", "5 min · Free") · two mocked assistant chat bubbles (preview of opening message) · full-width "Start your audit" CTA · "No signup. Brian sees the report too." caption |
  | `card` | `AutoAwesomeIcon` + "Free AI Readiness Audit" heading · body copy · "Start the audit" button; hover lift (`translateY(-2px)`, `borderColor #3399ff`) |
  | `inline` | single "Start your free AI audit" contained button |
- **States:** idle, hovered (card/hero lift), keyboard-focusable (`role="button"`, Enter/Space activates `card` variant); calls `onOpen()` to mount the dialog

### 24.2 Audit Bot Dialog (Chat)

- **Products:** SC_PRODUCT_STOKED_UI_SUI.md
- **Location:** `docs/src/modules/auditBot/channels/web/components/AuditBot.tsx`
- **Regions:**
  | Zone | Component / content |
  |------|---------------------|
  | Dialog shell | MUI `Dialog` (`maxWidth="md"`, full-width, `85vh` on desktop / full-height on mobile) |
  | Header | green status dot · "Stoked {playbook label}" · "~N min · Free · Brian sees the report" caption · `CloseIcon` |
  | Busy bar | `LinearProgress` (2px) while a turn is in flight |
  | Message list | scrolling `DialogContent` of chat bubbles — user (`#3399ff`/white, right-aligned) vs assistant (`grey.100` / `primaryDark.700`, left-aligned); auto-scrolls to bottom |
  | Report card | inline `AuditReportView` (§24.3) rendered under the assistant bubble that carries a `report` payload |
  | Email capture | bordered panel ("Want Brian to follow up?") with name + email `TextField`s, "Send the follow-up" button, and optional "Book a 30-min call" button (when `calendlyUrl` set) |
  | Confirmation | post-submit panel ("Got it — your report is on its way…" / "Brian sees this on his phone…") |
  | Composer | multiline `TextField` (Enter to send, Shift+Enter newline) + `SendIcon` `IconButton`; hidden once the conversation is `finished` |
- **States:** seeded-opening (one assistant opener per playbook), idle, busy/sending (composer + send disabled, progress bar), reply-received, report-ready (`reportReady` → email capture shown), turn-error (apologetic assistant message + falls through to email capture), email-submitting (`savingLead`), lead-saved (`savedLead`; `emailedReport` toggles confirmation copy), finished (composer removed), closed/reset (state cleared on close)
- **Data flow:** `POST /api/audit/turn` (`docs/pages/api/audit/turn.ts`) per message → `{ sessionId, reply, report?, finished }`; `POST /api/audit/save-lead` (`docs/pages/api/audit/save-lead.ts`) on email capture → `{ ok, emailedReport }`. Lead persistence + report email via `auditStore.ts` / `auditMailer.ts`; optional `notifyTelegram.ts`.

### 24.3 Audit Report View

- **Products:** SC_PRODUCT_STOKED_UI_SUI.md
- **Location:** `docs/src/modules/auditBot/channels/web/components/AuditReportView.tsx`
- **Regions:** company + one-liner header · playbook-specific summary chips (`MiniChip`) · `SectionLabel`-delimited blocks · ranked `OpportunityCard` list (`#rank`, title, effort/cost/savings chips, body, optional caveat) · "Brian would start with" · "Honest caveat" · "Next step"
- **Variants (by `report.playbook`):** `ai-readiness` (readiness band + top opportunities with hours-saved chips), `cloud-cost` (cloud/spend/savings chips + monthly-savings cards), `security` (posture/compliance chips + severity-ranked findings)
- **States:** rendered (one of three report shapes); purely presentational — no internal loading/error state (errors surface in the parent dialog)

---

## 25. Template / Theme Demo & Experiment Surfaces

Legacy MUI-forked demo apps and benchmark/experiment pages that ship alongside the docs site. These are full rendered surfaces but are secondary to the product showcase — they exist as reference template apps and internal performance/experiment harnesses rather than marketing pages. All are wrapped in `AppTheme` (`docs/src/modules/components/AppTheme`).

### 25.1 Onepirate Theme Demo App

- **Products:** SC_PRODUCT_STOKED_UI_SUI.md
- **Location:** `docs/pages/premium-themes/onepirate/{index,sign-in,sign-up,forgot-password,terms,privacy}.js` → screens in `docs/src/pages/premium-themes/onepirate/` (`Home`, `SignIn`, `SignUp`, `ForgotPassword`, `Terms`, `Privacy`, plus `modules/`)
- **Regions:** themed marketing landing (`Home`: hero, product values, "how it works", CTA, footer) **or** auth screens (`SignIn`/`SignUp`/`ForgotPassword` forms) **or** legal copy (`Terms`/`Privacy`)
- **States:** static (loaded), form-input, form-submitting, form-error (auth screens)

### 25.2 Paperbase Dashboard Demo App

- **Products:** SC_PRODUCT_STOKED_UI_SUI.md
- **Location:** `docs/pages/premium-themes/paperbase/index.js` → `docs/src/pages/premium-themes/paperbase/Paperbase.tsx` (`Navigator` rail, `Header`, `Content`)
- **Regions:** left `Navigator` drawer · top `Header` (tabs + search) · `Content` data table · footer
- **States:** static (loaded), nav-item-selected, mobile-drawer-open/closed

### 25.3 Experiments Index & Demo Pages

- **Products:** SC_PRODUCT_STOKED_UI_SUI.md
- **Location:** `docs/pages/experiments/index.js` (link list of experiments) + `docs/pages/experiments/{base,blog,docs,website}/**`
- **Regions:** `Container` · `List` of experiment links (index) · per-experiment bespoke demo body
- **States:** static (loaded)

### 25.4 Performance Benchmark Pages

- **Products:** SC_PRODUCT_STOKED_UI_SUI.md
- **Location:** `docs/pages/performance/{slider-emotion,slider-jss,system,table-component,table-emotion,table-hook,table-mui,table-raw,table-styled-components}.js`
- **Regions:** single benchmark widget per page (slider / table rendered via different styling engines) for render-cost comparison
- **States:** static (rendered benchmark), interactive (slider drag / table re-render)

---

## 26. Stokd Activity-UX Components — `@stoked-ui/stokd`

`packages/sui-stokd/src/` (npm `@stoked-ui/stokd`, v0.2.2). Host-agnostic, CSS-variable-themed React components and view-model types that render the **current agent/work activity** surface. Consumed by the Stokd web dashboard and the VS Code extension — this package ships no page routes of its own; it exposes the cards/badges those hosts compose into a live activity view. All components are theme-driven (`--sui-card`, `--sui-border`, `--sui-accent-*`, `data-theme="light|dark"`) and accept `className`/`theme` props. Status, work-type, and provider are resolved by the consumer and passed in as view-model props (`SessionModel`, `TaskModel`, `DisplayStatusModel`, `WorkTypeModel`, `ShipStatusModel`, …); grouping/formatting helpers (`groupSessionsByRequest`, `pickGroupDisplayStatus`, `displayStatusLabel`, `formatDuration`, `formatCurrency`, `normalizeProviderId`) are exported alongside.

### 26.1 ActiveTaskCard (Task / Project Execution Card)

- **Products:** SC_PRODUCT_STOKED_UI_SUI.md
- **Location:** `packages/sui-stokd/src/components/ActiveTaskCard/ActiveTaskCard.tsx`
- **Regions:**
  | Zone | Content |
  |------|---------|
  | Header | pulse/ping dot · number badge (`#`) · work-type badge (Task/Project/Planning) · title · `PrerequisiteBadge`; right side: runtime `LiveTimer` · `StatusBadge` · Continue / Stop buttons; sub-rows: issue #, git branch (+worktree indicator), work-item id, `ShipStatusChips` |
  | Task stage strip | 3-node stepper (Planning · Implementation · Validation) with per-node status icon (task work-type only) |
  | Plan / Initiative bullets | bulleted plan parsed from `source_prompt` (≤8) · initiative items (checked/struck-through when done) |
  | Line items | per-item done/pending rows (task work-type only) |
  | Acceptance criteria | collapsible toggle (`Acceptance Criteria (N)`) → passed/failed/pending rows |
  | Command timeline | scrollable last-16 merged message/tool entries (chip + title + detail + timestamp + live indicator), auto-scroll to bottom |
  | Final summary | last agent response / resolution excerpt (≤420 chars) |
  | Footer | session count (+active) · `ProviderBadge` · start time · initiative progress (`N/M tasks`) · total cost |
- **States:** `data-active=true/false` (any session engaged), `data-worktype=project/task/planning`, `data-theme=light/dark`; stage nodes pending/in_progress/completed/failed; acceptance items passed/failed/unresolved; timeline entries completed vs in-progress; Continue visible only when stalled & non-terminal; Stop visible when sessions non-stopped; timeline empty ("No tool calls yet")

### 26.2 InteractiveSessionCard (Planning Chat Feed)

- **Location:** `packages/sui-stokd/src/components/InteractiveSessionCard/InteractiveSessionCard.tsx`
- **Regions:** header (pulse dot · "Planning" badge · title · `ProviderBadge` · session count · start time · cost · `StatusBadge` · Stop) · scrolling conversation feed of role bubbles (user right-aligned; assistant/tool/thinking left-aligned, each with role icon + label + body + detail)
- **States:** `data-active=true/false`; bubble `data-kind=user/thinking/assistant/tool`; entry completed vs in-progress; auto-scroll pinned-to-bottom (respects user scroll); empty ("Waiting for conversation events.")

### 26.3 PipelineShellCard (Project Pipeline Skeleton)

- **Location:** `packages/sui-stokd/src/components/PipelineShellCard/PipelineShellCard.tsx`
- **Regions:** 5-stage stepper (Analysis · Planning · Implementation · Validation · Integration) · body (project # · "Project" badge · `StatusBadge` · title · branch hint · start time · spinning/static loader note)
- **States:** placeholder shown while full pipeline view loads; per-step `data-status=pending/in_progress/completed/failed/skipped`, `data-current`; overall `data-status=working/analyzing/idle/stopped` (note copy varies)

### 26.4 Badges & Indicators (StatusBadge · ShipStatusChips · ProviderBadge · PrerequisiteBadge · LiveTimer)

- **Location:** `packages/sui-stokd/src/components/{StatusBadge,ShipStatusChips,ProviderBadge,PrerequisiteBadge,LiveTimer}/`
- **Regions / States:**
  - `StatusBadge` — label pill + optional solid/ping dot; `data-type=success/warning/error/neutral/info`, pulse on engaged
  - `ShipStatusChips` — 3 env chips (main/stage/prod), each `data-state=achieved/pending`
  - `ProviderBadge` — provider SVG logo or letter avatar + optional label; `data-provider=claude/codex/gemini/amp/grok/stokd/local/unknown`, `data-size=xs/sm/md`, theme-aware logo
  - `PrerequisiteBadge` — render-null when none; blocked ("Blocked — waiting on N prerequisite(s)") vs met ("Prerequisites met"); `data-blocked`
  - `LiveTimer` — formatted elapsed text, ticks every 1s, `paused` prop, optional base-ms offset, "-" when no start time

---

## Cross-Cutting State Vocabulary

Common state names recur across views and are normalized as:

- **lifecycle:** loading, ready, success, error, empty
- **interaction:** idle, hovered, focused, selected, multi-selected, disabled
- **edit:** viewing, editing, dirty, saving, saved, validation-error, delete-confirm
- **media/transport:** playing, paused, buffering, seeking, ended, recording
- **layout:** expanded, collapsed, drag-active, drop-zone, drag-source, drop-target, fullscreen, modal-open
- **auth/session:** auth-loading, authenticated, unauthenticated, unauthorized, role-admin/-client/-subscriber/-agent

---

## Cross-References

- Module inventory: `.stokd/meta/packages/*/SC_MODULE.md`
- Codebase overview: `.stokd/meta/SC_OVERVIEW.md`
- Flow / data-path inventory: `.stokd/meta/SC_FLOWS.md`
- Test inventory: `.stokd/meta/SC_TEST.md`
- Product doc: `.stokd/meta/products/SC_PRODUCT_STOKED_UI_SUI.md`
- Guardrails: `.stokd/meta/SC_CONTEXT.md`, `CLAUDE.md`, `AGENTS.md`
