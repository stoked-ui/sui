# Stoked UI — User Flow Classification

> **Generated:** 2026-03-17 | **Updated:** 2026-03-17 | **Meta version:** 0.2.0
> **Repository:** `@stoked-ui/sui`
> **Root:** `/opt/worktrees/stoked-ui/stoked-ui-main`

---

## 1. Product Discovery & Marketing Flows

### 1.1 Product Showcase Browsing

- **Actor:** Visitor (unauthenticated)
- **Goal:** Discover Stoked UI component library capabilities
- **Steps:**
  1. Land on home page — random product showcase auto-selected
  2. Switch between products via `ProductsSwitcher` in the preview grid
  3. Interact with live embedded component demos (FileExplorer, Timeline, Editor, Media)
  4. Click product feature chips to navigate to documentation
  5. Navigate to individual product showcase pages for deeper demos
- **Views:** 1.1 Home Page, 1.2 Product Showcase Pages
- **Products:** `sui-file-explorer`, `sui-media`, `sui-timeline`, `sui-editor`, `sui-docs`
- **Entry points:** Direct URL `stoked-ui.com`, search engine landing

### 1.2 Documentation Browsing

- **Actor:** Developer
- **Goal:** Learn component APIs, integration patterns, and usage examples
- **Steps:**
  1. Navigate to product docs via header nav or product showcase feature chips
  2. Browse sidebar navigation for topics (getting started, API reference, demos)
  3. Interact with live `Demo` components — toggle code visibility, switch TS/JS, change styling solution
  4. Edit demo code inline via `DemoEditor` with live preview
  5. Open demos in external sandboxes (StackBlitz, CodeSandbox) for deeper experimentation
  6. Reference `ApiPage` tables for props, slots, and CSS classes
- **Views:** 1.3 Product Documentation Pages, 9.4 Demo Viewer, 9.5 Code Viewers, 9.6 Markdown Renderer
- **Products:** `sui-file-explorer`, `sui-media`, `sui-timeline`, `sui-editor`, `sui-docs`, `sui-github`, `sui-video-renderer`
- **Entry points:** Header nav "Docs" menu, product showcase feature chip links, direct URL `/products/{product-id}/docs/*`

### 1.3 Consulting Service Discovery

- **Actor:** Prospective client (unauthenticated)
- **Goal:** Evaluate Stoked Consulting service offerings
- **Steps:**
  1. Land on consulting home — random service page displayed
  2. Browse service-specific pages (Front End, Back End, DevOps, AI)
  3. View service cards with hover details for each specialization
  4. Review standalone product pages (Flux, Mac Mixer, Always Listening, Stokd Cloud)
  5. Navigate to pricing or contact information
- **Views:** 2.11 Consulting Service Pages, 2.12 Consulting Home, 1.4 Standalone Product Pages, 10.2 Pricing Page
- **Products:** Docs site (consulting)
- **Entry points:** Direct URL `stokedconsulting.com`, consulting nav menu in header

---

## 2. Authentication Flows

### 2.1 Web Login

- **Actor:** Registered user (admin, client, agent, subscriber)
- **Goal:** Authenticate to access protected portal areas
- **Steps:**
  1. Navigate to login page or get redirected from a protected route
  2. Enter email + password, or click Google OAuth button
  3. For email: `POST /api/auth/login` → server sets `stoked_auth` HTTP-only cookie
  4. For Google: `POST /api/auth/google` → Lambda validates token → sets cookie
  5. Redirect to appropriate portal based on role (admin → admin dashboard, client → customer portal)
  6. Cross-origin session transfer: if navigating between `stoked-ui.com` and `stokedconsulting.com`, a 5-minute JWT transfer token syncs the session via `/api/auth/transfer` → `/api/auth/exchange`
- **Views:** 2.2 Login Page, 2.1 Admin Dashboard (post-login redirect), 2.3 Customer Portal (post-login redirect)
- **Products:** Docs site (consulting)
- **Entry points:** URL `/consulting/login`, redirect from any authenticated route, cross-origin navigation

### 2.2 CLI Authentication

- **Actor:** Developer using `stoked` CLI tool
- **Goal:** Obtain API key for programmatic access to Stoked APIs
- **Steps:**
  1. Run CLI auth command — CLI starts local HTTP server on ephemeral port
  2. CLI opens browser to `/cli/auth?port={port}&state={state}`
  3. User authenticates in browser (if not already logged in, redirected to login)
  4. Browser sends authorization callback to CLI's local server
  5. CLI receives API key via `POST /api/auth/cli/authorize`
  6. CLI stores API key locally for subsequent requests
