/** Interface for Timeline Labels Classes */
export interface TimelineLabelsClasses {
  root: string; // The class for the root element of the timeline labels
  label: string; // The class for the label element of the timeline labels
  actions: string; // The class for the actions element of the timeline labels
}

/** Key of Timeline Labels Classes */
export type TimelineLabelsClassKey = keyof TimelineLabelsClasses;

/**
 * Get the utility class for Timeline Labels
 * @param {string} slot - The slot for the utility class
 * @returns {string} The generated utility class
 */
export function getTimelineLabelsUtilityClass(slot: string): string {
  return generateUtilityClass('MuiTimelineLabels', slot);
}

/** Timeline Labels utility classes */
export const timelineLabelsClasses: TimelineLabelsClasses = generateUtilityClasses('MuiTimelineLabels', [
  'root',
  'label',
  'actions',
]);