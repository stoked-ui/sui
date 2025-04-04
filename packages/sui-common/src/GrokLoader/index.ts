/**
 * @class GrokLoader
 * @description A loader for importing Grok-related data and functionality.
 */

import { loadGrokData } from './loader-utils';
import { initGrokConfig } from './grok-config';

const GrokLoader = () => {
  /**
   * Loads the necessary data and configuration for working with Grok.
   *
   * @returns {Promise<void>} A promise that resolves when the loading is complete.
   */
  return loadGrokData().then((data) => initGrokConfig(data));
};

export default GrokLoader;