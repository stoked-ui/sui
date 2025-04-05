/**
 * Defines the classes for the Timeline component.
 */
export interface TimelineClasses {
  root: string;
  labels: string;
  time: string;
  trackArea: string;
  resizer: string;
}

/**
 * Represents the keys of the Timeline classes.
 */
export type TimelineClassKey = keyof TimelineClasses;

/**
 * Returns the utility class for a specific slot in the Timeline component.
 * @param {string} slot - The slot for which to generate the utility class.
 * @returns {string} The generated utility class.
 */
export function getTimelineUtilityClass(slot: string): string {
  return generateUtilityClass('MuiTimeline', slot);
}

/**
 * Represents the utility classes generated for the Timeline component.
 */
export const timelineClasses: TimelineClasses = generateUtilityClasses('MuiTimeline', [
  'root',
  'labels',
  'time',
  'trackArea',
  'resizer',
]);
