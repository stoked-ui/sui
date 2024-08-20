import { ComponentsOverrides, ComponentsProps, ComponentsVariants } from '@mui/material/styles';

export interface VideoEditorComponents<Theme = unknown> {
  MuiVideoEditor?: {
    defaultProps?: ComponentsProps['MuiVideoEditor'];
    styleOverrides?: ComponentsOverrides<Theme>['MuiVideoEditor'];
    variants?: ComponentsVariants<Theme>['MuiVideoEditor'];
  };
}

declare module '@mui/material/styles' {
  interface Components<Theme = unknown> extends VideoEditorComponents<Theme> {}
}
