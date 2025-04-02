/**
 * Re-exports the `useIncId` hook.
 */
import useIncId from './useIncId';

/**
 * Exports the `useIncId` hook for external usage.
 *
 * @description The `useIncId` hook provides a way to generate unique identifiers.
 * @example
 *   const { id } = useIncId();
 *   console.log(id); // generates a new unique identifier
 */
export * from './useIncId';

/**
 * Exports the default instance of the `useIncId` hook.
 *
 * @description The default instance of the `useIncId` hook can be used to generate unique identifiers.
 * @param {object} [options] - Optional configuration options for the `useIncId` hook.
 *   @see https://example.com/docs/useIncId
 */
export default useIncId;