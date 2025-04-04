/**
 * @file
 * Utility functions for generating utility classes for the Timeline Track Area component.
 *
 * @author [Your Name]
 */

import { generateUtilityClass, generateUtilityClasses } from '@mui/utils';

/**
 * Interface representing the available styles for the Timeline Track Area component.
 */
export interface TimelineTrackAreaClasses {
  /**
   * Styles applied to the root element of the Timeline Track Area component.
   */
  root: string;
}

/**
 * Type alias for a key representing one of the available classes in TimelineTrackAreaClasses.
 */
export type TimelineTrackAreaClassKey = keyof TimelineTrackAreaClasses;

/**
 * Retrieves the utility class name for the given slot.
 *
 * @param {string} slot - The slot to generate the utility class for.
 * @returns {string} The generated utility class name.
 */
export function getTimelineTrackAreaUtilityClass(slot: string): string {
  return generateUtilityClass('MuiTimelineTrackArea', slot);
}

/**
 * Generates all available utility classes for the Timeline Track Area component.
 *
 * @returns {TimelineTrackAreaClasses} An object containing all available utility classes.
 */
export const timelineTrackAreaClasses: TimelineTrackAreaClasses = generateUtilityClasses('MuiTimelineTrackArea', [
  'root',
]);