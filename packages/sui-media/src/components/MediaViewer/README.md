# MediaViewer Component

A full-screen media viewer component for displaying images and videos with multiple view modes, queue management, and keyboard shortcuts.

## Overview

The `MediaViewer` component provides a rich media viewing experience with:

- **Multiple View Modes**: Normal (embedded), Theater (maximized), and Fullscreen modes
- **Navigation Controls**: Previous/next buttons with keyboard support
- **Queue Integration**: Displays next-up queue from media items
- **Keyboard Shortcuts**: Built-in shortcuts for common actions (arrows, f, esc)
- **Responsive Layout**: Adapts to different screen sizes and orientations
- **Media Class Support**: Branded playback with before/after idents and video bugs
- **Ownership Controls**: Edit, delete, and visibility toggle for content owners
- **Preview Grid**: Shows media items for quick navigation
- **Auto-play Support**: Optional automatic playback on open

## Features

### View Modes

```typescript
export enum MediaViewerMode {
  /** Default embedded view (90vw max, preview cards visible) */
  NORMAL = 'NORMAL',

  /** Viewport-maximized (100vw, 95vh max, no preview cards) */
  THEATER = 'THEATER',

  /** Browser fullscreen API active (100vw, 100vh) */
  FULLSCREEN = 'FULLSCREEN',
}
```

- **NORMAL**: Standard embedded view suitable for galleries and collections
- **THEATER**: Large maximized view without preview cards
- **FULLSCREEN**: Full browser fullscreen mode for immersive viewing

### Abstraction Layers

The component uses framework-agnostic abstraction layers for:

- **Router**: Navigation to media detail pages
- **Auth**: User authentication and ownership verification
- **Queue**: Media playback queue management
- **KeyboardShortcuts**: Keyboard event handling
- **Payment**: Payment processing for paid content

## Props

### Core Props

```typescript
/** Current media item to display */
item: MediaItem;

/** All media items in the gallery/collection */
mediaItems?: MediaItem[];

/** Index of current item in mediaItems array */
currentIndex?: number;

/** Whether the viewer is currently open */
open: boolean;
```

### Callback Handlers

```typescript
/** Handler for closing the viewer */
onClose: () => void;

/** Handler for navigating to a different item */
onNavigate?: (item: MediaItem, index: number) => void;

/** Handler when media item is edited */
onEdit?: (item: MediaItem) => void;

/** Handler when media item is deleted */
onDelete?: (item: MediaItem) => void;
```

### Abstraction Layers

```typescript
/** Router abstraction for navigation */
router?: IRouter;

/** Auth abstraction for user info and permissions */
auth?: IAuth;

/** Queue abstraction for Next Up functionality */
queue?: IQueue;

/** Keyboard shortcuts abstraction */
keyboard?: IKeyboardShortcuts;

/** Payment abstraction for paid content */
payment?: IPayment;
```

### Configuration Props

```typescript
/** Whether to hide the navbar/header */
hideNavbar?: boolean;

/** Whether to show preview cards at bottom */
showPreviewCards?: boolean;

/** Initial viewer mode */
initialMode?: MediaViewerMode;

/** MediaClass configuration for branded playback */
mediaClass?: MediaClassConfig | null;

/** Whether to enable autoplay */
autoplay?: boolean;

/** Initial muted state */
initialMuted?: boolean;
```

### Feature Flags

```typescript
/** Whether to enable queue management */
enableQueue?: boolean;

/** Whether to enable keyboard shortcuts */
enableKeyboardShortcuts?: boolean;

/** Whether to enable owner controls (edit/delete) */
enableOwnerControls?: boolean;

/** Whether to enable MediaClass playback sequences */
enableMediaClass?: boolean;
```

## Usage Examples

### Basic Usage

```tsx
import { MediaViewer } from '@stoked-ui/media';
import { useState } from 'react';

export function BasicMediaViewer() {
  const [viewerOpen, setViewerOpen] = useState(false);

  const mediaItem = {
    id: '123',
    title: 'Sample Video',
    mediaType: 'video',
    file: '/videos/sample.mp4',
    thumbnail: '/thumbnails/sample.jpg',
    duration: 300,
  };

  return (
    <>
      <button onClick={() => setViewerOpen(true)}>Open Viewer</button>

      <MediaViewer
        item={mediaItem}
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
      />
    </>
  );
}
```

### With Media Collection

```tsx
import { MediaViewer } from '@stoked-ui/media';
import { useState } from 'react';

export function CollectionViewer() {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const mediaItems = [
    {
      id: '1',
      title: 'Video 1',
      mediaType: 'video',
      file: '/videos/v1.mp4',
      thumbnail: '/thumb1.jpg',
    },
    {
      id: '2',
      title: 'Video 2',
      mediaType: 'video',
      file: '/videos/v2.mp4',
      thumbnail: '/thumb2.jpg',
    },
    {
      id: '3',
      title: 'Image',
      mediaType: 'image',
      file: '/images/img.jpg',
      thumbnail: '/img-thumb.jpg',
    },
  ];

  const currentItem = mediaItems[currentIndex];

  return (
    <MediaViewer
      item={currentItem}
      mediaItems={mediaItems}
      currentIndex={currentIndex}
      open={viewerOpen}
      onClose={() => setViewerOpen(false)}
      onNavigate={(item, index) => setCurrentIndex(index)}
      showPreviewCards={true}
    />
  );
}
```

