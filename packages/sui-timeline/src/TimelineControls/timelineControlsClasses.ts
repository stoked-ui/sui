import { generateUtilityClass, generateUtilityClasses } from '@mui/utils/generateUtilityClass';
import { generateUtilityClasses as muiGenerateUtilityClasses } from '@mui/utils/generateUtilityClasses';

/**
 * TimelineControlsClasses represents styles applied to the root element of the Timeline Controls component.
 */
export interface TimelineControlsClasses {
  /**
   * The class name for the root element of the Timeline Controls component.
   */
  root: string;
}

/**
 * EditorControlsClassKey is a type alias for keys of TimelineControlsClasses, representing valid slots for utility classes.
 */
export type EditorControlsClassKey = keyof TimelineControlsClasses;

/**
 * getEditorControlsUtilityClass returns the utility class name based on the provided slot.
 * 
 * @param slot The slot to generate the utility class for.
 * @returns The utility class name.
 */
export function getEditorControlsUtilityClass(slot: string): string {
  return generateUtilityClass('MuiEditorControls', slot);
}

/**
 * editorControlsClasses is an object containing all the utility classes generated for the MuiEditorControls component.
 */
export const editorControlsClasses: TimelineControlsClasses = generateUtilityClasses('MuiEditorControls', [
  'root',
]);