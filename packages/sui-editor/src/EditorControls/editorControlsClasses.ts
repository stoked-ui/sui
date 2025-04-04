/**
 * @module EditorControls
 */

import generateUtilityClass from '@mui/utils/generateUtilityClass';
import generateUtilityClasses from '@mui/utils/generateUtilityClasses';

/**
 * The styles applied to the root element.
 */
export interface EditorControlsClasses {
  /** Styles applied to the root element. */
  root: string;
}

/**
 * A key representing a valid class in `EditorControlsClasses`.
 */
export type EditorControlsClassKey = keyof EditorControlsClasses;

/**
 * Returns the utility class for the given slot.
 *
 * @param {string} slot - The slot to generate the utility class for.
 * @returns {string} The generated utility class.
 */
export function getEditorControlsUtilityClass(slot: string): string {
  return generateUtilityClass('MuiEditorControls', slot);
}

/**
 * An object containing the utility classes for `EditorControls`.
 */
export const editorControlsClasses: EditorControlsClasses = generateUtilityClasses('MuiEditorControls', [
  'root',
]);