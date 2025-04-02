/**
 * Re-exports the `useIncId` hook, making it available for external usage.
 *
 * @description This module re-exports the `useIncId` hook, which provides a way to generate unique identifiers.
 */

import useIncId from './useIncId';

/**
 * Exports the `useIncId` hook for external usage, providing a way to generate unique identifiers.
 *
 * @description The `useIncId` hook provides a way to generate unique identifiers.
 * @param {object} [options] - Optional configuration options for the `useIncId` hook.
 *   @see https://example.com/docs/useIncId
 */
export * from './useIncId';

/**
 * Exports the default instance of the `useIncId` hook, which can be used to generate unique identifiers.
 *
 * @description The default instance of the `useIncId` hook provides a way to generate unique identifiers.
 * 
 * @param {object} [options] - Optional configuration options for the `useIncId` hook.
 *   @see https://example.com/docs/useIncId
 */
export default useIncId;