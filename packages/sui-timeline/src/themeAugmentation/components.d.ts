import { ComponentsOverrides, ComponentsProps, ComponentsVariants } from '@mui/material/styles';

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

}

declare module '@mui/material/styles' {
  interface Components<Theme = unknown> extends TimelineComponents<Theme> {}
}
