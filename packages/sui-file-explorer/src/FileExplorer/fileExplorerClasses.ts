import generateUtilityClass from '@mui/utils/generateUtilityClass';
import generateUtilityClasses from '@mui/utils/generateUtilityClasses';

export interface FileExplorerClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type FileExplorerClassKey = keyof FileExplorerClasses;

export function getFileExplorerUtilityClass(slot: string): string {
  return generateUtilityClass('MuiFileExplorer', slot);
}

export const fileExplorerClasses: FileExplorerClasses = generateUtilityClasses('MuiFileExplorer', [
  'root',
]);
