/**
 * Import utility functions for generating utility classes.
 */
import generateUtilityClass from '@mui/utils/generateUtilityClass';
import generateUtilityClasses from '@mui/utils/generateUtilityClasses';

/**
 * Define the interface for timeline time classes.
 *
 * @interface TimelineTimeClasses
 * @property {string} root - Styles applied to the root element.
 */
export interface TimelineTimeClasses {
  /** Styles applied to the root element. */
  root: string;
}

/**
 * Type alias for a key of the timeline time classes.
 *
 * @typedef {string} TimelineTimeClassKey
 */

/**
 * Function to get the utility class for timeline time component based on the slot.
 *
 * @param {string} slot - The slot to generate the utility class for.
 * @returns {string} The generated utility class.
 */
export function getTimelineTimeUtilityClass(slot: string): string {
  return generateUtilityClass('MuiTimelineTime', slot);
}

/**
 * An object containing all timeline time classes.
 *
 * @constant {TimelineTimeClasses}
 */
export const timelineTimeClasses: TimelineTimeClasses = generateUtilityClasses('MuiTimelineTime', [
  'root',
]);