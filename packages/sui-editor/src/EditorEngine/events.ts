import { IMediaFile } from '@stoked-ui/media-selector';
import { Events, EventTypes , IEngine  } from '@stoked-ui/timeline';
import {EditorEngineState, IEditorEngine} from './EditorEngine.types'


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
}

