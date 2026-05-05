# Stoked UI — View Classification

> **Generated:** 2026-03-16 | **Updated:** 2026-04-03 | **Meta version:** 0.2.0
> **Repository:** `@stoked-ui/sui`
> **Root:** `/opt/worktrees/stoked-ui/stoked-ui-main`

---

## 1. Docs Site — Public Pages

### 1.1 Home Page

- **Products:** All (landing page showcases live products)
- **Location:** `docs/pages/index.tsx`, `docs/src/components/home/`
- **Regions:**
  | Zone | Component |
  |------|-----------|
  | Banner | `AppHeaderBanner` — announcement/notification strip |
  | Header | `AppHeader` — logo, product switcher, theme toggle, search, auth menu |
  | Hero | `EditorHero` (dynamic import, SSR disabled) — random product home showcase |
  | Products Preview | `ProductsPreviews` — grid with `ProductsSwitcher` (left) + live `Showcase` component (right) |
  | Newsletter | `NewsletterToast` (NoSsr) — subscription prompt |
  | Footer | `AppFooter` — links, copyright |
- **States:** initial-load (random showcase selected), product-switched (user picks different product), mobile-swipe (SwipeableViews on small screens)

### 1.2 Product Showcase Pages

- **Products:** `sui-file-explorer`, `sui-media`, `sui-timeline`, `sui-editor`
- **Location:** `docs/pages/products/{product-id}/main.tsx`
- **Regions:**
  | Zone | Component |
  |------|-----------|
  | Header | `AppHeader` |
  | Hero | Product-specific showcase (see table below) |
  | Feature chips | `Product.features` rendered as `Chip` links |
  | Footer | `AppFooter` |
- **States:** in-view (intersection observer triggers showcase render), out-of-view (placeholder box)

**Individual showcases:**

| Product | Route | Showcase Component | Location |
|---------|-------|--------------------|----------|
| Stoked UI | `/products/stoked-ui/` | `StokedConsultingShowcase` | `docs/src/components/home/StokedConsultingShowcase.tsx` |
| File Explorer | `/products/file-explorer/` | `FileExplorerShowcase` | `docs/src/components/home/FileExplorerShowcase.tsx` |
| Media | `/products/media/` | `AdvancedShowcase` | `docs/src/components/home/AdvancedShowcase.tsx` |
| Timeline | `/products/timeline/` | `TimelineShowcase` | `docs/src/components/home/TimelineShowcase.tsx` |
| Editor | `/products/editor/` | `EditorShowcase` | `docs/src/components/home/EditorShowcase.tsx` |

### 1.3 Product Documentation Pages

- **Products:** `sui-file-explorer`, `sui-media`, `sui-timeline`, `sui-editor`, `sui-docs`, Mac Mixer, Flux, Always Listening, Stokd Cloud
- **Location:** `docs/pages/products/{product-id}/docs/*.js`
- **Regions:**
  | Zone | Component |
  |------|-----------|
  | Header | `AppHeader` with product context |
  | Sidebar | Auto-generated docs navigation |
  | Main content | Markdown + embedded demos (`Demo`, `DemoEditor`, `ReactRunner`) |
  | API tables | `ApiPage` components (properties, slots, classes) |
  | Footer | `AppFooter` |
- **States:** loading (markdown parse), demo-expanded (code visible), demo-collapsed (preview only), code-variant-toggled (TS/JS), styling-solution-toggled (Emotion/Tailwind/CSS)

### 1.4 Standalone Product Pages (Consulting Site)

- **Products:** Flux, Mac Mixer, Always Listening, Stokd Cloud
- **Location:** `docs/pages/products/{product-id}/main.tsx` for older static product entries; `docs/pages/consulting/products/mac-mixer.tsx` and `docs/src/modules/products/MacMixerProductPage.tsx` for the dedicated Mac Mixer consulting page.
- **Notes:** Public-facing marketing product pages on `stokedconsulting.com`; `stoked-ui.com` requests for consulting-owned product slugs redirect here. Product privacy pages live at `/products/{slug}/privacy` and accept `?l=` locale switches (`en`, `de`, `fr`, `ja`, `zh`, `ko`, `pt-br`, `es`) with English fallback.
- **Regions:** Header, product hero, product-specific content bands, documentation links, footer. Mac Mixer includes a static route/volume preview and alpha release status CTA.
- **States:** static marketing content, responsive hero layout, docs-link navigation

### 1.5 Editor PWA

- **Products:** `sui-editor`
- **Location:** `docs/pages/products/editor/pwa/index.tsx`, `docs/pages/products/editor/pwa/example/index.tsx`
- **Route:** `/products/editor/pwa`, `/products/editor/pwa/example`
- **Regions:**
  | Zone | Component |
  |------|-----------|
  | Full viewport | `EditorComponent` (dynamic import, SSR disabled) — standalone editor embedded as PWA |
- **States:** loading (NoSsr hydration), loaded (full editor)

### 1.6 File Explorer Standalone Example

- **Products:** `sui-file-explorer`
- **Location:** `docs/pages/products/file-explorer/example/index.tsx`
- **Route:** `/products/file-explorer/example`
- **Regions:** Standalone file explorer instance
- **States:** loaded

### 1.7 404 Page

- **Products:** All
- **Location:** `docs/pages/404.tsx`
- **Regions:**
  | Zone | Component |
  |------|-----------|
  | Header | `AppHeaderBanner` + `AppHeader` |
  | Content | `NotFoundHero` — error message with navigation |
  | Footer | `AppFooter` |
- **States:** static (single error state)

### 1.8 About Page

- **Products:** All
- **Location:** `docs/pages/about.tsx`
- **Regions:** Header, about content (team, mission), footer
- **States:** static

---

## 2. Docs Site — Consulting Admin Portal

