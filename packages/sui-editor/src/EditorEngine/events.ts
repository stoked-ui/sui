import { IMediaFile } from '@stoked-ui/media-selector';
import { Events, EventTypes, IEngine } from '@stoked-ui/timeline';
import { EditorEngineState, IEditorEngine } from './EditorEngine.types';

/**
 * Class representing editor events.
 */
export class EditorEvents extends Events {
  /**
   * Create an instance of EditorEvents.
   * @param {Object} handlers - Event handlers.
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
 * Interface for editor event types.
 */
export interface EditorEventTypes extends EventTypes {
  /**
   * Event type for recording.
   * @typedef {{ engine: IEngine }} record
   * @memberof EditorEventTypes
   */

  /**
   * Event type for finished recording.
   * @typedef {{ blob: Blob, engine: IEngine }} finishedRecording
   * @memberof EditorEventTypes
   */

  /**
   * Event type for pausing.
   * @typedef {{ engine: IEngine, previousState: string | EditorEngineState }} paused
   * @memberof EditorEventTypes
   */
}