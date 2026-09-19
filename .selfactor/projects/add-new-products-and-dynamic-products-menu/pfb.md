# Add New Products and Dynamic Products Menu

## 1. Feature Overview
**Feature Name:** Add New Products and Dynamic Products Menu
**Owner:** Stoked Consulting
**Status:** Proposed
**Target Release:** Q1 2026

### Summary
Add three new products -- Mac Mixer, Always Listening, and Stokd Cloud -- to the Stoked UI documentation website at stokedconsulting.com, including product definitions, icons, documentation content, and product pages. Simultaneously fix the Products navigation menu in the site header, which is currently hardcoded to show only Stoked UI and Flux, so that it dynamically renders Stoked UI plus all products where `live: true`.

---

## 2. Problem Statement

### What problem are we solving?
Three products -- Mac Mixer (macOS audio mixer), Always Listening (voice pipeline tray app), and Stokd Cloud (Claude AI project orchestration platform) -- exist as active codebases but have no presence on the public-facing documentation website. Potential users and clients cannot discover, learn about, or evaluate these products. Additionally, the Products dropdown menu in the site header is hardcoded in `docs/src/products.tsx` at line 1039 (`const ALL_PRODUCTS: Products = new Products([sui, flux]);`), meaning any new product added to the system never appears in navigation unless a developer manually edits that line. This defeats the purpose of the `live` flag on the `Product` class and the `products` MongoDB collection, both of which already support dynamic product visibility.

### Who is affected?
- **End users / prospective customers** who cannot find Mac Mixer, Always Listening, or Stokd Cloud on the website.
- **The development team** who must manually update a hardcoded array every time a product is added or toggled live.
- **The consulting sales team** who cannot direct clients to product documentation pages for these offerings.

### Why now?
All three products have active codebases with significant functionality (Mac Mixer at alpha, Always Listening with a full PRD, Stokd Cloud with a working monorepo including a VSCode extension, NestJS API, and MCP server). The documentation site already supports the infrastructure (product definitions, MongoDB seed scripts, doc page routing, icon system) -- only the product entries, doc content, and the menu fix are missing. Completing this work is low-effort relative to the visibility it provides.

---

## 3. Goals & Success Metrics

### Goals
1. Register Mac Mixer, Always Listening, and Stokd Cloud as products in `docs/src/products.tsx` with accurate metadata, icons, and feature lists.
2. Create markdown documentation content for each product under `docs/data/{product-id}/docs/` following the established pattern (overview, features, roadmap at minimum).
3. Create MongoDB seed data for each product and its doc pages, following the `seed-products.ts` pattern.
4. Add route entries for each product in `docs/src/route.ts`.
5. Build out content for Stokd Cloud, which is listed as a product but lacks documentation.
6. Fix the `ALL_PRODUCTS` constant to dynamically include Stoked UI plus all non-consulting products where `live: true`, eliminating the hardcoded `[sui, flux]` array.
7. Ensure the Products dropdown menu in the unauthenticated header nav dynamically reflects which products are live.

### Success Metrics
- All three new products are visible on the documentation site with working product pages and doc content.
- The Products dropdown menu shows Stoked UI, Flux, Mac Mixer, Always Listening, and Stokd Cloud (all products with `live: true`, excluding consulting products).
- Adding a future product with `live: true` to `products.tsx` automatically surfaces it in the Products menu with zero additional menu code changes.
- All new doc pages are accessible via their expected URL paths (e.g., `/mac-mixer/docs/overview/`).
- Product seed scripts successfully upsert products and pages to MongoDB.
- No regressions to existing product pages or navigation.

---

## 4. User Experience & Scope

### In Scope

**New Product Definitions (in `docs/src/products.tsx`):**
- **Mac Mixer** (`id: 'mac-mixer'`): macOS audio utility with per-app volume control, auto-pause music, and system audio recording. Icon: `product-advanced`. Features: Overview, App Volumes, Auto-Pause, Recording, Download, Roadmap.
- **Always Listening** (`id: 'always-listening'`): Cross-platform voice pipeline tray app (Tauri v2 / Rust / React) with Voice-to-Claude, Dictation, and Combined modes. Icon: `product-templates`. Features: Overview, Voice Modes, Preferences, Home Assistant, Download, Roadmap.
- **Stokd Cloud** (`id: 'stokd-cloud'`): AI-powered project orchestration platform with a VSCode extension, NestJS state tracking API, and MCP server for Claude integration. Icon: `product-toolpad`. Features: Overview, VSCode Extension, State API, Review Commands, Roadmap.