- **Views:** 10.3 CLI Auth Page, 2.2 Login Page (if not authenticated)
- **Products:** Docs site (consulting), `stoked-cli` (internal)
- **Entry points:** CLI command `stoked auth`

### 2.3 User Registration

- **Actor:** New user (invited or self-registering)
- **Goal:** Create an account on the platform
- **Steps:**
  1. Navigate to registration endpoint or be invited by admin
  2. Provide email, password, and profile information
  3. `POST /api/auth/register` creates account
  4. Role auto-assigned: admin for `AUTH_AUTO_DOMAINS` emails, otherwise `totally stoked` (default)
  5. Redirected to appropriate portal
- **Views:** 2.2 Login Page (registration form variant)
- **Products:** Docs site (consulting)
- **Entry points:** Registration link, admin invitation

---

## 3. Video Editing Flows

### 3.1 Project Creation

- **Actor:** Editor user
- **Goal:** Create a new video editing project with media tracks
- **Steps:**
  1. Open Editor component (via PWA or embedded instance)
  2. Editor initializes: `EngineState.LOADING` → Loader displayed with loop video
  3. Add media files via "Add Files" button → `MediaFile.openDialog()` opens file picker
  4. Selected files processed: `extractMetadata()` extracts duration, dimensions, thumbnails
  5. `getTracksFromMediaFiles()` converts files to `EditorTrack` objects with controllers
  6. Tracks dispatched via `SET_TRACKS` action → Timeline renders with populated tracks
  7. Engine transitions: `LOADING` → `READY` → canvas renders first frame
  8. Project auto-saved to IndexedDB via `LocalDb`
- **Views:** 4.1 Editor (Full Application), 4.2 Editor Preview, 4.7 Editor Loader, 4.6 Editor File Tabs, 5.1 Timeline
- **Products:** `sui-editor`, `sui-timeline`, `sui-media`, `sui-file-explorer`
- **Entry points:** URL `/products/editor/pwa`, Editor component mount in any host app

### 3.2 Timeline Editing

- **Actor:** Editor user
- **Goal:** Arrange, trim, and position media clips on the timeline
- **Steps:**
  1. View tracks in timeline — each track is a horizontal lane with action clips
  2. **Move clip:** Drag action left/right → `onActionMoving` callback → new start/end times calculated → `UPDATE_ACTION` dispatched
  3. **Trim clip:** Drag left/right edge of action → `onActionResizing` → action duration updated
  4. **Select clip:** Click action → `SELECT_ACTION` dispatched → border highlight + resize handles visible
  5. **Reorder tracks:** Drag track labels to reorder stacking (z-order affects canvas compositing)
  6. **Toggle snap:** Enable grid-snap or edge-snap via `SnapControls` for precise alignment
  7. **Zoom timeline:** Use `ZoomControls` (hold-to-repeat) to adjust time scale
  8. **Scrub playhead:** Click timeline ruler or drag `TimelineCursor` to navigate to specific time
  9. **Undo/Redo:** Ctrl+Z / Ctrl+Y via `KeyDownControls`
  10. Engine re-renders canvas after each edit when `autoReRender` enabled
- **Views:** 5.1 Timeline, 5.3 Timeline Action (Clip), 5.4 Timeline Player, 4.1 Editor
- **Products:** `sui-timeline`, `sui-editor`
- **Entry points:** Timeline region within Editor component

### 3.3 Detail Editing (Track/Action Properties)

- **Actor:** Editor user
- **Goal:** Fine-tune individual track or action properties
- **Steps:**
  1. Click track label → `SELECT_TRACK` + `DETAIL_OPEN` dispatched → DetailModal opens
  2. Navigate breadcrumbs: project → track → action
  3. **Project properties:** Edit name, description, canvas dimensions, background color (color picker)
  4. **Track properties:** Edit blend mode (select), toggle hidden/locked/muted, view video preview
  5. **Action properties:** Edit start/end/duration, position (X,Y), scale (X,Y), opacity, rotation, volume with live preview
  6. Right-click action on timeline → context menu with "View Detail", "Blend Mode", "Fit" options
  7. **Screener mode:** In detail view, engine switches to `PlaybackMode.TRACK_FILE` — plays single track's media in video element with playback controls
  8. Close detail view → `DISPLAY_CANVAS` → returns to full canvas composite
