import type { IEngine, PlayState } from "./Engine.types";

export class Events {
  handlers = {};

  constructor(handlers = {}) {
    this.handlers = {
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
      ...handlers,
    };
  }
}

export interface EventTypes {
  /**
   * Before setting time (manual)
   * @type {{ time: number, engine: IEngine }}
   * @memberofEventTypes
   */
  beforeSetTime: { time: number; engine: IEngine };
  /**
   * After setting time (manual)
   * @type {{ time: number, engine: IEngine }}
   * @memberofEventTypes
   */
  afterSetTime: { time: number; engine: IEngine };
  /**
   * After tick setting time
   * @type {{ time: number, engine: IEngine }}
   * @memberofEventTypes
   */
  setTimeByTick: { time: number; engine: IEngine };
  /**
   * Before setting the running speed
   * return false will prevent setting rate
   * @type {{ speed: number, engine: IEngine }}
   * @memberofEventTypes
   */
  beforeSetPlayRate: { rate: number; engine: IEngine };
  /**
   * After setting the running rate
   * @type {{ speed: number, engine: IEngine }}
   * @memberofEventTypes
   */
  afterSetPlayRate: { rate: number; engine: IEngine };
  /**
   * run
   * @type {{engine: IEngine}}
   * @memberofEventTypes
   */
  play: { engine: IEngine };
  /**
   * stop
   * @type {{ engine: IEngine }}
   * @memberofEventTypes
   */
  paused: { engine: IEngine, previousState: PlayState };
  /**
   * End of operation
   * @type {{ engine: IEngine }}
   * @memberofEventTypes
   */
  ended: { engine: IEngine };

  setScrollLeft: { left: number, engine: IEngine }
}
