# Module: @stoked-ui/media

> **Generated:** 2026-05-05 (refreshed 2026-05-21 for upgrade) | **Meta version:** 0.4.0 (prev 0.3.0)
> **Package location:** `packages/sui-media`
> **NPM name:** `@stoked-ui/media` (v0.1.0-alpha.5)
> **Source entry:** `packages/sui-media/src/index.ts`
> **Server entry:** `packages/sui-media/src/server/index.ts` (Next.js App Router proxy)
> **Build artifacts:** `packages/sui-media/build/` (modern + node + stable + types)

---

## 1. Responsibility

`@stoked-ui/media` is the **browser-side media abstraction layer** for the Stoked UI monorepo. It owns six related concerns:

1. **File-model classes** that wrap browser `File` / `Blob` with id, mime, media type, settings, persistence hooks, and command history. These are the runtime objects every editor surface (timeline tracks, file-explorer entries, screener panes, video thumbnails) consumes — `MediaFile`, `WebFile`, `App`/`AppFile`/`AppOutputFile`, `Stage`, `WebFileFactory`.
2. **Modern File System Access API integration** — `openFileApi`/`saveFileApi` with deprecated fallbacks, plus drag-and-drop input normalization (`getInputFiles`).
3. **Framework-agnostic abstractions** — `IRouter`, `IAuth`, `IPayment`, `IQueue`, `IKeyboardShortcuts` plus no-op implementations and in-memory factories so the React components plug into any host app's routing/auth/payment/queue stack.
4. **React UI components** — `MediaViewer` (full-screen/theater dialog), `MediaCard`, `MediaGallery`, `WebUserDirectChat` — built on the abstractions above.
5. **TanStack Query API client + hooks** — typed CRUD/upload client (`MediaApiClient`, `UploadClient`) and React hooks (`useMediaList`, `useMediaItem`, `useMediaUpload`, `useResumeUpload`, `useMediaUpdate`, `useMediaDelete`, `useMediaGallery`, `useMediaMetadataCache`) for consuming the NestJS `@stoked-ui/media-api` service. `MediaApiProvider` wires the clients into the React tree.
6. **Server-side proxy handler** — `createMediaHandler` (`src/server/next-handler.ts`) that exposes `GET/POST/PUT/DELETE` route handlers for a Next.js App Router catch-all, hiding the upstream API key.

It is *not* a NestJS module, *not* an editor or timeline (those packages depend on this one), *not* a CDN browser (that lives in `@stoked-ui/cdn`), and *not* the place for application-domain endpoints (those go in `docs/pages/api/*` per repo guardrails).

---

## 2. Public Interfaces / Entry Points

### Browser entry — `src/index.ts`

