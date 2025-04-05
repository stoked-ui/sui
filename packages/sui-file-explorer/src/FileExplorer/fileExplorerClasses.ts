import generateUtilityClass from '@mui/utils/generateUtilityClass';
import generateUtilityClasses from '@mui/utils/generateUtilityClasses';

/**
 * Interface for defining the styling classes of the FileExplorer component.
 */
export interface FileExplorerClasses {
  /** Styles applied to the root element. */
  root: string;
}

/**
 * Key type for accessing the FileExplorerClasses properties.
 */
export type FileExplorerClassKey = keyof FileExplorerClasses;

/**
 * Generates a utility class for the FileExplorer component.
 * @param {string} slot - The slot for the utility class.
 * @returns {string} The generated utility class.
 */
export function getFileExplorerUtilityClass(slot: string): string {
  return generateUtilityClass('MuiFileExplorer', slot);
}

/**
 * Mapping of utility classes for the FileExplorer component.
 */
export const fileExplorerClasses: FileExplorerClasses = generateUtilityClasses('MuiFileExplorer', [
  'root',
]);