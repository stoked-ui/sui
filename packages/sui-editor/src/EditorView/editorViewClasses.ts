import { generateUtilityClass, generateUtilityClasses } from '@mui/utils';

/**
 * @module EditorView
 * @description Utility classes for the MUI Editor View component.
 */

export interface EditorViewClasses {
  /**
   * Styles applied to the root element of the Editor View component.
   */
  root: string;
  renderer?: string;
  preview?: string;
}

export type EditorViewClassKey = keyof EditorViewClasses;

/**
 * Returns the utility class for the specified slot in the Editor View component.
 *
 * @param {string} slot The slot to retrieve the utility class for.
 * @returns {string} The utility class for the specified slot.
 */
export function getEditorViewUtilityClass(slot: string): string {
  return generateUtilityClass('MuiEditorView', slot);
}

/**
 * Generates all utility classes for the Editor View component.
 *
 * @returns {EditorViewClasses} An object containing all utility classes for the Editor View component.
 */
export const editorViewClasses = generateUtilityClasses('MuiEditorView', [
  'root',
  'renderer',
  'preview'
]);