- **Views:** 4.5 Detail Modal, 4.3 Editor View Actions, 4.4 Editor Controls Bar, 5.1 Timeline
- **Products:** `sui-editor`, `sui-timeline`
- **Entry points:** Click track label, right-click action context menu, Editor View hover actions

### 3.4 Playback & Preview

- **Actor:** Editor user
- **Goal:** Preview the composed video project in real-time
- **Steps:**
  1. Click play button in transport controls → `Engine.play()` called
  2. Engine state → `PLAYING` → `requestAnimationFrame` loop starts
  3. Each frame: active actions determined from `_activeIds` BTree
  4. Controllers render: `VideoController` draws video frames, `AudioController` manages audio, `ImageController` displays static images
  5. `CompositorController` stacks layers by z-index, applies blend modes, renders to canvas
  6. Playhead cursor updates position via `setTimeByTick` event
  7. Timeline auto-scrolls to follow cursor during playback
  8. User adjusts playback rate via rate dropdown (-10x to +10x)
  9. Click pause → engine stops tick loop, last frame held on canvas
  10. Optional WASM renderer: `PreviewRenderer.render_frame()` for complex scenes
- **Views:** 4.2 Editor Preview, 4.4 Editor Controls Bar, 5.1 Timeline, 5.4 Timeline Player
- **Products:** `sui-editor`, `sui-timeline`, `sui-video-renderer`
- **Entry points:** Play button in Editor Controls or Timeline Player

### 3.5 Video Export / Recording

- **Actor:** Editor user
- **Goal:** Render the project to a downloadable video file
- **Steps:**
  1. Click record button in Editor Controls (canvas mode only)
  2. Engine state → `RECORDING`
  3. `MediaRecorder` initialized with canvas stream
  4. Timeline plays end-to-end — each frame captured from canvas
  5. On playback end: `MediaRecorder.stop()` → `VIDEO_CREATED` dispatched
  6. Video added to `state.settings.videos` and saved to IndexedDB
  7. Video accessible via `EditorScreener` version dropdown
  8. User can download or switch `PlaybackMode.MEDIA` to view exported video
- **Views:** 4.1 Editor, 4.2 Editor Preview, 4.4 Editor Controls Bar, 4.8 Editor Screener
- **Products:** `sui-editor`, `sui-video-renderer`
- **Entry points:** Record button in Editor Controls

### 3.6 Project File Management

- **Actor:** Editor user
- **Goal:** Browse, load, and manage saved projects and track files
- **Steps:**
  1. Toggle file explorer drawer via `ViewToggle` in Editor Controls
  2. **Projects tab:** Browse saved projects from IndexedDB — name, version, type columns
  3. Double-click project to load → `SET_FILE` action → timeline repopulated
  4. **Track Files tab:** Browse media files in current project — name, type columns
  5. Double-click track file to preview in detail screener
  6. Save current project via hover save button in `EditorViewActions`
  7. Clear project via hover clear button → discard current file
  8. Open new file via hover open button
- **Views:** 4.6 Editor File Tabs, 4.3 Editor View Actions, 6.1 FileExplorer
- **Products:** `sui-editor`, `sui-file-explorer`, `sui-common` (LocalDb)
- **Entry points:** View toggle in Editor Controls, hover actions on Editor Preview

---

## 4. File Explorer Flows

### 4.1 File Tree Navigation

- **Actor:** Application user (via any host component embedding FileExplorer)
- **Goal:** Browse and select files in a hierarchical tree
- **Steps:**
  1. View file tree — folders and files with media-type icons
  2. Click folder icon or content to expand/collapse (`toggleItemExpansion`)
  3. Click file to select → `handleSelection()` → `SELECT_ITEM` dispatched
  4. Multi-select: Shift+Click for range, Ctrl+Click to toggle individual
  5. Keyboard navigation: Arrow keys for focus, Enter for select, Home/End for first/last
  6. Optional grid mode: view metadata columns (size, lastModified) alongside tree
  7. Optional checkbox mode: toggle checkboxes for batch selection
- **Views:** 6.1 FileExplorer (Full), 6.4 File Item, 6.2 FileExplorerBasic
- **Products:** `sui-file-explorer`
- **Entry points:** FileExplorer component mount, standalone example at `/products/file-explorer/example`

### 4.2 Drag-and-Drop File Management

