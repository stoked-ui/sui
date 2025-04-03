/**
 * Exports types from various mime-related modules.
 *
 * This module serves as a central hub for exporting MIME type definitions
 * from the `MimeType`, `IMimeType`, and `StokedUiMime` modules.
 *
 * @module ExportedTypes
 */
export * from './MimeType';

/**
 * Exports types from the IMimeType module.
 *
 * The `IMimeType` module defines interfaces and types related to MIME types,
 * including properties, methods, and usage patterns.
 *
 * @example
 * Use the exported interface: const mimeType: IMimeType = {};
 *
 * @property {string} mimeType - The MIME type string.
 */
export * from './IMimeType';

/**
 * Exports types from the StokedUiMime module.
 *
 * The `StokedUiMime` module provides additional type definitions for use in
 * the Stoked UI framework, including props, methods, and state management logic.
 *
 * @param {object} [options] - Optional configuration options for Stoked UI Mimes.
 * @example
 * Use the exported class: const stokedUiMime = new StokedUiMime(options);
 */
export * from './StokedUiMime';