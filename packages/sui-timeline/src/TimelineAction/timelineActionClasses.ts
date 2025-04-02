import generateUtilityClass from '@mui/utils/generateUtilityClass';
import generateUtilityClasses from '@mui/utils/generateUtilityClasses';

export interface TimelineActionClasses {
  /** Styles applied to the root element. */
  root: string;
  left: string;
  right: string;
  /** Whether the action is selected */
  selected: string;
  /** Whether the action is scalable */
  flexible: string;
  /** Whether the action is movable */
  movable: string;
  /** Whether the action is prohibited from running */
  disabled: string;
}

export type TimelineActionClassKey = keyof TimelineActionClasses;

export function getTimelineActionUtilityClass(slot: string): string {
  return generateUtilityClass('MuiTimelineAction', slot);
}

export const timelineActionClasses: TimelineActionClasses = generateUtilityClasses('MuiTimelineAction', [
  'root',
  'left',
  'right',
  'selected',
  'flexible',
  'movable',
  'disabled'
]);