- **Actor:** Application user
- **Goal:** Reorder files or import new files via drag-and-drop
- **Steps:**
  1. **Internal DnD:** Drag file within explorer → reorder via `updateState({type: 'instruction'})` → post-move flash animation
  2. **External DnD:** Drag file from desktop → `dropTargetForExternal()` detects `containsFiles()` → validates MIME types against `dndFileTypes`
  3. Accepted files: `createChildren(files, targetId)` → `onAddFiles` callback fired with `FileBase[]`
  4. Rejected files: `getRejectionReason()` returns error
  5. **Trash DnD:** Drop on trash zone (when `dndTrash` enabled) → `removeItem(id)` called
  6. Drop indicators guide user to valid drop positions
- **Views:** 6.1 FileExplorer (Full), 6.4 File Item
- **Products:** `sui-file-explorer`
- **Entry points:** Drag interaction within FileExplorer component

---

## 5. Media Flows

### 5.1 Media Browsing & Viewing

- **Actor:** Authenticated user
- **Goal:** Browse media gallery, view individual items in full viewer
- **Steps:**
  1. Browse media in `MediaGallery` masonry grid — responsive columns adapt to screen size
  2. Hover over `MediaCard` → thumbnail strip preview, playback controls appear
  3. Click card → `MediaViewer` dialog opens in NORMAL mode (90vw, rounded corners)
  4. Navigate between items using prev/next buttons or ArrowLeft/ArrowRight keys
  5. Cycle view modes: `f` key → NORMAL → THEATER (100vw, 95vh) → FULLSCREEN (browser API)
  6. For video: playback with `VideoProgressBar` scrubbing, time tooltip, thumbnail sprite preview on hover
  7. Switch quality: `q` key or gear icon → `QualitySelector` (480p, 720p, 1080p, 4K, auto)
  8. Escape → exit to NORMAL mode
- **Views:** 7.2 MediaGallery, 7.3 MediaCard, 7.1 MediaViewer, 7.4 VideoProgressBar
- **Products:** `sui-media`
- **Entry points:** MediaGallery component mount, direct media URL

### 5.2 Media Upload (Resumable Multipart)

- **Actor:** Authenticated user (admin or content creator)
- **Goal:** Upload media files to the platform with progress tracking and resume support
- **Steps:**
  1. Initiate upload: `POST /api/cdn/upload/initiate` with filename, MIME type, total size, optional SHA-256 hash
  2. Server returns `sessionId`, `uploadId`, first batch of presigned S3 URLs (chunk size: 10 MB default)
  3. Client uploads parts directly to S3 via presigned URLs
  4. Each completed part: `POST /api/cdn/upload/{sessionId}/part/{partNumber}` registers ETag with backend
  5. Monitor progress: `GET /api/cdn/upload/{sessionId}/status` → progress %, pending parts, fresh presigned URLs
  6. If interrupted: resume by checking status and uploading remaining pending parts
  7. Finalize: `POST /api/cdn/upload/{sessionId}/complete` → creates media document → returns `mediaId`
  8. Hash-based deduplication prevents re-uploading identical files
  9. Sessions expire after 7 days if incomplete
- **Views:** 11.1 CDN File Browser (upload zone), 7.2 MediaGallery (post-upload)
- **Products:** `sui-media`, `sui-media-api`, `sui-common-api`
- **Entry points:** Upload button in CDN admin, API call from any integrated client

### 5.3 Media CRUD via API

- **Actor:** Authenticated user or API consumer
- **Goal:** Create, read, update, or delete media records
- **Steps:**
  1. **List:** `GET /media` with query params (mediaType, tags, search, dateFrom/dateTo, pagination)
  2. **Read:** `GET /media/:id` — returns media metadata, increments view count
  3. **Create:** `POST /media` — create media record (after upload completes)
  4. **Update:** `PATCH /media/:id` — update title, description, tags, publicity, rating
  5. **Delete:** `DELETE /media/:id` — remove media record and associated S3 objects
- **Views:** 7.2 MediaGallery, 7.3 MediaCard, 7.1 MediaViewer
- **Products:** `sui-media-api`, `sui-media`
- **Entry points:** REST API calls, MediaGallery hover controls (edit/delete buttons)

---

## 6. Consulting Admin Flows

### 6.1 Client Management