| Surface | Exports | Source |
|---|---|---|
| Core file classes (default + named) | `MediaFile`, `WebFile`, `App`, `Stage`, `WebFileFactory` | `src/{MediaFile,WebFile,App,Stage,WebFileFactory}` |
| MediaFile types & metadata | `IMediaFile`, `Screenshot`, `ScreenshotStore`, `ScreenshotQueue`, `DropFile`, `getInputFiles`, `FILES_TO_IGNORE`, `FromEventInput`, `PragmaticDndEvent` | `src/MediaFile/{MediaFile,IMediaFile,MediaFile.types,FileSystem}.ts`, `src/MediaFile/Metadata/` |
| WebFile types | `IWebFileProps`, `IWebFileData`, `Command` (undo/redo) | `src/WebFile/WebFile.ts` |
| App / AppFile | `App` (abstract), `AppFile`, `AppOutputFile`, `AppFileFactory`, `AppOutputFileFactory`, `IAppFile`, `IAppFileProps`, `IAppFileData`, `IApp` | `src/App/` |
| Mime → media classification | `getMediaType()`, `MediaType` (`'doc'\|'file'\|'folder'\|'image'\|'pdf'\|'trash'\|'video'\|'lottie'\|'audio'\|string`), `MimeMediaWildcardMap` | `src/MediaType/MediaType.ts` |
| File System Access API | `openFileApi`, `saveFileApi`, `openFileDeprecated`, `saveFileDeprecated`, `OpenDialogProps` | `src/FileSystemApi/FileSystemApi.ts` |
| Zip utilities | `createZip`, `IZipMetadata`, `ZipMetadata`, `pickProps`, `splitProps` | `src/zip/Zip.ts` |
| Abstractions | `IRouter`/`NoOpRouter`/`noOpRouter`, `IAuth`/`IUser`/`NoOpAuth`/`createMockAuth`, `IPayment`/`PaymentRequest*`/`NoOpPayment`/`createMockPayment`, `IQueue`/`IQueueItem`/`NoOpQueue`/`createInMemoryQueue`, `IKeyboardShortcuts`/`ShortcutDefinition`/`OverlayCallback`/`createInMemoryKeyboardShortcuts`/`normalizeKeyString`/`COMMON_MEDIA_SHORTCUTS` | `src/abstractions/{Router,Auth,Payment,Queue,KeyboardShortcuts}.ts` |
| MediaViewer component | `MediaViewer`, `MediaViewerHeader`, `MediaViewerPrimary`, `NextUpHeader`, `NowPlayingIndicator`, `MediaViewerProps`, `MediaItem`, `MediaViewerMode`, `ResolutionTrack`, `QualityState`, `QualityMode` | `src/components/MediaViewer/` |
| MediaViewer hooks | `useMediaViewerState`, `useMediaViewerLayout`, `useAdaptiveBitrate` | `src/components/MediaViewer/hooks/` |
| MediaCard component | `MediaCard`, `ThumbnailStrip`, `VideoProgressBar`, `MediaCardProps`, `ExtendedMediaItem`, `MediaCardDisplayMode`, `MediaCardModeState`, `SpriteConfig` | `src/components/MediaCard/` |
| MediaGallery component | `MediaGallery`, `MediaGalleryProps`, `MediaGallerySource` | `src/components/MediaGallery/` |
| WebUserDirectChat | `WebUserDirectChat`, `WebUserDirectChatProps`, `DirectChatProvider`, `DirectChatFormData` | `src/components/WebUserDirectChat/` |
| API client | `MediaApiClient`, `createMediaApiClient`, `UploadClient`, `createUploadClient`, `UploadError`, all DTO/response types via `src/api/types.ts` (re-exports from `@stoked-ui/common`) | `src/api/` |
| React Query hooks | `MediaApiProvider`, `useMediaApiContext`, `useMediaClient`, `useUploadClient`, `useMediaList`, `useMediaItem`, `useMediaUpdate`, `useMediaDelete`, `useMediaUpload`, `useActiveUploads`, `useMediaGallery` (+ option types `UseMediaItemOptions`, `UseMediaListOptions`, `UseMediaUpdateOptions`, `UseMediaDeleteOptions`, `UseMediaUploadOptions`, `UploadState`, `MediaApiProviderProps`) | `src/hooks/` |

### Server entry — `src/server/index.ts`

```ts
// app/api/sui-media/[[...sui]]/route.ts
import { createMediaHandler } from '@stoked-ui/media/server';

export const { GET, POST, PUT, DELETE } = createMediaHandler({
  privateKey: process.env.STOKED_MEDIA_API_KEY!,
  sourceApiUrl: process.env.STOKED_MEDIA_API_URL,    // optional
  localPath: '/api/sui-media',                        // optional
});
```

There are no CLI commands or runtime daemons. The package is library code that browser apps import and a single Next.js App Router proxy.

---

## 3. Products

This module is consumed by the single product documented in this repo:

- **SC_PRODUCT_STOKED_UI_SUI.md** — `@stoked-ui/sui`. Within that product, `@stoked-ui/media` is a foundational browser package that ships `IMediaFile`/`MediaFile`/`AppFile` types reused by `@stoked-ui/editor`, `@stoked-ui/timeline`, and `@stoked-ui/file-explorer`, plus the `MediaViewer`/`MediaCard`/`MediaGallery` UI surfaces rendered by the docs site's media product pages and any host app using the `@stoked-ui/media-api` upload service.