**Documentation Content (markdown files under `docs/data/`):**
- `docs/data/mac-mixer/docs/overview/overview.md` -- Product overview, key features, system requirements, getting started.
- `docs/data/mac-mixer/docs/download/download.md` -- Installation instructions, Homebrew, build from source.
- `docs/data/mac-mixer/docs/roadmap/roadmap.md` -- Current status and future plans.
- `docs/data/always-listening/docs/overview/overview.md` -- Product overview, voice modes, tech stack.
- `docs/data/always-listening/docs/voice-modes/voice-modes.md` -- Voice-to-Claude, Dictation, Combined mode details.
- `docs/data/always-listening/docs/roadmap/roadmap.md` -- Status and planned features.
- `docs/data/stokd-cloud/docs/overview/overview.md` -- Platform overview, architecture, components.
- `docs/data/stokd-cloud/docs/vscode-extension/vscode-extension.md` -- Extension features and usage.
- `docs/data/stokd-cloud/docs/roadmap/roadmap.md` -- Development status and plans.

**Page Definitions:**
- `docs/data/macMixerPages.ts`, `docs/data/alwaysListeningPages.ts`, `docs/data/stokdCloudPages.ts` following the `fluxPages.ts` pattern.

**Route Entries (in `docs/src/route.ts`):**
- `macMixer: '/mac-mixer/'`, `macMixerDocs: '/mac-mixer/docs/overview/'`
- `alwaysListening: '/always-listening/'`, `alwaysListeningDocs: '/always-listening/docs/overview/'`
- `stokdCloud: '/stokd-cloud/'`, `stokdCloudDocs: '/stokd-cloud/docs/overview/'`

**MongoDB Seed Data:**
- Extend or create seed scripts for Mac Mixer, Always Listening, and Stokd Cloud following the `seed-products.ts` pattern.

**Dynamic Products Menu Fix:**
- Replace the hardcoded `ALL_PRODUCTS` in `docs/src/products.tsx` with a dynamically constructed `Products` collection that includes Stoked UI (`sui`) plus all other product instances where `live: true` and whose `id` does not start with `consulting-`.
- Verify that `HeaderNavBar.tsx` correctly renders the updated menu without code changes (it already calls `ALL_PRODUCTS.menu()`).

### Out of Scope
- Creating new SVG icon files; the existing 5 product icon sets (`product-core`, `product-advanced`, `product-designkits`, `product-templates`, `product-toolpad`) will be reused.
- Building custom showcase components for the new products; they will use `AdvancedShowcase` or `StokedConsultingShowcase` as placeholders.
- Implementing product-specific API endpoints beyond the existing `docs/pages/api/products/` routes.
- Adding products to the authenticated admin/client navigation (that system already pulls from MongoDB dynamically).
- App Store distribution, download infrastructure, or payment integration for any of these products.
- Mobile-responsive product pages (existing responsive layout is sufficient).

---

## 5. Assumptions & Constraints

**Assumptions:**
- The existing icon set (`product-core`, `product-advanced`, `product-toolpad`, `product-templates`, `product-designkits`) is sufficient for the three new products. Custom product-specific icons can be added in a future iteration.
- The `AdvancedShowcase` component is an acceptable placeholder for new product showcase sections on the homepage until product-specific showcases are built.
- Mac Mixer is at alpha stage, Always Listening has a complete PRD but is in development, and Stokd Cloud has a functional monorepo. Documentation content should reflect current actual state, not aspirational features.
- All products will be set to `live: true` upon addition. Visibility can be toggled later via the `live` flag.
- The Next.js dynamic page routing under `docs/pages/` will resolve new product doc URLs without additional configuration beyond adding the markdown files and page definitions.

