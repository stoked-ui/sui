import generateUtilityClass from '@mui/utils/generateUtilityClass';
import generateUtilityClasses from '@mui/utils/generateUtilityClasses';

export interface TimelineLabelsClasses {
  root: string;
  label: string;
}

export type TimelineLabelsClassKey = keyof TimelineLabelsClasses;

export function getTimelineLabelsUtilityClass(slot: string): string {
  return generateUtilityClass('MuiTimelineLabels', slot);
}

export const timelineLabelsClasses: TimelineLabelsClasses = generateUtilityClasses('MuiTimelineLabels', [
  'root',
  'label'
]);
