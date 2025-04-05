/**
 * Interface for TimelineScrollResizer classes.
 * @typedef {Object} TimelineScrollResizerClasses
 * @property {string} root - Styles applied to the root element.
 */

/**
 * Key of TimelineScrollResizer classes.
 * @typedef {('root')} TimelineScrollResizerClassKey
 */

/**
 * Returns the utility class name for TimelineScrollResizer.
 * @param {string} slot - The slot for the utility class.
 * @returns {string} The generated utility class name.
 */
export function getTimelineScrollResizerUtilityClass(slot) {
  return generateUtilityClass('MuiTimelineScrollResizer', slot);
}

/**
 * TimelineScrollResizer classes with generated utility classes.
 * @type {TimelineScrollResizerClasses}
 */
export const timelineScrollResizerClasses = generateUtilityClasses('MuiTimelineScrollResizer', [
  'root',
]);