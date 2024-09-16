import {type Engine} from "./Engine";

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
   * @type {{ time: number, engine: Engine }}
   * @memberofEventTypes
   */
  beforeSetTime: { time: number; engine: Engine };
  /**
   * After setting time (manual)
   * @type {{ time: number, engine: Engine }}
   * @memberofEventTypes
   */
  afterSetTime: { time: number; engine: Engine };
  /**
   * After tick setting time
   * @type {{ time: number, engine: Engine }}
   * @memberofEventTypes
   */
  setTimeByTick: { time: number; engine: Engine };
  /**
   * Before setting the running speed
   * return false will prevent setting rate
   * @type {{ speed: number, engine: Engine }}
   * @memberofEventTypes
   */
  beforeSetPlayRate: { rate: number; engine: Engine };
  /**
   * After setting the running rate
   * @type {{ speed: number, engine: Engine }}
   * @memberofEventTypes
   */
  afterSetPlayRate: { rate: number; engine: Engine };
  /**
   * run
   * @type {{engine: Engine}}
   * @memberofEventTypes
   */
  play: { engine: Engine };
  /**
   * stop
   * @type {{ engine: Engine }}
   * @memberofEventTypes
   */
  paused: { engine: Engine };
  /**
   * End of operation
   * @type {{ engine: Engine }}
   * @memberofEventTypes
   */
  ended: { engine: Engine };

  setScrollLeft: { left: number, engine: Engine }
}
