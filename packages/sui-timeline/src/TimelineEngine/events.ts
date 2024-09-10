import {type TimelineEngine} from "./TimelineEngine";

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
      ...handlers,
    };
  }
}

export interface EventTypes {
  /**
   * Before setting time (manual)
   * @type {{ time: number, engine: TimelineEngine }}
   * @memberofEventTypes
   */
  beforeSetTime: { time: number; engine: TimelineEngine };
  /**
   * After setting time (manual)
   * @type {{ time: number, engine: TimelineEngine }}
   * @memberofEventTypes
   */
  afterSetTime: { time: number; engine: TimelineEngine };
  /**
   * After tick setting time
   * @type {{ time: number, engine: TimelineEngine }}
   * @memberofEventTypes
   */
  setTimeByTick: { time: number; engine: TimelineEngine };
  /**
   * Before setting the running speed
   * return false will prevent setting rate
   * @type {{ speed: number, engine: TimelineEngine }}
   * @memberofEventTypes
   */
  beforeSetPlayRate: { rate: number; engine: TimelineEngine };
  /**
   * After setting the running rate
   * @type {{ speed: number, engine: TimelineEngine }}
   * @memberofEventTypes
   */
  afterSetPlayRate: { rate: number; engine: TimelineEngine };
  /**
   * run
   * @type {{engine: TimelineEngine}}
   * @memberofEventTypes
   */
  play: { engine: TimelineEngine };
  /**
   * stop
   * @type {{ engine: TimelineEngine }}
   * @memberofEventTypes
   */
  paused: { engine: TimelineEngine };
  /**
   * End of operation
   * @type {{ engine: TimelineEngine }}
   * @memberofEventTypes
   */
  ended: { engine: TimelineEngine };
}