There is no other product doc; the module participates in only this one.

---

## 4. Views

This module renders the following views from `SC_VIEWS.md`:

| View (SC_VIEWS.md ref) | Role of this module |
|---|---|
| §12.1 MediaViewer | Owned. `src/components/MediaViewer/index.tsx` exports the `<MediaViewer>` dialog (`ViewerDialog`, `MediaViewerHeader`, `MediaContainer`, `MediaViewerPrimary`, `NextUpHeader`, `QualitySelector`, `NowPlayingIndicator`). State machine in `hooks/useMediaViewerState.ts`; layout in `hooks/useMediaViewerLayout.ts`; ABR in `hooks/useAdaptiveBitrate.ts`. |
| §12.2 MediaCard | Owned. `src/components/MediaCard/MediaCard.tsx` plus `ThumbnailStrip.tsx`, `VideoProgressBar.tsx`, `useHybridMetadata.ts`, `useServerThumbnail.ts`. |
| §12.3 MediaGallery | Owned. `src/components/MediaGallery/MediaGallery.tsx` — masonry grid + integrated MediaViewer overlay. |
| §12.4 WebUserDirectChat | Owned. `src/components/WebUserDirectChat/WebUserDirectChat.tsx`. |
| §12.5 Stage / Players | Owned (Stage). `src/Stage/Stage.ts` provides the shadow-DOM canvas registry consumed by `@stoked-ui/editor`'s `VideoController`. |

This module also **materially shapes** views owned by other packages:

| View | How |
|---|---|
| §9.x Editor views (`@stoked-ui/editor`) — Editor canvas, EditorScreener, DetailView, EditorFileTabs, EditorView, EditorControls | All use `IMediaFile`/`MediaFile`/`AppFile`/`MediaType` as the runtime file type. The Stage shadow-DOM canvas hosts the editor's `<video>` elements. |
| §10.x Timeline views (`@stoked-ui/timeline`) — TimelineProvider, TimelineAction, TimelineFile | Consume `IMediaFile`, `App`, `Screenshot`, `Command`, `IAppFile*`, and `ScreenshotQueue` for thumbnail strips and undo/redo wiring. |
| §11.x FileExplorer views (`@stoked-ui/file-explorer`) | Use `MediaType` and `MediaFile` to classify rows and to handle drag-and-drop input normalization. |
| §1.x / §2.x Docs marketing media pages and `/products/media/` showcase | Embed `MediaViewer`/`MediaCard`/`MediaGallery` for live demos in `docs/data/media/docs/`. |

---

## 5. Integration Points

### Upstream (this module depends on)

| Dependency | Where used | Contract |
|---|---|---|
| `@stoked-ui/common` (peer, workspace:^) | `createSettings`, `namedId`, `FetchBackoff`, `Settings`, `ExtensionMimeTypeMap`, `MimeType`/`IMimeType`, `MimeRegistry`, `LocalDb`, `FileSaveRequest`, `Constructor`, plus all upload DTO/response types & the `Media`/`UploadSession` model interfaces re-exported via `src/api/types.ts` | Must remain browser-safe (no NestJS/Mongoose). Type re-exports from `@stoked-ui/common` are the wire contract with `@stoked-ui/media-api`. |
| `@tanstack/react-query` ^5 (peer) | `MediaApiProvider`, all `useMedia*` hooks (cache keys, mutation invalidation) | Hooks expect a single `QueryClient` in context. Cache key shape (`['media', id]`, `['mediaList', params]`, `['activeUploads']`) is a public contract for invalidation by host apps. |
| `react`/`react-dom` ^18 (peer) | All components and hooks | React 18 concurrent features used (`startTransition` in `useMediaViewerState`). |
| `@mui/material`, `@mui/icons-material`, `@mui/lab`, `@emotion/{react,styled}` | All components | MUI 5.x. The package ships its own `Dialog`, `styled` chrome — host app must provide a theme provider. |
| `jszip` ^3 | `src/zip/Zip.ts::createZip` | In-memory zip generation; stays browser-only. |
| `formdata-node` ^6 | `UploadClient` for multipart bodies in non-browser test environments | Allows `UploadClient` to run under Node/Jest. |
| `next/server` (`NextRequest`/`NextResponse`) | `src/server/next-handler.ts` only | Loaded only via the `@stoked-ui/media/server` subpath; never imported by browser entry. |
| `@types/wicg-file-system-access` (dev) | `FileSystemApi.ts` typings | DOM augmentation for `showOpenFilePicker`/`showSaveFilePicker`. |

