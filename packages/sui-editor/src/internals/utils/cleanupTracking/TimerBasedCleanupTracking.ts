/**
 * TimerBasedCleanupTracking is a class that implements CleanupTracking interface.
 * It tracks the cleanup timers for objects in an application and un-subscribes them when they are no longer needed.
 *
 * @implements {CleanupTracking}
 */
export class TimerBasedCleanupTracking implements CleanupTracking {
  /**
   * A map of timeouts with their corresponding unregister tokens as keys.
   * The value is the timeout function that will be called when the timeout expires.
   */
  timeouts? = new Map<number, ReturnType<typeof setTimeout>>();

  /**
   * The amount of time in milliseconds after which a cleanup timer should expire.
   * Defaults to 1000 if not specified.
   */
  cleanupTimeout = CLEANUP_TIMER_LOOP_MILLIS;

  /**
   * Constructs a new TimerBasedCleanupTracking instance.
   *
   * @param {number} [timeout=CLEANUP_TIMER_LOOP_MILLIS] - The amount of time in milliseconds after which a cleanup timer should expire.
   */
  constructor(timeout = CLEANUP_TIMER_LOOP_MILLIS) {
    this.cleanupTimeout = timeout;
  }

  /**
   * Registers an object with a cleanup function and un-subscribes it when the cleanup timer expires.
   *
   * @param {any} object - The object to register for cleanup.
   * @param {UnsubscribeFn} unsubscribe - The function to call when the object is no longer needed.
   * @param {UnregisterToken} unregisterToken - The token to use for registration and un-registration.
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
   * Un-registers an object and un-subscribes it when the cleanup timer expires.
   *
   * @param {UnregisterToken} unregisterToken - The token to use for registration and un-registration.
   */
  unregister(unregisterToken: UnregisterToken): void {
    const timeout = this.timeouts!.get(unregisterToken.cleanupToken);
    if (timeout) {
      this.timeouts!.delete(unregisterToken.cleanupToken);
      clearTimeout(timeout);
    }
  }

  /**
   * Resets the timers for all registered objects.
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