### 2.1 Admin Dashboard

- **Products:** Docs site (consulting)
- **Location:** `docs/pages/consulting/admin.tsx`
- **Regions:**
  | Zone | Component |
  |------|-----------|
  | Header | `AppHeader` (consulting variant) |
  | Title | Welcome message with user name |
  | Card grid | 8 navigation `Paper` cards with icons: Clients, Products, Users, Invoices, Licenses, Blog, API Docs, Settings |
  | Footer | `AppFooter` |
- **States:** loading (auth check), auth-redirect (unauthenticated → login), authenticated (dashboard visible)

### 2.2 Login Page

- **Products:** Docs site (consulting)
- **Location:** `docs/pages/consulting/login.tsx`
- **Regions:**
  | Zone | Component |
  |------|-----------|
  | Form | Email + password inputs, submit button |
  | Error | Inline error message on failed auth |
- **States:** idle, submitting, error, success (redirect to admin)

### 2.3 Customer Portal

- **Products:** Docs site (consulting)
- **Location:** `docs/pages/consulting/customer.tsx`
- **Regions:** Customer-specific dashboard with deliverables and account info
- **States:** loading, authenticated, unauthenticated (redirect)

### 2.4 Clients List

- **Products:** Docs site (consulting)
- **Location:** `docs/pages/consulting/clients/index.tsx` → `ClientsPage` (dynamic, SSR disabled)
- **Regions:**
  | Zone | Component |
  |------|-----------|
  | Header | `AppHeader` |
  | Toolbar | Add new client button, search/filter |
  | Client cards | `ClientCard` grid — name, contact info, deliverable/invoice counts |
  | Create dialog | Modal with contact mode selection (existing/new/legacy) and form fields |
  | Footer | `AppFooter` |
- **States:** loading, empty (no clients), populated, filtered, dialog-open (create/edit)

### 2.5 Client Detail

- **Products:** Docs site (consulting)
- **Location:** `docs/pages/consulting/clients/[client-slug].tsx` → `ClientDetailPage`
- **Regions:**
  | Zone | Component |
  |------|-----------|
  | Profile header | Client name, contact info, logo |
  | Deliverables table | List of deliverables with type, version, date |
  | Invoices section | Client-specific invoices |
  | Edit button | Opens edit form |
- **States:** loading, populated, editing, not-found

### 2.6 Products Management

- **Products:** Docs site (consulting)
- **Location:** `docs/pages/consulting/products/index.tsx` → `ProductsPage`, `docs/pages/consulting/products/[product-slug].tsx` → `ProductDetailPage`
- **Notes:** Internal product slugs still use the private management shell; consulting-owned product slugs render the public product page instead of the login gate.
- **Regions (list):**
  | Zone | Component |
  |------|-----------|
  | Product table | Name, description, pricing, features, actions |
  | Add button | Create new product |
  | Create/edit dialog | Product form with validation |
- **Regions (detail):**
  | Zone | Component |
  |------|-----------|
  | Form | Name, description, icon, features CRUD, privacy policy editor with localized language variants |
  | Pages section | Product page management with nested pages |
  | Pricing tiers | Pricing configuration |
- **States:** loading, empty, populated, editing, saving, not-found

### 2.7 Users Management

- **Products:** Docs site (consulting)
- **Location:** `docs/pages/consulting/users/index.tsx` → `UsersPage`
- **Regions:**
  | Zone | Component |
  |------|-----------|
  | User list | Email, role, status columns with role filtering |
  | Create form | New user creation dialog with role/permission assignment |
- **States:** loading, empty, populated, creating

### 2.8 Invoices List

- **Products:** Docs site (consulting)
- **Location:** `docs/pages/consulting/invoices/index.tsx` → `InvoiceListPage`
- **Regions:**
  | Zone | Component |
  |------|-----------|
  | Filter bar | Status, date range filters |
  | Invoice table | Amount, date, status, client columns with pagination |
  | Actions | Download, print buttons |
- **States:** loading, empty, populated, filtered, paginated

### 2.9 Invoice Detail

- **Products:** Docs site (consulting)
- **Location:** `docs/pages/consulting/invoices/[id].tsx` → `InvoiceDetailPage`
- **Regions:**
  | Zone | Component |
  |------|-----------|
  | Invoice preview | PDF/HTML render of invoice |
  | Line items | Invoice line items with totals |
  | Actions | Download, print, send to client |
  | Status | Payment status indicator |
- **States:** loading, rendered, sending, not-found

### 2.10 Deliverable Viewer

- **Products:** Docs site (consulting)
- **Location:** `docs/pages/consulting/deliverables/[id].tsx` → `DeliverableViewerPage`
- **Regions:**
  | Zone | Component |
  |------|-----------|
  | Full-screen iframe | HTML deliverable render (sanitized, 100dvh) |
  | Loading overlay | `CircularProgress` spinner |
- **States:** loading (auth check + fetching), auth-redirect (unauthenticated → login), html-render (full iframe), error (null/empty deliverable)

### 2.11 Consulting Service Pages

- **Products:** Docs site (consulting)
- **Location:** `docs/pages/consulting/{front-end,back-end,devops,ai}/main.tsx`
- **Regions:**
  | Zone | Component |
  |------|-----------|
  | Header | `AppHeader` |
  | Hero | `HeroConsulting` (service-specific variant) |
  | Services grid | 6 styled `ServiceCard` components with hover effects |
  | Industries section | Industry focus areas |
  | Footer | `AppFooter` |
- **States:** static (no dynamic state)

### 2.12 Consulting Home

- **Products:** Docs site (consulting)
- **Location:** `docs/pages/consulting/main.tsx`, `docs/pages/consulting/home.tsx`
- **Regions:** Header, hero with interactive file-preview demo, service cards grid, industries, footer
- **States:** static marketing content, responsive hero layout, file-selection preview in hero demo

