import generateUtilityClass from '@mui/utils/generateUtilityClass';
import generateUtilityClasses from '@mui/utils/generateUtilityClasses';

export interface FileExplorerTabsClasses {
  /** Styles applied to the root element. */
  root: string;
  label: string;
  folder: string;
}

export type FileExplorerTabsClassKey = keyof FileExplorerTabsClasses;

export function getFileExplorerTabsUtilityClass(slot: string): string {
  return generateUtilityClass('MuiFileExplorerTabs', slot);
}

export const fileExplorerTabsClasses: FileExplorerTabsClasses = generateUtilityClasses('MuiFileExplorerTabs', [
  'root',
  'label',
  'folder',
]);

