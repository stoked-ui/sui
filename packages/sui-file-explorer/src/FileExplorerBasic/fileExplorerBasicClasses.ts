import generateUtilityClass from '@mui/utils/generateUtilityClass';
import generateUtilityClasses from '@mui/utils/generateUtilityClasses';

export interface FileExplorerBasicClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type FileExplorerBasicClassKey = keyof FileExplorerBasicClasses;

export function getFileExplorerBasicUtilityClass(slot: string): string {
  return generateUtilityClass('MuiFileExplorerBasic', slot);
}

export const fileExplorerBasicClasses: FileExplorerBasicClasses = generateUtilityClasses(
  'MuiFileExplorerBasic',
  ['root'],
);

