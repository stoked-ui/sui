/**
 * Module for importing and re-exporting the `useIncId` hook.
 */

import useIncId from './useIncId';

/**
 * Re-exports the `useIncId` hook to enable importing it elsewhere in the application.
 */
export * from './useIncId';

/**
 * Exports the default implementation of the `useIncId` hook.
 *
 * @description Provides a custom hook for generating an incrementing ID based on a provided context.
 */
export default useIncId;