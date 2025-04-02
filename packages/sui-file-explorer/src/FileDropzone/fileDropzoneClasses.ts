import generateUtilityClass from '@mui/utils/generateUtilityClass';
import generateUtilityClasses from '@mui/utils/generateUtilityClasses';

export interface FileDropzoneClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type FileDropzoneClassKey = keyof FileDropzoneClasses;

export function getFileDropzoneUtilityClass(slot: string): string {
  return generateUtilityClass('MuiFileDropzone', slot);
}

export const fileDropzoneClasses: FileDropzoneClasses = generateUtilityClasses(
  'MuiFileDropzone',
  ['root'],
);

