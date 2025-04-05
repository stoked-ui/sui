/**
 * Interface mapping component names to their respective class keys for Timeline components.
 * Defines the mapping between MUI component names and their corresponding class keys.
 * @typedef {Object} TimelineComponentNameToClassKey
 * @property {TimelineClassKey} MuiTimeline - Class key for MuiTimeline component
 * @property {TimelineActionClassKey} MuiTimelineAction - Class key for MuiTimelineAction component
 * @property {TimelineCursorClassKey} MuiTimelineCursor - Class key for MuiTimelineCursor component
 * @property {TimelineLabelsClassKey} MuiTimelineLabels - Class key for MuiTimelineLabels component
 * @property {TimelinePlayerClassKey} MuiTimelinePlayer - Class key for MuiTimelinePlayer component
 * @property {TimelineScrollResizerClassKey} [MuiTimelineScrollResizer] - Optional class key for MuiTimelineScrollResizer component
 * @property {TimelineTimeClassKey} MuiTimelineTime - Class key for MuiTimelineTime component
 * @property {TimelineTrackClassKey} MuiTimelineTrack - Class key for MuiTimelineTrack component
 * @property {TimelineTrackAreaClassKey} MuiTimelineTrackArea - Class key for MuiTimelineTrackArea component
 */

/**
 * Extends the ComponentNameToClassKey interface from @mui/material/styles with TimelineComponentNameToClassKey.
 */
declare module '@mui/material/styles' {
  interface ComponentNameToClassKey extends TimelineComponentNameToClassKey {}
}

// disable automatic export
export {};