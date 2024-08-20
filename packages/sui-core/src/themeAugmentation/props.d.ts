import { ButtonProps } from '../Button';

export interface ButtonComponentsPropsList {
  SuiButton: ButtonProps<any, any>;
}

declare module '@mui/material/styles' {
  interface ComponentsPropsList extends ButtonComponentsPropsList {}
}

// disable automatic export
export {};
