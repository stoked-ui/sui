# MediaCard Component

A responsive card component for displaying media items (images and videos) with interactive controls and abstraction layer integration.

## Overview

The `MediaCard` component is designed to display media content in a gallery or list view with:

- **Thumbnail Display**: Shows media thumbnails with support for images and videos
- **Video Progress Tracking**: Displays video progress bar on hover with scrubber sprite support
- **Interactive Controls**: Provides play, edit, delete, and visibility toggle buttons
- **Selection Mode**: Supports batch selection for multiple media items
- **Payment Integration**: Shows locked state for paid content and triggers payment flow
- **Queue Integration**: Allows adding media to playback queue
- **Owner Controls**: Displays different controls for content owners vs. viewers
- **Responsive Design**: Adapts to different screen sizes with optional square mode
- **Accessibility**: Built with Material-UI components for proper semantic structure

## Features

### Display Modes

- **View Mode**: Standard browsing with interactive overlays
- **Select Mode**: Batch selection with checkboxes
- **Minimal Mode**: Compact card without overlay controls
- **Square Mode**: Forces 1:1 aspect ratio for grid views

### Abstraction Layers

The component uses framework-agnostic abstraction layers for:

- **Router**: Navigation handling (Next.js, React Router, etc.)
- **Auth**: User authentication and ownership checking
- **Payment**: Payment processing and access control
- **Queue**: Media playback queue management

## Props

### Core Props

```typescript
/** The media item to display */
item: ExtendedMediaItem;

/** Selection mode state */
modeState: MediaCardModeState;

/** Callback to update selection mode state */
setModeState: React.Dispatch<React.SetStateAction<MediaCardModeState>>;
```

### Display Props

```typescript
/** Optional CSS class name */
className?: string;

/** Show additional info overlays */
info?: boolean;

/** Visibility optimization - only render content when in viewport */
isVisible?: boolean;

/** Minimal mode - compact card without overlay controls */
minimalMode?: boolean;

/** Display mode for the card */
displayMode?: MediaCardDisplayMode;

/** Global selection mode - lifted to parent for batch optimization */
globalSelectionMode?: boolean;

/** Whether this card is selected */
isSelected?: boolean;

/** Material-UI sx prop for custom styling */
sx?: SxProps<Theme>;

/** Grid view mode - force 1:1 aspect ratio */
squareMode?: boolean;
```

### Callback Handlers

```typescript
/** Callback when view/play is clicked */
onViewClick?: (item: ExtendedMediaItem) => void;

/** Callback when edit is clicked */
onEditClick?: (item: ExtendedMediaItem) => void;

/** Callback when delete is clicked */
onDeleteClick?: (item: ExtendedMediaItem) => void;

/** Callback when toggle public/private is clicked */
onTogglePublic?: (item: ExtendedMediaItem) => void;

/** Callback when toggle rating (adult/ga) is clicked */
onToggleAdult?: (item: ExtendedMediaItem) => void;

/** Callback when hide is clicked */
onHide?: (item: ExtendedMediaItem) => void;
```

### Abstraction Layer Props

```typescript
/** Router abstraction for navigation */
router?: IRouter;

/** Authentication abstraction for user info and permissions */
auth?: IAuth;

/** Payment abstraction for handling purchases */
payment?: IPayment;

/** Queue abstraction for managing media playback queue */
queue?: IQueue;
```

### Configuration Props

```typescript
/** Base URL for media files (e.g., CDN or S3 bucket URL) */
mediaBaseUrl?: string;

/** Base URL for thumbnails */
thumbnailBaseUrl?: string;

/** Enable keyboard shortcuts for media controls */
enableKeyboardShortcuts?: boolean;
```

## Usage Examples

### Basic Usage with No-Op Abstractions

```tsx
import { MediaCard } from '@stoked-ui/media';
import type { ExtendedMediaItem, MediaCardModeState } from '@stoked-ui/media';
import { useState } from 'react';

export function BasicMediaCard() {
  const [modeState, setModeState] = useState<MediaCardModeState>({ mode: 'view' });

  const mediaItem: ExtendedMediaItem = {
    _id: '123',
    title: 'Sample Video',
    mediaType: 'video',
    file: '/videos/sample.mp4',
    thumbnail: '/thumbnails/sample.jpg',
    duration: 300,
    publicity: 'public',
    views: 1000,
  };

  return (
    <MediaCard
      item={mediaItem}
      modeState={modeState}
      setModeState={setModeState}
      info={true}
    />
  );
}
```

