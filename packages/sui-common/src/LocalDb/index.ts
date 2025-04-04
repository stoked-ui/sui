/**
 * Exports the LocalDb and VideoDb modules, making their contents available for import in other files.
 */

import LocalDb from './LocalDb';
import VideoDb from './VideoDb';

/**
 * Re-exports all properties of the imported LocalDb and VideoDb modules to ensure they can be accessed directly.
 */
export default LocalDb;
export * from './LocalDb';
export * from './VideoDb';