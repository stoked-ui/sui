/**
 * UnregisterToken represents a token used for cleaning up resources.
 */
export type UnregisterToken = { cleanupToken: number };

/**
 * UnsubscribeFn is a function that unsubscribes from an object, returning no value.
 */
export type UnsubscribeFn = () => void;

/**
 * CleanupTracking interface provides methods to register and unregister cleanup tracking.
 * 
 * @purpose Provides methods for registering and unregistering cleanup tracking for objects.
 */
export interface CleanupTracking {
  /**
   * Registers a cleanup tracking token with an object, providing the unsubscribe function and token.
   * 
   * @param object The object that will be cleaned up.
   * @param unsubscribe A function to unsubscribe from the object.
   * @param unregisterToken A token used for cleaning up resources.
   */
  register(object: any, unsubscribe: UnsubscribeFn, unregisterToken: UnregisterToken): void;

  /**
   * Unregisters a cleanup tracking token with an object.
   * 
   * @param unregisterToken The token to be unregistered.
   */
  unregister(unregisterToken: UnregisterToken): void;

  /**
   * Resets the cleanup tracking for all objects.
   */
  reset(): void;
}