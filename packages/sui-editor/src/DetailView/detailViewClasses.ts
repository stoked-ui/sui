/**
 * Utility class for generating utility classes for File Detail component.
 */

import { generateUtilityClass, generateUtilityClasses } from '@mui/utils';

/**
 * Interface for file detail class props.
 */
export interface DetailViewClasses {
  /**
   * Styles applied to the root element of the component.
   */
  root: string;
}

/**
 * Type for key of file detail class.
 */
export type FileDetailClassKey = keyof DetailViewClasses;

/**
 * Returns utility class name for a given slot.
 *
 * @param {string} slot - Slot identifier.
 * @returns {string} Utility class name.
 */
export function getFileDetailUtilityClass(slot: string): string {
  return generateUtilityClass('MuiFileDetail', slot);
}

/**
 * Generates all utility classes for the File Detail component.
 */
export const fileDetailClasses: DetailViewClasses = generateUtilityClasses('MuiFileDetail', [
  'root',
]);