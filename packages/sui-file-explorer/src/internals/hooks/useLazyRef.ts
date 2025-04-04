/**
 * @module useLazyRef
 *
 * A hook for creating a lazy reference.
 *
 * The `useLazyRef` hook is used to create a reference that doesn't exist until it's first accessed. This can be useful when you need a component or some other resource to be loaded only when it's actually needed, rather than loading all possible resources upfront.
 */

/**
 * @param {boolean} [loadImmediately=false] Whether the initial value should be set immediately
 * @returns {object} A reference object with two properties: `current` and `fallback`
 */
export { default as useLazyRef } from '@mui/utils/useLazyRef';