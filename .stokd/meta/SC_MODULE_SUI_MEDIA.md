# SC_MODULE_SUI_MEDIA

> **Generated:** 2026-03-21 | **Meta version:** 0.2.0
> **Package:** `@stoked-ui/media` | **Location:** `packages/sui-media`

---

## Module Name & Location

| Field | Value |
|-------|-------|
| Package name | `@stoked-ui/media` |
| Path | `packages/sui-media` |
| Version | `0.1.0-alpha.5` |
| Entry point (client) | `packages/sui-media/src/index.ts` |
| Entry point (server) | `packages/sui-media/src/server/index.ts` |

---

## Responsibility

`@stoked-ui/media` is the monorepo's media-file management and component library. It owns three distinct concern areas:

1. **File abstraction layer** — browser-native `File`-compatible classes (`MediaFile`, `WebFile`, `AppFile`) that attach metadata, screenshot caches, audio waveforms, unique IDs, and persistence helpers on top of raw browser `File` objects. These classes are the canonical media data model consumed by `sui-editor`, `sui-timeline`, and `sui-file-explorer`.

2. **React UI components** — `MediaViewer` (NORMAL / THEATER / FULLSCREEN FSM), `MediaCard` (thumbnail, progress, payment gate), `MediaGallery` (responsive grid, configurable data source), and `WebUserDirectChat` (Telegram-backed support chat widget with live reply sync). All components accept framework-agnostic abstraction props (`IRouter`, `IAuth`, `IPayment`, `IQueue`) so they are usable outside of any specific app framework.

3. **API client + React hooks** — type-safe `MediaApiClient` and resumable `UploadClient` that talk to the `sui-media-api` NestJS backend, plus a full TanStack Query hook layer (`useMediaList`, `useMediaItem`, `useMediaUpload`, etc.) and a `MediaApiProvider` React context. The `src/server/next-handler.ts` entry provides a Next.js App Router proxy (`createMediaHandler`) that keeps backend credentials server-side.

---

## Public Interfaces / Entry Points

### Core Classes

| Export | File | Purpose |
|--------|------|---------|
| `MediaFile` | `src/MediaFile/MediaFile.ts` | Base file class; extends browser `File`. Factory methods `fromFile`, `fromUrl`, `fromBlob`, `fromUrls`, `from` (drag-drop/input events). Extracts video/audio metadata, generates screenshots and audio waveform images. |
| `IMediaFile` | `src/MediaFile/IMediaFile.ts` | Interface contract for the file abstraction layer. |
| `WebFile` | `src/WebFile/WebFile.ts` | Persistent file with IDB save/checksum/versioning via `@stoked-ui/common` `LocalDb`. |
| `AppFile` | `src/App/AppFile/AppFile.ts` | Multi-file project container; extends `WebFile`, holds `IMediaFile[]`, `Versions`, `IDBVideo[]`. |
| `AppOutputFile` | `src/App/AppOutputFile/AppOutputFile.ts` | Output file from a render/export operation. |
| `App` | `src/App/App.ts` | Application-level file manager. |
| `Stage` | `src/Stage/Stage.ts` | Singleton DOM stage manager; maps named `HTMLDivElement` stages used by renderer hosts. |
| `WebFileFactory` | `src/WebFileFactory/index.ts` | Factory for constructing `WebFile` instances. |

### MIME / Type Utilities

| Export | File | Purpose |
|--------|------|---------|
| `getMediaType(mimeType)` | `src/MediaType/MediaType.ts` | Maps MIME type string → `MediaType` string (`'video'`, `'audio'`, `'image'`, `'pdf'`, `'lottie'`, etc.). |
| `MediaType` | `src/MediaType/MediaType.ts` | Union type string. |
| `MimeMediaWildcardMap` | `src/MediaType/MediaType.ts` | Map of MIME wildcard → `MediaType`. |

### File System Access API

| Export | File | Purpose |
|--------|------|---------|
| `openFileApi` | `src/FileSystemApi/FileSystemApi.ts` | Wraps `showOpenFilePicker` (modern) + legacy `<input>` fallback. |
| `saveFileApi` | `src/FileSystemApi/FileSystemApi.ts` | Wraps `showSaveFilePicker` (modern). |
| `saveFileDeprecated` | `src/FileSystemApi/FileSystemApi.ts` | Legacy anchor-download fallback. |

### Zip Utilities

| Export | File | Purpose |
|--------|------|---------|
| `createZip` | `src/zip/Zip.ts` | Creates JSZip archive from a file + metadata. |
| `IZipMetadata`, `ZipMetadata` | `src/zip/Zip.ts` | Metadata shape and property name list. |
| `pickProps`, `splitProps` | `src/zip/Zip.ts` | Property extraction helpers. |

