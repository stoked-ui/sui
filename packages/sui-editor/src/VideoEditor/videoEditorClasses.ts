import generateUtilityClass from '@mui/utils/generateUtilityClass';
import generateUtilityClasses from '@mui/utils/generateUtilityClasses';

export interface VideoEditorClasses {
  /** Styles applied to the root element. */
  root: string;
  viewSpace: string;
  videoControls: string;
  timeline: string;
  bottomLeft: string;
  bottomRight: string;
}

export type VideoEditorClassKey = keyof VideoEditorClasses;

export function getVideoEditorUtilityClass(slot: string): string {
  return generateUtilityClass('MuiVideoEditor', slot);
}

export const videoEditorClasses: VideoEditorClasses = generateUtilityClasses('MuiVideoEditor', [
  'root',
  'viewSpace',
  'videoControls',
  'timeline',
  'bottomLeft',
  'bottomRight',
]);
