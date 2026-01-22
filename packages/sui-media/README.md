# @stoked-ui/media

A comprehensive media management and component library for React with framework-agnostic abstractions, modern file handling APIs, and reactive media UI components.

## Overview

The `@stoked-ui/media` package provides production-ready media handling capabilities including:

- **Media File Management**: Comprehensive file handling with upload, download, and metadata extraction
- **React Components**: MediaCard and MediaViewer for displaying and managing media
- **Modern APIs**: File System Access API integration, Zip compression, and streaming support
- **Framework-Agnostic Abstractions**: Decouple from routing, authentication, payments, and queue systems
- **API Client**: Type-safe client for consuming the @stoked-ui/media-api backend
- **React Hooks**: TanStack Query-based hooks for media CRUD operations

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Core Concepts](#core-concepts)
- [Components](#components)
  - [MediaCard](#mediacard)
  - [MediaViewer](#mediaviewer)
- [Media File Management](#media-file-management)
  - [MediaFile Class](#mediafile-class)
  - [WebFile Class](#webfile-class)
  - [File System Access API](#file-system-access-api)
- [API Client Integration](#api-client-integration)
- [React Hooks](#react-hooks)
- [Abstraction Layers](#abstraction-layers)
- [Advanced Features](#advanced-features)
  - [Metadata Extraction](#metadata-extraction)
  - [Hybrid Metadata Processing](#hybrid-metadata-processing)
  - [Video Sprite Sheet Generation](#video-sprite-sheet-generation)
  - [Performance Optimization](#performance-optimization)
- [Troubleshooting](#troubleshooting)
- [FAQ](#faq)
- [API Reference](#api-reference)
- [Contributing](#contributing)
- [License](#license)

## Installation

Install the package using your preferred package manager:

```bash
npm install @stoked-ui/media
# or
yarn add @stoked-ui/media
# or
pnpm add @stoked-ui/media
```

### Peer Dependencies

The package requires React 18+ and TanStack Query 5+ as peer dependencies:

```bash
npm install react@^18.0.0 @tanstack/react-query@^5.0.0
```

### Optional Dependencies

Some features require additional packages:

- **@stoked-ui/common**: Common utilities and components (workspace dependency)
- **sharp**: For server-side image optimization (optional, for media-api integration)
- **fluent-ffmpeg**: For video processing (optional, for media-api integration)

## Quick Start

### 1. Basic Setup with API Client (5 minutes)

```tsx
import { MediaApiProvider, useMediaList } from '@stoked-ui/media';

export function App() {
  return (
    <MediaApiProvider config={{
      baseUrl: 'https://api.example.com',
    }}>
      <MediaGallery />
    </MediaApiProvider>
  );
}

function MediaGallery() {
  const { data: mediaList, isLoading } = useMediaList();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
      {mediaList?.items.map((item) => (
        <MediaCard key={item._id} item={item} />
      ))}
    </div>
  );
}
```

### 2. MediaCard with Controls

```tsx
import { MediaCard } from '@stoked-ui/media';
import { useState } from 'react';

export function MyMediaCard() {
  const [modeState, setModeState] = useState({ mode: 'view' });

  const item = {
    _id: '123',
    title: 'My Video',
    mediaType: 'video',
    file: '/videos/sample.mp4',
    thumbnail: '/thumbnails/sample.jpg',
    duration: 300,
    publicity: 'public',
  };

  return (
    <MediaCard
      item={item}
      modeState={modeState}
      setModeState={setModeState}
      info={true}
      onViewClick={(item) => console.log('View:', item._id)}
      onDeleteClick={(item) => console.log('Delete:', item._id)}
    />
  );
}
```

### 3. MediaViewer with Queue Navigation

```tsx
import { MediaViewer } from '@stoked-ui/media';
import { useState } from 'react';

export function MyMediaViewer() {
  const [open, setOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const items = [
    { id: '1', title: 'Video 1', mediaType: 'video' as const, file: '/videos/1.mp4' },
    { id: '2', title: 'Video 2', mediaType: 'video' as const, file: '/videos/2.mp4' },
  ];

  return (
    <>
      <button onClick={() => setOpen(true)}>Open Viewer</button>
      <MediaViewer
        item={items[currentIndex]}
        mediaItems={items}
        currentIndex={currentIndex}
        open={open}
        onClose={() => setOpen(false)}
        onNavigate={(_, index) => setCurrentIndex(index)}
        enableKeyboardShortcuts
        enableQueue
      />
    </>
  );
}
```

## Core Concepts

### Media Items

Media items are objects that represent images, videos, or albums. They contain metadata like title, description, file URL, thumbnail, and optional server-side metadata.

```typescript
interface ExtendedMediaItem {
  _id?: string;
  title?: string;
  description?: string;
  mediaType?: 'image' | 'video' | 'album';
  file?: string;
  url?: string;
  thumbnail?: string;
  duration?: number;
  views?: number;
  publicity?: 'public' | 'private' | 'paid';
  [key: string]: any;
}
```

### Server vs. Client Metadata

The package supports hybrid metadata processing where metadata can come from:

1. **Client-side**: Extracted directly from files using browsers APIs
2. **Server-side**: Provided by @stoked-ui/media-api for optimized processing
3. **Hybrid**: Cached and updated dynamically

See [Hybrid Metadata Processing](#hybrid-metadata-processing) for details.

## Components

### MediaCard

An interactive card component for displaying media items in galleries or lists with thumbnail previews, progress tracking, and action controls.

**Key Features:**
- Display images and videos with responsive thumbnails
- Video progress bar with frame-accurate scrubber sprite support
- Interactive controls (play, edit, delete, toggle public)
- Selection mode for batch operations and multi-select
- Payment integration with price display for paid content
- Queue management with playback tracking
- Owner vs. viewer mode detection
- Grid-responsive design with flexible aspect ratios
- Lazy loading support for performance
- MediaClass branding support

**Complete Props Reference:**
```typescript
interface MediaCardProps {
  // Required
  item: ExtendedMediaItem;              // Media item to display
  modeState: MediaCardModeState;        // Current selection mode state
  setModeState: (state) => void;        // Update selection mode

  // Display options
  info?: boolean;                       // Show info overlay on hover
  minimalMode?: boolean;                // Compact display without metadata
  squareMode?: boolean;                 // Force 1:1 aspect ratio
  displayMode?: MediaCardDisplayMode;   // 'owner' or 'viewer'
  isVisible?: boolean;                  // For lazy loading optimization

  // Callbacks
  onViewClick?: (item: ExtendedMediaItem) => void;
  onEditClick?: (item: ExtendedMediaItem) => void;
  onDeleteClick?: (item: ExtendedMediaItem) => void;
  onTogglePublic?: (item: ExtendedMediaItem) => void;
  onThumbnailLoaded?: () => void;
  onMediaLoaded?: () => void;

  // Abstraction layers (framework integration)
  router?: IRouter;
  auth?: IAuth;
  payment?: IPayment;
  queue?: IQueue;

  // API integration
  apiClient?: MediaApiClient;
  enableServerThumbnails?: boolean;     // Use server-generated thumbnails

  // Styling
  sx?: SxProps<Theme>;                  // MUI styling
  imageAlt?: string;                    // Image alt text
}
```

**Usage Examples:**
```tsx
// Basic display
<MediaCard item={media} modeState={modeState} setModeState={setModeState} />

// With callbacks
<MediaCard
  item={media}
  modeState={modeState}
  setModeState={setModeState}
  onViewClick={(item) => navigate(`/media/${item._id}`)}
  onDeleteClick={(item) => deleteMedia(item._id)}
/>

// Owner-specific features
<MediaCard
  item={media}
  displayMode="owner"
  onEditClick={(item) => navigate(`/edit/${item._id}`)}
  onTogglePublic={(item) => updateMedia(item._id, { publicity: togglePublicity(item.publicity) })}
/>

// With server thumbnails
<MediaCard
  item={media}
  enableServerThumbnails
  apiClient={apiClient}
/>
```

**Documentation:** [MediaCard README](./src/components/MediaCard/README.md)

### MediaViewer

A full-screen media viewer component with multiple view modes, playlist navigation, keyboard shortcuts, and adaptive layout.

**Key Features:**
- Multiple view modes (NORMAL, THEATER, FULLSCREEN)
- Smooth navigation between media items with prev/next controls
- Queue integration for playlist management with next-up indicators
- Keyboard shortcuts for accessibility and power users
- Responsive layout that adapts to viewport and content
- Preview grid showing upcoming items
- MediaClass branding with before/after idents
- Owner controls for editing and deletion
- API integration for loading full media details
- Error handling with fallback display

**Complete Props Reference:**
```typescript
interface MediaViewerProps {
  // Required
  item: MediaItem;                      // Current media item
  open: boolean;                        // Viewer visibility
  onClose: () => void;                  // Close handler

  // Navigation
  mediaItems?: MediaItem[];             // Array of all items
  currentIndex?: number;                // Current position in array
  onNavigate?: (item: MediaItem, index: number) => void;

  // Callbacks
  onEdit?: (item: MediaItem) => void;
  onDelete?: (item: MediaItem) => void;
  onMediaLoaded?: (item: MediaItem) => void;
  onMetadataLoaded?: (metadata: Metadata) => void;

  // Display options
  hideNavbar?: boolean;                 // Hide toolbar
  showPreviewCards?: boolean;           // Show next items preview
  initialMode?: MediaViewerMode;        // Starting view mode
  autoplay?: boolean;                   // Auto-play videos
  initialMuted?: boolean;               // Muted on start

  // Feature toggles
  enableQueue?: boolean;                // Enable playlist features
  enableKeyboardShortcuts?: boolean;    // Enable keyboard controls
  enableOwnerControls?: boolean;        // Show edit/delete buttons

  // Abstraction layers
  router?: IRouter;
  auth?: IAuth;
  queue?: IQueue;
  keyboard?: IKeyboardShortcuts;
  payment?: IPayment;

  // API integration
  apiClient?: MediaApiClient;
  enableServerFeatures?: boolean;       // Load full details from API
}
```

**Usage Examples:**
```tsx
// Basic viewer
<MediaViewer
  item={currentItem}
  open={isOpen}
  onClose={() => setIsOpen(false)}
/>

// With navigation and playlist
<MediaViewer
  item={items[currentIndex]}
  mediaItems={items}
  currentIndex={currentIndex}
  open={isOpen}
  onClose={() => setIsOpen(false)}
  onNavigate={(item, index) => setCurrentIndex(index)}
  enableQueue
  showPreviewCards
/>

// With all features enabled
<MediaViewer
  item={currentItem}
  mediaItems={allItems}
  currentIndex={currentIndex}
  open={isOpen}
  onClose={() => setIsOpen(false)}
  onNavigate={(item, index) => setCurrentIndex(index)}
  router={useRouter()}
  auth={useAuth()}
  keyboard={useKeyboard()}
  enableQueue
  enableKeyboardShortcuts
  enableOwnerControls
  apiClient={apiClient}
/>
```

**Keyboard Shortcuts:**
- `ArrowLeft`: Previous item
- `ArrowRight`: Next item
- `f`: Toggle fullscreen
- `Escape`: Exit fullscreen/close viewer
- `Space`: Play/pause (video only)

**Documentation:** [MediaViewer README](./src/components/MediaViewer/README.md)

## Media File Management

### MediaFile Class

The core `MediaFile` class handles file uploads, downloads, and provides a unified interface for working with files.

```typescript
import { MediaFile, type IMediaFile } from '@stoked-ui/media';

// Create from File object
const mediaFile = new MediaFile(fileInput);

// Get file metadata
console.log(mediaFile.name);
console.log(mediaFile.size);
console.log(mediaFile.type);

// Check media type
if (mediaFile.isVideo()) {
  console.log('Video file');
}

// Upload to server
const response = await mediaFile.upload({
  endpoint: '/api/upload',
  headers: { 'Authorization': 'Bearer token' },
  onProgress: (progress) => console.log(`${progress}%`),
});
```

**API Reference:**
```typescript
class MediaFile {
  // Properties
  file: File;
  name: string;
  size: number;
  type: string;
  lastModified: number;

  // Methods
  isImage(): boolean;
  isVideo(): boolean;
  isAudio(): boolean;
  isDocument(): boolean;
  getMediaType(): MediaType;

  async upload(options: UploadOptions): Promise<UploadResponse>;
  async download(filename?: string): Promise<void>;

  // File system operations
  async readAsArrayBuffer(): Promise<ArrayBuffer>;
  async readAsDataURL(): Promise<string>;
  async readAsText(): Promise<string>;
}
```

### WebFile Class

The `WebFile` class extends `MediaFile` with web-persistent storage capabilities.

```typescript
import { WebFile } from '@stoked-ui/media';

// Save file to IndexedDB
const webFile = new WebFile(fileObject);
const savedId = await webFile.save();

// Retrieve file later
const retrieved = await WebFile.load(savedId);

// List all saved files
const allFiles = await WebFile.listAll();

// Delete file from storage
await webFile.delete();
```

### File System Access API

Access the modern File System Access API for native file picker and save dialogs:

```typescript
import { openFileApi, saveFileApi } from '@stoked-ui/media';

// Open file picker
const files = await openFileApi({
  types: [
    {
      description: 'Images',
      accept: { 'image/*': ['.png', '.jpg', '.gif'] }
    },
    {
      description: 'Videos',
      accept: { 'video/*': ['.mp4', '.webm'] }
    }
  ],
  multiple: true
});

// Save file
const fileHandle = await saveFileApi({
  suggestedName: 'export.json',
  types: [{
    description: 'JSON',
    accept: { 'application/json': ['.json'] }
  }]
});
```

**Browser Support:**
- Chrome/Edge: Yes
- Firefox: Partial (behind flag)
- Safari: Limited support
- Mobile: Limited support

Fallback to standard file input if not available.

## API Client Integration

### Creating an API Client

```typescript
import { createMediaApiClient } from '@stoked-ui/media';

const client = createMediaApiClient({
  baseUrl: 'https://api.example.com/v1',
  authToken: 'your-jwt-token',
  timeout: 30000,
});

// Update token dynamically
client.setAuthToken(newToken);
```

### Client Methods

```typescript
// Get single media item
const media = await client.getMedia(mediaId);

// List media with filters
const list = await client.listMedia({
  limit: 20,
  offset: 0,
  mediaType: 'video',
  search: 'sunset',
  sortBy: '-createdAt',
});

// Create media entry
const newMedia = await client.createMedia({
  title: 'My Video',
  description: 'A beautiful sunset',
  mediaType: 'video',
  file: 'https://example.com/sunset.mp4',
  thumbnail: 'https://example.com/sunset.jpg',
});

// Update media
const updated = await client.updateMedia(mediaId, {
  title: 'Updated Title',
  publicity: 'public',
});

// Delete media
await client.deleteMedia(mediaId);
```

## React Hooks

### useMediaApiProvider

Set up the API client context:

```tsx
import { MediaApiProvider } from '@stoked-ui/media';

export function App() {
  return (
    <MediaApiProvider config={{
      baseUrl: 'https://api.example.com',
      authToken: localStorage.getItem('token'),
    }}>
      <YourApp />
    </MediaApiProvider>
  );
}
```

### useMediaList

Fetch paginated media with caching:

```tsx
import { useMediaList } from '@stoked-ui/media';

function MediaGallery() {
  const { data, isLoading, error, hasNextPage, fetchNextPage } = useMediaList({
    limit: 20,
    mediaType: 'image',
  });

  return (
    <div>
      {data?.items.map((item) => (
        <MediaCard key={item._id} item={item} />
      ))}
      {hasNextPage && <button onClick={() => fetchNextPage()}>Load More</button>}
    </div>
  );
}
```

### useMediaItem

Fetch a single media item with caching:

```tsx
const { data: media, isLoading, error } = useMediaItem(mediaId);
```

### useMediaUpload

Handle file uploads with progress tracking:

```tsx
const { upload, isUploading, progress, error } = useMediaUpload();

const handleUpload = async (file: File) => {
  const result = await upload(file, {
    title: file.name,
    description: 'Auto-uploaded',
  });
  console.log('Uploaded:', result._id);
};
```

### useMediaUpdate

Update media metadata:

```tsx
const { update, isUpdating } = useMediaUpdate();

const handleUpdate = async (mediaId: string, updates: Partial<MediaItem>) => {
  await update(mediaId, updates);
};
```

### useMediaDelete

Delete media:

```tsx
const { delete: deleteMedia, isDeleting } = useMediaDelete();

const handleDelete = async (mediaId: string) => {
  await deleteMedia(mediaId);
};
```

## Abstraction Layers

The package uses framework-agnostic abstraction layers to decouple components from specific implementations. This allows components to work with any routing system, auth provider, payment processor, or queue manager.

### Available Abstractions

1. **Router (`IRouter`)** - Navigation and routing
2. **Auth (`IAuth`)** - User authentication and authorization
3. **Payment (`IPayment`)** - Payment processing for paid content
4. **Queue (`IQueue`)** - Media playback queue management
5. **KeyboardShortcuts (`IKeyboardShortcuts`)** - Keyboard event handling

### Using Abstractions

Import the abstractions and create implementations for your framework:

```tsx
import {
  IRouter,
  IAuth,
  IPayment,
  IQueue,
  IKeyboardShortcuts,
  createMockAuth,
  createMockPayment,
  createInMemoryQueue,
} from '@stoked-ui/media';

// Use mock implementations for testing
const mockAuth = createMockAuth({
  id: 'user-123',
  email: 'user@example.com',
  name: 'John Doe',
});

// Or create custom implementations
const customRouter: IRouter = {
  navigate: (path: string) => {
    // Custom navigation logic
  },
  currentPath: () => window.location.pathname,
  query: () => new URLSearchParams(window.location.search),
};

// Pass to components
<MediaCard
  item={mediaItem}
  modeState={modeState}
  setModeState={setModeState}
  router={customRouter}
  auth={mockAuth}
/>
```

### No-Op Implementations

For optional abstractions, use no-op implementations:

```tsx
import { noOpRouter, noOpAuth, noOpQueue, noOpPayment, noOpKeyboardShortcuts } from '@stoked-ui/media';

<MediaCard
  item={mediaItem}
  modeState={modeState}
  setModeState={setModeState}
  router={noOpRouter}
  auth={noOpAuth}
/>
```

## TypeScript Support

Full TypeScript support with comprehensive type definitions:

```tsx
import type {
  MediaCardProps,
  ExtendedMediaItem,
  MediaCardModeState,
  MediaCardDisplayMode,
  MediaViewerProps,
  MediaItem,
  MediaViewerMode,
} from '@stoked-ui/media';

import { MediaCard, MediaViewer } from '@stoked-ui/media';
```

## Examples

### Gallery with Owner Controls

```tsx
import { MediaCard } from '@stoked-ui/media';
import { useRouter, useAuth } from '@/hooks';
import { useState } from 'react';

export function MediaGallery({ items }) {
  const [modeState, setModeState] = useState({ mode: 'view' });
  const router = useRouter();
  const auth = useAuth();

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
      {items.map((item) => (
        <MediaCard
          key={item._id}
          item={item}
          modeState={modeState}
          setModeState={setModeState}
          router={router}
          auth={auth}
          info={true}
          onViewClick={(item) => router.navigate(`/media/${item._id}`)}
          onEditClick={(item) => router.navigate(`/media/${item._id}/edit`)}
          onDeleteClick={async (item) => {
            if (confirm('Delete this media?')) {
              // API call to delete
            }
          }}
        />
      ))}
    </div>
  );
}
```

### Media Viewer with Queue

```tsx
import { MediaViewer } from '@stoked-ui/media';
import { useRouter, useAuth, useQueue, useKeyboardShortcuts } from '@/hooks';
import { useState } from 'react';

export function MediaGalleryViewer({ items, initialIndex }) {
  const [open, setOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(initialIndex || 0);

  const router = useRouter();
  const auth = useAuth();
  const queue = useQueue();
  const keyboard = useKeyboardShortcuts();

  const currentItem = items[currentIndex];

  return (
    <MediaViewer
      item={currentItem}
      mediaItems={items}
      currentIndex={currentIndex}
      open={open}
      onClose={() => setOpen(false)}
      onNavigate={(item, index) => setCurrentIndex(index)}
      router={router}
      auth={auth}
      queue={queue}
      keyboard={keyboard}
      enableQueue={true}
      enableKeyboardShortcuts={true}
      enableOwnerControls={true}
      showPreviewCards={true}
    />
  );
}
```

### Integration with Next.js

```tsx
// hooks/useMediaAbstractions.ts
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import type { IRouter, IAuth } from '@stoked-ui/media';

export function useMediaRouter(): IRouter {
  const router = useRouter();
  return {
    navigate: (path: string) => router.push(path),
    currentPath: () => router.pathname,
    query: () => new URLSearchParams(),
  };
}

export function useMediaAuth(): IAuth {
  const { data: session } = useSession();
  const user = session?.user;

  return {
    getCurrentUser: () => user ? {
      id: user.id,
      email: user.email,
      name: user.name,
    } : null,
    isAuthenticated: () => !!session,
    login: () => signIn(),
    logout: () => signOut(),
    hasPermission: (resource, action) => true,
    isOwner: (authorId: string) => user?.id === authorId,
  };
}

// Usage
import { MediaCard } from '@stoked-ui/media';
import { useMediaRouter, useMediaAuth } from '@/hooks/useMediaAbstractions';

export function MyMediaCard({ item }) {
  const [modeState, setModeState] = useState({ mode: 'view' });
  const router = useMediaRouter();
  const auth = useMediaAuth();

  return (
    <MediaCard
      item={item}
      modeState={modeState}
      setModeState={setModeState}
      router={router}
      auth={auth}
    />
  );
}
```

## Advanced Features

### Metadata Extraction

Extract metadata directly from files in the browser:

```tsx
import { MediaFile } from '@stoked-ui/media';

const file = new MediaFile(inputFile);

// For videos
if (file.isVideo()) {
  const video = document.createElement('video');
  video.src = URL.createObjectURL(file.file);

  video.onloadedmetadata = () => {
    console.log('Duration:', video.duration);
    console.log('Width:', video.videoWidth);
    console.log('Height:', video.videoHeight);
  };
}

// For images
if (file.isImage()) {
  const img = new Image();
  img.src = URL.createObjectURL(file.file);

  img.onload = () => {
    console.log('Width:', img.width);
    console.log('Height:', img.height);
  };
}
```

### Hybrid Metadata Processing

The package supports hybrid metadata processing where metadata is fetched from both client and server:

```tsx
import { useMediaItem, useMediaMetadataCache } from '@stoked-ui/media';

function MediaDisplay({ mediaId }) {
  // Fetch from server (with caching)
  const { data: media } = useMediaItem(mediaId);

  // Use cached metadata or extract from file
  const metadata = useMediaMetadataCache({
    mediaId,
    serverMetadata: media,
    onMetadataExtracted: (extracted) => {
      console.log('Client-extracted metadata:', extracted);
    },
  });

  return (
    <div>
      <h2>{media?.title}</h2>
      <p>Duration: {metadata?.duration || media?.duration}</p>
    </div>
  );
}
```

**Benefits:**
- **Faster initial load**: Client metadata extracted immediately
- **Accurate data**: Server metadata used when available
- **Offline support**: Falls back to client extraction
- **Progressive enhancement**: Updates as server data loads

### Video Sprite Sheet Generation

For better scrubbing experience, video thumbnails are generated as sprite sheets:

```typescript
interface SpriteConfig {
  totalFrames: number;        // Total frames in sprite
  framesPerRow: number;       // Frames per row
  frameWidth: number;         // Width of each frame
  frameHeight: number;        // Height of each frame
  spriteSheetWidth: number;   // Total width
  spriteSheetHeight: number;  // Total height
  interval: number;           // Seconds between frames
}
```

The server generates these automatically. Access via:

```tsx
<MediaCard
  item={{
    ...media,
    scrubberGenerated: true,
    scrubberSprite: 'https://api.example.com/sprites/123.jpg',
    scrubberSpriteConfig: {
      totalFrames: 100,
      framesPerRow: 10,
      frameWidth: 160,
      frameHeight: 90,
      // ...
    }
  }}
/>
```

### Performance Optimization

**Lazy Loading:**
```tsx
const isVisible = useInView(ref);

<MediaCard
  item={media}
  isVisible={isVisible}
  // Only loads thumbnail when visible
/>
```

**Memoization:**
```tsx
import { useMemo } from 'react';
import { useMediaViewerLayout } from '@stoked-ui/media';

const layout = useMediaViewerLayout({
  item,
  mediaItems,
  currentIndex,
  // Memoized and recalculated only when deps change
});
```

**Image Optimization:**
- Use server-generated thumbnails when possible
- Set appropriate responsive image sizes
- Enable AVIF/WebP format support via picture element

## Troubleshooting

### Common Issues

**Issue: "MediaApiProvider not found" error**

Make sure to wrap your app with `MediaApiProvider`:

```tsx
import { MediaApiProvider } from '@stoked-ui/media';

export function App() {
  return (
    <MediaApiProvider config={{ baseUrl: 'https://api.example.com' }}>
      <YourApp />
    </MediaApiProvider>
  );
}
```

**Issue: Component renders but media doesn't load**

Check that:
1. The media file URL is accessible (CORS headers correct)
2. The file format is supported by the browser
3. The `mediaType` is set correctly (`'image'` or `'video'`)
4. Network request is successful (check DevTools Network tab)

**Issue: Thumbnails not showing**

Solutions:
1. Ensure thumbnail URL is correct
2. Check CORS headers on image server
3. Verify image format is supported (JPEG, PNG, WebP)
4. Use server-side thumbnail generation for consistency

**Issue: Video won't play**

Check:
1. Video format is supported (MP4/H.264, WebM/VP9)
2. Video codec is compatible
3. Server supports range requests for scrubbing
4. CORS headers allow video access

**Issue: Performance degradation with large galleries**

Solutions:
1. Use `isVisible` prop with virtualization
2. Implement pagination instead of infinite scroll
3. Use server-side thumbnail generation
4. Enable browser caching headers

### Debug Mode

Enable debug logging:

```tsx
import { MediaApiProvider } from '@stoked-ui/media';

<MediaApiProvider
  config={{ baseUrl: 'https://api.example.com' }}
  debug={true}
>
  <App />
</MediaApiProvider>
```

## FAQ

**Q: Does this work without the @stoked-ui/media-api backend?**

A: Yes! The components work standalone. Just provide URLs for files and thumbnails. The API client is optional for managing media metadata.

**Q: Can I use this with a different backend?**

A: Yes! Implement the `MediaApiClient` interface or use the generic client with your own endpoints.

**Q: How do I handle authentication?**

A: Use the `IAuth` abstraction:

```tsx
const auth: IAuth = {
  getCurrentUser: () => ({ id: 'user-1', email: 'user@example.com' }),
  isAuthenticated: () => !!localStorage.getItem('token'),
  login: () => redirectToLogin(),
  logout: () => clearToken(),
  hasPermission: (resource, action) => true,
  isOwner: (authorId) => authorId === currentUserId,
};

<MediaCard item={media} auth={auth} />
```

**Q: How do I implement payment integration?**

A: Use the `IPayment` abstraction:

```tsx
const payment: IPayment = {
  initiatePayment: async (options) => {
    // Call your payment processor (Stripe, PayPal, etc.)
    return { status: 'completed', transactionId: '...' };
  },
  verifyPayment: async (transactionId) => true,
};

<MediaCard item={paidMedia} payment={payment} />
```

**Q: Can I customize the UI?**

A: Use MUI's `sx` prop for styling:

```tsx
<MediaCard
  item={media}
  sx={{
    '& .media-card': { backgroundColor: '#f5f5f5' },
    '& .media-title': { fontSize: '1.25rem' },
  }}
/>
```

**Q: How do I implement queue management?**

A: Use the `IQueue` abstraction:

```tsx
const queue: IQueue = {
  items: mediaList,
  add: (item) => { /* add to queue */ },
  remove: (itemId) => { /* remove from queue */ },
  clear: () => { /* clear queue */ },
  next: () => currentItem,
  previous: () => previousItem,
};

<MediaViewer item={current} queue={queue} enableQueue />
```

## API Reference

### Type Definitions

**ExtendedMediaItem** - Represents a media file with metadata

**MediaCardProps** - Props for MediaCard component

**MediaViewerProps** - Props for MediaViewer component

**IRouter** - Abstract router interface

**IAuth** - Abstract auth interface

**IPayment** - Abstract payment interface

**IQueue** - Abstract queue interface

**IKeyboardShortcuts** - Abstract keyboard shortcuts interface

See [src/components/MediaCard/README.md](./src/components/MediaCard/README.md) and [src/components/MediaViewer/README.md](./src/components/MediaViewer/README.md) for comprehensive documentation.

## Storybook

The package includes comprehensive Storybook stories demonstrating all features. Run:

```bash
npm run storybook
```

## Contributing

Contributions are welcome! Please follow the [Conventional Commits](https://conventionalcommits.org) specification.

## License

MIT - See LICENSE file for details
