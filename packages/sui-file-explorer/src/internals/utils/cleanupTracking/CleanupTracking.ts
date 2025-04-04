/**
 * Interface for tracking cleanup operations.
 */
export type UnregisterToken = { cleanupToken: number };

/**
 * Type representing a function to unsubscribe from an object.
 */
export type UnsubscribeFn = () => void;

/**
 * Interface for tracking cleanup operations, providing methods to register and unregister
 * objects with cleanup functions, as well as resetting the tracker.
 *
 * @description Tracks cleanup operations for objects.
 */
export interface CleanupTracking {
  /**
   * Registers an object with a cleanup function, providing a token to unregister.
   *
   * @param {any} object - The object to register.
   * @param {UnsubscribeFn} unsubscribe - The function to call when the object is unregistered.
   * @param {UnregisterToken} unregisterToken - A token to use for unregistering the object.
   */
  register(object: any, unsubscribe: UnsubscribeFn, unregisterToken: UnregisterToken): void;

  /**
   * Unregisters an object from cleanup operations using a provided token.
   *
   * @param {UnregisterToken} unregisterToken - The token to use for unregistering the object.
   */
  unregister(unregisterToken: UnregisterToken): void;

  /**
   * Resets the cleanup tracking system, effectively clearing all registered objects and their cleanup functions.
   */
  reset(): void;
}