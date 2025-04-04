/**
 * Import necessary classes from other modules.
 */
import {TimelineClassKey} from '../Timeline/timelineClasses';
import {TimelineActionClassKey} from "../TimelineAction/timelineActionClasses";
import {TimelineCursorClassKey} from "../TimelineCursor/timelineCursorClasses";
import {TimelineLabelsClassKey} from "../TimelineLabels/timelineLabelsClasses";
import {TimelinePlayerClassKey} from "../TimelinePlayer/timelinePlayerClasses";
import {TimelineScrollResizerClassKey} from "../TimelineScrollResizer/timelineScrollResizerClasses";
import {TimelineTimeClassKey} from "../TimelineTime/timelineTimeClasses";
import {TimelineTrackClassKey} from "../TimelineTrack/timelineTrackClasses";
import {TimelineTrackAreaClassKey} from "../TimelineTrackArea/timelineTrackAreaClasses";

/**
 * Maps component names to their corresponding class keys.
 */
export interface TimelineComponentNameToClassKey {
  /**
   * MuiTimeline component class key.
   */
  MuiTimeline: TimelineClassKey;
  /**
   * MuiTimelineAction component class key.
   */
  MuiTimelineAction: TimelineActionClassKey;
  /**
   * MuiTimelineCursor component class key.
   */
  MuiTimelineCursor: TimelineCursorClassKey;
  /**
   * MuiTimelineLabels component class key.
   */
  MuiTimelineLabels: TimelineLabelsClassKey;
  /**
   * MuiTimelinePlayer component class key.
   */
  MuiTimelinePlayer: TimelinePlayerClassKey;
  /**
   * Optional MuiTimelineScrollResizer component class key (may be undefined).
   */
  MuiTimelineScrollResizer?: TimelineScrollResizerClassKey;
  /**
   * MuiTimelineTime component class key.
   */
  MuiTimelineTime: TimelineTimeClassKey;
  /**
   * MuiTimelineTrack component class key.
   */
  MuiTimelineTrack: TimelineTrackClassKey;
  /**
   * MuiTimelineTrackArea component class key.
   */
  MuiTimelineTrackArea: TimelineTrackAreaClassKey;
}

/**
 * Extend the ComponentNameToClassKey interface to include the TimelineComponentNameToClassKey properties.
 */
declare module '@mui/material/styles' {
  interface ComponentNameToClassKey extends TimelineComponentNameToClassKey {}
}

// disable automatic export
export {};