**Constraints:**
- Only 5 icon name variants exist in `docs/public/static/branding/` (`product-core`, `product-advanced`, `product-toolpad`, `product-templates`, `product-designkits`), each with light and dark SVG variants. New products must use one of these until custom icons are created.
- The `Product` class requires a `showcaseType` React component. New products must provide one, even if it is a generic placeholder.
- The doc content structure requires markdown files to live at `docs/data/{product-id}/docs/{slug}/{slug}.md` and corresponding page definitions in `docs/data/{product-id}Pages.ts`.
- The MongoDB seed script connects to a local or environment-configured MongoDB URI. Products must be seeded before they appear in the authenticated admin panel.

---

## 6. Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Changing `ALL_PRODUCTS` from hardcoded to dynamic breaks the existing Products menu rendering | High | Low | The `Products` class and `ProductMenu` component already iterate over `this.live` to render menu items. Adding more products to the collection should work without code changes to the menu component. Test thoroughly by verifying the Flux and Stoked UI entries still render correctly after the change. |
| New product doc pages return 404 due to missing Next.js page routes | Medium | Medium | Follow the exact file structure and page definition pattern used by Flux (`fluxPages.ts`, `docs/data/flux/docs/` directory structure). Verify that the Next.js catch-all routes under `docs/pages/` resolve the new paths. |
| Showcase component errors on homepage for new products | Medium | Low | Use `AdvancedShowcase` as a safe default -- it is already used by Flux and Media products. Products can have `hideProductFeatures: true` to minimize homepage exposure until custom showcases are built. |
| Product count in the menu becomes unwieldy with 5+ products plus Stoked UI | Low | Medium | The existing Popper/dropdown menu supports scrolling. Consider grouping by category (apps vs. components) in a future iteration if the list grows beyond 8-10 items. |
| Documentation content for products still in development becomes outdated quickly | Low | High | Write documentation that describes current capabilities and clearly labels alpha/beta status. Use the roadmap page for planned features rather than documenting them as existing. |

---

## 7. Dependencies

**Internal Dependencies:**
- `docs/src/products.tsx` -- Product class, Products collection, TProduct type definition. All new products must conform to the existing `TProduct` interface.
- `docs/src/route.ts` -- Route constants referenced by `Product.docHref` and `Product.href` getters.
- `docs/src/components/icon/IconImage.tsx` -- Icon rendering component. The `name` prop must match an existing SVG file prefix in `docs/public/static/branding/`.
- `docs/src/components/header/HeaderNavBar.tsx` -- Imports `ALL_PRODUCTS` and calls `.menu()` for the unauthenticated nav. No changes needed here if `ALL_PRODUCTS` is fixed.
- `docs/data/pages.ts` or equivalent -- Must register new page definitions so the Next.js router can resolve them.
- `docs/scripts/seed-products.ts` -- Seed script pattern for MongoDB product and page data.
- `docs/pages/api/products/public.ts` -- Public API route that filters `live: true` products. New products will automatically appear here once seeded to MongoDB.

**External Dependencies:**
- MongoDB instance (local or hosted) for seeding product data.
- Existing product worktrees for reference content:
  - `/opt/worktrees/mac-mixer/master/` -- Mac Mixer source, README, and documentation.
  - `/opt/worktrees/always-listening/always-listening-main/` -- Always Listening source, PRD, and documentation.
  - `/opt/worktrees/stokd-cloud/stokd-cloud-main/` -- Stokd Cloud source, README, architecture docs.

---

## 8. Open Questions

1. **Product-specific icons:** Should custom SVG icons be created for Mac Mixer, Always Listening, and Stokd Cloud for this iteration, or is reusing the existing generic product icons acceptable for launch?

2. **Showcase components:** Should new products appear in the homepage ProductsPreviews section, or should they only appear in the navigation menu and have their own dedicated product/docs pages? If they appear on the homepage, custom showcase components would need to be built.

3. **Product grouping in the menu:** With the number of live products growing (Stoked UI, Flux, Mac Mixer, Always Listening, Stokd Cloud, plus the 4 consulting products), should the Products dropdown be split into categories (e.g., "Components" vs. "Applications" vs. "Cloud")?

4. **Stokd Cloud naming:** The worktree and repo are named `stokd-cloud` but the product is a broader platform (VSCode extension, API, MCP server, review commands). Should the product-facing name be "Stokd Cloud" or simply "Stokd"?

