import {CleanupTracking, UnregisterToken, UnsubscribeFn} from './CleanupTracking';

/**
 * The time in milliseconds before which the render is assumed to be committed if no effect ran.
 */
const CLEANUP_TIMER_LOOP_MILLIS = 1000;

/**
 * TimerBasedCleanupTracking class documentation
 *
 * This class implements the CleanupTracking interface and provides timer-based cleanup functionality.
 * It allows objects to be registered for cleanup after a specified timeout, and unregisters them when the timeout is reached.
 */
export class TimerBasedCleanupTracking implements CleanupTracking {
  /**
   * A map of timeouts, keyed by their token.
   *
   * @type {Map<number, ReturnType<typeof setTimeout>>}
   */
  timeouts? = new Map<number, ReturnType<typeof setTimeout>>();

  /**
   * The time in milliseconds before which the render is assumed to be committed if no effect ran.
   *
   * @type {number}
   */
  cleanupTimeout = CLEANUP_TIMER_LOOP_MILLIS;

  constructor(timeout = CLEANUP_TIMER_LOOP_MILLIS) {
    this.cleanupTimeout = timeout;
  }

  /**
   * Registers an object for cleanup after a specified timeout.
   *
   * @param {any} object The object to register for cleanup.
   * @param {UnsubscribeFn} unsubscribe The function to call when the object is unregistered.
   * @param {UnregisterToken} unregisterToken The token used to identify the object for cleanup.
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
   * Unregisters an object for cleanup.
   *
   * @param {UnregisterToken} unregisterToken The token used to identify the object for cleanup.
   */
  unregister(unregisterToken: UnregisterToken): void {
    const timeout = this.timeouts!.get(unregisterToken.cleanupToken);
    if (timeout) {
      this.timeouts!.delete(unregisterToken.cleanupToken);
      clearTimeout(timeout);
    }
  }

  /**
   * Resets all registered objects for cleanup.
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