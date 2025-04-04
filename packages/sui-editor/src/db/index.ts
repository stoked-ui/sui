/**
 * Exports the initialization database function.
 * 
 * @module initDb
 */

import initDb from './init';

/**
 * @typedef {function} InitDbFunction
 * 
 * @description The initialization database function.
 * 
 * @param {object} options - Initialization options.
 * 
 * @returns {Promise<void>} A promise resolving when the database is initialized.
 */
export { initDb };