### 2.13 Licenses Management

- **Products:** Docs site (consulting)
- **Location:** `docs/pages/consulting/licenses.tsx`
- **Regions:** License management list/table with actions
- **States:** loading, populated, error

### 2.14 Billing

- **Products:** Docs site (consulting)
- **Location:** `docs/pages/consulting/billing.tsx`
- **Regions:** Billing information, payment methods
- **States:** loading, populated, error

### 2.15 Settings

- **Products:** Docs site (consulting)
- **Location:** `docs/pages/consulting/settings.tsx`
- **Regions:** Settings forms with toggles and inputs
- **States:** loading, editing, saving, error, success

### 2.16 API Docs

- **Products:** Docs site (consulting)
- **Location:** `docs/pages/consulting/api-docs.tsx`
- **Regions:** OpenAPI/Swagger documentation viewer
- **States:** loading, rendered

### 2.17 Groupies

- **Products:** Docs site (consulting)
- **Location:** `docs/pages/consulting/groupies.tsx`
- **Regions:** Group management interface
- **States:** loaded

### 2.18 Partners

- **Products:** Docs site (consulting)
- **Location:** `docs/pages/consulting/partners/[partnerName].tsx`
- **Regions:** Partner-specific information and offerings
- **States:** loading, loaded, not-found

---

## 3. Docs Site — Blog

### 3.1 Blog Home

- **Products:** `sui-docs`
- **Location:** `docs/pages/blog/index.tsx`
- **Regions:**
  | Zone | Component |
  |------|-----------|
  | Header | `AppHeader` |
  | Post list | Blog post cards with title, excerpt, date, author |
  | Footer | `AppFooter` |
- **States:** loading, empty, populated

### 3.2 Blog Post

- **Products:** `sui-docs`
- **Location:** `docs/pages/blog/[slug].tsx`
- **Regions:**
  | Zone | Component |
  |------|-----------|
  | Header | `AppHeader` |
  | Back button | Navigation back to blog index |
  | Post title + metadata | Title, date, reading time |
  | Authors section | `AuthorsContainer` — author avatars and names |
  | Post content | Markdown-rendered body (`markdown-body` class) |
  | Tags | `Chip` components for post tags |
  | Footer | `HeroEnd` (related posts), `AppFooter` |
- **States:** loading, rendered, not-found

### 3.3 Blog Editor — Post List

- **Products:** `sui-docs`
- **Location:** `docs/pages/blog/editor.tsx`
- **Regions:**
  | Zone | Component |
  |------|-----------|
  | Header | `AppHeader` |
  | Post list | `BlogPostList` (dynamic, SSR disabled) — posts with edit/delete actions |
  | Footer | `AppFooter` |
- **States:** loading, empty, populated

### 3.4 Blog Editor — New Post

- **Products:** `sui-docs`
- **Location:** `docs/pages/blog/editor/new.tsx`
- **Regions:**
  | Zone | Component |
  |------|-----------|
  | Editor form | `BlogEditorForm` — title, slug, tags, author, publish status |
  | Content editor | `BlogMarkdownEditor` — markdown editing |
- **States:** editing, submitting, error, success

### 3.5 Blog Editor — Edit Post

- **Products:** `sui-docs`
- **Location:** `docs/pages/blog/editor/[slug].tsx`
- **Regions:** Same as 3.4, pre-populated with existing post data
- **States:** loading, editing, submitting, error, success

---

## 4. Editor Composite View

### 4.1 Editor (Full Application)

- **Products:** `sui-editor`
- **Location:** `packages/sui-editor/src/Editor/Editor.tsx`
- **Regions:**
  | Zone | Grid Area | Component | Description |
  |------|-----------|-----------|-------------|
  | Preview | `viewer` | `EditorView` | 16:9 canvas with WASM/canvas renderer, screener video element, shadow DOM stage |
  | Controls | `controls` | `EditorControls` | Transport bar: play/pause/record/rewind/FF, volume, time display, rate selector, view toggle |
  | Timeline | `timeline` | `Timeline` (from `sui-timeline`) | Track editing area (height: 37px + 36px per track) |
  | File tabs | `explorer-tabs` | `EditorFileTabs` | Collapsible drawer with Projects + Track Files tabs |
  | Detail modal | overlay | `DetailModal` | Centered card dialog for editing project/track/action properties |
  | Context menu | overlay | `ContextMenu` | Right-click popup (View Detail, Blend Mode, Fit select) |
  | Loader | overlay | `Loader` | Loading spinner + loop video during initialization |
- **States:**
  - Engine: `LOADING`, `READY`, `PLAYING`, `PAUSED`, `RECORDING`
  - View mode: `TIMELINE_VIEW` (timeline visible), `FILE_VIEW` (file explorer visible)
  - Detail: `CLOSED`, `OPEN_PROJECT`, `OPEN_TRACK`, `OPEN_ACTION`, `OPEN_SETTINGS`
  - Fullscreen: `flags.fullscreen` — maximized view
  - File: loaded (file present), unloaded (empty state)

### 4.2 Editor Preview (EditorView)

- **Products:** `sui-editor`
- **Location:** `packages/sui-editor/src/EditorView/EditorView.tsx`
- **Regions:**
  | Zone | Component |
  |------|-----------|
  | Canvas | `Renderer` — HTML canvas for WASM frame rendering |
  | Video element | `Screener` — hidden video for screen capture/screener mode |
  | Shadow stage | `Stage` — hidden shadow DOM for compositing |
  | Hover actions | `EditorViewActions` — floating action buttons (clear, save, open, settings) that fade in on mouse-over |
  | Loader overlay | `Loader` — spinning indicator with loop video background |
