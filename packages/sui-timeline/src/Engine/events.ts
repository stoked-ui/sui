import type { EngineState, IEngine } from "./Engine.types";

/**
 * Class representing event handlers.
 */
export class Events {
  /**
   * Object containing event handlers.
   * @type {Object<string, any>}
   */
  handlers = {};

  /**
   * Create an instance of Events.
   * @param {Object<string, any>} handlers - Custom event handlers.
   */
  constructor(handlers = {}) {
    this.handlers = {
      beforeSetTime: [],
      afterSetTime: [],
      setTimeByTick: [],
      beforeSetPlayRate: [],
      afterSetPlayRate: [],
      setActiveActionIds: [],
      rewind: [],
      fastForward: [],
      play: [],
      pause: [],
      ended: [],
      setScrollLeft: [],
      ...handlers,
    };
  }
}

/**
 * Interface defining event types.
 */
export interface EventTypes {
  /**
   * Before setting time (manual)
   * @type {{ time: number, engine: IEngine }}
   * @memberof EventTypes
   */
  beforeSetTime: { time: number; engine: IEngine };
  /**
   * After setting time (manual)
   * @type {{ time: number, engine: IEngine }}
   * @memberof EventTypes
   */
  afterSetTime: { time: number; engine: IEngine };
  /**
   * After tick setting time
   * @type {{ time: number, engine: IEngine }}
   * @memberof EventTypes
   */
  setTimeByTick: { time: number; engine: IEngine };
  /**
   * Before setting the running speed
   * return false will prevent setting rate
   * @type {{ rate: number, engine: IEngine }}
   * @memberof EventTypes
   */
  beforeSetPlayRate: { rate: number; engine: IEngine };
  /**
   * After setting the running rate
   * @type {{ rate: number, engine: IEngine }}
   * @memberof EventTypes
   */
  afterSetPlayRate: { rate: number; engine: IEngine };
  /**
   * Run
   * @type {{ engine: IEngine }}
   * @memberof EventTypes
   */
  rewind: { engine: IEngine };
  /**
   * Run
   * @type {{ engine: IEngine }}
   * @memberof EventTypes
   */
  fastForward: { engine: IEngine };
  /**
   * Run
   * @type {{ engine: IEngine }}
   * @memberof EventTypes
   */
  play: { engine: IEngine };
  /**
   * Stop
   * @type {{ engine: IEngine, previousState: string | EngineState }}
   * @memberof EventTypes
   */
  pause: { engine: IEngine, previousState: string | EngineState };
  /**
   * End of operation
   * @type {{ engine: IEngine }}
   * @memberof EventTypes
   */
  ended: { engine: IEngine };

  /**
   * Set scroll left
   * @type {{ left: number, engine: IEngine }}
   * @memberof EventTypes
   */
  setScrollLeft: { left: number, engine: IEngine }
}