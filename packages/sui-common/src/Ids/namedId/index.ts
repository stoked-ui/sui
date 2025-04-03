/**
 * Exports a named ID and all its exports.
 * 
 * @packageDocumentation
 * This package exports the `import` module using the `namedId` function, which returns a named ID and all its exports.
 */

/**
 * @typedef {Object} NamedIdExports
 * @property {*} namedId The named ID returned by the `namedId` function.
 * @property {Array<*>} exports All the exports of the named ID.
 */
export default import.namedId;

export * from './namedId';