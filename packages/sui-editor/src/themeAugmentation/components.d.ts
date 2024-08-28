import { ComponentsOverrides, ComponentsProps, ComponentsVariants } from '@mui/material/styles';

export interface EditorComponents<Theme = unknown> {
  MuiEditorTest?: {
    defaultProps?: ComponentsProps['MuiEditorTest'];
    styleOverrides?: ComponentsOverrides<Theme>['MuiEditorTest'];
    variants?: ComponentsVariants<Theme>['MuiEditorTest'];
  };
}

declare module '@mui/material/styles' {
  interface Components<Theme = unknown> extends EditorComponents<Theme> {}
}
