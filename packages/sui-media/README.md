# @stoked-ui/media

Media-file models, media UI components, framework adapters, API clients, and React Query hooks for Stoked UI applications.

The package owns the browser-side media abstraction layer used by `@stoked-ui/editor`, `@stoked-ui/timeline`, and `@stoked-ui/file-explorer`, plus UI surfaces such as `MediaViewer`, `MediaCard`, `MediaGallery`, and `WebUserDirectChat`.

## Installation

```bash
pnpm add @stoked-ui/media @stoked-ui/common @tanstack/react-query react react-dom
```

Peer dependencies:

- `@stoked-ui/common`
- `@tanstack/react-query`
- `react`
- `react-dom`

MUI, Emotion, `jszip`, and other runtime support packages are declared as package dependencies.

## Quick Start

Render a static gallery:

```tsx
import { MediaGallery } from '@stoked-ui/media';

const items = [
  {
    id: 'clip-1',
    title: 'Launch clip',
    mediaType: 'video',
    file: '/media/launch.mp4',
    thumbnail: '/media/launch.jpg',
  },
];

export function Gallery() {
  return <MediaGallery source={{ data: items }} columns={{ xs: 1, md: 3 }} />;
}
```

Use the API client and hooks:

```tsx
import { MediaApiProvider, MediaGallery, useMediaList } from '@stoked-ui/media';

function MediaList() {
  const { data, isLoading } = useMediaList({ limit: 20, publicity: 'public' });

  if (isLoading) {
    return null;
  }

  return <MediaGallery source={{ data: data?.items ?? [] }} />;
}

export function App() {
  return (
    <MediaApiProvider config={{ baseUrl: 'https://api.example.com/v1', authToken: 'token' }}>
      <MediaList />
    </MediaApiProvider>
  );
}
```

## Primary Exports

- Core classes: `MediaFile`, `WebFile`, `App`, `AppFile`, `AppOutputFile`, `Stage`, and `WebFileFactory`.
- Media typing: `getMediaType`, `MediaType`, and MIME wildcard maps.
- Browser file helpers: `openFileApi`, `saveFileApi`, and `saveFileDeprecated`.
- Zip helpers: `createZip`, `pickProps`, `splitProps`, `IZipMetadata`, and `ZipMetadata`.
- Framework adapters: `IRouter`, `IAuth`, `IPayment`, `IQueue`, `IKeyboardShortcuts`, no-op adapters, and in-memory/mock helpers.
- Components: `MediaViewer`, `MediaCard`, `ThumbnailStrip`, `VideoProgressBar`, `MediaGallery`, and `WebUserDirectChat`.
- Viewer hooks: `useMediaViewerState`, `useMediaViewerLayout`, `useAdaptiveBitrate`, and playback helpers.
- API clients: `createMediaApiClient`, `MediaApiClient`, `createUploadClient`, and `UploadClient`.
- React Query integration: `MediaApiProvider`, `useMediaList`, `useMediaItem`, `useMediaUpload`, `useMediaUpdate`, `useMediaDelete`, `useActiveUploads`, `useMediaGallery`, and metadata-cache hooks.
- Server helper: `createMediaHandler` for Next.js App Router proxy routes.

## Integration Notes

- `MediaApiProvider` creates `MediaApiClient`, `UploadClient`, and a React Query client unless one is supplied.
- `createMediaHandler` is server-only. Use it to proxy to `@stoked-ui/media-api` while keeping private keys off the client.
- File-system helpers depend on browser File System Access APIs and fall back only where the source implementation supports it.
- `MediaFile` and `WebFile` use browser media APIs and IndexedDB-oriented flows; isolate them from SSR execution.
- The matching backend for CRUD, upload, metadata, thumbnail, and sprite operations is `@stoked-ui/media-api`.

## Local Development

```bash
pnpm --filter @stoked-ui/media build
pnpm --filter @stoked-ui/media typescript
pnpm --filter @stoked-ui/media test
pnpm --filter @stoked-ui/media test:ci
pnpm --filter @stoked-ui/media dev
```

## Related Docs

- Product docs: `https://sui.stokd.cloud/products/media/docs`
- Backend package: `@stoked-ui/media-api`
- Source: `packages/sui-media/src`

## License

MIT
