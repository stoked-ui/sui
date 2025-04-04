import {TimelineProps} from '../Timeline';
import {TimelineActionProps} from "../TimelineAction";
import {TimelineCursorProps} from "../TimelineCursor";
import {TimelineLabelsProps} from "../TimelineLabels";
import {TimelinePlayerProps} from "../TimelinePlayer";
import {TimelineScrollResizerProps} from "../TimelineScrollResizer";
import {TimelineTimeProps} from "../TimelineTime";
import {TimelineTrackProps} from "../TimelineTrack";
import {TimelineTrackAreaProps} from "../TimelineTrackArea";

/**
 * Props for Timeline components.
 */
export interface TimelineComponentsPropsList {
  /**
   * Props for the MuiTimeline component.
   */
  MuiTimeline: TimelineProps;

  /**
   * Props for the MuiTimelineAction component.
   */
  MuiTimelineAction: TimelineActionProps;

  /**
   * Props for the MuiTimelineCursor component.
   */
  MuiTimelineCursor: TimelineCursorProps;

  /**
   * Props for the MuiTimelineLabels component.
   */
  MuiTimelineLabels: TimelineLabelsProps;

  /**
   * Props for the MuiTimelinePlayer component.
   */
  MuiTimelinePlayer: TimelinePlayerProps;

  /**
   * Optional props for the MuiTimelineScrollResizer component.
   */
  MuiTimelineScrollResizer?: TimelineScrollResizerProps;

  /**
   * Props for the MuiTimelineTime component.
   */
  MuiTimelineTime: TimelineTimeProps;

  /**
   * Props for the MuiTimelineTrack component.
   */
  MuiTimelineTrack: TimelineTrackProps;

  /**
   * Props for the MuiTimelineTrackArea component.
   */
  MuiTimelineTrackArea: TimelineTrackAreaProps;
}

/**
 * Extends the components props list with the timeline components.
 */
declare module '@mui/material/styles' {
  interface ComponentsPropsList extends TimelineComponentsPropsList {}
}

// disable automatic export
export {};