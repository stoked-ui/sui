/**
 * @file Overview of the createSettings function and its usage.
 */

export interface NestedRecord<T = any> {
  /**
   * A record type that allows nested properties with arbitrary keys.
   */
  [path: string]: T;
}

/**
 * @interface Settings
 * An object extending NestedRecord, allowing for dynamic property names.
 *
 * @extends {NestedRecord<any>}
 * @template T - The type of the settings object.
 */

export interface Settings<T = any> extends NestedRecord<T> {}

/**
 * Creates a new instance of the settings object, which is a proxy of the initial data.
 *
 * @param {Record<string, any>} [initialData={}] - The initial data for the settings object.
 * @returns {Settings<any>} A new instance of the settings object.
 */
export function createSettings<T = any>(initialData: Record<string, T> = {}): Settings<T> {
  /**
   * Creates a new proxy settings object by merging the initial data.
   *
   * @type {Settings<T>}
   */

  const settings: Settings<T> = {...initialData};

  return new Proxy(settings, {
    /**
     * Gets the value of a nested property. If the path is not found, returns undefined.
     *
     * @param {string | symbol} [path=''] - The path to the desired property.
     * @returns {*} The value of the property at the specified path.
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
     * Sets the value of a nested property. If the path is not found, creates it.
     *
     * @param {string | symbol} [path=''] - The path to the desired property.
     * @param {*} [value] - The new value for the property at the specified path.
     * @returns {boolean} True if the operation was successful, false otherwise.
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