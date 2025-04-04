/**
 * Utility class for generating utility classes for the MUI Timeline Player component.
 *
 * This class provides methods to generate utility classes and their corresponding class keys for the Timeline Player component.
 */

import { generateUtilityClass, generateUtilityClasses } from '@mui/utils/generateUtilityClass';
import { generateUtilityClasses as muiGenerateUtilityClasses } from '@mui/utils/generateUtilityClasses';

/**
 * Interface representing the utility classes for the MUI Timeline Player component.
 *
 * @interface TimelinePlayerClasses
 * @property {string} root - The class name for the root element of the Timeline Player component.
 * @property {string} skipPrevious - The class name for the skip previous button.
 * @property {string} pausePlaying - The class name for the pause playing button.
 * @property {string} skipNext - The class name for the skip next button.
 * @property {string} time - The class name for the time display.
 * @property {string} rate - The class name for the rate display.
 */
export interface TimelinePlayerClasses {
  root: string;
  skipPrevious: string;
  pausePlaying: string;
  skipNext: string;
  time: string;
  rate: string;
}

/**
 * Type representing the key of a utility class for the MUI Timeline Player component.
 *
 * @typedef {string} TimelinePlayerClassKey
 */

export type TimelinePlayerClassKey = keyof TimelinePlayerClasses;

/**
 * Function to generate the utility class for a specific slot in the MUI Timeline Player component.
 *
 * @param {string} slot - The slot to generate the utility class for.
 * @returns {string} The generated utility class.
 */
export function getTimelinePlayerUtilityClass(slot: string): string {
  return generateUtilityClass('MuiTimelinePlayer', slot);
}

/**
 * Utility classes for the MUI Timeline Player component.
 *
 * This constant returns an object containing all the utility classes for the Timeline Player component.
 */
export const timelinePlayerClasses: TimelinePlayerClasses = muiGenerateUtilityClasses('MuiTimelinePlayer', [
  'root',
  'skipPrevious',
  'pausePlaying',
  'skipNext',
  'time',
  'rate',
]);