5. **Should the menu fix pull live products from MongoDB at runtime?** Currently the menu is built from static TypeScript definitions. The MongoDB `products` collection has the same data. Should the unauthenticated nav make an API call to `/api/products/public` to build the menu dynamically, or should the static `products.tsx` definitions remain the source of truth for the public nav?

6. **Mac Mixer licensing:** The source is GPLv2 (from the BackgroundMusic project). Does this affect how the product is presented on the commercial Stoked Consulting site?

7. **Alpha/Beta badges:** Should products in pre-release stages display a status badge (e.g., "Alpha", "Beta") in the Products dropdown menu, similar to how the admin nav shows `prerelease` chips?

---

## 9. Non-Goals

- **Custom SVG product icons** -- Reusing existing icon set for this iteration.
- **Custom homepage showcase components** -- New products will use generic showcases or be excluded from the homepage ProductsPreviews section.
- **Download/distribution infrastructure** -- No app binaries, DMGs, or store links will be hosted as part of this work. Download pages will link to external sources (GitHub releases, App Store) where applicable.
- **Product pricing or licensing pages** -- No e-commerce or license key integration for the new products.
- **Authenticated navigation changes** -- The admin and client menus already pull products dynamically from MongoDB. This work only fixes the unauthenticated public Products menu.
- **Server-side rendering of the Products menu from MongoDB** -- The fix targets the static TypeScript product definitions, not a runtime API-driven menu.
- **Consulting product changes** -- The four consulting products (front-end, back-end, devops, ai) are unaffected and remain in their separate `CONSULTING` collection.
- **Deprecation or removal of any existing products** -- All current products retain their existing definitions and live status.

---

## 10. Notes & References

**Codebase References:**
- Product system: `/opt/worktrees/stoked-ui/stoked-ui-main/docs/src/products.tsx`
- Header navigation: `/opt/worktrees/stoked-ui/stoked-ui-main/docs/src/components/header/HeaderNavBar.tsx`
- Route definitions: `/opt/worktrees/stoked-ui/stoked-ui-main/docs/src/route.ts`
- Icon component: `/opt/worktrees/stoked-ui/stoked-ui-main/docs/src/components/icon/IconImage.tsx`
- Icon SVGs: `/opt/worktrees/stoked-ui/stoked-ui-main/docs/public/static/branding/product-*-{light,dark}.svg`
- Flux product docs (reference pattern): `/opt/worktrees/stoked-ui/stoked-ui-main/docs/data/flux/docs/`
- Flux page definitions (reference pattern): `/opt/worktrees/stoked-ui/stoked-ui-main/docs/data/fluxPages.ts`
- Product seed script (reference pattern): `/opt/worktrees/stoked-ui/stoked-ui-main/docs/scripts/seed-products.ts`
- Products public API: `/opt/worktrees/stoked-ui/stoked-ui-main/docs/pages/api/products/public.ts`

**Product Source Repositories:**
- Mac Mixer: `/opt/worktrees/mac-mixer/master/` -- macOS audio utility (Swift/Obj-C, GPLv2)
- Always Listening: `/opt/worktrees/always-listening/always-listening-main/` -- Voice pipeline tray app (Tauri v2 / Rust / React)
- Stokd Cloud: `/opt/worktrees/stokd-cloud/stokd-cloud-main/` -- AI project orchestration platform (NestJS / TypeScript monorepo)

**Key Technical Details:**
- The `ALL_PRODUCTS` constant on line 1039 of `products.tsx` is the root cause of the hardcoded menu. It is imported by `HeaderNavBar.tsx` and used for both the "Products" and "Docs" dropdown menus in the unauthenticated nav.
- The `Products.menu()` method already filters to `this.live` products, so the fix needs to ensure all live non-consulting products are in the `ALL_PRODUCTS` collection.
- The `Product` class requires a `showcaseType` component. All existing live products provide one. New products should use `AdvancedShowcase` as a default.
- Product icons are resolved by `IconImage` as `/static/branding/{name}-{light|dark}.svg`. Available names: `product-core`, `product-advanced`, `product-toolpad`, `product-templates`, `product-designkits`.
- The MongoDB `products` collection uses `productId` as the unique identifier, while the TypeScript `Product` class uses `id`. These must match.
