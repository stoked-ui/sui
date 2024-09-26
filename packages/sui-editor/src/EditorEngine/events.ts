import { Events, type EventTypes, type IEngine } from '@stoked-ui/timeline';
import { EditorState } from './EditorEngine.types'

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
  record: { engine: IEngine };

  /**
   * stop
   * @type {{ engine: IEngine }}
   * @memberofEventTypes
   */
  paused: { engine: IEngine, previousState: EditorState };
}
