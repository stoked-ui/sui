import generateUtilityClass from '@mui/utils/generateUtilityClass';
import generateUtilityClasses from '@mui/utils/generateUtilityClasses';

export interface TimelineTimeClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type TimelineTimeClassKey = keyof TimelineTimeClasses;

export function getTimelineTimeUtilityClass(slot: string): string {
  return generateUtilityClass('MuiTimelineTime', slot);
}

export const timelineTimeClasses: TimelineTimeClasses = generateUtilityClasses('MuiTimelineTime', [
  'root',
]);