### With Router and Auth Integration

```tsx
import { MediaViewer } from '@stoked-ui/media';
import { useRouter, useAuth } from '@/hooks';
import { useState } from 'react';

export function AuthenticatedViewer() {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const router = useRouter();
  const auth = useAuth();

  const mediaItems = [
    { id: '1', title: 'My Video', mediaType: 'video', file: '/v1.mp4' },
    { id: '2', title: 'Another Video', mediaType: 'video', file: '/v2.mp4' },
  ];

  const handleClose = () => {
    setViewerOpen(false);
    // Navigate back to gallery
    router.navigate('/media/gallery');
  };

  const handleEdit = (item) => {
    // Navigate to edit page
    router.navigate(`/media/${item.id}/edit`);
  };

  const handleDelete = async (item) => {
    // Delete logic here
    if (confirm('Delete this media?')) {
      // API call...
      setViewerOpen(false);
    }
  };

  return (
    <MediaViewer
      item={mediaItems[currentIndex]}
      mediaItems={mediaItems}
      currentIndex={currentIndex}
      open={viewerOpen}
      onClose={handleClose}
      onNavigate={(item, index) => setCurrentIndex(index)}
      onEdit={handleEdit}
      onDelete={handleDelete}
      router={router}
      auth={auth}
      enableOwnerControls={true}
    />
  );
}
```

### With Queue Management

```tsx
import { MediaViewer } from '@stoked-ui/media';
import { useQueue } from '@/hooks';
import { useState } from 'react';

export function QueuedViewer() {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const queue = useQueue();

  const mediaItems = [
    { id: '1', title: 'Now Playing', mediaType: 'video', file: '/v1.mp4' },
    { id: '2', title: 'Up Next', mediaType: 'video', file: '/v2.mp4' },
    { id: '3', title: 'Later', mediaType: 'video', file: '/v3.mp4' },
  ];

  return (
    <MediaViewer
      item={mediaItems[currentIndex]}
      mediaItems={mediaItems}
      currentIndex={currentIndex}
      open={viewerOpen}
      onClose={() => setViewerOpen(false)}
      onNavigate={(item, index) => setCurrentIndex(index)}
      queue={queue}
      enableQueue={true}
      showPreviewCards={true}
    />
  );
}
```

### With Keyboard Shortcuts

```tsx
import { MediaViewer } from '@stoked-ui/media';
import { useKeyboardShortcuts } from '@/hooks';
import { useState } from 'react';

export function AccessibleViewer() {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const keyboard = useKeyboardShortcuts();

  const mediaItems = [
    { id: '1', title: 'Video 1', mediaType: 'video', file: '/v1.mp4' },
    { id: '2', title: 'Video 2', mediaType: 'video', file: '/v2.mp4' },
  ];

  return (
    <MediaViewer
      item={mediaItems[currentIndex]}
      mediaItems={mediaItems}
      currentIndex={currentIndex}
      open={viewerOpen}
      onClose={() => setViewerOpen(false)}
      onNavigate={(item, index) => setCurrentIndex(index)}
      keyboard={keyboard}
      enableKeyboardShortcuts={true}
    />
  );
}
```

### With MediaClass Branding

```tsx
import { MediaViewer } from '@stoked-ui/media';
import { useState } from 'react';

export function BrandedViewer() {
  const [viewerOpen, setViewerOpen] = useState(false);

  const mediaItem = {
    id: '123',
    title: 'Branded Content',
    mediaType: 'video',
    file: '/videos/content.mp4',
    thumbnail: '/thumb.jpg',
  };

  const mediaClass = {
    id: 'premium-class',
    name: 'Premium Channel',
    beforeIdent: {
      id: 'ident-before',
      thumbnail: '/idents/before.jpg',
      duration: 3,
    },
    afterIdent: {
      id: 'ident-after',
      thumbnail: '/idents/after.jpg',
      duration: 3,
    },
    videoBug: {
      imageId: 'bug-logo',
      imageUrl: '/logos/watermark.png',
      position: 'bottom-right',
      sizePercent: 10,
      opacity: 0.8,
      intervalSeconds: 5,
      durationSeconds: 2,
      initialDelaySeconds: 1,
    },
  };

  return (
    <MediaViewer
      item={mediaItem}
      open={viewerOpen}
      onClose={() => setViewerOpen(false)}
      mediaClass={mediaClass}
      enableMediaClass={true}
      autoplay={true}
    />
  );
}
```

### Theater Mode Viewer

