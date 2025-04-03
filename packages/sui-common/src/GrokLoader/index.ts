/**
 * @packageDocumentation
 * The GrokLoader is a module that loads and executes Grok scripts.
 * It provides a way to load and execute scripts in a centralized manner,
 * making it easier to manage script dependencies and interactions.
 */

import GrokLoader from './GrokLoader';

/**
 * @typedef {Object} GrokOptions
 * Configuration options for the loader.
 *
 * @property {string[]} [scripts] - Array of script names to load and execute.
 */
interface GrokOptions {
  /**
   * The array of script names to load and execute.
   * If not provided, all scripts in the current directory are loaded.
   */
  scripts?: string[];
}

/**
 * @typedef {Object} GrokScript
 * A single script to be loaded and executed by the loader.
 *
 * @property {string} name - The name of the script.
 */

interface GrokScript {
  /**
   * The name of the script.
   */
  name: string;
}
/**
 * @function GrokLoader
 * 
 * The default export of the GrokLoader module, providing access to its functionality.
 * 
 * This function loads and executes an array of Grok scripts, returning a promise
 * that resolves when all scripts have been executed. Any configuration options provided
 * are used to customize the loading process.
 * 
 * @param {GrokOptions} options - Configuration options for the loader.
 * @returns {Promise<void>} A promise that resolves when all scripts have been executed.
 */
export default GrokLoader;