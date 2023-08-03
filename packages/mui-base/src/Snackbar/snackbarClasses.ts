import { generateUtilityClass } from '../generateUtilityClass';
import { generateUtilityClasses } from '../generateUtilityClasses';

export interface SnackbarClasses {
  /** Class name applied to the root element. */
  root: string;
}

export function getSnackbarUtilityClass(slot: string): string {
  return generateUtilityClass('MuiSnackbar', slot);
}

export const snackbarClasses: SnackbarClasses = generateUtilityClasses('MuiSnackbar', ['root']);
