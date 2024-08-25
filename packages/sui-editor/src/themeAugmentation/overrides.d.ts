import { EditorClassKey } from '../Editor';

// prettier-ignore
export interface EditorComponentNameToClassKey {
  MuiEditorTest: EditorClassKey;
}

declare module '@mui/material/styles' {
  interface ComponentNameToClassKey extends EditorComponentNameToClassKey {}
}

// disable automatic export
export {};
