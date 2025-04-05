import generateUtilityClass from '@mui/utils/generateUtilityClass';
import generateUtilityClasses from '@mui/utils/generateUtilityClasses';

/**
 * Interface for defining TimelineControls classes.
 * @typedef {object} TimelineControlsClasses
 * @property {string} root - Styles applied to the root element.
 */
export interface TimelineControlsClasses {
  root: string;
}

/**
 * Key of the EditorControls class.
 */
export type EditorControlsClassKey = keyof TimelineControlsClasses;

/**
 * Returns the utility class for EditorControls.
 * @param {string} slot - The slot for the utility class.
 * @returns {string} The generated utility class.
 */
export function getEditorControlsUtilityClass(slot: string): string {
  return generateUtilityClass('MuiEditorControls', slot);
}

/**
 * TimelineControls classes generated using utility classes.
 */
export const editorControlsClasses: TimelineControlsClasses = generateUtilityClasses('MuiEditorControls', [
  'root',
]);