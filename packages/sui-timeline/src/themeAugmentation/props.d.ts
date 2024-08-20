import { TimelineProps } from '../Timeline/Timeline.types';
import { TimelineActionProps } from "../TimelineAction/TimelineAction.types";

export interface TimelineComponentsPropsList {
  MuiTimeline: TimelineProps;
  MuiTimelineAction: TimelineActionProps;
}

declare module '@mui/material/styles' {
  interface ComponentsPropsList extends TimelineComponentsPropsList {}
}

// disable automatic export
export {};
