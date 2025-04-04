/**
 * @module Timeline Track Utility Class
 *
 * Provides utility functions for styling and rendering the Timeline Track component.
 */

import generateUtilityClass from '@mui/utils/generateUtilityClass';
import generateUtilityClasses from '@mui/utils/generateUtilityClasses';

/**
 * Interface for TimelineTrack classes
 */
export interface TimelineTrackClasses {
  /**
   * Styles applied to the root element of the Timeline Track component.
   */
  root: string;
}

/**
 * Type alias for TimelineTrack class keys
 */
export type TimelineTrackClassKey = keyof TimelineTrackClasses;

/**
 * Function to get the utility class for a given slot in the Timeline Track component
 *
 * @param {string} slot - The slot of the Timeline Track component.
 * @returns {string} The utility class for the specified slot.
 */
export function getTimelineTrackUtilityClass(slot: string): string {
  return generateUtilityClass('MuiTimelineTrack', slot);
}

/**
 * Object containing the generated utility classes for the Timeline Track component
 */
export const timelineTrackClasses: TimelineTrackClasses = generateUtilityClasses('MuiTimelineTrack', [
  'root',
]);