/**
 * @packageDocumentation Exported Types
 *
 * Exports types from various mime-related modules. This module serves as a central hub for exporting MIME type definitions from the `MimeType`, `IMimeType`, and `StokedUiMime` modules.
 */
export * from './MimeType';

/**
 * @typedef {import('./MimeType').MimeType} MimeType
 * @typedef {import('./IMimeType').IMimeType} IMimeType
 * @typedef {import('./StokedUiMime').StokedUiMime} StokedUiMime
 */

/**
 * Exports types from the `MimeType` module.
 *
 * The `MimeType` module defines interfaces and types related to MIME types,
 * including properties, methods, and usage patterns.
 *
 * @example Use the exported interface: const mimeType: MimeType = {};
 */
export * from './MimeType';

/**
 * Exports types from the `IMimeType` module.
 *
 * The `IMimeType` module provides additional type definitions for use in
 * MIME-related contexts, including props, methods, and state management logic.
 *
 * @typedef {object} IMimeTypeOptions
 * @property {string} [options.type] - Optional MIME type string.
 *
 * @param {IMimeTypeOptions} [options] - Optional configuration options for MIME types.
 * @example Use the exported class: const mimeType = new MimeType(options);
 */
export * from './IMimeType';

/**
 * Exports types from the `StokedUiMime` module.
 *
 * The `StokedUiMime` module provides additional type definitions for use in
 * the Stoked UI framework, including props, methods, and state management logic.
 *
 * @typedef {object} StokedUiMimeOptions
 * @property {string} [options.type] - Optional MIME type string.
 * @property {object} [options.config] - Optional configuration options for Stoked UI Mimes.
 *
 * @example Use the exported class: const stokedUiMime = new StokedUiMime(StokedUiMimeOptions);
 */
export * from './StokedUiMime';