### With Router and Auth Abstractions

```tsx
import { MediaCard } from '@stoked-ui/media';
import { useRouter, useAuth } from '@/hooks'; // Your custom hooks
import { useState } from 'react';

export function MediaCardWithRouter() {
  const [modeState, setModeState] = useState({ mode: 'view' });
  const router = useRouter();
  const auth = useAuth();

  const mediaItem = {
    _id: '456',
    title: 'My Video',
    mediaType: 'video',
    file: '/videos/myvideo.mp4',
    thumbnail: '/thumbnails/myvideo.jpg',
    author: 'user123',
    duration: 600,
    publicity: 'private',
  };

  return (
    <MediaCard
      item={mediaItem}
      modeState={modeState}
      setModeState={setModeState}
      router={router}
      auth={auth}
      displayMode="ownContent"
      onViewClick={(item) => console.log('View:', item)}
      onEditClick={(item) => console.log('Edit:', item)}
    />
  );
}
```

### With Payment Integration

```tsx
import { MediaCard } from '@stoked-ui/media';
import { useRouter, useAuth, usePayment } from '@/hooks';
import { useState } from 'react';

export function PaidMediaCard() {
  const [modeState, setModeState] = useState({ mode: 'view' });
  const router = useRouter();
  const auth = useAuth();
  const payment = usePayment();

  const paidContent = {
    _id: '789',
    title: 'Premium Content',
    mediaType: 'video',
    file: '/videos/premium.mp4',
    thumbnail: '/thumbnails/premium.jpg',
    paidThumbnail: '/thumbnails/premium-paid.jpg', // Shown when locked
    publicity: 'paid',
    price: 500, // Price in satoshis
    author: 'creator123',
    duration: 1200,
  };

  return (
    <MediaCard
      item={paidContent}
      modeState={modeState}
      setModeState={setModeState}
      router={router}
      auth={auth}
      payment={payment}
      thumbnailBaseUrl="https://cdn.example.com/"
      onViewClick={(item) => {
        // Will automatically trigger payment flow if needed
        router.navigate(`/media/${item._id}`);
      }}
    />
  );
}
```

### With Queue Integration

```tsx
import { MediaCard } from '@stoked-ui/media';
import { useRouter, useAuth, useQueue } from '@/hooks';
import { useState } from 'react';

export function MediaCardWithQueue() {
  const [modeState, setModeState] = useState({ mode: 'view' });
  const router = useRouter();
  const auth = useAuth();
  const queue = useQueue();

  const mediaItem = {
    _id: '999',
    title: 'Episode 1',
    mediaType: 'video',
    file: '/videos/episode1.mp4',
    thumbnail: '/thumbnails/ep1.jpg',
    duration: 2400,
    publicity: 'public',
  };

  const handleViewClick = (item) => {
    // Add to queue for playback
    queue.addItem({
      id: item._id,
      type: item.mediaType,
      title: item.title,
      src: item.file,
      thumbnail: item.thumbnail,
      duration: item.duration,
      metadata: item,
    });
    router.navigate(`/media/${item._id}`);
  };

  return (
    <MediaCard
      item={mediaItem}
      modeState={modeState}
      setModeState={setModeState}
      router={router}
      auth={auth}
      queue={queue}
      onViewClick={handleViewClick}
    />
  );
}
```

### Selection Mode

```tsx
import { MediaCard } from '@stoked-ui/media';
import { useState } from 'react';

export function MediaCardSelection() {
  const [modeState, setModeState] = useState({
    mode: 'select',
    selectState: { selected: [] },
  });

  const mediaItems = [
    { _id: '1', title: 'Video 1', mediaType: 'video', file: '/v1.mp4' },
    { _id: '2', title: 'Video 2', mediaType: 'video', file: '/v2.mp4' },
    { _id: '3', title: 'Image', mediaType: 'image', thumbnail: '/img.jpg' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
      {mediaItems.map((item) => (
        <MediaCard
          key={item._id}
          item={item}
          modeState={modeState}
          setModeState={setModeState}
          globalSelectionMode={true}
          isSelected={modeState.selectState?.selected.includes(item._id) || false}
        />
      ))}
    </div>
  );
}
```

## Integration with Abstraction Layers

### Router Abstraction

The Router abstraction handles navigation. By default, clicking the play button navigates to `/media/{id}`. Customize this by providing your own router implementation:

