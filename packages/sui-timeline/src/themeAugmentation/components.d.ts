import { ComponentsOverrides, ComponentsProps, ComponentsVariants } from '@mui/material/styles';

export interface TimelineComponents<Theme = unknown> {
  MuiTimeline?: {
    defaultProps?: ComponentsProps['MuiTimeline'];
    styleOverrides?: ComponentsOverrides<Theme>['MuiTimeline'];
    variants?: ComponentsVariants<Theme>['MuiTimeline'];
  };

}

declare module '@mui/material/styles' {
  interface Components<Theme = unknown> extends TimelineComponents<Theme> {}
}
