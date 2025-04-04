import { generateUtilityClass, generateUtilityClasses } from '@mui/utils';

/**
 * The styles applied to the root element of the TimelineScrollResizer component.
 */
export interface TimelineScrollResizerClasses {
  /** Styles applied to the root element. */
  root: string;
}

/**
 * Type representing a key for the TimelineScrollResizer class properties.
 */
export type TimelineScrollResizerClassKey = keyof TimelineScrollResizerClasses;

/**
 * Utility function to retrieve the utility class name based on the provided slot.
 *
 * @param {string} slot - The slot value to look up in the generateUtilityClass function.
 * @returns {string} The utility class name.
 */
export function getTimelineScrollResizerUtilityClass(slot: string): string {
  return generateUtilityClass('MuiTimelineScrollResizer', slot);
}

/**
 * A collection of utility classes generated for the TimelineScrollResizer component.
 */
export const timelineScrollResizerClasses: TimelineScrollResizerClasses = generateUtilityClasses('MuiTimelineScrollResizer', [
  'root',
]);