- **States:** idle (no content), loading (`engine.isLoading`), rendering (frames active), recording (capture active), preview (settings disabled, loop video shown)

### 4.3 Editor View Actions

- **Products:** `sui-editor`
- **Location:** `packages/sui-editor/src/EditorView/EditorViewActions.tsx`
- **Regions:**
  | Zone | Component |
  |------|-----------|
  | Bottom-left | Clear button (ClearIcon) — discard current file |
  | Bottom-right | Save button (SaveIcon, conditional: file dirty or videoTrack active), Open button (OpenIcon), Settings button (SettingsIcon) |
- **States:** visible (mouse hover), hidden (no hover or detailMode), zoom-fade animation

### 4.4 Editor Controls Bar

- **Products:** `sui-editor`
- **Location:** `packages/sui-editor/src/EditorControls/EditorControls.tsx`
- **Regions:**
  | Zone | Component |
  |------|-----------|
  | Transport | `Controls` — skip-start, rewind, play/stop toggle, fast-forward, skip-end, record (canvas mode only) |
  | View toggle | `ViewToggle` — switch between timeline and file explorer views |
  | Volume | `Volume` — audio volume slider |
  | Time display | `TimeRoot` — digital time (MM:SS.FF) |
  | Rate control | `RateControlRoot` — playback rate dropdown (-10x to +10x, hides on <616px containers) |
- **States:** playing, paused, recording, disabled (`settings.disabled`), responsive (wraps below 581px)

### 4.5 Detail Modal

- **Products:** `sui-editor`
- **Location:** `packages/sui-editor/src/DetailView/DetailView.tsx`
- **Regions:**
  | Zone | Component |
  |------|-----------|
  | Breadcrumbs | `DetailBreadcrumbs` — navigation path (project → track → action) |
  | Close button | `Fab` in top-right corner |
  | Form body | `DetailCombined` routes to one of four sub-panels (see below) |
  | Actions | Save / cancel buttons (when `editMode` active) |
- **Sub-panels:**
  | Panel | Condition | Fields |
  |-------|-----------|--------|
  | `DetailProject` | `selectedType === 'project'` | Name, created date, last modified, description, canvas dimensions, background color (color picker), edit toggle |
  | `DetailTrack` | `selectedType === 'track'` | Track name, blend mode select, hidden/locked/muted checkboxes, video preview (`FileDetailView`), edit toggle |
  | `DetailAction` | `selectedType === 'action'` | Action name, start/end/duration, position (X,Y), scale (X,Y), opacity, rotation, volume, blend mode with live preview |
  | `DetailSettings` | `selectedType === 'settings'` | Raw settings JSON dump, flags JSON dump, components JSON dump |
- **States:** closed (`flags.detailOpen` false), open (one panel active), editing (`editMode` true), read-only, form-dirty

### 4.6 Editor File Tabs

- **Products:** `sui-editor`, `sui-file-explorer`
- **Location:** `packages/sui-editor/src/EditorFileTabs/EditorFileTabs.tsx`
- **Regions:**
  | Zone | Component |
  |------|-----------|
  | Tab bar | MUI Tabs — "Projects" and "Track Files" tabs |
  | Projects panel | Lists saved projects from LocalDb with version/type columns, double-click to load |
  | Track Files panel | Lists media files used in current project tracks with type column, double-click to preview |
- **States:** visible (not detail mode, file loaded), hidden (detail mode or loading), tab-selected (projects/files), project-selected (current file highlighted)

### 4.7 Editor Loader

- **Products:** `sui-editor`
- **Location:** `packages/sui-editor/src/Editor/Loader.tsx`
- **Regions:**
  | Zone | Component |
  |------|-----------|
  | Background | `LoopVideo` — stock-loop.mp4 video with fade animation |
  | Spinner | `LoaderCircle` — dual-circle animation (primary + secondary color, 1s interval) |
- **States:** loading (`EngineState.LOADING`), preview (`settings.disabled`, shows loop video only), hidden (detail mode)

### 4.8 Editor Screener

- **Products:** `sui-editor`
- **Location:** `packages/sui-editor/src/EditorScreener/EditorScreener.tsx`
- **Regions:** Version dropdown select (FormControl + Select)
- **States:** visible (versions exist), hidden (no versions)

### 4.9 WASM Preview Demo

- **Products:** `sui-video-renderer`
- **Location:** `packages/sui-editor/src/WasmPreview/WasmPreviewDemo.tsx`
- **Regions:**
  | Zone | Component |
  |------|-----------|
  | Canvas | Rendering surface for WASM compositor |
  | Layer controls | Add/remove layers, opacity slider, visibility toggle per layer |
  | Actions | Benchmark button, clear canvas button |
  | Metrics | Performance metrics display |
- **States:** idle, rendering, benchmarking, error
- **Note:** Standalone demo component, not integrated into main editor

---

## 5. Timeline View

### 5.1 Timeline (Standalone)

- **Products:** `sui-timeline`, `sui-editor`
- **Location:** `packages/sui-timeline/src/Timeline/Timeline.tsx`
- **Regions:**
  | Zone | Position | Component |
  |------|----------|-----------|
  | Labels panel | Left (275px or hidden) | `TimelineLabels` — per-track `TimelineLabel` (icon, name, `TimelineTrackActions` mute/lock toggles), `SnapControls` in header |
  | Time ruler | Top (37px) | `TimelineTime` — tick marks with scale subdivisions, interactive scrub, zoom controls (top-right) |
  | Track area | Center (flex) | `TimelineTrackArea` — virtualized grid of `TimelineTrack` rows containing `TimelineAction` clips |
  | Playhead | Overlay (z-300) | `TimelineCursor` — draggable SVG triangle + vertical line |
  | Floating labels | Overlay (when no labels) | Absolute-positioned track names (z-200, shows on hover) |
  | Drag lines | Overlay | `TimelineTrackAreaDragLines` — alignment guides during drag |
  | Add track | Bottom | `AddTrackButton` — append new tracks |
  | Keyboard | Non-visual | `KeyDownControls` — Ctrl+Z undo, Ctrl+Y redo |
