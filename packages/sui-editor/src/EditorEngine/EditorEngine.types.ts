import { IEngine, EngineState, ScreenerBlob, EngineOptions } from '@stoked-ui/timeline';
import {FileBase} from "../models";
import {EditorEvents, EditorEventTypes} from "./events";

export interface IEditorEngine<Events extends EditorEventTypes = EditorEventTypes> extends IEngine<Events> {
  readonly isRecording: boolean;

  record(param: {
    /** By default, it runs from beginning to end, with a priority greater than autoEnd */
    toTime?: number;
    /** Whether to automatically end after playing */
    autoEnd?: boolean;
  }): boolean;
}

const RECORDING = 'recording';
export type EditorEngineState = EngineState & typeof RECORDING;

export function ScreenVideoBlob(blob: ScreenerBlob, engine: IEditorEngine) {
  engine.screenerBlob = blob;
  const url = URL.createObjectURL(blob.blob);
  // URL.revokeObjectURL(url);
  engine.screener!.src = url;
  return url;
}


export type EditorEngineOptions = Omit<EngineOptions, 'events'> & {
  events?: EditorEvents;
}