```tsx
import { IRouter } from '@stoked-ui/media';

const customRouter: IRouter = {
  navigate: (path: string, options?: NavigationOptions) => {
    // Custom navigation logic
    window.history.pushState(null, '', path);
  },
  currentPath: () => window.location.pathname,
  query: () => new URLSearchParams(window.location.search),
};

<MediaCard
  item={mediaItem}
  modeState={modeState}
  setModeState={setModeState}
  router={customRouter}
/>
```

### Auth Abstraction

The Auth abstraction provides user information and ownership checks. Different controls are shown based on ownership:

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

<MediaCard
  item={mediaItem}
  modeState={modeState}
  setModeState={setModeState}
  auth={customAuth}
/>
```

### Payment Abstraction

The Payment abstraction handles payment processing for paid content:

```tsx
import { IPayment } from '@stoked-ui/media';

const customPayment: IPayment = {
  requestPayment: async (options) => {
    // Custom payment flow
    return {
      id: 'payment_123',
      status: 'pending',
      amount: options.amount,
      currency: options.currency,
    };
  },
  verifyPayment: async (paymentId) => ({
    verified: true,
    status: 'completed',
  }),
};

<MediaCard
  item={paidContent}
  modeState={modeState}
  setModeState={setModeState}
  payment={customPayment}
/>
```

### Queue Abstraction

The Queue abstraction manages the playback queue:

```tsx
import { IQueue } from '@stoked-ui/media';

const customQueue: IQueue = {
  items: [],
  addItem: (item) => {
    customQueue.items.push(item);
  },
  removeItem: (id) => {
    customQueue.items = customQueue.items.filter(i => i.id !== id);
  },
  clear: () => {
    customQueue.items = [];
  },
};

<MediaCard
  item={mediaItem}
  modeState={modeState}
  setModeState={setModeState}
  queue={customQueue}
/>
```

## Advanced Features

### Video Progress Tracking

Videos display a progress bar on hover with support for scrubber sprite sheets for frame previews:

```tsx
const videoItem: ExtendedMediaItem = {
  _id: '555',
  mediaType: 'video',
  file: '/videos/sample.mp4',
  thumbnail: '/thumb.jpg',
  duration: 300,
  scrubberGenerated: true,
  scrubberSprite: '/sprites/sample-sprite.jpg',
  scrubberSpriteConfig: {
    totalFrames: 100,
    framesPerRow: 10,
    frameWidth: 160,
    frameHeight: 90,
    spriteSheetWidth: 1600,
    spriteSheetHeight: 900,
    interval: 3, // Frame every 3 seconds
  },
};

<MediaCard
  item={videoItem}
  modeState={modeState}
  setModeState={setModeState}
/>
```

### MediaClass Branding

Support for MediaClass branding with before/after idents and video bugs:

```tsx
const brandedItem: ExtendedMediaItem = {
  _id: '666',
  mediaType: 'video',
  file: '/videos/branded.mp4',
  thumbnail: '/thumb.jpg',
  mediaClass: {
    id: 'class-premium',
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
  },
};
```

## Styling

Customize the card appearance using the `sx` prop:

```tsx
<MediaCard
  item={mediaItem}
  modeState={modeState}
  setModeState={setModeState}
  sx={{
    borderRadius: '12px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    transition: 'transform 0.2s',
    '&:hover': {
      transform: 'scale(1.02)',
    },
  }}
/>
```

## Accessibility

The component includes proper accessibility features:

- Semantic HTML structure using Material-UI components
- Keyboard navigation support
- ARIA labels on buttons
- Proper contrast ratios
- Focus management

## TypeScript Support

Full TypeScript support with comprehensive type definitions:

```tsx
import type {
  MediaCardProps,
  ExtendedMediaItem,
  MediaCardDisplayMode,
  MediaCardModeState,
} from '@stoked-ui/media';
```

## Performance Considerations

- Use `isVisible` prop for lazy rendering in long lists
- Leverage `globalSelectionMode` for batch operations
- Videos are only loaded when visible in the viewport
- Memoization recommendations for parent components

## Related Components

- **MediaViewer**: Full-screen media viewer with queue management
- **VideoProgressBar**: Standalone video progress bar component
- **ThumbnailStrip**: Video thumbnail strip for scrubber previews

## See Also

- [MediaViewer Documentation](../MediaViewer/README.md)
- [Abstraction Layers Guide](../../abstractions/README.md)
- [Storybook Stories](./MediaCard.stories.tsx)
