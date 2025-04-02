import generateUtilityClass from '@mui/utils/generateUtilityClass';
import generateUtilityClasses from '@mui/utils/generateUtilityClasses';

export interface TimelineControlsClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type EditorControlsClassKey = keyof TimelineControlsClasses;

export function getEditorControlsUtilityClass(slot: string): string {
  return generateUtilityClass('MuiEditorControls', slot);
}

export const editorControlsClasses: TimelineControlsClasses = generateUtilityClasses('MuiEditorControls', [
  'root',
]);

