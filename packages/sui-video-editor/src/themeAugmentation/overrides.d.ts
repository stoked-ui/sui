import { VideoEditorClassKey } from '../VideoEditor';

// prettier-ignore
export interface VideoEditorComponentNameToClassKey {
  MuiVideoEditor: VideoEditorClassKey;
}

declare module '@mui/material/styles' {
  interface ComponentNameToClassKey extends VideoEditorComponentNameToClassKey {}
}

// disable automatic export
export {};
