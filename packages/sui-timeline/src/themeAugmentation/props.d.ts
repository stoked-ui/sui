/**
 * @typedef {Object} TimelineComponentsPropsList
 * @property {TimelineProps} MuiTimeline - Props for the Timeline component
 * @property {TimelineActionProps} MuiTimelineAction - Props for the TimelineAction component
 * @property {TimelineCursorProps} MuiTimelineCursor - Props for the TimelineCursor component
 * @property {TimelineLabelsProps} MuiTimelineLabels - Props for the TimelineLabels component
 * @property {TimelinePlayerProps} MuiTimelinePlayer - Props for the TimelinePlayer component
 * @property {TimelineScrollResizerProps} [MuiTimelineScrollResizer] - Optional props for the TimelineScrollResizer component
 * @property {TimelineTimeProps} MuiTimelineTime - Props for the TimelineTime component
 * @property {TimelineTrackProps} MuiTimelineTrack - Props for the TimelineTrack component
 * @property {TimelineTrackAreaProps} MuiTimelineTrackArea - Props for the TimelineTrackArea component
 */

/**
 * @typedef {import('../Timeline').TimelineProps} TimelineProps
 * @typedef {import('../TimelineAction').TimelineActionProps} TimelineActionProps
 * @typedef {import('../TimelineCursor').TimelineCursorProps} TimelineCursorProps
 * @typedef {import('../TimelineLabels').TimelineLabelsProps} TimelineLabelsProps
 * @typedef {import('../TimelinePlayer').TimelinePlayerProps} TimelinePlayerProps
 * @typedef {import('../TimelineScrollResizer').TimelineScrollResizerProps} TimelineScrollResizerProps
 * @typedef {import('../TimelineTime').TimelineTimeProps} TimelineTimeProps
 * @typedef {import('../TimelineTrack').TimelineTrackProps} TimelineTrackProps
 * @typedef {import('../TimelineTrackArea').TimelineTrackAreaProps} TimelineTrackAreaProps
 */

/**
 * @description Extends the ComponentsPropsList interface from @mui/material/styles with props for custom timeline components.
 */
declare module '@mui/material/styles' {
  interface ComponentsPropsList extends TimelineComponentsPropsList {}
}

// disable automatic export
export {};