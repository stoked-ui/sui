import { EditorProps } from '../Editor';

export interface EditorComponentsPropsList {
  MuiEditor: EditorProps<any, any>;
}

declare module '@mui/material/styles' {
  interface ComponentsPropsList extends EditorComponentsPropsList {}
}

// disable automatic export
export {};
