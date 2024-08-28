import { ButtonClassKey } from '../Button';

// prettier-ignore
export interface ButtonComponentNameToClassKey {
  SuiButton: ButtonClassKey;
}

declare module '@mui/material/styles' {
  interface ComponentNameToClassKey extends ButtonComponentNameToClassKey {}
}

// disable automatic export
export {};
