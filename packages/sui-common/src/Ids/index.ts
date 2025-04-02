/**
 * @file Exports utility functions for incrementing an identifier and creating a named ID.
 */

import namedId from './namedId';
import useIncId from './useIncId';

/**
 * @typedef {Object} ExportedFunctions
 * @property {(func: () => string) => string} namedId - Function to create a unique named ID.
 * @property {function} useIncId - Hook function to increment an identifier.
 */

export { useIncId, namedId };
export * from './namedId';
export * from './useIncId';