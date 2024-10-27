import { Engine, EngineState, ScreenerBlob, EngineOptions, EventTypes } from '@stoked-ui/timeline';
import {EditorEvents, EditorEventTypes} from "./events";

//interface IEngine<EmitterEvents extends EventTypes = EventTypes> extends Emitter<EmitterEvents> {
export interface IEditorEngine<State extends string = EngineState, EmitterEvents extends EventTypes = EventTypes>  extends Engine<State, EmitterEvents> {
  readonly isRecording: boolean;

  record(param: {
    /** By default, it runs from beginning to end, with a priority greater than autoEnd */
    toTime?: number;
    /** Whether to automatically end after playing */
    autoEnd?: boolean;
  }): boolean;
}

export type EditorEngineState = EngineState | 'recording';

export function ScreenVideoBlob(blob: ScreenerBlob, engine: IEditorEngine) {
  engine.screenerBlob = blob;
  const url = URL.createObjectURL(blob.blob);
  // URL.revokeObjectURL(url);
  engine.screener!.src = url;
  return url;
}