### Downstream (consumers)

In-tree (verified via `grep '@stoked-ui/media'`, excluding `build/` and lockfiles):

- **`@stoked-ui/editor`** (`packages/sui-editor/src/`) — heaviest consumer. Imports `IMediaFile`, `MediaFile`, `AppFile`, `MediaType`, `Stage`, `ScreenshotStore`, `Screenshot`, `Command` across `Editor`, `EditorView`, `EditorControls`, `EditorEngine` (commented out — pending re-enable), `EditorScreener`, `EditorFileTabs`, `Controllers/{VideoController,WebController,ImageController}`, `internals/useEditor`, `EditorProvider`, `models/items.ts`, `Editor/StokedUiEditorApp.ts`. The editor's `VideoController` mounts `<video>` elements into the `Stage` shadow-DOM canvas.
- **`@stoked-ui/timeline`** (`packages/sui-timeline/src/`) — imports `IMediaFile`, `App`, `Screenshot`, `Command`, `ScreenshotQueue`, `IAppFile`/`IAppFileProps`/`IAppFileData` across `TimelineProvider`, `Controller`, `TimelineAction`, `TimelineFile`, `Timeline/StokedUiTimelineApp.ts`, undo/redo command classes (`RemoveActionCommand`, `RemoveTrackCommand`).
- **`@stoked-ui/file-explorer`** (`packages/sui-file-explorer/src/`) — imports `MediaType` and `MediaFile` for drag-and-drop input normalization (`useFileExplorerDnd`) and for icon/row classification (`File`, `FileWrapped`, `CustomFileTreeItem`, `useFile.types`, `models/items.ts`).
- **`docs/`** — embeds `MediaViewer`/`MediaCard`/`MediaGallery` examples in `docs/data/media/docs/{media-viewer,media-card,web-user-direct-chat,roadmap,migration,overview}/`. The marketing card in `docs/src/products.tsx` is the public product entry.

There are no published external consumers documented in this repo.

### Contracts that must hold for downstream

