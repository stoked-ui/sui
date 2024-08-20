import { TimelineClassKey } from '../Timeline/timelineClasses';
import { TimelineActionClassKey } from "../TimelineAction/timelineActionClasses";

// prettier-ignore
export interface TimelineComponentNameToClassKey {
  MuiTimeline: TimelineClassKey;
  MuiTimelineAction: TimelineActionClassKey;
}

declare module '@mui/material/styles' {
  interface ComponentNameToClassKey extends TimelineComponentNameToClassKey {}
}

// disable automatic export
export {};