- **States:**
  - **Loading:** `engine.isLoading` — hides labels and track area
  - **Track states:** visible, hidden, selected (height/opacity change), hovered (label display), locked (disables action drag/resize), muted (reduces opacity), disabled (detail mode + unselected), dim
  - **Action/clip states:** selected (border highlight, resize handles visible), being-dragged, snapped (grid/edge), looping (repeating gradient), flexible (resize enabled), movable (drag enabled)
  - **Layout modes:** expanded (full labels panel), collapsed (`TimelineTrackAreaCollapsed` — merged single track), no-labels (floating labels instead), detail-mode (selected track grows, others shrink)
  - **Snap modes:** grid-snap-on, edge-snap-on, drag-line-on
  - **Zoom:** zoomed-in, zoomed-out (controlled by `ZoomControls` hold-to-repeat buttons)
  - **Playback:** playing (disables all editing), paused, cursor-scrubbing

### 5.2 Timeline Collapsed View

- **Products:** `sui-timeline`
- **Location:** `packages/sui-timeline/src/TimelineTrackArea/TimelineTrackAreaCollapsed.tsx`
- **Regions:** Single merged track visualization using `TimelineFile.collapsedTrack()` to composite all actions
- **States:** collapsed (all tracks merged), drag-line (alignment guides visible)

### 5.3 Timeline Action (Clip)

- **Products:** `sui-timeline`
- **Location:** `packages/sui-timeline/src/TimelineAction/TimelineAction.tsx`
- **Regions:**
  | Zone | Component |
  |------|-----------|
  | Body | Colored background with striped pattern (looping actions) or gradient endpoint marker |
  | Screenshots | `ImageList` of frame thumbnails from media file |
  | Lock badges | `Zoom` badges showing lock icon when track locked |
  | Left handle | `LeftStretch` resize affordance (10px, left edge) |
  | Right handle | `RightStretch` resize affordance (10px, right edge) |
- **States:** selected (border increase, handles visible), hovered (label opacity), disabled, dim, locked (drag/resize disabled), looping (repeating gradient), playing (interaction disabled)

### 5.4 Timeline Player

- **Products:** `sui-timeline`
- **Location:** `packages/sui-timeline/src/TimelinePlayer/TimelinePlayer.tsx`
- **Regions:**
  | Zone | Component |
  |------|-----------|
  | Skip start | SkipPreviousIcon button |
  | Play/Pause | PlayArrowIcon / PauseIcon toggle |
  | Skip end | SkipNextIcon button |
  | Time display | Formatted MM:SS.MS |
  | Speed control | Select dropdown (0.2x, 0.5x, 1.0x, 1.5x, 2.0x) |
- **States:** playing (pause icon), paused (play icon), auto-scroll (scroll-to-cursor during playback)

---

## 6. File Explorer Views

### 6.1 FileExplorer (Full)

- **Products:** `sui-file-explorer`, `sui-editor`
- **Location:** `packages/sui-file-explorer/src/FileExplorer/FileExplorer.tsx`
- **Regions:**
  | Zone | Component |
  |------|-----------|
  | Tree view | `<ul>` hierarchy — `File` items as `<li>` with icons, labels, checkboxes |
  | Grid headers | `FileExplorerGridHeaders` — column headers (name, size, lastModified) when `grid={true}` |
  | Grid columns | `FileExplorerGridColumns` — metadata columns per file item |
  | Dropzone | `FileDropzone` — "drag and drop files here" overlay when `dropzone={true}` |
- **View Modes:**
  - **Tree mode** (default): Hierarchical with indentation (`itemChildrenIndentation`, default 12px), collapsible folders
  - **Grid mode** (`grid={true}`): Multi-column table layout with headers, alternating row classes (`.Mui-odd`/`.Mui-even`)
- **States:** tree-mode, grid-mode, expanded (folder open), collapsed (folder closed), selected (single/multi via `checkboxSelection`/`multiSelect`), focused, disabled, dnd-idle, dnd-dragging, dnd-preview, dnd-parent-of-instruction, drop-target-active

### 6.2 FileExplorerBasic

- **Products:** `sui-file-explorer`
- **Location:** `packages/sui-file-explorer/src/FileExplorerBasic/FileExplorerBasic.tsx`
- **Regions:**
  | Zone | Component |
  |------|-----------|
  | Tree view | Simplified `<ul>` hierarchy with `FileElement` items (JSX children-based, not items array) |
- **States:** expanded, collapsed, selected, focused

### 6.3 FileExplorerTabs

- **Products:** `sui-file-explorer`, `sui-editor`
- **Location:** `packages/sui-file-explorer/src/FileExplorerTabs/FileExplorerTabs.tsx`
- **Regions:**
  | Zone | Component |
  |------|-----------|
  | Tab bar | MUI `TabList` — tab buttons for each file group |
  | Tab panels | `ExplorerPanel` — `FileExplorer` instance per tab |
- **Variants:** `standard` (static tabs), `drawer` (collapsible bottom panel, 49px mini → 300px full)
- **States:** tab-selected, drawer-open, drawer-collapsed, empty-tab (no TabPanel shown)

### 6.4 File Item

