/**
 * @packageDocumentation
 * Re-exports for Accessibility Hook
 *
 * This package provides a custom accessibility-focused hook, `useIncId`, 
 * which generates unique identifiers for invoices. It is used to enhance the 
 * accessibility of invoice-related components.
 */

import useIncId from './useIncId';

/**
 * Exports the custom hook `useIncId` as the default export.
 *
 * @typedef { import('./useIncId').DefaultExport } UseIncIdHook
 */
export * from './useIncId';
export default useIncId;