- **Actor:** Admin
- **Goal:** Create, view, and manage consulting clients
- **Steps:**
  1. Navigate to Admin Dashboard → click "Clients" card
  2. View client list — `ClientCard` grid with name, contact info, deliverable/invoice counts
  3. Search and filter clients
  4. Click "Add Client" → create dialog opens with contact mode selection (existing user, new contact, legacy import)
  5. Fill form: name, email, phone, company details
  6. Submit → `POST /api/clients/` creates client record
  7. Click client card → navigate to client detail page
  8. View client profile: deliverables table, invoices section, edit capabilities
  9. Edit client: `PUT /api/clients/{id}` updates record
- **Views:** 2.1 Admin Dashboard, 2.4 Clients List, 2.5 Client Detail
- **Products:** Docs site (consulting)
- **Entry points:** Admin Dashboard "Clients" card, URL `/consulting/clients`

### 6.2 Invoice Management

- **Actor:** Admin
- **Goal:** Create, track, and manage client invoices
- **Steps:**
  1. Navigate to Admin Dashboard → click "Invoices" card
  2. View invoice list with status, date range, and client filters
  3. Browse paginated table: amount, date, status, client columns
  4. Click invoice row → navigate to invoice detail
  5. View invoice preview (PDF/HTML render), line items, totals, payment status
  6. Actions: download, print, send to client
  7. Create new invoice → `POST /api/invoices/` with line items and client association
  8. Legacy invoices normalized via `invoiceNormalization.ts` (draft/sent/paid status tracking)
- **Views:** 2.1 Admin Dashboard, 2.8 Invoices List, 2.9 Invoice Detail
- **Products:** Docs site (consulting)
- **Entry points:** Admin Dashboard "Invoices" card, URL `/consulting/invoices`

### 6.3 Product & Service Management

- **Actor:** Admin
- **Goal:** Manage product catalog, pages, and pricing
- **Steps:**
  1. Navigate to Admin Dashboard → click "Products" card
  2. View product table: name, description, pricing, features, actions
  3. Click "Add Product" → create dialog with validation
  4. Click product row → navigate to product detail
  5. Edit product: name, description, icon, features CRUD
  6. Manage product pages: create nested pages with content
  7. Configure pricing tiers
  8. Public products visible via `GET /api/products/public`
- **Views:** 2.1 Admin Dashboard, 2.6 Products Management
- **Products:** Docs site (consulting)
- **Entry points:** Admin Dashboard "Products" card, URL `/consulting/products`

### 6.4 User Management

- **Actor:** Admin
- **Goal:** Create and manage user accounts and roles
- **Steps:**
  1. Navigate to Admin Dashboard → click "Users" card
  2. View user list: email, role, status columns with role filtering
  3. Create new user: dialog with email, password, role/permission assignment
  4. Impersonate user (admin-only): `POST /api/auth/impersonate` for troubleshooting
  5. Manage API keys for users: list/create/delete via `/api/auth/api-keys/`
- **Views:** 2.1 Admin Dashboard, 2.7 Users Management
- **Products:** Docs site (consulting)
- **Entry points:** Admin Dashboard "Users" card, URL `/consulting/users`

### 6.5 License Management

- **Actor:** Admin
- **Goal:** Create, activate, and manage software licenses
- **Steps:**
  1. Navigate to Admin Dashboard → click "Licenses" card
  2. View license list with status and product association
  3. Create license: `POST /api/licenses/create` linked to product and user
  4. Activate license: `POST /api/licenses/activate` with license key
  5. Validate license: `POST /api/licenses/validate` checks status and expiry
  6. Deactivate license: `POST /api/licenses/deactivate`
  7. License products available via `GET /api/licenses/products`
  8. Role auto-upgrade: `stokd member` if active `stokd-membership` license, `subscriber` if any active license
- **Views:** 2.1 Admin Dashboard, 2.13 Licenses Management
- **Products:** Docs site (consulting)
- **Entry points:** Admin Dashboard "Licenses" card, URL `/consulting/licenses`

### 6.6 Deliverable Management

- **Actor:** Admin
- **Goal:** Upload and manage client deliverables (HTML reports, documents)
- **Steps:**
  1. Create deliverable: `POST /api/deliverables/` with client association
  2. Upload deliverable file: `POST /api/deliverables/upload-file` → stored on CDN
  3. Render deliverable HTML: `POST /api/deliverables/render` generates sanitized HTML snapshot
  4. View deliverable: navigate to `/consulting/deliverables/{id}` → full-screen sanitized iframe
  5. Proxy deliverable resources: `GET /api/deliverables/proxy/[...path]` serves embedded assets
  6. Share deliverable link with client — authenticated access required
