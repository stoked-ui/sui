/**
 * @interface TimelineComponents
 * @description Defines the components for a timeline.
 *
 * @param {unknown} [theme] - The theme object.
 */
export interface TimelineComponents<Theme = unknown> {
  /**
   * MuiTimeline component props and overrides.
   */
  MuiTimeline?: {
    defaultProps?: ComponentsProps['MuiTimeline'];
    styleOverrides?: ComponentsOverrides<Theme>['MuiTimeline'];
    variants?: ComponentsVariants<Theme>['MuiTimeline'];
  },
  /**
   * MuiTimelineAction component props and overrides.
   */
  MuiTimelineAction?: {
    defaultProps?: ComponentsProps['MuiTimelineAction'];
    styleOverrides?: ComponentsOverrides<Theme>['MuiTimelineAction'];
    variants?: ComponentsVariants<Theme>['MuiTimelineAction'];
  };
  /**
   * MuiTimelineCursor component props and overrides.
   */
  MuiTimelineCursor?: {
    defaultProps?: ComponentsProps['MuiTimelineCursor'];
    styleOverrides?: ComponentsOverrides<Theme>['MuiTimelineCursor'];
    variants?: ComponentsVariants<Theme>['MuiTimelineCursor'];
  };
  /**
   * MuiTimelineLabels component props and overrides.
   */
  MuiTimelineLabels?: {
    defaultProps?: ComponentsProps['MuiTimelineLabels'];
    styleOverrides?: ComponentsOverrides<Theme>['MuiTimelineLabels'];
    variants?: ComponentsVariants<Theme>['MuiTimelineLabels'];
  };
  /**
   * MuiTimelinePlayer component props and overrides.
   */
  MuiTimelinePlayer?: {
    defaultProps?: ComponentsProps['MuiTimelinePlayer'];
    styleOverrides?: ComponentsOverrides<Theme>['MuiTimelinePlayer'];
    variants?: ComponentsVariants<Theme>['MuiTimelinePlayer'];
  };
  /**
   * MuiTimelineScrollResizer component props and overrides.
   */
  MuiTimelineScrollResizer?: {
    defaultProps?: ComponentsProps['MuiTimelineScrollResizer'];
    styleOverrides?: ComponentsOverrides<Theme>['MuiTimelineScrollResizer'];
    variants?: ComponentsVariants<Theme>['MuiTimelineScrollResizer'];
  };
  /**
   * MuiTimelineTime component props and overrides.
   */
  MuiTimelineTime?: {
    defaultProps?: ComponentsProps['MuiTimelineTime'];
    styleOverrides?: ComponentsOverrides<Theme>['MuiTimelineTime'];
    variants?: ComponentsVariants<Theme>['MuiTimelineTime'];
  };
  /**
   * MuiTimelineTrack component props and overrides.
   */
  MuiTimelineTrack?: {
    defaultProps?: ComponentsProps['MuiTimelineTrack'];
    styleOverrides?: ComponentsOverrides<Theme>['MuiTimelineTrack'];
    variants?: ComponentsVariants<Theme>['MuiTimelineTrack'];
  };
  /**
   * MuiTimelineTrackArea component props and overrides.
   */
  MuiTimelineTrackArea?: {
    defaultProps?: ComponentsProps['MuiTimelineTrackArea'];
    styleOverrides?: ComponentsOverrides<Theme>['MuiTimelineTrackArea'];
    variants?: ComponentsVariants<Theme>['MuiTimelineTrackArea'];
  };
}

/**
 * @interface Components
 * @description Extends the TimelineComponents interface.
 */
declare module '@mui/material/styles' {
  interface Components<Theme = unknown> extends TimelineComponents<Theme> {}
}