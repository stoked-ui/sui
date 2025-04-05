import { CleanupTracking, UnregisterToken, UnsubscribeFn } from './CleanupTracking';

/**
 * Class implementing CleanupTracking using FinalizationRegistry for cleanup tracking.
 */
export class FinalizationRegistryBasedCleanupTracking implements CleanupTracking {
  /**
   * FinalizationRegistry instance for tracking cleanup functions.
   */
  registry = new FinalizationRegistry<UnsubscribeFn>((unsubscribe) => {
    if (typeof unsubscribe === 'function') {
      unsubscribe();
    }
  });

  /**
   * Register an object with its corresponding cleanup function and unregister token.
   * 
   * @param {any} object - The object to register for cleanup.
   * @param {UnsubscribeFn} unsubscribe - The cleanup function to be called when object is finalized.
   * @param {UnregisterToken} unregisterToken - The token used to unregister the object.
   */
  register(object: any, unsubscribe: UnsubscribeFn, unregisterToken: UnregisterToken): void {
    this.registry.register(object, unsubscribe, unregisterToken);
  }

  /**
   * Unregister an object using its unregister token.
   * 
   * @param {UnregisterToken} unregisterToken - The token of the object to unregister.
   */
  unregister(unregisterToken: UnregisterToken): void {
    this.registry.unregister(unregisterToken);
  }

  // eslint-disable-next-line class-methods-use-this
  /**
   * Reset the cleanup tracking mechanism.
   */
  reset() {}
}