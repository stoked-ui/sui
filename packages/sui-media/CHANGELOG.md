# Changelog

All notable changes to the @stoked-ui/media package will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-01-21

### Initial Release

This is the first stable release of @stoked-ui/media, a comprehensive media management and component library for React applications.

### Added

#### Components

- **MediaCard Component**
  - Interactive card for displaying media in galleries and lists
  - Responsive thumbnail previews with lazy loading support
  - Video progress bar with frame-accurate scrubber sprite support
  - Interactive controls (play, edit, delete, toggle public)
  - Selection mode for batch operations and multi-select
  - Payment integration with price display for paid content
  - Queue management with playback tracking
  - Owner vs. viewer mode detection
  - Grid-responsive design with flexible aspect ratios
  - MediaClass branding support
  - Complete TypeScript type definitions

- **MediaViewer Component**
  - Full-screen media viewer with multiple view modes (NORMAL, THEATER, FULLSCREEN)
  - Smooth navigation between media items with prev/next controls
  - Queue integration for playlist management with next-up indicators
  - Keyboard shortcuts for accessibility and power users
  - Responsive layout that adapts to viewport and content
  - Preview grid showing upcoming items
  - MediaClass branding with before/after idents
  - Owner controls for editing and deletion
  - API integration for loading full media details
  - Error handling with fallback display

#### Media File Management

- **MediaFile Class**
  - Core file handling with upload/download capabilities
  - Media type detection (image, video, audio, document)
  - File metadata access (name, size, type, lastModified)
  - Upload with progress tracking
  - File reading utilities (ArrayBuffer, DataURL, Text)

- **WebFile Class**
  - Web-persistent storage using IndexedDB
  - Save/load/delete operations for client-side file caching
  - File listing and management
  - Extends MediaFile with storage capabilities

- **File System Access API Integration**
  - Modern file picker dialogs
  - Native save dialogs
  - Type filtering for file selection
  - Browser feature detection with graceful fallback

#### API Client

- **MediaApiClient**
  - Type-safe client for @stoked-ui/media-api backend
  - Complete CRUD operations (Create, Read, Update, Delete)
  - Advanced filtering and search capabilities
  - Pagination support (offset and cursor-based)
  - Authentication with JWT token management
  - Configurable timeout and base URL
  - Error handling and retry logic

- **API Provider Context**
  - React context for API client configuration
  - Global authentication state management
  - Centralized API configuration

#### React Hooks

- **useMediaList**: Paginated media list with caching via TanStack Query
- **useMediaItem**: Single media item fetching with cache
- **useMediaUpload**: File upload with progress tracking
- **useMediaUpdate**: Media metadata updates
- **useMediaDelete**: Media deletion with cache invalidation
- **useMediaMetadataCache**: Hybrid metadata caching (client + server)
- **useMediaViewerLayout**: Responsive layout calculations

#### Abstraction Layers

- **IRouter**: Framework-agnostic routing abstraction
- **IAuth**: Authentication and authorization abstraction
- **IPayment**: Payment processing abstraction
- **IQueue**: Media queue management abstraction
- **IKeyboardShortcuts**: Keyboard event handling abstraction

#### Mock Implementations

- **createMockAuth**: Mock authentication for testing
- **createMockPayment**: Mock payment processor for testing
- **createInMemoryQueue**: In-memory queue implementation
- **noOpRouter**: No-operation router
- **noOpAuth**: No-operation auth
- **noOpPayment**: No-operation payment
- **noOpQueue**: No-operation queue
- **noOpKeyboardShortcuts**: No-operation keyboard shortcuts

#### Advanced Features

- **Metadata Extraction**
  - Client-side video metadata extraction (duration, dimensions, codec)
  - Client-side image metadata extraction (dimensions, format)
  - Hybrid metadata processing (client + server)
  - Progressive enhancement as server data loads

- **Video Sprite Sheet Support**
  - Sprite sheet configuration parsing
  - Frame-accurate scrubbing preview
  - Optimized sprite sheet display

- **Performance Optimizations**
  - Lazy loading support for images and videos
  - Memoization of expensive calculations
  - Intersection Observer integration
  - Server-side thumbnail generation support
  - Responsive image optimization

#### TypeScript Support

- Complete TypeScript type definitions for all APIs
- Strict type checking
- JSDoc comments for IntelliSense
- Exported type definitions:
  - MediaCardProps
  - ExtendedMediaItem
  - MediaCardModeState
  - MediaCardDisplayMode
  - MediaViewerProps
  - MediaItem
  - MediaViewerMode
  - All abstraction interfaces

#### Documentation

- Comprehensive README with examples
- Component-specific README files
- API client usage guide
- Storybook stories for all components
- TypeScript type documentation
- Migration guide from @stoked-ui/media-selector

#### Testing

- Unit tests for all core functionality
- Component tests with React Testing Library
- Mock implementations for testing
- Test utilities and helpers

### Migration from @stoked-ui/media-selector

Users of the deprecated @stoked-ui/media-selector package should migrate to @stoked-ui/media:

**Before:**
```typescript
import { MediaSelector } from '@stoked-ui/media-selector';
```

**After:**
```typescript
import { MediaCard, MediaViewer } from '@stoked-ui/media';
```

The new package includes all functionality from media-selector plus comprehensive media management features.

### Breaking Changes

This is an initial release, so there are no breaking changes from previous versions.

### Dependencies

- **Peer Dependencies**:
  - react: ^18.0.0
  - @stoked-ui/common: workspace:^
  - @tanstack/react-query: ^5.0.0

- **Direct Dependencies**:
  - formdata-node: ^6.0.3
  - jszip: ^3.10.1

### Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile browsers: Modern iOS Safari and Chrome on Android

### Known Issues

- File System Access API has limited support in Firefox (requires flag)
- File System Access API has limited support on mobile browsers
- Safari has partial support for File System Access API

### Contributors

- Brian Stoker (Author)

---

For more information, see the [README](./README.md).
