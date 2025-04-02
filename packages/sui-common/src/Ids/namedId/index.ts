/**
 * Exports a module that provides the namedId functionality.
 * 
 * This module is imported by other modules and can be re-exported for convenience.
 */

import namedId from './namedId';

/**
 * Export the namedId function as the default export of this module.
 */
export default namedId;

/**
 * Re-export the namedId function for convenience, allowing other modules to access it directly.
 */
export * from './namedId';