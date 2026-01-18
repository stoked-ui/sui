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
