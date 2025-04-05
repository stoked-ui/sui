/**
 * Interface for defining classes for TimelineAction component.
 * @typedef {object} TimelineActionClasses
 * @property {string} root - Styles applied to the root element.
 * @property {string} left - Styles applied to the left element.
 * @property {string} right - Styles applied to the right element.
 * @property {string} selected - Whether the action is selected.
 * @property {string} flexible - Whether the action is scalable.
 * @property {string} movable - Whether the action is movable.
 * @property {string} disabled - Whether the action is prohibited from running.
 */

/**
 * Key of TimelineActionClasses.
 * @typedef {string} TimelineActionClassKey
 */

/**
 * Retrieves the utility class for the TimelineAction component.
 * @param {string} slot - The slot for the utility class.
 * @returns {string} The generated utility class.
 */
export function getTimelineActionUtilityClass(slot: string): string {
  return generateUtilityClass('MuiTimelineAction', slot);
}

/**
 * Classes for TimelineAction component.
 * @type {TimelineActionClasses}
 */
export const timelineActionClasses: TimelineActionClasses = generateUtilityClasses('MuiTimelineAction', [
  'root',
  'left',
  'right',
  'selected',
  'flexible',
  'movable',
  'disabled'
]);
