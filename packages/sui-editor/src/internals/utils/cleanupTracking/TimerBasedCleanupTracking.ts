/**
 * TimerBasedCleanupTracking class implements the CleanupTracking interface
 */
export class TimerBasedCleanupTracking implements CleanupTracking {
  /**
   * Map to store timeouts
   */
  timeouts? = new Map<number, ReturnType<typeof setTimeout>>();

  /**
   * Time interval for cleanup
   */
  cleanupTimeout = CLEANUP_TIMER_LOOP_MILLIS;

  /**
   * Creates an instance of TimerBasedCleanupTracking.
   * @param {number} timeout - Timeout value for cleanup
   */
  constructor(timeout = CLEANUP_TIMER_LOOP_MILLIS) {
    this.cleanupTimeout = timeout;
  }

  /**
   * Register an object for cleanup
   * @param {any} object - Object to register
   * @param {UnsubscribeFn} unsubscribe - Function to unsubscribe
   * @param {UnregisterToken} unregisterToken - Token for unregistering
   */
  register(object: any, unsubscribe: UnsubscribeFn, unregisterToken: UnregisterToken): void {
    if (!this.timeouts) {
      this.timeouts = new Map<number, ReturnType<typeof setTimeout>>();
    }

    const timeout = setTimeout(() => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
      this.timeouts!.delete(unregisterToken.cleanupToken);
    }, this.cleanupTimeout);

    this.timeouts!.set(unregisterToken!.cleanupToken, timeout);
  }

  /**
   * Unregister an object from cleanup
   * @param {UnregisterToken} unregisterToken - Token for unregistering
   */
  unregister(unregisterToken: UnregisterToken): void {
    const timeout = this.timeouts!.get(unregisterToken.cleanupToken);
    if (timeout) {
      this.timeouts!.delete(unregisterToken.cleanupToken);
      clearTimeout(timeout);
    }
  }

  /**
   * Reset all timeouts and unregister all objects
   */
  reset() {
    if (this.timeouts) {
      this.timeouts.forEach((value, key) => {
        this.unregister({ cleanupToken: key });
      });
      this.timeouts = undefined;
    }
  }
}