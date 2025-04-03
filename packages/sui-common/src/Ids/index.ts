import namedId from './namedId';
/**
 * @packageDocumentation
 * Importing a module that exports the `namedId` variable.
 * 
 * This file re-exports the `useIncId` hook and `namedId` variable for easy access.
 */

/**
 *
 * @typedef {object} NamedIdImportedObject
 * @property {string} namedId - Unique identifier
 */
import useIncId from './useIncId';
/**
 * Importing and re-exporting the `useIncId` hook.
 * 
 * The `useIncId` hook provides a convenient way to generate unique identifiers.
 */

/**
 *
 * @typedef {object} UseIncIdObject
 * @property {function} useIncId - Generates a unique identifier
 */
export { useIncId, namedId };
/**
 * Re-exporting the `useIncId` hook and `namedId` variable for easy access.
 * 
 * This allows developers to import these components seamlessly in their codebase.
 */

/**
 *
 * @typedef {object} NamedIdExportedObject
 * @property {string} namedId - Unique identifier
 */
export * from './namedId';
/**
 * Re-exporting all exports from the `namedId` module.
 * 
 * This includes the `namedId` variable, which provides a unique identifier for our application.
 */

/**
 *
 * @typedef {object} UseIncIdExportedObject
 * @property {function} useIncId - Generates a unique identifier
 */
export * from './useIncId';
/**
 * Re-exporting all exports from the `useIncId` module.
 * 
 * This includes the `useIncId` hook, which provides a convenient way to generate unique identifiers.