1. **Single browser entry**: consumers import from `@stoked-ui/media`; the Next.js handler must come from `@stoked-ui/media/server`. Deep imports into `src/MediaFile/`, `src/api/`, etc. are not part of the public API.
2. **`IMediaFile` shape**: `id`, `mediaType`, `path`, `url`, `media: Settings`, `children: IMediaFile[]`, `created`, `getUrl()`. Downstream packages (editor, timeline, file-explorer) hold long-lived references; renames or signature changes ripple through `useEditor`, `EditorEngine`, `Controllers/*`, `TimelineProvider`, `TimelineAction`, `useFileExplorerDnd`.
3. **`MediaType` union members**: `'doc' | 'file' | 'folder' | 'image' | 'pdf' | 'trash' | 'video' | 'lottie' | 'audio' | string`. The string fallback is intentional — file-explorer and editor switch on these values for icon and controller selection. `getMediaType()` must keep returning `'file'` for unknown mimes.
4. **`createSettings` Proxy semantics on `MediaFile.media`**: properties set via `Object.assign` do not always propagate through React state updates (documented quirk). Downstream UI (editor DetailView) falls back to the live DOM `<video>` element for duration/width/height. Do not "fix" by replacing the proxy without auditing every consumer.
5. **`Stage` registry**: keys are `stage-${host}` and `temp-stage-${host}` per host id; child transfer from temp → permanent stage happens lazily. The editor's `VideoController` depends on this exact pattern.
6. **`ScreenshotStore` empty-store semantics**: rendering must handle `count === 0` (the editor used to block thumbnail generation when the store was empty — fixed). Do not regress.
7. **`Command` interface (undo/redo)**: `execute()`/`undo()`. Timeline ships `RemoveActionCommand`/`RemoveTrackCommand` against this interface.
8. **API client / DTO shape**: `MediaApiClient`, `UploadClient`, and the re-exported DTOs in `src/api/types.ts` mirror `@stoked-ui/common` and `@stoked-ui/media-api`. The 5 MiB ≤ chunkSize ≤ 100 MiB and 1–50 partNumbers bounds match S3 multipart limits and the API's `InitiateUploadDto` regex `/^(video|image)\/[a-z0-9.+-]+$/`.
9. **TanStack Query cache keys**: `['media', id]`, `['mediaList', params]`, `['activeUploads']`. Host apps invalidate by these prefixes; reshaping is a breaking change.
10. **MediaViewer abstraction surface**: components default to `noOpRouter`/`noOpAuth`/`noOpQueue`/`noOpKeyboardShortcuts`. Host apps inject real implementations via props. New required abstraction methods are breaking.
11. **Next.js proxy**: `createMediaHandler({ privateKey, sourceApiUrl?, localPath? })` returns `{ GET, POST, PUT, DELETE }`. The handler must keep `privateKey` server-only — it is the auth bridge to `@stoked-ui/media-api`.

---

## 6. Key Source Files

