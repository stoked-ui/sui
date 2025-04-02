import generateUtilityClass from '@mui/utils/generateUtilityClass';
import generateUtilityClasses from '@mui/utils/generateUtilityClasses';

export interface DetailViewClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type FileDetailClassKey = keyof DetailViewClasses;

export function getFileDetailUtilityClass(slot: string): string {
  return generateUtilityClass('MuiFileDetail', slot);
}

export const fileDetailClasses: DetailViewClasses = generateUtilityClasses('MuiFileDetail', [
  'root',
]);

