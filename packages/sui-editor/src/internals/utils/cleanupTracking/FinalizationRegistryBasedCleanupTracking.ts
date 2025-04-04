import {CleanupTracking, UnregisterToken, UnsubscribeFn} from './CleanupTracking';

/**
 * A FinalizationRegistry-based cleanup tracking implementation.
 */
export class FinalizationRegistryBasedCleanupTracking implements CleanupTracking {
  /**
   * The finalization registry used to track objects that need to be cleaned up.
   */
  registry = new FinalizationRegistry<UnsubscribeFn>((unsubscribe) => {
    if (typeof unsubscribe === 'function') {
      unsubscribe();
    }
  });

  /**
   * Registers an object with the cleanup tracking system, along with a callback function
   * to clean up when the object is no longer in use.
   *
   * @param {object} object The object that needs to be cleaned up.
   * @param {UnsubscribeFn} unsubscribe A function that will be called when the object is no longer in use.
   * @param {UnregisterToken} unregisterToken A token used to identify the object for cleanup purposes.
   */
  register(object: any, unsubscribe: UnsubscribeFn, unregisterToken: UnregisterToken): void {
    this.registry.register(object, unsubscribe, unregisterToken);
  }

  /**
   * Unregisters an object from the cleanup tracking system using a provided token.
   *
   * @param {UnregisterToken} unregisterToken A token used to identify the object for cleanup purposes.
   */
  unregister(unregisterToken: UnregisterToken): void {
    this.registry.unregister(unregisterToken);
  }

  /**
   * Resets the cleanup tracking system, which has no effect in this implementation.
   *
   * @returns {void}
   */
  // eslint-disable-next-line class-methods-use-this
  reset() {}
}