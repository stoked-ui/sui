/**
 * Utility class for generating classes for the MUI Timeline component's action.
 */

import generateUtilityClass from '@mui/utils/generateUtilityClass';
import generateUtilityClasses from '@mui/utils/generateUtilityClasses';

export interface TimelineActionClasses {
  /**
   * Styles applied to the root element of the timeline action.
   */
  root: string;
  
  /**
   * Styles applied to the left part of the timeline action.
   */
  left: string;
  
  /**
   * Styles applied to the right part of the timeline action.
   */
  right: string;
  
  /**
   * Whether the action is selected.
   */
  selected: string;
  
  /**
   * Whether the action is scalable.
   */
  flexible: string;
  
  /**
   * Whether the action is movable.
   */
  movable: string;
  
  /**
   * Whether the action is prohibited from running.
   */
  disabled: string;
}

/**
 * Utility function to generate a utility class for the MUI Timeline component's action.
 *
 * @param slot The slot name of the utility class.
 * @returns The generated utility class.
 */
export function getTimelineActionUtilityClass(slot: string): string {
  return generateUtilityClass('MuiTimelineAction', slot);
}

/**
 * An object containing all the classes for the MUI Timeline component's action.
 */
export const timelineActionClasses: TimelineActionClasses = generateUtilityClasses('MuiTimelineAction', [
  'root',
  'left',
  'right',
  'selected',
  'flexible',
  'movable',
  'disabled'
]);