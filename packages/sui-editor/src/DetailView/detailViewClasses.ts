import generateUtilityClass from '@mui/utils/generateUtilityClass';
import generateUtilityClasses from '@mui/utils/generateUtilityClasses';

/**
 * Interface for defining classes for DetailView component.
 * @typedef {Object} DetailViewClasses
 * @property {string} root - Styles applied to the root element.
 */

/**
 * Key of classes available in DetailView component.
 * @typedef {string} FileDetailClassKey
 */

/**
 * Returns the utility class name for the specified slot in FileDetail component.
 * @param {string} slot - The slot to generate the utility class for.
 * @returns {string} The generated utility class name.
 */
export function getFileDetailUtilityClass(slot: string): string {
  return generateUtilityClass('MuiFileDetail', slot);
}

/**
 * Classes for the DetailView component.
 * @type {DetailViewClasses}
 */
export const fileDetailClasses: DetailViewClasses = generateUtilityClasses('MuiFileDetail', [
  'root',
]);