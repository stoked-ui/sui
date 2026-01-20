# @stoked-ui/media

A framework-agnostic media component library featuring reactive media cards and viewers with abstraction layers for routing, authentication, payments, and queue management.

## Overview

The `@stoked-ui/media` package provides high-quality, reusable media components for displaying images and videos in web applications. The components are designed to be framework-agnostic through the use of abstraction layers, allowing them to work seamlessly with any routing system, authentication provider, payment processor, and queue management system.

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Components](#components)
  - [MediaCard](#mediacard)
  - [MediaViewer](#mediaviewer)
- [Abstraction Layers](#abstraction-layers)
- [TypeScript Support](#typescript-support)
- [Examples](#examples)
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

The package requires React 18+ as a peer dependency:

```bash
npm install react@^18.0.0
```

## Quick Start

### Basic MediaCard

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
    />
  );
}
```

### Basic MediaViewer

```tsx
import { MediaViewer } from '@stoked-ui/media';
import { useState } from 'react';

export function MyMediaViewer() {
  const [open, setOpen] = useState(false);

  const item = {
    id: '123',
    title: 'My Video',
    mediaType: 'video',
    file: '/videos/sample.mp4',
    thumbnail: '/thumbnails/sample.jpg',
  };

  return (
    <>
      <button onClick={() => setOpen(true)}>Open Viewer</button>
      <MediaViewer
        item={item}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
```

## Components

### MediaCard

An interactive card component for displaying media items in galleries or lists.

**Key Features:**
- Display images and videos with thumbnails
- Video progress tracking with scrubber sprite support
- Interactive controls (play, edit, delete)
- Selection mode for batch operations
- Payment integration for paid content
- Queue management
- Owner vs. viewer modes
- Responsive design with grid support

**Basic Props:**
```typescript
interface MediaCardProps {
  item: ExtendedMediaItem;           // Media to display
  modeState: MediaCardModeState;     // Selection mode state
  setModeState: (state) => void;     // Mode state setter
  info?: boolean;                     // Show info overlay
  minimalMode?: boolean;              // Compact mode
  squareMode?: boolean;               // 1:1 aspect ratio
  displayMode?: MediaCardDisplayMode; // Owner vs. viewer

  // Callbacks
  onViewClick?: (item) => void;
  onEditClick?: (item) => void;
  onDeleteClick?: (item) => void;
  onTogglePublic?: (item) => void;

  // Abstractions
  router?: IRouter;
  auth?: IAuth;
  payment?: IPayment;
  queue?: IQueue;
}
```

**Documentation:** [MediaCard README](./src/components/MediaCard/README.md)

### MediaViewer

A full-screen media viewer component with multiple view modes and navigation.

**Key Features:**
- Multiple view modes (NORMAL, THEATER, FULLSCREEN)
- Navigation between media items
- Queue integration for playlist management
- Keyboard shortcuts
- Responsive layout
- Preview grid
- MediaClass branding support
- Owner controls

**Basic Props:**
```typescript
interface MediaViewerProps {
  item: MediaItem;                    // Current item
  mediaItems?: MediaItem[];           // All items
  currentIndex?: number;              // Current position
  open: boolean;                      // Viewer open state

  // Callbacks
  onClose: () => void;
  onNavigate?: (item, index) => void;
  onEdit?: (item) => void;
  onDelete?: (item) => void;

  // Abstractions
  router?: IRouter;
  auth?: IAuth;
  queue?: IQueue;
  keyboard?: IKeyboardShortcuts;
  payment?: IPayment;

  // Configuration
  showPreviewCards?: boolean;
  enableQueue?: boolean;
  enableKeyboardShortcuts?: boolean;
  enableOwnerControls?: boolean;
}
```

**Documentation:** [MediaViewer README](./src/components/MediaViewer/README.md)

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

## Storybook Stories

The package includes comprehensive Storybook stories demonstrating all component features and configurations.

**MediaCard Stories:**
- BasicVideo
- BasicImage
- SquareMode
- OwnerContent
- ViewerContent
- PaidContent
- WithPaymentIntegration
- WithQueueIntegration
- SelectionMode
- GridLayout
- CompleteIntegration

**MediaViewer Stories:**
- BasicVideo
- MediaCollection
- NormalMode
- TheaterMode
- FullscreenMode
- WithOwnerControls
- WithQueueIntegration
- WithKeyboardShortcuts
- CompleteIntegration

## API Documentation

### Extended Media Item

The `ExtendedMediaItem` type includes comprehensive fields for media metadata:

```typescript
interface ExtendedMediaItem {
  _id?: string;
  title?: string;
  description?: string;
  mediaType?: 'image' | 'video' | 'album';
  file?: string;
  url?: string;
  thumbnail?: string;
  paidThumbnail?: string;
  duration?: number;
  views?: number;
  publicity?: 'public' | 'private' | 'paid' | 'subscription' | 'deleted';
  price?: number;
  author?: string;
  owners?: string[];
  likes?: string[];
  dislikes?: string[];
  tags?: string[];

  // Video features
  scrubberGenerated?: boolean;
  scrubberSprite?: string;
  scrubberSpriteConfig?: SpriteConfig;

  // MediaClass branding
  mediaClass?: MediaClass;

  // Stream recording metadata
  isStreamRecording?: boolean;
  streamRecordedAt?: Date | string;
  streamPeakViewers?: number;
  [key: string]: any;
}
```

## Performance Optimization

The components include several optimization techniques:

- **Lazy Loading**: Use `isVisible` prop for rendering optimization in long lists
- **Selection Optimization**: Use `globalSelectionMode` for batch operations
- **Layout Memoization**: Layout calculations are memoized
- **Responsive Images**: Automatic responsive image sizing
- **Video Optimization**: Efficient video loading with preview sprites

## Accessibility

All components include:

- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation support
- Focus management
- Proper contrast ratios
- Screen reader support

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile browsers: iOS Safari 12+, Chrome Android Latest

## Contributing

Contributions are welcome! Please follow the [Conventional Commits](https://conventionalcommits.org) specification.

## License

MIT - See LICENSE file for details

---

**For detailed component documentation, see:**
- [MediaCard Documentation](./src/components/MediaCard/README.md)
- [MediaViewer Documentation](./src/components/MediaViewer/README.md)
- [Abstraction Layers Guide](./src/abstractions/README.md)