```tsx
import { MediaViewer, MediaViewerMode } from '@stoked-ui/media';
import { useState } from 'react';

export function TheaterViewer() {
  const [viewerOpen, setViewerOpen] = useState(false);

  const mediaItem = {
    id: '123',
    title: 'Movie Night',
    mediaType: 'video',
    file: '/videos/movie.mp4',
    thumbnail: '/thumb.jpg',
  };

  return (
    <MediaViewer
      item={mediaItem}
      open={viewerOpen}
      onClose={() => setViewerOpen(false)}
      initialMode={MediaViewerMode.THEATER}
      showPreviewCards={false}
    />
  );
}
```

## Keyboard Shortcuts

When `enableKeyboardShortcuts` is true, the following shortcuts are active:

| Key | Action |
|-----|--------|
| `←` (Left Arrow) | Previous media |
| `→` (Right Arrow) | Next media |
| `f` | Cycle through view modes |
| `Esc` | Close viewer or exit fullscreen |

## Integration with Abstraction Layers

### Router Abstraction

Navigate to different pages based on user actions:

```tsx
import { IRouter } from '@stoked-ui/media';

const customRouter: IRouter = {
  navigate: (path: string, options?: NavigationOptions) => {
    // Custom navigation
  },
  currentPath: () => window.location.pathname,
  query: () => new URLSearchParams(window.location.search),
};

<MediaViewer
  item={mediaItem}
  open={true}
  onClose={() => {}}
  router={customRouter}
/>
```

### Auth Abstraction

Show different controls based on user authentication and ownership:

```tsx
import { IAuth } from '@stoked-ui/media';

const customAuth: IAuth = {
  getCurrentUser: () => ({
    id: 'user123',
    username: 'john_doe',
    email: 'john@example.com',
  }),
  isOwner: (authorId: string) => authorId === 'user123',
  isAuthenticated: () => true,
};

<MediaViewer
  item={mediaItem}
  open={true}
  onClose={() => {}}
  auth={customAuth}
  onEdit={(item) => console.log('Edit:', item)}
  onDelete={(item) => console.log('Delete:', item)}
/>
```

### Queue Abstraction

Manage playback queue and display next-up items:

```tsx
import { IQueue } from '@stoked-ui/media';

const customQueue: IQueue = {
  items: [],
  addItem: (item) => { /* ... */ },
  removeItem: (id) => { /* ... */ },
  clear: () => { /* ... */ },
};

<MediaViewer
  item={mediaItem}
  mediaItems={mediaItems}
  open={true}
  onClose={() => {}}
  queue={customQueue}
  enableQueue={true}
/>
```

### KeyboardShortcuts Abstraction

Integrate with your keyboard handling system:

```tsx
import { IKeyboardShortcuts } from '@stoked-ui/media';

const customKeyboard: IKeyboardShortcuts = {
  register: (key: string, handler: () => void | boolean) => {
    // Register handler
    return () => {
      // Cleanup function
    };
  },
  unregister: (key: string) => { /* ... */ },
};

<MediaViewer
  item={mediaItem}
  open={true}
  onClose={() => {}}
  keyboard={customKeyboard}
  enableKeyboardShortcuts={true}
/>
```

## Layout Behavior

### Normal Mode
- Embedded view with max width of 90vw
- Preview cards displayed at bottom
- Header and controls visible
- Responsive to viewport size

### Theater Mode
- Maximized view with 100vw width and 95vh height
- No preview cards
- Minimal header
- Hides preview grid

### Fullscreen Mode
- 100vw × 100vh fullscreen
- Browser fullscreen API
- Complete immersive experience
- All UI hidden when not interacting

## Responsive Design

The component automatically adapts to:
- Mobile devices (portrait and landscape)
- Tablets
- Desktop screens
- Ultra-wide displays

## Performance Considerations

- Media items are lazy-loaded
- Preview grid is only rendered in NORMAL mode
- Video playback is optimized for streaming
- Memoization of layout calculations

## Accessibility

The component includes:
- Keyboard navigation
- ARIA labels
- Focus management
- Semantic HTML structure
- Screen reader support

## TypeScript Support

Full TypeScript support with comprehensive types:

```tsx
import type {
  MediaViewerProps,
  MediaItem,
  MediaViewerMode,
  MediaViewerLayoutResult,
  MediaClassConfig,
} from '@stoked-ui/media';
```

## Sub-Components

- **MediaViewerHeader**: Top header with media information and close button
- **MediaViewerPrimary**: Main media display area with controls
- **NextUpHeader**: Queue status display
- **NowPlayingIndicator**: Playback status indicator

## Related Components

- **MediaCard**: Card component for displaying media thumbnails
- **VideoProgressBar**: Standalone video progress bar

## See Also

- [MediaCard Documentation](../MediaCard/README.md)
- [Abstraction Layers Guide](../../abstractions/README.md)
- [Storybook Stories](./MediaViewer.stories.tsx)
