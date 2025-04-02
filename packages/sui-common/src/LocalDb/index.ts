/**
 * Exports the LocalDb class and its modules.
 *
 * @module exports
 */

import LocalDb from './LocalDb';
import VideoDb from './VideoDb';

/**
 * Exports the LocalDb class as the default export.
 *
 * @type {LocalDb}
 */
export default LocalDb;

/**
 * Re-exports all properties of the LocalDb class.
 *
 * @see LocalDb
 */
export * from './LocalDb';

/**
 * Re-exports all properties of the VideoDb class.
 *
 * @see VideoDb
 */
export * from './VideoDb';