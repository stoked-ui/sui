import generateUtilityClass from '@mui/utils/generateUtilityClass';
import generateUtilityClasses from '@mui/utils/generateUtilityClasses';

export interface TimelineScrollResizerClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type TimelineScrollResizerClassKey = keyof TimelineScrollResizerClasses;

export function getTimelineScrollResizerUtilityClass(slot: string): string {
  return generateUtilityClass('MuiTimelineScrollResizer', slot);
}

export const timelineScrollResizerClasses: TimelineScrollResizerClasses = generateUtilityClasses('MuiTimelineScrollResizer', [
  'root',
]);

