import { ComponentsOverrides, ComponentsProps, ComponentsVariants } from '@mui/material/styles';

export interface ButtonComponents<Theme = unknown> {
  SuiButton?: {
    defaultProps?: ComponentsProps['SuiButton'];
    styleOverrides?: ComponentsOverrides<Theme>['SuiButton'];
    variants?: ComponentsVariants<Theme>['SuiButton'];
  };
}

declare module '@mui/material/styles' {
  interface Components<Theme = unknown> extends ButtonComponents<Theme> {}
}
