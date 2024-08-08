import generateUtilityClass from '@mui/utils/generateUtilityClass';
import generateUtilityClasses from '@mui/utils/generateUtilityClasses';

export interface FileExplorerGridHeadersClasses {
  /** Styles applied to the root element. */
  root: string;
  /** Styles applied to the column element. */
  column: string;
  /** Styles applied to the transition component. */
  groupTransition: string;
  /** Styles applied to the content element. */
  iconContainer: string;
  /** Styles applied to the label element. */
  label: string;
}

export type FileExplorerGridHeadersClassKey = keyof FileExplorerGridHeadersClasses;

export function getFileUtilityClass(slot: string): string {
  return generateUtilityClass('MuiFileExplorerGridHeaders', slot);
}

export const fileExplorerViewGridHeadersClasses: FileExplorerGridHeadersClasses = generateUtilityClasses('MuiFileExplorerGridHeaders', [
  'root',
  'column',
  'groupTransition',
  'iconContainer',
  'label',
]);
