import generateUtilityClass from '@mui/utils/generateUtilityClass';
import generateUtilityClasses from '@mui/utils/generateUtilityClasses';

export interface VideoEditorControlsClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type VideoEditorControlsClassKey = keyof VideoEditorControlsClasses;

export function getVideoEditorControlsUtilityClass(slot: string): string {
  return generateUtilityClass('MuiVideoEditorControls', slot);
}

export const videoEditorControlsClasses: VideoEditorControlsClasses = generateUtilityClasses('MuiVideoEditorControls', [
  'root',
]);
