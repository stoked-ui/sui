/**
 * @stoked-ui/media - Media File Management and Processing Library
 *
 * This package provides comprehensive media file handling capabilities including:
 * - MediaFile: Base class for handling file uploads and media operations
 * - WebFile: Web-based file persistence and management
 * - AppFile: Application-specific file handling with metadata support
 * - MediaType: Utility for determining media types from MIME types
 * - FileSystemApi: Modern File System Access API integration
 * - Zip utilities: File compression and archiving support
 */

// ============================================================================
// Core Classes - Main Exports
// ============================================================================

/**
 * MediaFile class for handling file uploads and media operations
 * @see {@link https://example.com/docs/MediaFile} For detailed documentation
 */
import MediaFile from './MediaFile';

/**
 * WebFile class for web-based file persistence and management
 * @see {@link https://example.com/docs/WebFile} For detailed documentation
 */
import WebFile from './WebFile';

/**
 * App class for application-specific file management
 * @see {@link https://example.com/docs/App} For detailed documentation
 */
import App from './App';

/**
 * Stage class for file staging and processing operations
 * @see {@link https://example.com/docs/Stage} For detailed documentation
 */
import Stage from './Stage';

// ============================================================================
// Default Exports
// ============================================================================

export { App, MediaFile, WebFile, Stage };

// ============================================================================
// MediaFile Exports - Core File Handling
// ============================================================================

/**
 * MediaFile types and utilities
 * Includes MediaFile class, IMediaFile interface, and metadata handling
 */
export * from './MediaFile';

// ============================================================================
// WebFile Exports - Web Persistence
// ============================================================================

/**
 * WebFile types and utilities
 * Includes WebFile class, WebFileFactory, and related interfaces
 */
export * from './WebFile';

// ============================================================================
// WebFileFactory Exports - Web File Creation
// ============================================================================

/**
 * WebFileFactory for creating WebFile instances
 * Used internally by WebFile and App for file instantiation
 */
import WebFileFactory from './WebFileFactory';
export { WebFileFactory };

// ============================================================================
// App and AppFile Exports - Application File Management
// ============================================================================

/**
 * App and AppFile classes for application-specific file handling
 * Includes AppFile, AppOutputFile, and related factories
 */
export * from './App';

// ============================================================================
// MediaType Exports - MIME Type Utilities
// ============================================================================

/**
 * MediaType utilities for classifying files by MIME type
 * Provides getMediaType() function and MediaType type definition
 * @example
 * import { getMediaType, MediaType, MimeMediaWildcardMap } from '@stoked-ui/media';
 * const type = getMediaType('image/png'); // returns 'image'
 */
export * from './MediaType';

// ============================================================================
// FileSystemApi Exports - File System Access
// ============================================================================

/**
 * File System Access API utilities
 * Provides modern showOpenFilePicker and showSaveFilePicker integration
 * @example
 * import { openFileApi, saveFileApi } from '@stoked-ui/media';
 * const files = await openFileApi({ types: [{ accept: { 'image/*': ['.png', '.jpg'] } }] });
 */
export * from './FileSystemApi';

// ============================================================================
// Zip Utilities - Compression and Archiving
// ============================================================================

/**
 * Zip utilities for file compression and archiving
 * Includes createZip, pickProps, splitProps, and metadata handling
 * @example
 * import { createZip, IZipMetadata, ZipMetadata } from '@stoked-ui/media';
 * const zipped = await createZip(file);
 */
export * from './zip';

// ============================================================================
// Abstractions - Framework-Agnostic Interfaces
// ============================================================================

/**
 * Framework-agnostic abstractions for external dependencies
 * Allows media components to integrate with various routing, auth, payment,
 * queue management, and keyboard shortcut systems
 * @example
 * import {
 *   IRouter, IAuth, IPayment, IQueue, IKeyboardShortcuts,
 *   noOpRouter, noOpAuth, createMockPayment, createInMemoryQueue
 * } from '@stoked-ui/media';
 */
export * from './abstractions';

// ============================================================================
// Components - Media Viewer and UI Components
// ============================================================================

/**
 * MediaViewer component for full-screen media viewing
 * Framework-agnostic viewer with queue management, keyboard shortcuts,
 * and multiple display modes (NORMAL, THEATER, FULLSCREEN)
 * @example
 * import { MediaViewer, MediaViewerProps, MediaItem } from '@stoked-ui/media';
 * <MediaViewer
 *   item={mediaItem}
 *   open={true}
 *   onClose={handleClose}
 *   router={myRouter}
 *   auth={myAuth}
 *   queue={myQueue}
 * />
 */
export { MediaViewer, MediaViewerHeader, MediaViewerPrimary, NextUpHeader, NowPlayingIndicator } from './components/MediaViewer';
export type { MediaViewerProps, MediaItem, MediaViewerMode } from './components/MediaViewer';

/**
 * MediaViewer custom hooks
 * Includes useMediaViewerState, useMediaViewerLayout, and useMediaClassPlayback
 * @example
 * import { useMediaViewerState, MediaViewerMode } from '@stoked-ui/media';
 * const { mode, transition } = useMediaViewerState(MediaViewerMode.NORMAL);
 */
export { useMediaViewerState, useMediaViewerLayout } from './components/MediaViewer/hooks';

/**
 * MediaCard component for displaying media items with interactive controls
 * Supports images and videos with thumbnails, progress tracking, selection mode,
 * payment integration, and queue management
 * @example
 * import { MediaCard, MediaCardProps, ExtendedMediaItem } from '@stoked-ui/media';
 * <MediaCard
 *   item={mediaItem}
 *   modeState={{ mode: 'view' }}
 *   setModeState={setModeState}
 *   router={myRouter}
 *   auth={myAuth}
 *   payment={myPayment}
 *   queue={myQueue}
 *   onViewClick={handleView}
 * />
 */
export { MediaCard, ThumbnailStrip, VideoProgressBar } from './components/MediaCard';
export type {
  MediaCardProps,
  ExtendedMediaItem,
  MediaCardDisplayMode,
  MediaCardModeState,
  SpriteConfig,
} from './components/MediaCard';

// ============================================================================
// API Client - Media API Integration
// ============================================================================

/**
 * Media API Client for consuming NestJS Media API endpoints
 * Provides type-safe CRUD operations, upload management, and React hooks
 * @example
 * import {
 *   createMediaApiClient,
 *   createUploadClient,
 *   MediaApiProvider,
 *   useMediaList,
 *   useMediaUpload
 * } from '@stoked-ui/media';
 *
 * // Create API clients
 * const mediaClient = createMediaApiClient({
 *   baseUrl: 'https://api.example.com',
 *   authToken: 'your-token'
 * });
 *
 * // Or use with React
 * <MediaApiProvider config={{ baseUrl: 'https://api.example.com' }}>
 *   <App />
 * </MediaApiProvider>
 */
export * from './api';

// ============================================================================
// React Hooks - Media API Integration
// ============================================================================

/**
 * React hooks for Media API integration
 * Provides hooks for uploading, listing, updating, and deleting media
 * Built on @tanstack/react-query for optimal caching and state management
 * @example
 * import {
 *   useMediaUpload,
 *   useMediaList,
 *   useMediaItem,
 *   useMediaUpdate,
 *   useMediaDelete
 * } from '@stoked-ui/media';
 *
 * function MyComponent() {
 *   const { upload, isUploading, progress } = useMediaUpload();
 *   const { data: mediaList } = useMediaList({ page: 1, limit: 20 });
 *   return <div>...</div>;
 * }
 */
export * from './hooks';
