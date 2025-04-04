import { generateUtilityClass, generateUtilityClasses } from '@mui/utils';

/**
 * @typedef {object} TimelineCursorClasses
 * @property {string} root - Styles applied to the root element.
 */

export interface TimelineCursorClasses {
  /** Styles applied to the root element. */
  root: string;
}

/**
 * Enum of keys for TimelineCursorClasses
 */
export type TimelineCursorClassKey = keyof TimelineCursorClasses;

/**
 * Utility function to get the MuiTimelineCursor class based on the slot.
 *
 * @param {string} slot - The slot to use for the utility class.
 * @returns {string} The utility class name.
 */
export function getTimelineCursorUtilityClass(slot: string): string {
  return generateUtilityClass('MuiTimelineCursor', slot);
}

/**
 * Map of utility classes to CSS classes
 */
export const timelineCursorClasses: TimelineCursorClasses = generateUtilityClasses('MuiTimelineCursor', [
  'root',
]);