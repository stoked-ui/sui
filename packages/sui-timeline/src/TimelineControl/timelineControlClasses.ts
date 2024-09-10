import generateUtilityClass from '@mui/utils/generateUtilityClass';
import generateUtilityClasses from '@mui/utils/generateUtilityClasses';

export interface TimelineControlClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type TimelineControlClassKey = keyof TimelineControlClasses;

export function getTimelineControlUtilityClass(slot: string): string {
  return generateUtilityClass('MuiTimelineControl', slot);
}

export const timelineControlClasses: TimelineControlClasses = generateUtilityClasses('MuiTimelineControl', [
  'root',
]);
