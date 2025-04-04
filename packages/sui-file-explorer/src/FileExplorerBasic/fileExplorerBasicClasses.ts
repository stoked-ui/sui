/**
 * Generates utility classes for the basic styles of a file explorer component.
 *
 * @module MUI
 */

import generateUtilityClass from '@mui/utils/generateUtilityClass';
import generateUtilityClasses from '@mui/utils/generateUtilityClasses';

/**
 * Interface representing the basic class keys for the file explorer component.
 */
export interface FileExplorerBasicClasses {
  /**
   * The style applied to the root element of the file explorer component.
   */
  root: string;
}

/**
 * Type representing a key of the file explorer basic classes.
 */
export type FileExplorerBasicClassKey = keyof FileExplorerBasicClasses;

/**
 * Returns the utility class for the given slot of the file explorer basic styles.
 *
 * @param {string} slot The slot to generate the utility class for.
 * @returns {string} The generated utility class.
 */
export function getFileExplorerBasicUtilityClass(slot: string): string {
  return generateUtilityClass('MuiFileExplorerBasic', slot);
}

/**
 * Generates all the utility classes for the basic styles of a file explorer component.
 *
 * @returns {FileExplorerBasicClasses} An object containing all the utility classes.
 */
export const fileExplorerBasicClasses: FileExplorerBasicClasses = generateUtilityClasses(
  'MuiFileExplorerBasic',
  ['root'],
);