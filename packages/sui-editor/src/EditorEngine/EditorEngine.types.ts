import { IEngine, PlayState } from '@stoked-ui/timeline';
import {Version} from "../Editor";

export interface IEditorEngine extends IEngine {
  readonly isRecording: boolean;


  record(param: {
    /** By default, it runs from beginning to end, with a priority greater than autoEnd */
    toTime?: number;
    /** Whether to automatically end after playing */
    autoEnd?: boolean;
  }): boolean;
}

const RECORDING = 'recording';
export type EditorState = PlayState & typeof RECORDING;

export function ScreenVideoBlob(blob: Blob, engine: IEditorEngine, version: Version) {
  engine.screenerBlob = {blob, version: version.version, name: version.id, key: version.key};
  const url = URL.createObjectURL(blob);
  // URL.revokeObjectURL(url);
  engine.screener!.src = url;
  return url;
}
