import {ComponentsOverrides, ComponentsProps, ComponentsVariants} from '@mui/material/styles';

export interface TimelineComponents<Theme = unknown> {
  MuiTimeline?: {
    defaultProps?: ComponentsProps['MuiTimeline'];
    styleOverrides?: ComponentsOverrides<Theme>['MuiTimeline'];
    variants?: ComponentsVariants<Theme>['MuiTimeline'];
  },
  MuiTimelineAction?: {
    defaultProps?: ComponentsProps['MuiTimelineAction'];
    styleOverrides?: ComponentsOverrides<Theme>['MuiTimelineAction'];
    variants?: ComponentsVariants<Theme>['MuiTimelineAction'];
  };
  MuiTimelineCursor?: {
    defaultProps?: ComponentsProps['MuiTimelineCursor'];
    styleOverrides?: ComponentsOverrides<Theme>['MuiTimelineCursor'];
    variants?: ComponentsVariants<Theme>['MuiTimelineCursor'];
  };
  MuiTimelineLabels?: {
    defaultProps?: ComponentsProps['MuiTimelineLabels'];
    styleOverrides?: ComponentsOverrides<Theme>['MuiTimelineLabels'];
    variants?: ComponentsVariants<Theme>['MuiTimelineLabels'];
  };
  MuiTimelinePlayer?: {
    defaultProps?: ComponentsProps['MuiTimelinePlayer'];
    styleOverrides?: ComponentsOverrides<Theme>['MuiTimelinePlayer'];
    variants?: ComponentsVariants<Theme>['MuiTimelinePlayer'];
  };
  MuiTimelineScrollResizer?: {
    defaultProps?: ComponentsProps['MuiTimelineScrollResizer'];
    styleOverrides?: ComponentsOverrides<Theme>['MuiTimelineScrollResizer'];
    variants?: ComponentsVariants<Theme>['MuiTimelineScrollResizer'];
  };
  MuiTimelineTime?: {
    defaultProps?: ComponentsProps['MuiTimelineTime'];
    styleOverrides?: ComponentsOverrides<Theme>['MuiTimelineTime'];
    variants?: ComponentsVariants<Theme>['MuiTimelineTime'];
  };
  MuiTimelineTrack?: {
    defaultProps?: ComponentsProps['MuiTimelineTrack'];
    styleOverrides?: ComponentsOverrides<Theme>['MuiTimelineTrack'];
    variants?: ComponentsVariants<Theme>['MuiTimelineTrack'];
  };
  MuiTimelineTrackArea?: {
    defaultProps?: ComponentsProps['MuiTimelineTrackArea'];
    styleOverrides?: ComponentsOverrides<Theme>['MuiTimelineTrackArea'];
    variants?: ComponentsVariants<Theme>['MuiTimelineTrackArea'];
  };

}

declare module '@mui/material/styles' {
  interface Components<Theme = unknown> extends TimelineComponents<Theme> {}
}

