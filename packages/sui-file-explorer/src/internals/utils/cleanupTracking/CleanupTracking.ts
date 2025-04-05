/**
 * Defines the type for the cleanup token.
 * @typedef {Object} UnregisterToken
 * @property {number} cleanupToken - The cleanup token number.
 */

/**
 * Defines the type for the unsubscribe function.
 * @typedef {Function} UnsubscribeFn
 */

/**
 * Interface for cleanup tracking functionality.
 * @interface CleanupTracking
 */
export interface CleanupTracking {
  /**
   * Registers an object with an unsubscribe function and unregister token.
   * @param {any} object - The object to register.
   * @param {UnsubscribeFn} unsubscribe - The unsubscribe function.
   * @param {UnregisterToken} unregisterToken - The unregister token.
   */
  register(object: any, unsubscribe: UnsubscribeFn, unregisterToken: UnregisterToken): void;
  
  /**
   * Unregisters an object based on the unregister token.
   * @param {UnregisterToken} unregisterToken - The unregister token to identify the object.
   */
  unregister(unregisterToken: UnregisterToken): void;
  
  /**
   * Resets the cleanup tracking functionality.
   */
  reset(): void;
}