import generateUtilityClass from '@mui/utils/generateUtilityClass';
import generateUtilityClasses from '@mui/utils/generateUtilityClasses';

export interface TimelineCursorClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type TimelineCursorClassKey = keyof TimelineCursorClasses;

export function getTimelineCursorUtilityClass(slot: string): string {
  return generateUtilityClass('MuiTimelineCursor', slot);
}

export const timelineCursorClasses: TimelineCursorClasses = generateUtilityClasses('MuiTimelineCursor', [
  'root',
]);