- **Views:** 2.10 Deliverable Viewer, 2.5 Client Detail (deliverables table)
- **Products:** Docs site (consulting)
- **Entry points:** Client detail deliverables section, direct URL `/consulting/deliverables/{id}`

---

## 7. Customer Portal Flows

### 7.1 Customer Self-Service

- **Actor:** Client user
- **Goal:** View deliverables, invoices, and account information
- **Steps:**
  1. Log in via `/consulting/login`
  2. Arrive at customer portal dashboard
  3. View assigned deliverables — click to open full-screen viewer
  4. View invoices and payment history
  5. Navigate to billing portal → `GET /api/account/billing/portal` redirects to Stripe billing portal
  6. Manage account settings via `/consulting/settings`
- **Views:** 2.3 Customer Portal, 2.10 Deliverable Viewer, 2.14 Billing, 2.15 Settings
- **Products:** Docs site (consulting)
- **Entry points:** URL `/consulting/customer`, post-login redirect for client role users

### 7.2 License Purchase

- **Actor:** User (any authenticated role)
- **Goal:** Purchase a software license via Stripe
- **Steps:**
  1. Browse available license products via pricing page or product catalog
  2. Select product tier → `POST /api/licenses/checkout` creates Stripe checkout session
  3. Redirect to Stripe hosted checkout page
  4. Complete payment on Stripe
  5. Stripe webhook (`POST /api/webhooks/stripe`) processes payment confirmation
  6. License created and activated automatically
  7. User role upgraded if applicable (subscriber, stokd member)
  8. View active licenses in account settings
- **Views:** 10.2 Pricing Page, 2.14 Billing, 2.13 Licenses Management
- **Products:** Docs site (consulting)
- **Entry points:** Pricing page, product page purchase buttons, URL `/consulting/billing`

---

## 8. Blog Flows

### 8.1 Blog Reading

- **Actor:** Visitor (unauthenticated)
- **Goal:** Read blog posts
- **Steps:**
  1. Navigate to blog index → view post cards with title, excerpt, date, author
  2. Click post card → navigate to individual post page
  3. Read rendered markdown content with author attribution and tags
  4. Browse related posts via `HeroEnd` section at page bottom
  5. Filter by tag via tag `Chip` components
- **Views:** 3.1 Blog Home, 3.2 Blog Post
- **Products:** `sui-docs`
- **Entry points:** Header nav, URL `/blog`, direct post URL `/blog/{slug}`

### 8.2 Blog Authoring & Publishing

- **Actor:** Admin / blog author
- **Goal:** Create, edit, and publish blog posts
- **Steps:**
  1. Navigate to blog editor → view post list with edit/delete actions
  2. Click "New Post" → editor form opens
  3. Fill metadata: title, slug, tags, author, featured image
  4. Write content in `BlogMarkdownEditor` (markdown editing)
  5. Upload blog images: `POST /api/upload/blog-image`
  6. Save draft → `POST /api/blog/{slug}`
  7. Preview rendered output
  8. Publish: `POST /api/blog/{slug}/publish` → post becomes publicly accessible
  9. Unpublish: `POST /api/blog/{slug}/unpublish` → post hidden from public
  10. Revalidate cache: `POST /api/blog/revalidate` to clear stale pages
- **Views:** 3.3 Blog Editor — Post List, 3.4 Blog Editor — New Post, 3.5 Blog Editor — Edit Post
- **Products:** `sui-docs`
- **Entry points:** URL `/blog/editor`, URL `/blog/editor/new`, URL `/blog/editor/{slug}`

---

## 9. CDN Asset Management Flows

### 9.1 CDN Browsing & File Operations

- **Actor:** Admin, client (scoped), agent
- **Goal:** Browse, organize, and manage files on the S3-backed CDN
- **Steps:**
  1. Navigate to CDN admin app at `cdn.stokedconsulting.com`
  2. Authenticate via docs site session cookie (cross-origin transfer)
  3. Browse directory structure via breadcrumb navigation
  4. Search/filter files using deferred search input
  5. **Create folder:** Admin clicks create folder → `POST /api/cdn/folders` → `.cdnkeep` marker placed
  6. **Upload files:** Drag-drop or click upload → multipart upload with progress (see Flow 5.2)
  7. **Move/rename:** Select files → `POST /api/cdn/move` (admin-only)
  8. **Delete:** Select files → `POST /api/cdn/delete` → recursive deletion for folders (batched >1000 objects)
  9. **Export:** Select files/folders → `POST /api/cdn/export` → zip download (archiver)
  10. Access scoping: clients see only `clients/{clientSlug}/` directories; admins see everything
