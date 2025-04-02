import namedId from './namedId';

/**
 * Exports a module that provides the namedId functionality, allowing other modules to access it directly.
 * 
 * This module can be imported by other modules and re-exported for convenience.
 */

/**
 * @interface NamedIdFunction
 * @description The function responsible for prefixing names with unique identifiers.
 * 
 * @param {Object} obj - An object containing a 'name' property.
 * @returns {string} The name prefixed with the unique identifier.
 */
export default namedId;

/**
 * Re-exports the namedId function, allowing other modules to access it directly without an alias.
 * 
 * This re-exports can be useful when working in environments where aliasing is not allowed or preferred.
 */