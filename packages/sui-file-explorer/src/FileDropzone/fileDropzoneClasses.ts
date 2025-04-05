import generateUtilityClass from '@mui/utils/generateUtilityClass';
import generateUtilityClasses from '@mui/utils/generateUtilityClasses';

/**
 * Interface for defining the classes used in the FileDropzone component.
 * @typedef {Object} FileDropzoneClasses
 * @property {string} root - Styles applied to the root element.
 */

/**
 * Represents the keys of the FileDropzoneClasses interface.
 * @typedef {string} FileDropzoneClassKey
 */

/**
 * Generates a utility class name for the FileDropzone component.
 * @param {string} slot - The slot to generate the utility class for.
 * @returns {string} The generated utility class name.
 */
export function getFileDropzoneUtilityClass(slot: string): string {
  return generateUtilityClass('MuiFileDropzone', slot);
}

/**
 * Utility classes for the FileDropzone component.
 * @type {FileDropzoneClasses}
 */
export const fileDropzoneClasses: FileDropzoneClasses = generateUtilityClasses(
  'MuiFileDropzone',
  ['root'],
);