### Framework-Agnostic Abstractions

All defined in `src/abstractions/`:

| Interface | No-op export | Purpose |
|-----------|--------------|---------|
| `IRouter` | `noOpRouter` | Navigation adapter (push, replace, back, prefetch). |
| `IAuth` | `noOpAuth`, `createMockAuth` | Auth state adapter (user, isAuthenticated, signIn/Out). |
| `IPayment` | `noOpPayment`, `createMockPayment` | Payment request adapter. |
| `IQueue` | `noOpQueue`, `createInMemoryQueue` | Playback queue adapter (add, remove, next, previous). |
| `IKeyboardShortcuts` | `noOpKeyboardShortcuts`, `createInMemoryKeyboardShortcuts`, `COMMON_MEDIA_SHORTCUTS` | Keyboard binding adapter. |

### React Components

| Export | File | Purpose |
|--------|------|---------|
| `MediaViewer` | `src/components/MediaViewer/` | Full-screen viewer. Modes: `NORMAL`, `THEATER`, `FULLSCREEN`. Takes `item`, `open`, `onClose`, `router`, `auth`, `queue`, `shortcuts`. |
| `MediaViewerHeader` | `src/components/MediaViewer/MediaViewerHeader.tsx` | Header bar for viewer. |
| `MediaViewerPrimary` | `src/components/MediaViewer/` | Primary media display area. |
| `NextUpHeader` | `src/components/MediaViewer/NextUpHeader.tsx` | "Up next" queue display. |
| `NowPlayingIndicator` | `src/components/MediaViewer/NowPlayingIndicator.tsx` | Animated "now playing" indicator. |
| `QualitySelector` | `src/components/MediaViewer/QualitySelector.tsx` | Adaptive bitrate quality picker. |
| `MediaCard` | `src/components/MediaCard/MediaCard.tsx` | Media item card with thumbnail, progress bar, selection mode, payment gate, queue integration. Accepts all four abstraction props. |
| `ThumbnailStrip` | `src/components/MediaCard/ThumbnailStrip.tsx` | Sprite-sheet-based hover preview strip. |
| `VideoProgressBar` | `src/components/MediaCard/VideoProgressBar.tsx` | Scrubber / progress bar sub-component. |
| `MediaGallery` | `src/components/MediaGallery/` | Responsive card grid. Source: `data[]`, REST `endpoint`, or S3 config. |
| `WebUserDirectChat` | `src/components/WebUserDirectChat/` | In-app support chat widget; opens a live Telegram-backed conversation after the intake handshake and continues syncing replies into the widget. |

### React Hooks

All exported from `src/hooks/index.ts`:

| Hook | Purpose |
|------|---------|
| `useMediaItem(id, options)` | Fetch single `MediaDocument` by ID (TanStack Query). |
| `useMediaList(params, options)` | Fetch paginated `MediaListResponse` (TanStack Query). |
| `useMediaUpdate()` | Mutation hook for `PATCH /media/:id`. |
| `useMediaDelete()` | Mutation hook for `DELETE /media/:id`. |
| `useMediaUpload()` | Resumable multipart upload with `UploadState` progress. |
| `useActiveUploads()` | List in-progress upload sessions. |
| `useMediaGallery(source)` | Fetch and normalize media items from any `MediaGallerySource`. |
| `useMediaMetadataCache` | In-memory metadata cache hook. |

### Viewer Hooks

Exported from `src/components/MediaViewer/hooks/`:

| Hook | Purpose |
|------|---------|
| `useMediaViewerState(initialMode)` | FSM for NORMAL/THEATER/FULLSCREEN transitions with browser fullscreen API integration. Returns `{ mode, transition, legacyState, isNormal, isTheater, isFullscreen }`. |
| `useMediaViewerLayout` | Calculates layout dimensions per mode. |
| `useAdaptiveBitrate` | Tracks estimated bandwidth, selects `ResolutionTrack`, switches quality. |
| `useMediaClassPlayback` | Playback state for class-based (non-browser-native) media. |

### Provider

| Export | File | Purpose |
|--------|------|---------|
| `MediaApiProvider` | `src/hooks/MediaApiProvider.tsx` | React context providing `MediaApiClient` + `UploadClient`. Wraps `QueryClientProvider`. |
| `useMediaApiContext()` | `src/hooks/MediaApiProvider.tsx` | Access raw context value. |
| `useMediaClient()` | `src/hooks/MediaApiProvider.tsx` | Access `MediaApiClient` directly. |
| `useUploadClient()` | `src/hooks/MediaApiProvider.tsx` | Access `UploadClient` directly. |

### API Clients