- **Products:** `sui-file-explorer`
- **Location:** `packages/sui-file-explorer/src/File/File.tsx`
- **Regions:**
  | Zone | Component |
  |------|-----------|
  | Drop indicator | `DropIndicator` — drag-drop guidance |
  | Checkbox | `FileCheckbox` — selection checkbox (when `checkboxSelection` enabled) |
  | Label | `FileLabel` — `FileIconContainer` (maps mediaType to icon: folder, image, video, audio, pdf, doc, lottie, project, trash) + text |
  | Grid columns | `FileExplorerGridColumns` (grid mode only) |
  | Children | `TransitionComponent` (Collapse) — nested file items |
- **States:** expanded, selected, focused, disabled, grid/list mode, odd/even row alternation

### 6.5 FileElement (Tree Item)

- **Products:** `sui-file-explorer`
- **Location:** `packages/sui-file-explorer/src/FileElement/FileElement.tsx`
- **Regions:**
  | Zone | Component |
  |------|-----------|
  | Expansion icon | Toggle arrow (visible when expandable + has children) |
  | Content | `FileElementContent` — expansion icon + label + end icon |
  | Children group | `FileElementGroup` (MUI Collapse animation) |
- **States:** expanded, selected, focused, disabled
- **Accessibility:** `role="treeitem"`, `aria-expanded`, `aria-selected`, `aria-disabled`

---

## 7. Media Views

### 7.1 MediaViewer

- **Products:** `sui-media`
- **Location:** `packages/sui-media/src/components/MediaViewer/index.tsx`
- **Regions:**
  | Zone | Component |
  |------|-----------|
  | Header | `MediaViewerHeader` — title/metadata bar (`VideoTitleBar` for video, `MediaInfo` for images), close button, theater exit button |
  | Primary display | `MediaViewerPrimary` — video or image renderer with prev/next navigation buttons, skeleton loader, quality selector overlay |
  | Next up queue | `NextUpHeader` — preview cards (only in NORMAL mode when `enableQueue` true) |
  | Quality selector | `QualitySelector` — gear icon overlay for adaptive bitrate (480p, 720p, 1080p, 4K, auto) |
  | Now playing | `NowPlayingIndicator` — current playback status |
- **View Modes (FSM):**
  | Mode | Dimensions | Behavior |
  |------|-----------|----------|
  | `NORMAL` (0) | 90vw max, rounded corners | Preview cards visible, embedded feel |
  | `THEATER` (1) | 100vw, 95vh | No preview cards, maximized viewport |
  | `FULLSCREEN` (2) | 100vw, 100vh | Browser fullscreen API |
- **State Transitions:** `CYCLE` (cycles through), `ENTER_THEATER`, `ENTER_FULLSCREEN`, `EXIT_TO_NORMAL`, `EXIT_FULLSCREEN`, `RESET`
- **States:** loading (`CircularProgress` + "Loading media from server..."), error (`Alert` with message), content (header + primary + queue), quality-switching (spinner during switch)
- **Keyboard Shortcuts:** ArrowLeft/Right (prev/next), Escape (exit to normal), `f` (cycle fullscreen), `q` (cycle quality)
- **Controls Visibility:** Mouse move/enter shows controls (3s timeout), double-click cycles fullscreen

### 7.2 MediaGallery

- **Products:** `sui-media`
- **Location:** `packages/sui-media/src/components/MediaGallery/MediaGallery.tsx`
- **Regions:**
  | Zone | Component |
  |------|-----------|
  | Grid | `Masonry` layout — responsive columns (`xs:1, sm:2, md:3, lg:4`), customizable gap |
  | Cards | `MediaCard` instances per item |
  | Integrated viewer | `MediaViewer` dialog — opens on card click, navigates between gallery items |
- **Data Sources:** Direct array (`source.data`), REST endpoint (`source.endpoint`), S3 bucket proxy (`source.s3Bucket`)
- **Mode States:**
  | Mode | Behavior |
  |------|----------|
  | `view` | Normal browsing, click opens viewer |
  | `select` | Selection mode with checkboxes, multi-select |
- **States:** loading (`CircularProgress`), error (`Alert`), populated (masonry grid), viewer-open (full-screen viewer dialog)

### 7.3 MediaCard

- **Products:** `sui-media`
- **Location:** `packages/sui-media/src/components/MediaCard/MediaCard.tsx`
- **Regions:**
  | Zone | Component |
  |------|-----------|
  | Thumbnail | `CardMedia` — image or video frame preview |
  | Progress bar | `VideoProgressBar` — playback progress overlay (videos only) |
  | Thumbnail strip | `ThumbnailStrip` — horizontal sprite-sheet frame strip on hover |
  | Metadata | Title, duration overlay, publicity badge (Public/Private/Paid), view count |
  | Selection checkbox | Top-left overlay (when `globalSelectionMode` active) |
  | Hover controls | Play, Edit, Delete, Toggle Public, Toggle Adult Content buttons (on hover, owner-only for edit/delete) |
- **Display Modes:** `otherContent`, `myContent`, `featured`, `squareMode` (1:1 aspect), `minimalMode` (reduced controls)
- **States:** idle, hovered (thumbnail strip + controls visible), selected (in selection mode), playing (progress bar active), requires-payment (payment flow on click for non-owners)

### 7.4 VideoProgressBar

- **Products:** `sui-media`
- **Location:** `packages/sui-media/src/components/MediaCard/VideoProgressBar.tsx`
- **Regions:**
  | Zone | Component |
  |------|-----------|
  | Fill bar | Red progress fill (3px, 6px on hover) |
  | Hover zone | Invisible 100px hit area for thumbnail triggering |
  | Scrubber | Circle handle at fill end (visible on hover/drag, scale 1.2 when dragging) |
  | Time tooltip | MM:SS or HH:MM:SS positioned above bar (when no sprite sheet) |
  | Thumbnail strip | `ThumbnailStrip` — sprite preview on hover (when `spriteUrl && spriteConfig` provided) |
