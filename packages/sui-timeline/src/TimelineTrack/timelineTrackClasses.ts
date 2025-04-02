import generateUtilityClass from '@mui/utils/generateUtilityClass';
import generateUtilityClasses from '@mui/utils/generateUtilityClasses';

export interface TimelineTrackClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type TimelineTrackClassKey = keyof TimelineTrackClasses;

export function getTimelineTrackUtilityClass(slot: string): string {
  return generateUtilityClass('MuiTimelineTrack', slot);
}

export const timelineTrackClasses: TimelineTrackClasses = generateUtilityClasses('MuiTimelineTrack', [
  'root',
]);

