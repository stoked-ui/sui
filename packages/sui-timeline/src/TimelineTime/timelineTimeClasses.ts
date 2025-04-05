/**
 * Interface for defining the classes for TimelineTime component.
 * @typedef {object} TimelineTimeClasses
 * @property {string} root - Styles applied to the root element.
 */

/**
 * Represents the keys of TimelineTimeClasses.
 * @typedef {keyof TimelineTimeClasses} TimelineTimeClassKey
 */

/**
 * Returns the utility class name for TimelineTime component.
 * @param {string} slot - The slot for which the utility class name is generated.
 * @returns {string} - The generated utility class name.
 */
export function getTimelineTimeUtilityClass(slot: string): string {
  return generateUtilityClass('MuiTimelineTime', slot);
}

/**
 * Object containing the generated utility classes for TimelineTime component.
 * @type {TimelineTimeClasses}
 */
export const timelineTimeClasses: TimelineTimeClasses = generateUtilityClasses('MuiTimelineTime', [
  'root',
]);
