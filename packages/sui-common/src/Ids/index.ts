/**
 * Exports utility functions for incrementing an identifier and creating a named ID.
 */
import namedId from './namedId';
import useIncId from './useIncId';

/**
 * @typedef {Object} ExportedFunctions
 * 
 * @property {(func: () => string) => string} namedId - Creates a unique named ID. This function takes a callback as an argument and returns a unique identifier.
 * 
 * @property {function} useIncId - Hook function to increment an identifier. This hook function increments the provided identifier by 1 and returns the updated value.
 */

/**
 * Utility functions for generating named IDs and incrementing identifiers.
 */
export { useIncId, namedId };
export * from './namedId';
export * from './useIncId';