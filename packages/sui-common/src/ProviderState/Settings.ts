/**
 * Usage
 *
 * Creates a settings object with nested properties.
 *
 * @example
 * const settings = createSettings({
 *   user: { name: 'John', preferences: { theme: 'dark' } }
 * });
 *
 * console.log(settings['user.name']); // Output: John
 * settings['user.preferences.theme'] = 'light';
 * console.log(settings['user.preferences.theme']); // Output: light
 */

/**
 * Interface NestedRecord
 *
 * Represents a nested record with string keys and values of type T.
 *
 * @example
 * const data: Record<string, any> = { foo: 1, bar: 2 };
 * const nestedData: NestedRecord<string> = { [data.foo]: data.bar };
 */
export interface NestedRecord<T = any> {
  /**
   * The path to a nested value in the settings object.
   *
   * @type {string | symbol}
   */
  [path: string]: T;
}

/**
 * Interface Settings
 *
 * Extends the NestedRecord type with additional properties.
 *
 * @example
 * const settings: Settings<string> = { foo: 'bar', baz: { qux: 'quux' } };
 */
export interface Settings<T = any> extends NestedRecord<T> {
  /**
   * The initial data for the settings object (defaults to an empty record).
   *
   * @type {Record<string, T>}
   */
  [path: string]: T;
}

/**
 * Creates a settings object with nested properties.
 *
 * @param initialData - The initial data for the settings object (defaults to an empty record).
 * @returns A proxy object representing the settings, allowing for dynamic property access and modification.
 *
 * @example
 * const settings = createSettings({
 *   user: { name: 'John', preferences: { theme: 'dark' } }
 * });
 */
export function createSettings<T = any>(initialData: Record<string, T> = {}): Settings<T> {
  /**
   * The initial settings object.
   *
   * @private
   */
  const settings: Settings<T> = {...initialData};

  return new Proxy(settings, {
    /**
     * Resolves a path to a nested value in the settings object.
     *
     * @param path - The path to resolve (e.g., 'user.name' or 'bar.qux').
     * @returns The resolved value, or undefined if the path does not exist.
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
     * Sets a value for a property in the settings object.
     *
     * @param path - The path to set (e.g., 'user.name' or 'bar.qux').
     * @param value - The new value to set.
     * @returns True if the operation was successful, false otherwise.
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