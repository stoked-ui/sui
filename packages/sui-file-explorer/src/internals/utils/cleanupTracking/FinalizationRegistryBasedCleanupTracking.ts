/**
 * Class implementing CleanupTracking using the FinalizationRegistry API
 */
export class FinalizationRegistryBasedCleanupTracking implements CleanupTracking {
  /**
   * FinalizationRegistry instance to track objects and their cleanup functions
   */
  registry = new FinalizationRegistry<UnsubscribeFn>((unsubscribe) => {
    if (typeof unsubscribe === 'function') {
      unsubscribe();
    }
  });

  /**
   * Register an object with its corresponding cleanup function and unregister token
   * 
   * @param {any} object - The object to register
   * @param {UnsubscribeFn} unsubscribe - The cleanup function to call when object is finalized
   * @param {UnregisterToken} unregisterToken - The token used to unregister the object
   */
  register(object: any, unsubscribe: UnsubscribeFn, unregisterToken: UnregisterToken): void {
    this.registry.register(object, unsubscribe, unregisterToken);
  }

  /**
   * Unregister an object using its unregister token
   * 
   * @param {UnregisterToken} unregisterToken - The token to unregister the object
   */
  unregister(unregisterToken: UnregisterToken): void {
    this.registry.unregister(unregisterToken);
  }

  // eslint-disable-next-line class-methods-use-this
  /**
   * Reset method placeholder (no functionality implemented)
   */
  reset() {}
}