/**
 * FileExplorerTabs utility class for generating CSS classes.
 *
 * This utility class is used to generate the CSS classes required for the FileExplorerTabs component.
 * It utilizes the `generateUtilityClass` and `generateUtilityClasses` functions from Material-UI's utilities.
 */

import generateUtilityClass from '@mui/utils/generateUtilityClass';
import generateUtilityClasses from '@mui/utils/generateUtilityClasses';

/**
 * Interface for the file explorer tabs classes.
 *
 * @typedef {Object} FileExplorerTabsClasses
 * @property {string} root - Styles applied to the root element.
 * @property {string} label - Styles applied to the label element.
 * @property {string} folder - Styles applied to the folder element.
 */

export interface FileExplorerTabsClasses {
  /** Styles applied to the root element. */
  root: string;
  label: string;
  folder: string;
}

/**
 * Type alias for the class keys of the file explorer tabs classes.
 *
 * @typedef {string} FileExplorerTabsClassKey
 * @property {keyof FileExplorerTabsClasses} root - Key for the root class.
 * @property {keyof FileExplorerTabsClasses} label - Key for the label class.
 * @property {keyof FileExplorerClasses} folder - Key for the folder class.
 */

export type FileExplorerTabsClassKey = keyof FileExplorerTabsClasses;

/**
 * Utility function to get the file explorer tabs utility class based on the slot.
 *
 * @param {string} slot The slot name.
 * @returns {string} The file explorer tabs utility class.
 */
export function getFileExplorerTabsUtilityClass(slot: string): string {
  return generateUtilityClass('MuiFileExplorerTabs', slot);
}

/**
 * File explorer tabs classes generated using Material-UI's utility functions.
 *
 * This object contains the CSS classes for the file explorer tabs component.
 */

export const fileExplorerTabsClasses: FileExplorerTabsClasses = generateUtilityClasses('MuiFileExplorerTabs', [
  'root',
  'label',
  'folder',
]);