| File | Why it matters |
|---|---|
| `src/index.ts` | Public surface contract for the browser entry. Adding/removing exports is a breaking change. |
| `src/MediaFile/MediaFile.ts` (1,022 lines) | The biggest single file. `MediaFile extends globalThis.File`, threads `createSettings` proxy, drives drag-and-drop ingestion (`getInputFiles`, `FromEventInput`, `PragmaticDndEvent`), and is the runtime type used by editor + timeline + file-explorer. Touch with care — every consumer mutates `.media` settings, sets `.url`, and walks `.children`. |
| `src/MediaFile/IMediaFile.ts` | Interface every downstream package imports by name. Do not rename or relax fields. |
| `src/MediaFile/MediaFile.types.ts` | Drag-and-drop ingestion types: `DropFile`, `FILES_TO_IGNORE`, `isChangeEvt`, `isDataTransfer`, `getInputFiles`, `PragmaticDndEvent`. |
| `src/MediaFile/Metadata/ScreenshotStore.ts` / `ScreenshotQueue.ts` | Thumbnail metadata pipeline reused by editor's `VideoController` and timeline's `Controller`. The empty-store guard (`count > 0`) was a known bug fix; preserve it. |
| `src/WebFile/WebFile.ts` (304 lines) | Persistence + version + undo/redo (`Command`, `commandHistory`, `undoStack`, `lastChecksum`). Backed by `LocalDb` (IndexedDB). Editor saves project state through here. The IDB version-entry creation guard is a documented fix; do not regress. |
| `src/WebFile/WebFileFactory.ts` | Generic factory pattern that `App` extends to register input/output factories. |
| `src/App/App.ts` | Abstract `App` class — apps register `AppFileFactory`/`AppOutputFileFactory`. `StokedUiEditorApp` and `StokedUiTimelineApp` extend this. |
| `src/App/AppFile/` and `src/App/AppOutputFile/` | Application-bound `MediaFile` subtypes with metadata typing — the timeline's `TimelineFile` derives from these. |
| `src/Stage/Stage.ts` | Shadow-DOM canvas registry keyed by host id; manages `stage-${host}` ↔ `temp-stage-${host}` child transfer. Editor's `VideoController` depends on this exact lifecycle. |
| `src/MediaType/MediaType.ts` | `getMediaType()` + `MimeMediaWildcardMap` — small but high-blast-radius utility used by file-explorer for every row icon and by editor for controller selection. |
| `src/FileSystemApi/FileSystemApi.ts` | `openFileApi`/`saveFileApi` plus deprecated fallbacks. The single integration point with `showOpenFilePicker`/`showSaveFilePicker`. |
| `src/zip/Zip.ts` | `createZip(file)` + `IZipMetadata`/`ZipMetadata` keys + `pickProps`/`splitProps`. Editor uses this to bundle project files. |
| `src/abstractions/{Router,Auth,Payment,Queue,KeyboardShortcuts}.ts` | Plug points for the `MediaViewer`/`MediaCard`. Each has a no-op default and an in-memory factory; host apps swap in real ones. `COMMON_MEDIA_SHORTCUTS` is the public default keymap. |
| `src/components/MediaViewer/index.tsx` (463 lines) | Full-screen/theater dialog. Consumes the four abstractions; integrates ABR via `useAdaptiveBitrate`; modes: `NORMAL`/`THEATER`/`FULLSCREEN`. |
| `src/components/MediaViewer/hooks/useMediaViewerState.ts` | Mode/transition state machine. |
| `src/components/MediaViewer/hooks/useAdaptiveBitrate.ts` | Quality selection driven by `ResolutionTrack`/`QualityState`/`QualityMode`. |
| `src/components/MediaCard/MediaCard.tsx` (531 lines) | Cards with thumbnail/poster, hover preview (`ThumbnailStrip`), progress bar (`VideoProgressBar`), selection mode, payment integration, queue actions. Drives §12.2. |
| `src/components/MediaCard/useHybridMetadata.ts` / `useServerThumbnail.ts` | Lazy hybrid (server + client) metadata + thumbnail resolution that gates the MediaCard render path. |
| `src/components/MediaGallery/MediaGallery.tsx` | Masonry grid that wires `MediaCard` rows to an integrated `MediaViewer` overlay. Source can be array data or `useMediaList` results. |
| `src/components/WebUserDirectChat/WebUserDirectChat.tsx` | Direct support chat surface with pluggable `DirectChatProvider`. |
| `src/api/media-api-client.ts` (402 lines) | Type-safe HTTP client with auth-header injection, request cancellation, configurable base URL/timeout. CRUD against the `Media` collection. |
| `src/api/upload-client.ts` (573 lines) | Multipart upload state machine that drives `useMediaUpload`/`useResumeUpload`. Works in browser and Node (via `formdata-node`). |
| `src/api/types.ts` | Re-exports the upload DTOs and `Media`/`UploadSession` model interfaces from `@stoked-ui/common` so consumers don't import the common package directly. |
| `src/hooks/MediaApiProvider.tsx` | React context that exposes `MediaApiClient`/`UploadClient` to all `useMedia*` hooks. |
| `src/hooks/useMediaUpload.ts` / `useResumeUpload.ts` | Upload lifecycle and resume-on-mount behavior backed by `UploadClient`. The `useActiveUploads` query (cache key `['activeUploads']`) is the resume-UI source of truth. |
| `src/hooks/useMediaList.ts` / `useMediaItem.ts` / `useMediaUpdate.ts` / `useMediaDelete.ts` / `useMediaGallery.ts` | TanStack Query wrappers — list/get/update/delete + a gallery convenience hook. |
| `src/hooks/useMediaMetadataCache.ts` | Client-side cache for metadata used by hybrid metadata resolution (`useHybridMetadata`). |
| `src/server/next-handler.ts` | Server-only Next.js App Router proxy that forwards browser requests to `sui-media-api` with a private API key. |
| `src/performance/{benchmark,metrics}.ts` | Optional performance instrumentation; not exported through the public surface but used internally. |
| `src/internal/models/` | Internal models that are not part of the public API. |

---

## 7. Change Impact

When this module changes, the following typically need validation:

### Always validate