| Export | File | Purpose |
|--------|------|---------|
| `createMediaApiClient(config)` | `src/api/media-api-client.ts` | Factory. Returns `MediaApiClient`. |
| `MediaApiClient` | `src/api/media-api-client.ts` | Methods: `getMedia`, `listMedia`, `updateMedia`, `deleteMedia`, `permanentlyDeleteMedia`, `searchMedia`, `getPublicMedia`, `likeMedia`, `unlikeMedia`, `dislikeMedia`, `viewMedia`, `getMediaStats`, `extractMetadata`, `generateThumbnail`, `generateSpriteSheet`. |
| `createUploadClient(config)` | `src/api/upload-client.ts` | Factory. Returns `UploadClient`. |
| `UploadClient` | `src/api/upload-client.ts` | Resumable S3 multipart upload: 10 MB default chunks, 50-URL batch presigning, speed estimation, retry (max 3). |
| `createMediaHandler(config)` | `src/server/next-handler.ts` | **Server-side only.** Creates Next.js App Router handlers (`GET`, `POST`, `PUT`, `DELETE`) that proxy to `sui-media-api` while keeping `privateKey` server-side. |

---

## Products

No product doc files were listed as inputs. Based on source analysis, the following docs site contexts use this module:

- **Media product showcase** — `docs/src/components/home/AdvancedShowcase.tsx`, routed at `/products/media/`
- **Media component documentation** — `docs/data/media/docs/media-viewer/MediaViewerBasic.tsx`, `docs/data/media/docs/web-user-direct-chat/WebUserDirectChatLive.js`, and surrounding docs pages
- **Home page showcase** — `docs/src/components/home/` (media listed as one of the four featured products)

---

## Views

From `SC_VIEWS.md`:

| View ID | View Name | Role |
|---------|-----------|------|
| 1.1 | Home Page | `MediaCard`/`MediaViewer` embedded in `AdvancedShowcase` inside the `ProductsPreviews` grid |
| 1.2 | Product Showcase Pages | `/products/media/` showcase uses `AdvancedShowcase` (media components) |
| 1.3 | Product Documentation Pages | Media component API docs at `docs/data/media/docs/` with embedded `MediaViewer`, `MediaCard`, `MediaGallery`, and `WebUserDirectChat` demos |

---

## Integration Points

### Upstream Dependencies

| Dependency | Source | Contract |
|------------|--------|----------|
| `@stoked-ui/common` | `packages/sui-common` | `createSettings`, `namedId`, `FetchBackoff`, `Settings`, `LocalDb`, `SortedList`, `Versions`, `IDBVideo`, `ExtensionMimeTypeMap`, `MimeRegistry`, `MimeType` |
| `@stoked-ui/media-api` | `packages/sui-media-api` (NestJS) | REST endpoints `/media`, `/media/:id`, `/upload/*`. DTO types shared via `@stoked-ui/common`. |
| `@mui/material` | npm | Card, IconButton, Typography, CircularProgress, Box, Grid — UI primitives for all components. |
| `@tanstack/react-query` | npm | Query/mutation caching layer; `QueryClient`, `QueryClientProvider`, `useQuery`, `useMutation`. |
| `jszip` | npm | ZIP archiving for `createZip` in `src/zip/Zip.ts`. |
| `next/server` | Next.js | `NextRequest`, `NextResponse` in `src/server/next-handler.ts` (server-only path). |

### Downstream Consumers

| Package | What it uses |
|---------|-------------|
| `@stoked-ui/editor` | `MediaFile`, `IMediaFile`, `MediaType`, `WebFile`, `AppFile`, `Stage`, `ScreenshotStore` (via `media` property on files) |
| `@stoked-ui/timeline` | `MediaFile`, `IMediaFile`, `MediaType`, `Controller` types reference `IMediaFile` |
| `@stoked-ui/file-explorer` | `IMediaFile`, `MediaFile`, drag-drop via `MediaFile.from()` |
| `docs/` Next.js app | `MediaViewer`, `MediaCard`, `MediaGallery`, and `WebUserDirectChat` in demos; `createMediaHandler` in API routes |

---

## Key Source Files

