/**
 * TimerBasedCleanupTracking class implementing CleanupTracking interface.
 * Tracks cleanup actions based on timer intervals.
 */
export class TimerBasedCleanupTracking implements CleanupTracking {
  /**
   * Map containing timeouts for cleanup actions.
   */
  timeouts? = new Map<number, ReturnType<typeof setTimeout>>();

  /**
   * Time interval for cleanup actions in milliseconds.
   */
  cleanupTimeout = CLEANUP_TIMER_LOOP_MILLIS;

  /**
   * Constructor for TimerBasedCleanupTracking.
   * @param {number} timeout - Time interval for cleanup actions in milliseconds.
   */
  constructor(timeout = CLEANUP_TIMER_LOOP_MILLIS) {
    this.cleanupTimeout = timeout;
  }

  /**
   * Register a cleanup action.
   * @param {any} object - Object to associate cleanup action with.
   * @param {UnsubscribeFn} unsubscribe - Function to unsubscribe cleanup action.
   * @param {UnregisterToken} unregisterToken - Token to unregister cleanup action.
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
   * Unregister a cleanup action.
   * @param {UnregisterToken} unregisterToken - Token to unregister cleanup action.
   */
  unregister(unregisterToken: UnregisterToken): void {
    const timeout = this.timeouts!.get(unregisterToken.cleanupToken);
    if (timeout) {
      this.timeouts!.delete(unregisterToken.cleanupToken);
      clearTimeout(timeout);
    }
  }

  /**
   * Reset all cleanup actions.
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