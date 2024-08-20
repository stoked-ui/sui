import generateUtilityClass from '@mui/utils/generateUtilityClass';
import generateUtilityClasses from '@mui/utils/generateUtilityClasses';

export interface EditorControlsClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type EditorControlsClassKey = keyof EditorControlsClasses;

export function getEditorControlsUtilityClass(slot: string): string {
  return generateUtilityClass('MuiEditorControls', slot);
}

export const editorControlsClasses: EditorControlsClasses = generateUtilityClasses('MuiEditorControls', [
  'root',
]);