| File | Why it matters |
|------|---------------|
| `src/index.ts` | Barrel export — the full public contract of the package. Any new export must be added here. |
| `src/MediaFile/MediaFile.ts` | Central data model. `extractVideoMetadata` drives `ScreenshotStore` creation, used by Editor track rendering. `fromUrl`/`fromFile`/`from` factory methods are the entry points for all file ingestion across the monorepo. |
| `src/MediaFile/IMediaFile.ts` | Interface implemented by `MediaFile`, `AppFile`, `EditorFile`. Breaking changes here propagate to all consuming packages. |
| `src/MediaFile/Metadata/ScreenshotStore.ts` | Manages timestamped video frame captures at `full` and `track` resolutions. Stored on `file.media.screenshotStore`. Known issue: only generates if `count > 0`. |
| `src/MediaFile/Metadata/ScreenshotQueue.ts` | Priority queue feeding `ScreenshotStore` with capture requests. |
| `src/api/media-api-client.ts` | All media CRUD, engagement (like/view/dislike), and processing (thumbnail, sprite sheet) operations against the NestJS backend. Endpoints must stay in sync with `sui-media-api` controllers. |
| `src/api/upload-client.ts` | Resumable S3 multipart upload. Chunk size: 5–100 MB (default 10 MB). Batches 50 presigned URLs at once. Max 3 retries. Must stay in sync with `sui-media-api` upload routes. |
| `src/api/types.ts` | DTO types re-exported from `@stoked-ui/common` plus client-specific additions (`MediaApiClientConfig`, `UploadOptions`, `MediaMetadata`, `MediaListParams`, `UploadProgress`, `MediaApiError`). |
| `src/hooks/MediaApiProvider.tsx` | React context root. Instantiates both API clients and a `QueryClient`. All child hooks depend on this context being present. |
| `src/components/MediaViewer/hooks/useMediaViewerState.ts` | FSM for viewer modes. Manages `document.requestFullscreen`/`exitFullscreen` lifecycle. Exposes `legacyState: 0 \| 1 \| 2` for backwards compatibility. |
| `src/components/MediaViewer/hooks/useAdaptiveBitrate.ts` | Bandwidth estimation and `ResolutionTrack` selection for adaptive streaming. |
| `src/components/MediaCard/MediaCard.tsx` | Stub implementation; comment warns the full v3 is 4 426 lines. Core prop interface and abstraction wiring is established here. |
| `src/abstractions/` | Defines the abstraction contracts (`IRouter`, `IAuth`, `IPayment`, `IQueue`, `IKeyboardShortcuts`). No-op defaults allow components to render with zero configuration. |
| `src/server/next-handler.ts` | Next.js App Router catch-all route factory. Proxies all HTTP methods to `sui-media-api`, injecting `privateKey` from server-side env. |
| `src/MediaType/MediaType.ts` | `getMediaType()` is called throughout `MediaFile` and consuming packages to classify file MIME types. |
| `src/WebFile/WebFile.ts` | Base for `AppFile`; handles IDB persistence, checksumming, and versioning of project files. |
| `src/zip/Zip.ts` | JSZip wrapper. Used by `AppFile.toBlob()` and editor save flows. |

---

## Change Impact

| Change area | What breaks / needs validation |
|-------------|-------------------------------|
| `IMediaFile` interface | Any added/removed property or method signature change forces updates in `MediaFile`, `EditorFile` (`sui-editor`), and anywhere `IMediaFile` is typed in `sui-timeline` and `sui-file-explorer`. Run `tsc` across all packages. |
| `MediaFile` constructor / factory methods | Editor and Timeline create `MediaFile` instances via `fromFile`, `fromUrl`, `from`. Changes to options shape or return type require verifying Editor file loading and Timeline track creation. |
| `MediaFile.extractVideoMetadata` / `ScreenshotStore` | Used by Editor's timeline track renderer for preview images. Breakage shows as missing/blank track thumbnails. |
| `api/media-api-client.ts` endpoint paths | Must remain in sync with `sui-media-api` NestJS controllers. Endpoint path or method changes that don't match will cause 404/405 at runtime. |
| `api/upload-client.ts` | Multipart upload protocol (initiate → presign → upload parts → complete) must match `sui-media-api` upload service. Part count mismatches cause S3 upload failures. |
| `api/types.ts` DTO changes | Cascades into `@stoked-ui/common` shared types and all consuming hooks. |
| `hooks/MediaApiProvider.tsx` | Context shape changes break every hook that calls `useMediaApiContext()`. Test all hooks after modifying. |
| `abstractions/` interface changes | Any added required method on `IRouter`, `IAuth`, `IPayment`, `IQueue`, or `IKeyboardShortcuts` breaks all concrete implementations in consuming apps. Prefer optional methods. |
| `components/MediaViewer` | FSM state changes affect the NORMAL/THEATER/FULLSCREEN cycle. Verify that browser fullscreen events (`fullscreenchange`, `webkitfullscreenchange`) still correctly sync state. `legacyState` must stay mapped for any existing callers. |
| `server/next-handler.ts` | Depends on Next.js App Router `NextRequest`/`NextResponse` API. Next.js major version upgrades may require handler signature updates. Also sensitive to `sui-media-api` route structure. |
| `MediaType.ts` (`getMediaType`) | Called in `MediaFile` constructor and throughout consuming packages. Adding/removing MIME mappings affects file type classification used in Editor controllers and File Explorer icons. |
