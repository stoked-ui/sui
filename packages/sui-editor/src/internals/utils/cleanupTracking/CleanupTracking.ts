/** 
 * Interface for an object representing an unregister token.
 * @typedef {Object} UnregisterToken
 * @property {number} cleanupToken - The cleanup token associated with the unregister token.
 */

/** 
 * Type for a function that unsubscribes from a resource.
 * @typedef {Function} UnsubscribeFn
 * @returns {void}
 */

/** 
 * Interface for an object that tracks cleanup operations.
 * @typedef {Object} CleanupTracking
 * @property {Function} register - Registers an object with an unsubscribe function and an unregister token.
 * @property {Function} unregister - Unregisters an object based on its unregister token.
 * @property {Function} reset - Resets the cleanup tracking.
 */ 

export type UnregisterToken = { cleanupToken: number };

export type UnsubscribeFn = () => void;

export interface CleanupTracking {
  register(object: any, unsubscribe: UnsubscribeFn, unregisterToken: UnregisterToken): void;
  unregister(unregisterToken: UnregisterToken): void;
  reset(): void;
}