import { Events, EventTypes } from '@stoked-ui/timeline';
import {EditorEngineState, ExportProgress, IEditorEngine} from './EditorEngine.types'


export class EditorEvents extends Events  {
  constructor(handlers = {}) {

    super({
      beforeSetTime: [],
      afterSetTime: [],
      setTimeByTick: [],
      beforeSetPlayRate: [],
      afterSetPlayRate: [],
      setActiveActionIds: [],
      play: [],
      paused: [],
      ended: [],
      setScrollLeft: [],
      record: [],
      finishedRecording: [],
      exportStart: [],
      exportProgress: [],
      exportComplete: [],
      exportCancelled: [],
      exportError: [],
      ...handlers,
    });
  }
}

export interface EditorEventTypes extends EventTypes {
  /**
   * record
   * @type {{engine: IEngine}}
   * @memberofEditorEventTypes
   */
  record: { engine: IEditorEngine };

  /**
   * finishedRecording
   * @type {{engine: IEngine}}
   * @memberofEditorEventTypes
   */
  finishedRecording: { blob: Blob, engine: IEditorEngine };

  /**
   * stop
   * @type {{ engine: IEngine }}
   * @memberofEventTypes
   */
  paused: { engine: IEditorEngine, previousState: string | EditorEngineState };

  /**
   * exportStart
   * Fired when offline export begins.
   */
  exportStart: { engine: IEditorEngine; totalFrames: number };

  /**
   * exportProgress
   * Fired each time a frame is encoded during export.
   */
  exportProgress: { engine: IEditorEngine; progress: ExportProgress };

  /**
   * exportComplete
   * Fired when the export finishes successfully.
   */
  exportComplete: { engine: IEditorEngine; blob: Blob };

  /**
   * exportCancelled
   * Fired when the user cancels an in-progress export.
   */
  exportCancelled: { engine: IEditorEngine };

  /**
   * exportError
   * Fired when the export fails with an error.
   */
  exportError: { engine: IEditorEngine; error: unknown };
}