- **Build** — `pnpm --filter @stoked-ui/media build` (modern + node + stable + types). Editor/timeline/file-explorer consume the built `IMediaFile`/`MediaType`/`Stage`/`Command` types.
- **Type check** — `pnpm --filter @stoked-ui/media typescript`.
- **Tests** — `pnpm --filter @stoked-ui/media test`. Existing suites cover abstractions (`Auth`, `Router`, `Payment`, `Queue`, `KeyboardShortcuts`), `MediaCard`, `MediaViewer`, MediaCard utils, MediaViewer hooks, and an integration-backward-compatibility suite. Coverage threshold is 80% (see `SC_TEST.md`).
- **Downstream type checks** — at minimum `pnpm --filter @stoked-ui/editor typescript` and `pnpm --filter @stoked-ui/timeline typescript` and `pnpm --filter @stoked-ui/file-explorer typescript`. Because `IMediaFile`/`MediaFile`/`MediaType`/`Stage`/`Screenshot*`/`Command`/`AppFile` are imported in dozens of files, a renamed or relaxed type ripples broadly.

### Risk-specific checklists

| Change | What to validate |
|---|---|
| Edit `src/index.ts` exports | Build editor/timeline/file-explorer to catch missing-export errors. The marketing copy in `docs/src/products.tsx` and the docs examples in `docs/data/media/docs/*` also import by name. |
| Edit `IMediaFile` (add/remove/rename fields) | Audit every consumer in `packages/sui-editor/src/{Editor,EditorView,EditorScreener,EditorFile,EditorTrack,EditorFileTabs,Controllers,internals/useEditor,DetailView,EditorProvider,Editor.styled}` and `packages/sui-timeline/src/{TimelineProvider,Controller,TimelineFile}`. Type errors will cascade. |
| Edit `MediaFile` constructor / drag-and-drop ingestion | Re-test drag-and-drop in `@stoked-ui/file-explorer` (`useFileExplorerDnd`) and editor `EditorView`. Confirm `getInputFiles` still normalizes `DataTransfer`, change events, and Pragmatic-DND events. |
| Edit `createSettings` Proxy usage on `MediaFile.media` | The known quirk (properties set via `Object.assign` not propagating through React state) is documented in editor memory; do not "fix" without auditing every consumer that Object.assigns to `.media`. The DetailView fallback to live `<video>` element must still work. |
| Edit `MediaType` union or `getMediaType` | All file-explorer rows, every editor controller-selection switch, and every drag-and-drop classifier read this. Run file-explorer drag-and-drop tests and confirm icon resolution for known + unknown mimes. |
| Edit `Stage` lifecycle (`getStage`, temp transfer) | Editor `VideoController` depends on the exact `stage-${host}` ↔ `temp-stage-${host}` pattern. Manual smoke: open the editor, attach a video clip, scrub the timeline, confirm canvas frames render. |
| Edit `ScreenshotStore`/`ScreenshotQueue` | Preserve the `count > 0` guard and the empty-store render path. Confirm timeline `TimelineAction` still renders frame strips. |
| Edit `WebFile` persistence / `Command` interface | Editor undo/redo and project save/load. The IDB version-entry creation guard is a documented fix; do not regress. Timeline's `RemoveActionCommand`/`RemoveTrackCommand` implement this interface. |
| Edit `AppFile`/`AppOutputFile`/`App` | `StokedUiEditorApp` and `StokedUiTimelineApp` register factories at module load. Type-check both downstream packages. |
| Edit abstractions (`IRouter`/`IAuth`/`IPayment`/`IQueue`/`IKeyboardShortcuts`) | Any new required method is a breaking change for host apps that don't use the `noOp*` defaults. Ship via optional fields when possible. |
| Edit `MediaViewer` props or sub-components | Run MediaViewer tests + MediaGallery integration. The `MediaViewerMode` enum (`NORMAL`/`THEATER`/`FULLSCREEN`) is rendered in MDX docs (`docs/data/media/docs/media-viewer/MediaViewerModes.js`). |
| Edit `useAdaptiveBitrate` / `ResolutionTrack`/`QualityState`/`QualityMode` | Verify ABR still produces consistent quality switching; the quality selector UI in `QualitySelector.tsx` reads these types directly. |
| Edit `MediaCard` props or `ExtendedMediaItem` | Run `MediaCard.test.tsx`, `MediaCard.utils.test.ts`. The marketing showcase pages embed `MediaCard` examples — eyeball at least one in `/products/media/`. |
| Edit `useHybridMetadata` / `useServerThumbnail` | Hybrid metadata is what gates a card from blank → rendered. Confirm both server (`useServerThumbnail`) and client paths still resolve, including the cache hit path in `useMediaMetadataCache`. |
| Edit `MediaApiClient` or `UploadClient` | `pnpm --filter @stoked-ui/media-api typescript` and end-to-end through the proxy: initiate → upload one part → complete → list → delete. The 5 MiB ≤ chunkSize ≤ 100 MiB and the `^(video\|image)/...$` mime regex are S3/protocol bounds — do not loosen unilaterally; coordinate with `sui-common-api`. |
| Edit any `useMedia*` hook cache key | Host apps invalidate by these keys. Any change to `['media', id]`, `['mediaList', params]`, or `['activeUploads']` is a breaking change for cache invalidation logic in consumer apps. |
| Edit `MediaApiProvider` context shape | All hooks call `useMediaApiContext`/`useMediaClient`/`useUploadClient`. Provider/consumer changes must land together. |
| Edit `createMediaHandler` (server proxy) | The `privateKey`/`sourceApiUrl`/`localPath` contract is documented in `API_CLIENT_README.md`. Verify the catch-all route `app/api/sui-media/[[...sui]]/route.ts` shape still works after Next.js bumps. The handler must never leak `privateKey` to client bundles — it is `next/server`-only. |
| Edit `createZip` / `pickProps` / `splitProps` | Editor project bundling reads/writes through here. Round-trip test: zip → unzip → rebuild MediaFile graph. |
| Edit `FileSystemApi` (`openFileApi`/`saveFileApi`) | Confirm both modern (`showOpenFilePicker`) and deprecated fallback paths still work; Safari and older browsers depend on the deprecated path. |
| Bump peer `@tanstack/react-query` major | All hook signatures and the `MediaApiProvider` interplay change between v4 → v5 → v6. Coordinate with host apps. |
| Bump peer `react`/`react-dom` major | Concurrent-mode usage in `useMediaViewerState` (`startTransition`) — re-validate. |
| Bump MUI / Emotion majors | `MediaViewer` (`Dialog`), `MediaCard`, `MediaGallery` use `styled` — visual regression check. |
| Bump `jszip` major | Round-trip zip/unzip with the editor's project save path. |

### Smoke tests after non-trivial changes

1. `pnpm --filter @stoked-ui/media build && pnpm --filter @stoked-ui/editor typescript && pnpm --filter @stoked-ui/timeline typescript && pnpm --filter @stoked-ui/file-explorer typescript` — fastest guard against breaking the three workspace consumers.
2. `pnpm --filter @stoked-ui/media test` — full Jest suite; coverage must stay ≥ 80%.
3. Boot the docs site at **port 5199** (`pnpm docs:dev`) and visit:
   - `/products/media/` — confirms the showcase still renders.
   - `/x/api/media/media-viewer/`, `/x/api/media/media-card/` MDX example pages — confirms the embedded `MediaViewer` and `MediaCard` examples still mount.
4. End-to-end against `@stoked-ui/media-api` (locally or staging): mount `<MediaApiProvider>`, run `useMediaList()` → `useMediaUpload()` → `useResumeUpload()` → `useMediaItem()` → `useMediaDelete()`. Confirms client + provider + hook + DTO contracts are intact.
5. Open the editor (`/x/editor`), drop a video file onto the canvas, scrub the timeline. Confirms `MediaFile` ingestion, `Stage` mounting, `ScreenshotStore` thumbnails, and the editor↔media integration path.
