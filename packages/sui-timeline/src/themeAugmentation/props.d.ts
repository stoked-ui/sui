import { TimelineProps } from '../Timeline';
import { TimelineActionProps } from "../TimelineAction";

export interface TimelineComponentsPropsList {
  MuiTimeline: TimelineProps;
  MuiTimelineAction: TimelineActionProps;
}

declare module '@mui/material/styles' {
  interface ComponentsPropsList extends TimelineComponentsPropsList {}
}

// disable automatic export
export {};