- **States:** idle, hover (time tooltip visible), dragging (scrubber active, document-level listeners), seeking (click to position)

---

## 8. GitHub Views

### 8.1 GitHub Contribution Calendar

- **Products:** `sui-github`
- **Location:** `packages/sui-github/src/GithubCalendar/GithubCalendar.tsx`
- **Regions:**
  | Zone | Component |
  |------|-----------|
  | Calendar heatmap | 7-column grid of color-coded contribution blocks (`ActivityCalendar` from `react-activity-calendar`) |
  | Labels | Day/month labels on hover |
- **States:** loading (fetching from API), rendered, hover (labels visible), animated (punch/highlight effects with random delay), responsive (windowMode vs containerMode block sizing), light/dark theme variants

### 8.2 GitHub Events Feed

- **Products:** `sui-github`
- **Location:** `packages/sui-github/src/GithubEvents/GithubEvents.tsx`
- **Regions:**
  | Zone | Component |
  |------|-----------|
  | Search/filter bar | Repo select, date range selector, event type filter |
  | Events list | Event cards by type (see table below) |
  | Pagination | Page controls |
  | Timezone display | Current timezone indicator |
- **Event Type Renderers** (in `packages/sui-github/src/GithubEvents/EventTypes/`):
  | Type | Component |
  |------|-----------|
  | PullRequestEvent | `PullRequestEvent.tsx` — PR summary with commit list and file changes |
  | PushEvent | `PushEvent.tsx` |
  | IssuesEvent | `IssuesEvent.tsx` |
  | IssueCommentEvent | `IssueCommentEvent.tsx` |
  | CreateEvent | `CreateEvent.tsx` |
  | DeleteEvent | `DeleteEvent.tsx` |
  | ForkEvent | `ForkEvent.tsx` |
  | ProjectsV2Event | `ProjectsV2Event.tsx` |
  | ProjectsV2ItemEvent | `ProjectsV2ItemEvent.tsx` |
  | ProjectsV2ColumnEvent | `ProjectsV2ColumnEvent.tsx` |
  | ProjectsV2FieldEvent | `ProjectsV2FieldEvent.tsx` |
- **States:** loading, error, empty, populated, filtered, paginated

### 8.3 Pull Request Detail

- **Products:** `sui-github`
- **Location:** `packages/sui-github/src/GithubEvents/EventTypes/PullRequest/PullRequestView.tsx`
- **Regions:**
  | Zone | Component |
  |------|-----------|
  | PR header | Title, number, status |
  | Commits tab | `CommitsList` — list of commits in the PR |
  | File changes tab | `FileChanges` — diff viewer for changed files |
- **States:** commits-tab-active, file-changes-tab-active

---

## 9. Shared UI Components (Cross-Cutting Views)

### 9.1 App Header

- **Products:** All docs site pages
- **Location:** `docs/src/layouts/AppHeader.tsx`
- **Regions:**
  | Zone | Component |
  |------|-----------|
  | Banner | `AppHeaderBanner` — dismissible announcement strip |
  | Logo | Stoked UI / Stoked Consulting branding |
  | Nav menu | Product menu, Docs menu, Consulting menu (`ProductMenu` with `Popper` dropdowns) |
  | Search | `DeferredAppSearch` |
  | Theme toggle | Light/dark mode button |
  | User menu | `UserMenu` — avatar, settings, sign out |
- **States:** menu-open (popper visible with fade transition), menu-closed, mobile (hamburger), desktop (full nav), sticky (fixed position)

### 9.2 User Menu

- **Products:** `sui-common`
- **Location:** `packages/sui-common/src/UserMenu/UserMenu.tsx`
- **Regions:**
  | Zone | Component |
  |------|-----------|
  | Avatar trigger | Initials avatar button with name/role label |
  | Dropdown menu | Popup with Settings, Licenses, Billing, Sign Out items |
- **States:** closed, open (menu anchored to avatar), hover

### 9.3 Social Links

- **Products:** `sui-common`
- **Location:** `packages/sui-common/src/SocialLinks/SocialLinks.tsx`
- **Regions:**
  | Zone | Component |
  |------|-----------|
  | Link fields | `SocialLinkField` per platform (Instagram, X, YouTube, etc.) — icon + label + text input with prefix adornment |
- **States:** controlled, uncontrolled, disabled, readOnly

### 9.4 Demo Viewer (Documentation)

- **Products:** `sui-docs`
- **Location:** `packages/sui-docs/src/components/Demo.tsx`, `DemoEditor.tsx`, `DemoSandbox.tsx`, `DemoToolbar.tsx`
- **Regions:**
  | Zone | Component |
  |------|-----------|
  | Preview | `ReactRunner` or `DemoSandbox` (iframe with Joy UI / standard MUI theme) — live component render |
  | Toolbar | `DemoToolbar` — styling solution dropdown, language toggle (JS/TS), visibility controls, edit buttons (StackBlitz, CodeSandbox, Copy), reset, more menu |
  | Code editor | `DemoEditor` — editable Prism-highlighted code block with scroll container and keyboard hint overlay |
  | Error display | `DemoEditorError` — positioned overlay alert on render failure |
- **States:** preview-only (code hidden), code-visible, editing (live code changes), error (render failure), variant-toggled (TS/JS), styling-toggled, iframe-loaded/not-loaded, RTL-direction

### 9.5 Code Viewers

- **Products:** `sui-docs`
- **Location:** `packages/sui-docs/src/components/HighlightedCode.tsx`, `HighlightedCodeWithTabs.tsx`, `DemoCodeViewer/index.tsx`
- **Regions:**
  | Zone | Component |
  |------|-----------|
  | Code block | Prism syntax-highlighted content with copy button |
  | Tab bar | `HighlightedCodeWithTabs` — multiple language/variant tabs with underline indicator, persistent selection via localStorage |
  | Tab panels | Code block per tab |
