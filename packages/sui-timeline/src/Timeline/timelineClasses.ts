import { generateUtilityClass, generateUtilityClasses } from '@mui/utils';

/**
 * Defines the utility classes for a timeline component.
 */
export interface TimelineClasses {
  /**
   * The root class of the timeline container.
   */
  root: string;
  /**
   * The class used to style the labels in the timeline.
   */
  labels: string;
  /**
   * The class used to style the time indicator in the timeline.
   */
  time: string;
  /**
   * The class used to style the track area of the timeline.
   */
  trackArea: string;
  /**
   * The class used to style the resizer handle in the timeline.
   */
  resizer: string;
}

/**
 * Returns the utility class for a specific slot in the timeline component.
 *
 * @param {string} slot - The slot to retrieve the utility class for.
 * @returns {string} The utility class for the specified slot.
 */
export function getTimelineUtilityClass(slot: string): string {
  return generateUtilityClass('MuiTimeline', slot);
}

/**
 * Generates an object containing all the utility classes for the timeline component.
 *
 * @returns {TimelineClasses} An object containing all the utility classes for the timeline component.
 */
export const timelineClasses = generateUtilityClasses('MuiTimeline', [
  'root',
  'labels',
  'time',
  'trackArea',
  'resizer',
]);