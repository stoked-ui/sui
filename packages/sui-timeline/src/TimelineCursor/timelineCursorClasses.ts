import generateUtilityClass from '@mui/utils/generateUtilityClass';
import generateUtilityClasses from '@mui/utils/generateUtilityClasses';

/**
 * Interface for defining classes for the TimelineCursor component.
 */
export interface TimelineCursorClasses {
  /** Styles applied to the root element. */
  root: string;
}

/**
 * Key of the TimelineCursorClasses interface.
 */
export type TimelineCursorClassKey = keyof TimelineCursorClasses;

/**
 * Returns the utility class name for the TimelineCursor component.
 * @param {string} slot - The slot for the utility class.
 * @returns {string} The generated utility class name.
 */
export function getTimelineCursorUtilityClass(slot: string): string {
  return generateUtilityClass('MuiTimelineCursor', slot);
}

/**
 * Utility classes for the TimelineCursor component.
 */
export const timelineCursorClasses: TimelineCursorClasses = generateUtilityClasses('MuiTimelineCursor', [
  'root',
]);
