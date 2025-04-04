import type { EngineState, IEngine } from "./Engine.types";

/**
 * Events class for handling and triggering different events in the application.
 *
 * The class has a handlers object that stores event types as arrays of functions,
 * allowing for easy registration and dispatching of events.
 */
export class Events {
  /**
   * Object to store event handlers, with keys representing event types and
   * values being arrays of functions.
   */
  handlers = {};

  constructor(handlers = {}) {
    this.handlers = {
      /**
       * Event triggered before setting time manually (in milliseconds).
       *
       * @param {Object} event - The event object containing the time and engine state.
       * @param {number} event.time - The time in milliseconds.
       * @param {IEngine} event.engine - The current engine state.
       */
      beforeSetTime: [],
      /**
       * Event triggered after setting time manually (in milliseconds).
       *
       * @param {Object} event - The event object containing the time and engine state.
       * @param {number} event.time - The time in milliseconds.
       * @param {IEngine} event.engine - The current engine state.
       */
      afterSetTime: [],
      /**
       * Event triggered after setting time using a tick (in milliseconds).
       *
       * @param {Object} event - The event object containing the time and engine state.
       * @param {number} event.time - The time in milliseconds.
       * @param {IEngine} event.engine - The current engine state.
       */
      setTimeByTick: [],
      /**
       * Event triggered before setting the running speed (in seconds).
       *
       * Returns false if rate is not allowed.
       *
       * @param {Object} event - The event object containing the speed and engine state.
       * @param {number} event.rate - The desired speed in seconds.
       * @param {IEngine} event.engine - The current engine state.
       */
      beforeSetPlayRate: [],
      /**
       * Event triggered after setting the running speed (in seconds).
       *
       * @param {Object} event - The event object containing the speed and engine state.
       * @param {number} event.rate - The current speed in seconds.
       * @param {IEngine} event.engine - The current engine state.
       */
      afterSetPlayRate: [],
      /**
       * Event triggered when rewinding the animation.
       *
       * @param {Object} event - The event object containing the engine state.
       * @param {IEngine} event.engine - The current engine state.
       */
      rewind: [],
      /**
       * Event triggered when fast-forwarding the animation.
       *
       * @param {Object} event - The event object containing the engine state.
       * @param {IEngine} event.engine - The current engine state.
       */
      fastForward: [],
      /**
       * Event triggered when playing the animation.
       *
       * @param {Object} event - The event object containing the engine state.
       * @param {IEngine} event.engine - The current engine state.
       */
      play: [],
      /**
       * Event triggered when pausing the animation.
       *
       * @param {Object} event - The event object containing the previous state and engine state.
       * @param {string | EngineState} event.previousState - The previous state of the engine (or null if paused).
       * @param {IEngine} event.engine - The current engine state.
       */
      pause: [],
      /**
       * Event triggered when the animation has ended.
       *
       * @param {Object} event - The event object containing the engine state.
       * @param {IEngine} event.engine - The current engine state.
       */
      ended: [],
      /**
       * Event triggered when setting the scroll position of an element.
       *
       * @param {Object} event - The event object containing the left position and engine state.
       * @param {number} event.left - The new left position of the element.
       * @param {IEngine} event.engine - The current engine state.
       */
      setScrollLeft: {},
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
  rewind: { engine: IEngine };
  /**
   * run
   * @type {{engine: IEngine}}
   * @memberofEventTypes
   */
  fastForward: { engine: IEngine };
  /**
   * run
   * @type {{engine: IEngine}}
   * @memberofEventTypes
   */
  play: {};
  /**
   * run
   * @type {{previousState: string | EngineState, engine: IEngine}}
   * @memberofEventTypes
   */
  pause: {};
  /**
   * run
   * @type {{engine: IEngine}}
   * @memberofEventTypes
   */
  ended: {};
  /**
   * run
   * @type {{left: number, engine: IEngine}}
   * @memberofEventTypes
   */
  setScrollLeft: {};
}