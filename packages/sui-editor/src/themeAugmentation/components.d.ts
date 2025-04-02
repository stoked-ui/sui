import {ComponentsOverrides, ComponentsProps, ComponentsVariants} from '@mui/material/styles';

export interface EditorComponents<Theme = unknown> {
  MuiEditor?: {
    defaultProps?: ComponentsProps['MuiEditor'];
    styleOverrides?: ComponentsOverrides<Theme>['MuiEditor'];
    variants?: ComponentsVariants<Theme>['MuiEditor'];
  };
}

declare module '@mui/material/styles' {
  interface Components<Theme = unknown> extends EditorComponents<Theme> {}
}

