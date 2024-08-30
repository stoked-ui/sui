import generateUtilityClass from '@mui/utils/generateUtilityClass';
import generateUtilityClasses from '@mui/utils/generateUtilityClasses';

export interface TimelineClasses {
  root: string;
  labels: string;
  time: string;
  tracks: string;
  scroll: string;

}

export type TimelineClassKey = keyof TimelineClasses;

export function getTimelineUtilityClass(slot: string): string {
  return generateUtilityClass('MuiTimeline', slot);
}

export const timelineClasses: TimelineClasses = generateUtilityClasses('MuiTimeline', [
  'root',
  'labels',
  'time',
  'tracks',
  'scroll'
]);
