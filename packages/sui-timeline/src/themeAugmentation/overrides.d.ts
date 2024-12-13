import {TimelineClassKey} from '../Timeline/timelineClasses';
import {TimelineActionClassKey} from "../TimelineAction/timelineActionClasses";
import {TimelineCursorClassKey} from "../TimelineCursor/timelineCursorClasses";
import {TimelineLabelsClassKey} from "../TimelineLabels/timelineLabelsClasses";
import {TimelinePlayerClassKey} from "../TimelinePlayer/timelinePlayerClasses";
import {TimelineScrollResizerClassKey} from "../TimelineScrollResizer/timelineScrollResizerClasses";
import {TimelineTimeClassKey} from "../TimelineTime/timelineTimeClasses";
import {TimelineTrackClassKey} from "../TimelineTrack/timelineTrackClasses";
import {TimelineTrackAreaClassKey} from "../TimelineTrackArea/timelineTrackAreaClasses";

// prettier-ignore
export interface TimelineComponentNameToClassKey {
  MuiTimeline: TimelineClassKey;
  MuiTimelineAction: TimelineActionClassKey;
  MuiTimelineCursor: TimelineCursorClassKey;
  MuiTimelineLabels: TimelineLabelsClassKey;
  MuiTimelinePlayer: TimelinePlayerClassKey;
  MuiTimelineScrollResizer?: TimelineScrollResizerClassKey;
  MuiTimelineTime: TimelineTimeClassKey;
  MuiTimelineTrack: TimelineTrackClassKey;
  MuiTimelineTrackArea: TimelineTrackAreaClassKey;
}

declare module '@mui/material/styles' {
  interface ComponentNameToClassKey extends TimelineComponentNameToClassKey {}
}

// disable automatic export
export {};
