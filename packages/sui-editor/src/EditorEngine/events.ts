/**
 * Import necessary modules and types.
 */
import { IMediaFile } from '@stoked-ui/media-selector';
import { Events, EventTypes, IEngine } from '@stoked-ui/timeline';
import { EditorEngineState, IEditorEngine } from './EditorEngine.types';

/**
 * Class representing events for the editor.
 *
 * @extends {Events}
 */
export class EditorEvents extends Events {
  /**
   * Initializes a new instance of the EditorEvents class.
   *
   * @param {Object} [handlers={}] - An object containing event handlers.
   */
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
      ...handlers,
    });
  }
}

/**
 * Interface representing event types for the editor.
 *
 * @extends {EventTypes}
 */
export interface EditorEventTypes extends EventTypes {
  /**
   * Record event type.
   *
   * @type {{ engine: IEditorEngine }}
   * @memberofEditorEventTypes
   */
  record: { engine: IEditorEngine };

  /**
   * Finished recording event type.
   *
   * @type {{ blob: Blob, engine: IEditorEngine }}
   * @memberofEditorEventTypes
   */
  finishedRecording: { blob: Blob, engine: IEditorEngine };

  /**
   * Stop (pause) event type.
   *
   * @type {{ engine: IEditorEngine, previousState: string | EditorEngineState }}
   * @memberofEventTypes
   */
  paused: { engine: IEditorEngine, previousState: string | EditorEngineState };
}