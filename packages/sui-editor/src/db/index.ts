/**
 * Exported function for initializing the database.
 * 
 * @param {Object} config - Configuration object for initializing the database.
 * @returns {void}
 * 
 * @example
 * initDb({ 
 *   host: 'localhost',
 *   port: 5432,
 *   user: 'user',
 *   password: 'password'
 * });
 */
import initDb from './init'

export { initDb }
