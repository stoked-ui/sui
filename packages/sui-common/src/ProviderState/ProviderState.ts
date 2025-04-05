/**
 * @typedef {Object} NestedRecord
 * @property {string} path - The path within the nested record
 */

/**
 * @typedef {Object} Settings
 * @property {string} path - The path within the settings
 */

/**
 * Creates settings with nested structure
 * @param {Record<string, T>} initialData - The initial data for settings
 * @returns {Settings<T>} The settings object with nested capabilities
 */
export function createSettings<T = any>(initialData: Record<string, T> = {}): Settings<T> {
  const settings: Settings<T> = {...initialData};

  return new Proxy(settings, {
    /**
     * Retrieves value based on nested path
     * @param {Settings<T>} target - The target settings object
     * @param {string | symbol} path - The path to retrieve value from
     * @returns {any} The value at the specified path
     */
    get: (target, path: string | symbol) => {
      if (typeof path === 'string' && path.includes('.')) {
        const keys = path.split('.');
        return keys.reduce((acc: any, key: string) => {
          return acc && acc[key] !== undefined ? acc[key] : undefined;
        }, target);
      }
      return target[path as keyof typeof target];
    },
    /**
     * Sets value based on nested path
     * @param {Settings<T>} target - The target settings object
     * @param {string | symbol} path - The path to set value for
     * @param {any} value - The value to set
     * @returns {boolean} Indicates if the value was successfully set
     */
    set: (target, path: string | symbol, value) => {
      if (typeof path === 'string' && path.includes('.')) {
        const keys = path.split('.');
        keys.reduce((acc: any, key: string, index: number) => {
          if (index === keys.length - 1) {
            acc[key] = value;
          } else {
            acc[key] = acc[key] || {};
          }
          return acc[key];
        }, target);
        return true;
      }
      target[path as keyof typeof target] = value;
      return true;
    }
  });
}