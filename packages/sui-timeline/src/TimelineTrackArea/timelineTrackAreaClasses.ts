import generateUtilityClass from '@mui/utils/generateUtilityClass';
import generateUtilityClasses from '@mui/utils/generateUtilityClasses';

/**
 * Interface for defining classes applied to TimelineTrackArea component.
 */
export interface TimelineTrackAreaClasses {
  /** Styles applied to the root element. */
  root: string;
}

/**
 * Key of TimelineTrackAreaClasses.
 */
export type TimelineTrackAreaClassKey = keyof TimelineTrackAreaClasses;

/**
 * Returns the utility class name for TimelineTrackArea component.
 * @param {string} slot - The slot for the utility class.
 * @returns {string} The generated utility class name.
 */
export function getTimelineTrackAreaUtilityClass(slot: string): string {
  return generateUtilityClass('MuiTimelineTrackArea', slot);
}

/**
 * Utility classes for TimelineTrackArea component.
 */
export const timelineTrackAreaClasses: TimelineTrackAreaClasses = generateUtilityClasses('MuiTimelineTrackArea', [
  'root',
]);