/**
 * @interface GrokLoader
 * 
 * The GrokLoader is a module that loads and executes Grok scripts.
 * It provides a way to load and execute scripts in a centralized manner,
 * making it easier to manage script dependencies and interactions.
 */

import GrokLoader from './GrokLoader';

/**
 * @function GrokLoader
 * 
 * The default export of the GrokLoader module, providing access to its functionality.
 * 
 * @param {Object} options - Configuration options for the loader.
 * @param {string[]} options.scripts - Array of script names to load and execute.
 * 
 * @returns {Promise<void>} A promise that resolves when all scripts have been executed.
 */

export default GrokLoader;