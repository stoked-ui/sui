import { generateUtilityClass, generateUtilityClasses } from '@mui/utils';

/**
 * @interface TimelineLabelsClasses
 * @description A class used to style the timeline labels component.
 */
export interface TimelineLabelsClasses {
  /**
   * The root class for the timeline labels component.
   */
  root: string;
  
  /**
   * The label class for individual timeline labels.
   */
  label: string;
  
  /**
   * The actions class for additional elements within a timeline label.
   */
  actions: string;
}

/**
 * @type {TimelineLabelsClassKey}
 * @description A key representing the current timeline label class.
 */
export type TimelineLabelsClassKey = keyof TimelineLabelsClasses;

/**
 * @function getTimelineLabelsUtilityClass
 * @param {string} slot - The slot of the utility class to generate.
 * @returns {string} The generated utility class name.
 * @description Returns the generated utility class name based on the provided slot.
 */
export function getTimelineLabelsUtilityClass(slot: string): string {
  return generateUtilityClass('MuiTimelineLabels', slot);
}

/**
 * @constant timelineLabelsClasses
 * @type {TimelineLabelsClasses}
 * @description An object containing the pre-defined utility classes for the timeline labels component.
 */
export const timelineLabelsClasses: TimelineLabelsClasses = generateUtilityClasses('MuiTimelineLabels', [
  'root',
  'label',
  'actions',
]);