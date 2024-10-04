import { IEngine, PlayState, ScreenerBlob } from '@stoked-ui/timeline';
import {type Version} from "../Editor";

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

export function ScreenVideoBlob(blob: ScreenerBlob, engine: IEditorEngine) {
  engine.screenerBlob = blob;
  const url = URL.createObjectURL(blob.blob);
  // URL.revokeObjectURL(url);
  engine.screener!.src = url;
  return url;
}

