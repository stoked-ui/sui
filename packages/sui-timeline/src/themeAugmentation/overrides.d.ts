import { TimelineClassKey } from '../Timeline';
import { TimelineActionClassKey } from "../TimelineAction";

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
