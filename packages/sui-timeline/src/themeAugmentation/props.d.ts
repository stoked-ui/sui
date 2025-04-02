import {TimelineProps} from '../Timeline';
import {TimelineActionProps} from "../TimelineAction";
import {TimelineCursorProps} from "../TimelineCursor";
import {TimelineLabelsProps} from "../TimelineLabels";
import {TimelinePlayerProps} from "../TimelinePlayer";
import {TimelineScrollResizerProps} from "../TimelineScrollResizer";
import {TimelineTimeProps} from "../TimelineTime";
import {TimelineTrackProps} from "../TimelineTrack";
import {TimelineTrackAreaProps} from "../TimelineTrackArea";

export interface TimelineComponentsPropsList {
  MuiTimeline: TimelineProps;
  MuiTimelineAction: TimelineActionProps;
  MuiTimelineCursor: TimelineCursorProps;
  MuiTimelineLabels: TimelineLabelsProps;
  MuiTimelinePlayer: TimelinePlayerProps;
  MuiTimelineScrollResizer?: TimelineScrollResizerProps;
  MuiTimelineTime: TimelineTimeProps;
  MuiTimelineTrack: TimelineTrackProps;
  MuiTimelineTrackArea: TimelineTrackAreaProps;
}

declare module '@mui/material/styles' {
  interface ComponentsPropsList extends TimelineComponentsPropsList {}
}

// disable automatic export
export {};

