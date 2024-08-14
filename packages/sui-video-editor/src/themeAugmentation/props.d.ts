import { VideoEditorProps } from '../VideoEditor';

export interface VideoEditorComponentsPropsList {
  MuiVideoEditor: VideoEditorProps<any, any>;
}

declare module '@mui/material/styles' {
  interface ComponentsPropsList extends VideoEditorComponentsPropsList {}
}

// disable automatic export
export {};
