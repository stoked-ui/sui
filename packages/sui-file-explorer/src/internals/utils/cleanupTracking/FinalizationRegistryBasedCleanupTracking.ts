/**
 * Finalization Registry Based Cleanup Tracking Class
 *
 * This class implements the CleanupTracking interface and provides a finalization registry based cleanup tracking system.
 */
export class FinalizationRegistryBasedCleanupTracking implements CleanupTracking {
  /**
   * The finalization registry used to track objects and their corresponding unsubscribe functions.
   * @type {FinalizationRegistry<UnsubscribeFn>}
   */
  registry = new FinalizationRegistry<UnsubscribeFn>((unsubscribe) => {
    if (typeof unsubscribe === 'function') {
      unsubscribe();
    }
  });

  /**
   * Registers an object with the cleanup tracking system, allowing for later unregistration.
   *
   * @param {any} object - The object to be tracked by the cleanup tracking system.
   * @param {UnsubscribeFn} unsubscribe - The function to be called when the object is no longer in use.
   * @param {UnregisterToken} unregisterToken - A token used to identify the object and its corresponding unsubscribe function for unregistration purposes.
   */
  register(object: any, unsubscribe: UnsubscribeFn, unregisterToken: UnregisterToken): void {
    this.registry.register(object, unsubscribe, unregisterToken);
  }

  /**
   * Unregisters an object from the cleanup tracking system.
   *
   * @param {UnregisterToken} unregisterToken - The token used to identify the object and its corresponding unsubscribe function for unregistration purposes.
   */
  unregister(unregisterToken: UnregisterToken): void {
    this.registry.unregister(unregisterToken);
  }

  /**
   * Resets the cleanup tracking system, removing all tracked objects and their corresponding unsubscribe functions.
   *
   * @note This method does not actually delete any objects or resources. It simply resets the registry to its initial state.
   */
  reset() {}
}