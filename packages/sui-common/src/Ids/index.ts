/**
 * Module exports
 *
 * This module exports various components and functions for internationalization.
 *
 * @module exports
 */

/**
 * Import necessary components and utilities
 */
import namedId from './namedId';
import useIncId from './useIncId';

/**
 * Export the useIncId component and the namedId variable
 */
export { useIncId, namedId };

/**
 * Re-export all modules from the namedId directory.
 *
 * @see https://www.typescriptlang.org/docs/handbook/advanced-topics.html#exporting-modules
 */
export * from './namedId';

/**
 * Re-export all modules from the useIncId directory.
 *
 * @see https://www.typescriptlang.org/docs/handbook/advanced-topics.html#exporting-modules
 */
export * from './useIncId';