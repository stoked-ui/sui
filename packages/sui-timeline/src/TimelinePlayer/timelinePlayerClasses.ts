import generateUtilityClass from '@mui/utils/generateUtilityClass';
import generateUtilityClasses from '@mui/utils/generateUtilityClasses';

export interface TimelinePlayerClasses {
  root: string;
  skipPrevious: string;
  pausePlaying: string;
  skipNext: string;
  time: string;
  rate: string;
}

export type TimelinePlayerClassKey = keyof TimelinePlayerClasses;

export function getTimelinePlayerUtilityClass(slot: string): string {
  return generateUtilityClass('MuiTimelinePlayer', slot);
}

export const timelinePlayerClasses: TimelinePlayerClasses = generateUtilityClasses('MuiTimelinePlayer', [
  'root',
  'skipPrevious',
  'pausePlaying',
  'skipNext',
  'time',
  'rate',
]);

