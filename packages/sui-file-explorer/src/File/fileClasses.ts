import generateUtilityClass from '@mui/utils/generateUtilityClass';
import generateUtilityClasses from '@mui/utils/generateUtilityClasses';

export interface FileClasses {
  /** Styles applied to the root element. */
  root: string;

  grid: string;
  /** Styles applied to the transition component. */
  /** Styles applied to the transition component. */
  groupTransition: string;
  /** Styles applied to the content element. */
  content: string;
  /** State class applied to the content element when expanded. */
  expanded: string;
  /** State class applied to the content element when selected. */
  selected: string;
  /** State class applied to the content element when focused. */
  focused: string;
  /** State class applied to the element when disabled. */
  disabled: string;
  /** Styles applied to the tree item icon. */
  iconContainer: string;
  /** Styles applied to the label element. */
  name: string;
  /** Styles applied to the checkbox element. */
  checkbox: string;
}

export type FileClassKey = keyof FileClasses;

export function getFileUtilityClass(slot: string): string {
  return generateUtilityClass('MuiFile', slot);
}

export const fileClasses: FileClasses = generateUtilityClasses('MuiFile', [
  'root',
  'grid',
  'groupTransition',
  'content',
  'expanded',
  'selected',
  'focused',
  'disabled',
  'iconContainer',
  'name',
  'checkbox',
]);
