import generateUtilityClass from '@mui/utils/generateUtilityClass';
import generateUtilityClasses from '@mui/utils/generateUtilityClasses';

/**
 * Interface for defining classes for FileExplorerBasic component.
 * @typedef {Object} FileExplorerBasicClasses
 * @property {string} root - Styles applied to the root element.
 */

/**
 * Key type for FileExplorerBasicClasses.
 * @typedef {keyof FileExplorerBasicClasses} FileExplorerBasicClassKey
 */

/**
 * Returns the utility class name for the specified slot.
 * @param {string} slot - The slot for which to generate the utility class.
 * @returns {string} The generated utility class name.
 */
export function getFileExplorerBasicUtilityClass(slot: string): string {
  return generateUtilityClass('MuiFileExplorerBasic', slot);
}

/**
 * Utility classes for FileExplorerBasic component.
 * @type {FileExplorerBasicClasses}
 */
export const fileExplorerBasicClasses: FileExplorerBasicClasses = generateUtilityClasses(
  'MuiFileExplorerBasic',
  ['root'],
);