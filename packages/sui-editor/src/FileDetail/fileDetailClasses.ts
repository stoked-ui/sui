import generateUtilityClass from '@mui/utils/generateUtilityClass';
import generateUtilityClasses from '@mui/utils/generateUtilityClasses';

export interface FileDetailClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type FileDetailClassKey = keyof FileDetailClasses;

export function getFileDetailUtilityClass(slot: string): string {
  return generateUtilityClass('MuiFileDetail', slot);
}

export const fileDetailClasses: FileDetailClasses = generateUtilityClasses('MuiFileDetail', [
  'root',
]);