- **Views:** 11.1 CDN File Browser
- **Products:** CDN admin (`packages-internal/cdn`), Docs site (consulting) API routes
- **Entry points:** URL `cdn.stokedconsulting.com`, admin dashboard link

### 9.2 CDN Permission Management

- **Actor:** Admin
- **Goal:** Configure role-based and user-specific access rules for CDN paths
- **Steps:**
  1. Navigate to CDN permissions management
  2. View current permission rules (MongoDB-backed `CdnViewer` records)
  3. Create permission: specify user/role, path pattern, access level
  4. Permissions use path-based matching with inheritance — a permission on `/clients/acme/` grants access to all descendants
  5. Test permission: verify user access via `GET /api/cdn/permissions`
- **Views:** 11.1 CDN File Browser (permissions panel)
- **Products:** CDN admin, Docs site (consulting)
- **Entry points:** CDN admin permissions section

---

## 10. GitHub Integration Flows

### 10.1 Contribution Activity Review

- **Actor:** Visitor or developer
- **Goal:** View GitHub contribution history as a heatmap calendar
- **Steps:**
  1. View `GithubCalendar` component on product page or docs
  2. Calendar auto-fetches contribution data from `github-contributions-api.jogruber.de`
  3. Heatmap renders with color-coded contribution blocks, responsive scaling
  4. Hover over day → label appears with contribution count and date
  5. Auto-scroll to most recent activity on mount
- **Views:** 8.1 GitHub Contribution Calendar
- **Products:** `sui-github`
- **Entry points:** GitHub product page `/github/main`, embedded in other pages

### 10.2 GitHub Events Feed

- **Actor:** Developer or project reviewer
- **Goal:** Browse and filter GitHub activity (PRs, pushes, issues, comments)
- **Steps:**
  1. View `GithubEvents` component
  2. Filter by: repository (autocomplete select), date range, event type, description text
  3. Browse paginated events list with type-specific renderers
  4. Click pull request event → expand to see `PullRequestView` with commits and file diffs
  5. View push events with commit summaries
  6. Rate-limit aware: displays API reset times when quota exceeded
- **Views:** 8.2 GitHub Events Feed, 8.3 Pull Request Detail
- **Products:** `sui-github`
- **Entry points:** GitHub docs pages `/github/docs/*`, embedded component

---

## 11. Feedback & Communication Flows

### 11.1 Product Feedback Submission

- **Actor:** Any user (authenticated or anonymous)
- **Goal:** Submit feedback on a specific product
- **Steps:**
  1. Navigate to feedback page or find inline feedback widget
  2. Select product from dropdown
  3. Enter feedback message
  4. Submit → `POST /api/products/feedback/register`
  5. If anonymous: email verification flow triggered via SES
  6. Verify email: `POST /api/products/feedback/verify` with verification code (TTL-limited)
  7. User auto-registered if new email
  8. Feedback stored and associated with product
- **Views:** 10.4 Feedback Page
- **Products:** All products
- **Entry points:** URL `/products/feedback`, inline feedback widgets

### 11.2 Direct Chat Contact

- **Actor:** Prospective client or user
- **Goal:** Reach out via messaging platform
- **Steps:**
  1. View `WebUserDirectChat` component
  2. Select provider: Telegram or WhatsApp
  3. Enter contact information and message
  4. Submit → `POST /api/chat/send` delivers message
  5. Success confirmation displayed
- **Views:** 9.10 WebUserDirectChat
- **Products:** `sui-media`
- **Entry points:** Chat widget on consulting pages

---

## 12. Developer Flows

### 12.1 Local Development

- **Actor:** Developer (contributor)
- **Goal:** Set up and run the development environment
- **Steps:**
  1. Clone repository
  2. `pnpm install` — install all workspace dependencies
  3. `pnpm build` — Turbo-orchestrated topological build (common → media → file-explorer → timeline → editor)
  4. `pnpm docs:dev` — start docs site at `localhost:5199`
  5. Edit package source → Babel rebuild via `scripts/build.mjs` → Next.js HMR picks up changes
  6. For `next.config.mjs` changes: restart dev server (not HMR)
  7. `pnpm test:unit` — Mocha tests for packages
  8. `pnpm eslint` — lint check
  9. `pnpm typescript` — type-check all packages
