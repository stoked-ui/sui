import { generateUtilityClass, generateUtilityClasses } from '@mui/utils';

/**
 * FileDropzone classes.
 *
 * @interface FileDropzoneClasses
 */
export interface FileDropzoneClasses {
  /**
   * Styles applied to the root element.
   */
  root: string;
}

/**
 * Key of a file dropzone class.
 *
 * @typedef {string} FileDropzoneClassKey
 */

/**
 * Function to get the utility class for a file dropzone component.
 *
 * @param {string} slot - Slot name for the utility class.
 * @returns {string} Utility class name.
 */
export function getFileDropzoneUtilityClass(slot: string): string {
  return generateUtilityClass('MuiFileDropzone', slot);
}

/**
 * FileDropzone classes map.
 *
 * @type {FileDropzoneClasses}
 */
export const fileDropzoneClasses = generateUtilityClasses(
  'MuiFileDropzone',
  ['root'],
);