- **States:** copied (button feedback), tab-selected

### 9.6 Markdown Renderer

- **Products:** `sui-docs`
- **Location:** `packages/sui-docs/src/components/MarkdownElement.tsx`, `RichMarkdownElement.tsx`
- **Regions:** Renders HTML from markdown — headings, code blocks, tables, blockquotes, lists, callouts, links, keyboard hints
- **RichMarkdownElement routing:** Routes markdown sections to `MarkdownElement`, `HighlightedCodeWithTabs`, custom components, or `Demo`
- **States:** rendered (static content)

### 9.7 GrokLoader

- **Products:** `sui-common`
- **Location:** `packages/sui-common/src/GrokLoader/GrokLoader.tsx`
- **Regions:** Single animated region — 3 dots in triangle formation using framer-motion
- **States:** animating (continuous — radius, rotation, scale keyframes)

### 9.8 VideoDb Viewer

- **Products:** `sui-common`
- **Location:** `packages/sui-common/src/LocalDb/VideoDb.tsx`
- **Regions:**
  | Zone | Component |
  |------|-----------|
  | Loading | `GrokLoader` spinner |
  | Video list | Video name + `<video>` player elements from IndexedDB |
- **States:** loading (IndexedDB fetch), loaded (video list rendered), error

### 9.9 InfoCard

- **Products:** `sui-docs`
- **Location:** `packages/sui-docs/src/InfoCard/InfoCard.tsx`
- **Regions:** Icon with glow effect, title, description, optional page link
- **States:** dense layout, default layout

### 9.10 WebUserDirectChat

- **Products:** `sui-media`
- **Location:** `packages/sui-media/src/components/WebUserDirectChat/WebUserDirectChat.tsx`
- **Regions:** Conversational intake transcript, live message transcript, composer, retry/start-over footer for handshake failures
- **States:** idle, collecting (user entering data), loading (sending), live (Telegram-backed chat open), complete (one-shot providers), error (submission failed)

---

## 10. Docs Site — Secondary Pages

### 10.1 Premium Theme Pages

- **Products:** `sui-docs`
- **Location:** `docs/pages/premium-themes/onepirate/`, `docs/pages/premium-themes/paperbase/`
- **Regions:** Full standalone theme demonstrations (sign-in, sign-up, forgot-password, privacy, terms, dashboard)
- **States:** per-page form states (idle, submitting, error, success)

### 10.2 Pricing Page

- **Products:** Docs site
- **Location:** `docs/pages/pricing.tsx`
- **Regions:** Header, pricing grid, footer
- **States:** static

### 10.3 CLI Auth Page

- **Products:** Docs site
- **Location:** `docs/pages/cli/auth.tsx`
- **Regions:** CLI authentication documentation/instructions
- **States:** static

### 10.4 Feedback Page

- **Products:** All products
- **Location:** `docs/pages/products/feedback.tsx`
- **Regions:** Feedback form (product selector, message input, submit)
- **States:** idle, submitting, submitted, error

### 10.5 GitHub Integration Pages

- **Products:** `sui-github`
- **Location:** `docs/pages/github/main.tsx`, `docs/pages/github/docs/*.js`
- **Regions:** Header, hero, docs content (calendar, events, roadmap, overview)
- **States:** standard doc page states

### 10.6 Video Renderer Docs

- **Products:** `sui-video-renderer`
- **Location:** `docs/pages/video-renderer/docs/*.js`
- **Regions:** Standard documentation layout with WASM-specific content
- **States:** standard doc page states

### 10.7 Experiment Pages

- **Products:** `sui-docs`
- **Location:** `docs/pages/experiments/base/` (components-gallery, listbox, menu, popup, tabs, use-host-element-name), `docs/pages/experiments/website/branding-theme-test.tsx`
- **Regions:** Isolated component testing/preview environments
- **States:** loaded (component test state)

### 10.8 Components Gallery

- **Products:** Docs site
- **Location:** `docs/pages/components.tsx`
- **Regions:** Component showcase and gallery
- **States:** loaded

### 10.9 Subscription Page

- **Products:** Docs site
- **Location:** `docs/pages/subscription.tsx`
- **Regions:** Subscription options and management
- **States:** loaded

### 10.10 Templates / Design Kits

- **Products:** Docs site
- **Location:** `docs/pages/templates.tsx`, `docs/pages/design-kits.tsx`
- **Regions:** Template/design-kit gallery
- **States:** loaded

---

## 11. CDN Admin App

### 11.1 CDN File Browser

- **Products:** CDN admin (internal)
- **Location:** `packages-internal/cdn/src/App.jsx`
- **URL:** `cdn.stokedconsulting.com`
- **Regions:**
  | Zone | Component |
  |------|-----------|
  | Breadcrumb navigation | Current directory path |
  | Search/filter bar | File search with deferred state |
  | File list | Directory browsing with file metadata |
  | Upload zone | Multipart file upload with progress tracking and resumption |
  | Actions toolbar | Delete, move, export (zip download) operations |
- **States:** browsing (directory listing), searching (filtered results), uploading (progress tracking), authenticated (session from docs site), role-restricted (admin/client/agent/subscriber visibility)

---

## View Count Summary

| Category | View Count |
|----------|-----------|
| Public product pages | 10 |
| Product documentation pages | ~20 |
| Consulting admin views | 18 |
| Blog views | 5 |
| Editor composite views | 9 |
| Timeline views | 4 |
| File explorer views | 5 |
| Media views | 4 |
| GitHub views | 3 |
| Shared cross-cutting views | 10 |
| Secondary/misc pages | 10 |
| CDN admin views | 1 |
| **Total distinct views** | **~99** |