- **Views:** N/A (terminal-based)
- **Products:** All packages
- **Entry points:** Terminal, `pnpm` commands

### 12.2 API Documentation & Testing

- **Actor:** Admin / developer
- **Goal:** Explore and test the platform's API endpoints
- **Steps:**
  1. Navigate to Admin Dashboard → click "API Docs" card
  2. View OpenAPI/Swagger documentation generated from `GET /api/openapi`
  3. Browse endpoints by category (auth, media, clients, invoices, licenses, etc.)
  4. Test endpoints interactively via Swagger UI
  5. View request/response schemas, authentication requirements, and parameter descriptions
- **Views:** 2.16 API Docs
- **Products:** Docs site (consulting)
- **Entry points:** Admin Dashboard "API Docs" card, URL `/consulting/api-docs`

---

## Flow Dependency Graph

```
                    ┌─────────────────┐
                    │  2.1 Web Login   │
                    └────────┬────────┘
                             │ authenticates
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
     ┌────────────┐  ┌────────────┐  ┌────────────┐
     │ 6.x Admin  │  │ 7.x Cust.  │  │ 9.x CDN    │
     │   Flows    │  │  Portal    │  │  Mgmt      │
     └────────────┘  └────────────┘  └────────────┘

     ┌─────────────────────────────────────────────┐
     │              3.x Video Editing               │
     │  3.1 Create → 3.2 Timeline → 3.3 Detail    │
     │       │            │              │          │
     │       ▼            ▼              ▼          │
     │  3.6 File     3.4 Playback   3.5 Export     │
     │  Management                                  │
     └─────────────────────────────────────────────┘

     ┌─────────────────────────────────────────────┐
     │               5.x Media Flows                │
     │  5.2 Upload → 5.3 CRUD → 5.1 Browse/View   │
     └─────────────────────────────────────────────┘
```

---

## Flow-to-View Matrix

| Flow | Primary Views |
|------|--------------|
| 1.1 Product Discovery | 1.1, 1.2 |
| 1.2 Documentation | 1.3, 9.4, 9.5, 9.6 |
| 1.3 Consulting Discovery | 2.11, 2.12, 1.4 |
| 2.1 Web Login | 2.2, 2.1, 2.3 |
| 2.2 CLI Auth | 10.3, 2.2 |
| 3.1 Project Creation | 4.1, 4.2, 4.7, 4.6, 5.1 |
| 3.2 Timeline Editing | 5.1, 5.3, 5.4, 4.1 |
| 3.3 Detail Editing | 4.5, 4.3, 4.4 |
| 3.4 Playback | 4.2, 4.4, 5.1, 5.4 |
| 3.5 Video Export | 4.1, 4.2, 4.4, 4.8 |
| 3.6 Project Files | 4.6, 4.3, 6.1 |
| 4.1 File Navigation | 6.1, 6.4, 6.2 |
| 4.2 Drag-and-Drop | 6.1, 6.4 |
| 5.1 Media Browsing | 7.2, 7.3, 7.1, 7.4 |
| 5.2 Media Upload | 11.1, 7.2 |
| 5.3 Media CRUD | 7.2, 7.3, 7.1 |
| 6.1 Client Mgmt | 2.1, 2.4, 2.5 |
| 6.2 Invoice Mgmt | 2.1, 2.8, 2.9 |
| 6.3 Product Mgmt | 2.1, 2.6 |
| 6.4 User Mgmt | 2.1, 2.7 |
| 6.5 License Mgmt | 2.1, 2.13 |
| 6.6 Deliverable Mgmt | 2.10, 2.5 |
| 7.1 Customer Portal | 2.3, 2.10, 2.14, 2.15 |
| 7.2 License Purchase | 10.2, 2.14, 2.13 |
| 8.1 Blog Reading | 3.1, 3.2 |
| 8.2 Blog Authoring | 3.3, 3.4, 3.5 |
| 9.1 CDN Browsing | 11.1 |
| 10.1 GitHub Calendar | 8.1 |
| 10.2 GitHub Events | 8.2, 8.3 |
| 11.1 Feedback | 10.4 |
| 11.2 Chat Contact | 9.10 |
| 12.2 API Docs | 2.16 |
