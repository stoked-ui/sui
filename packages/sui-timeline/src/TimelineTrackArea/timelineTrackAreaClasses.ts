import generateUtilityClass from '@mui/utils/generateUtilityClass';
import generateUtilityClasses from '@mui/utils/generateUtilityClasses';

export interface TimelineTrackAreaClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type TimelineTrackAreaClassKey = keyof TimelineTrackAreaClasses;

export function getTimelineTrackAreaUtilityClass(slot: string): string {
  return generateUtilityClass('MuiTimelineTrackArea', slot);
}

export const timelineTrackAreaClasses: TimelineTrackAreaClasses = generateUtilityClasses('MuiTimelineTrackArea', [
  'root',
]);
