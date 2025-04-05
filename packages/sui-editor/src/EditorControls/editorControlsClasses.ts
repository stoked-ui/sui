import generateUtilityClass from '@mui/utils/generateUtilityClass';
import generateUtilityClasses from '@mui/utils/generateUtilityClasses';

/**
 * Interface for Editor Controls classes.
 * @typedef {object} EditorControlsClasses
 * @property {string} root - Styles applied to the root element.
 */

/**
 * Key for Editor Controls classes.
 * @typedef {string} EditorControlsClassKey
 */

/**
 * Get the utility class for Editor Controls.
 * @param {string} slot - The slot for the utility class.
 * @returns {string} The generated utility class.
 */
export function getEditorControlsUtilityClass(slot: string): string {
  return generateUtilityClass('MuiEditorControls', slot);
}

/**
 * Editor Controls classes object.
 * @type {EditorControlsClasses}
 */
export const editorControlsClasses: EditorControlsClasses = generateUtilityClasses('MuiEditorControls', [
  'root',
]);