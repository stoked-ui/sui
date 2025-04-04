/**
 * Defines the mapping between editor component names and class keys.
 */
import { EditorClassKey } from '../Editor';

/**
 * Maps editor component names to their corresponding class keys.
 *
 * @example
 * const editorComponentNameToClassKey: EditorComponentNameToClassKey = {
 *   MuiEditor: EditorClassKey.MuiEditor,
 * };
 */

export interface EditorComponentNameToClassKey {
  /**
   * The class key for the Material-UI Editor component.
   */
  MuiEditor: EditorClassKey;
}

/**
 * Extends the `ComponentNameToClassKey` type from '@mui/material/styles' to include the `EditorComponentNameToClassKey`.
 *
 * @see {@link EditorComponentNameToClassKey}
 */

declare module '@mui/material/styles' {
  interface ComponentNameToClassKey extends EditorComponentNameToClassKey {}
}

/**
 * Disables automatic export of this module.
 */
export {};