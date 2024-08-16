import generateUtilityClass from '@mui/utils/generateUtilityClass';
import generateUtilityClasses from '@mui/utils/generateUtilityClasses';

export interface ViewSpaceClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type ViewSpaceClassKey = keyof ViewSpaceClasses;

export function getViewSpaceUtilityClass(slot: string): string {
  return generateUtilityClass('MuiViewSpace', slot);
}

export const viewSpaceClasses: ViewSpaceClasses = generateUtilityClasses('MuiViewSpace', [
  'root',
]);
