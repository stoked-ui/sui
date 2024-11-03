import {ComponentsOverrides, ComponentsProps, ComponentsVariants} from '@mui/material/styles';

export interface TimelineComponents<Theme = unknown> {
}

declare module '@mui/material/styles' {
  interface Components<Theme = unknown> extends TimelineComponents<Theme> {}
}
