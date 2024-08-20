import { EditorClassKey } from '../Editor';

// prettier-ignore
export interface EditorComponentNameToClassKey {
  MuiEditor: EditorClassKey;
}

declare module '@mui/material/styles' {
  interface ComponentNameToClassKey extends EditorComponentNameToClassKey {}
}

// disable automatic export
export {};
