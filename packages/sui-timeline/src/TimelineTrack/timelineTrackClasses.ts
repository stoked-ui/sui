import generateUtilityClass from '@mui/utils/generateUtilityClass';
import generateUtilityClasses from '@mui/utils/generateUtilityClasses';

/**
 * Interface for defining classes for the TimelineTrack component.
 */
export interface TimelineTrackClasses {
  /** Styles applied to the root element. */
  root: string;
}

/**
 * Key of the TimelineTrackClasses.
 */
export type TimelineTrackClassKey = keyof TimelineTrackClasses;

/**
 * Returns the utility class name for the TimelineTrack component.
 * @param {string} slot - The slot for the utility class.
 * @returns {string} The generated utility class name.
 */
export function getTimelineTrackUtilityClass(slot: string): string {
  return generateUtilityClass('MuiTimelineTrack', slot);
}

/**
 * Object containing generated utility classes for the TimelineTrack component.
 */
export const timelineTrackClasses: TimelineTrackClasses = generateUtilityClasses('MuiTimelineTrack', [
  'root',
]);