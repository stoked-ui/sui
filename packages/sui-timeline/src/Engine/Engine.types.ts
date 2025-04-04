/**
 * Engine options for the timeline engine.
 * @typedef {Object} EngineOptions
 * @property {HTMLElement} [viewer] - Optional viewer element.
 * @property {Record<string, IController>} [controllers] - Optional controllers object.
 * @property {*} [events] - Optional events object.
 */
export type EngineOptions = {
  viewer?: HTMLElement;
  controllers?: Record<string, IController>;
  events?: any;
}

/**
 * Engine state enum for playback mode.
 * @enum {string}
 */
export enum EngineState {
  /**
   * Loading state
   */
  LOADING = 'LOADING',
  /**
   * Playing state
   */
  PLAYING = 'PLAYING',
  /**
   * Paused state
   */
  PAUSED = 'PAUSED',
  /**
   * Ready state
   */
  READY = 'READY',
  /**
   * Preview state
   */
  PREVIEW = 'PREVIEW',
}

/**
 * Timeline engine interface.
 * @interface IEngine
 * @extends {Emitter<EventTypes>}
 */
export interface IEngine<EmitterEvents extends EventTypes = EventTypes> {
  /**
   * Whether the engine is playing.
   * @type {boolean}
   */
  readonly isPlaying: boolean;
  /**
   * Whether the engine is paused.
   * @type {boolean}
   */
  readonly isPaused: boolean;
  /**
   * Whether the engine is loading.
   * @type {boolean}
   */
  readonly isLoading: boolean;
  /**
   * Logging flag
   * @type {boolean}
   */
  logging: boolean;
  /**
   * Controllers object.
   * @type {Record<string, any>}
   */
  controllers: Record<string, any>;
  /**
   * Duration of the timeline.
   * @type {number}
   */
  readonly duration: number;
  /**
   * Maximum duration of the timeline.
   * @type {number}
   */
  maxDuration: number;
  /**
   * Canvas duration.
   * @type {number}
   */
  readonly canvasDuration: number;
  /**
   * Actions object.
   * @type {Record<string, ITimelineAction>}
   */
  readonly actions: Record<string, ITimelineAction>;
  /**
   * Current state of the timeline.
   * @type {string}
   */
  state: string;
  /**
   * Playback mode.
   * @type {PlaybackMode}
   */
  playbackMode: PlaybackMode;

  /**
   * Get the start time of the timeline.
   * @returns {number} The start time.
   */
  getStartTime(): number;

  /**
   * Get the end time of the timeline.
   * @returns {number} The end time.
   */
  getEndTime(): number;

  /**
   * Set the start time of the timeline.
   */
  setStart(): void;

  /**
   * Set the end time of the timeline.
   */
  setEnd(): void;

  /**
   * Set the scroll left position.
   * @param {number} left The new scroll left position.
   */
  setScrollLeft(left: number): void;
  /**
   * Set playback rate
   * @param {number} rate The new play rate
   * @returns {boolean} Whether the update was successful
   */
  setPlayRate(rate: number): boolean;
  /**
   * Get playback rate
   * @returns {number} The current play rate.
   */
  getPlayRate(): number;
  /**
   * Re-render the current time.
   */
  reRender(): void;

  /**
   * Process a single tick
   * @param {number} time The time to process
   */
  tickAction(time: number): void;
  /**
   * Set playback time
   * @param {number} time The new time
   * @param {boolean} [isTick=false] Whether this is a tick event.
   * @returns {boolean} Whether the update was successful
   */
  setTime(time: number, isTick?: boolean): boolean;
  /**
   * Get playback time
   * @type {number}
   */
  get time(): number;

  /**
   * Play backwards increasing in speed incrementally
   * @param {number} delta The delta to apply.
   */
  rewind(delta: number): void;
  /**
   * Play forwards increasing in speed incrementally
   * @param {number} delta The delta to apply.
   */
  fastForward(delta: number): void;

  /**
   * Play
   * @param {Object} param The playback options.
   * @returns {boolean} Whether the play was successful.
   * @param {number} [param.toTime] The time to start playing at. Defaults to beginning of timeline.
   * @param {boolean} [param.autoEnd=false] If true, engine will automatically end after playing.
   */
  play(param: {
    /**
     * Time to start playback at
     * @type {number}
     */
    toTime?: number;
    /**
     * Whether to automatically end after playing
     * @type {boolean}
     */
    autoEnd?: boolean;
  }): boolean;

  /**
   * Pause
   */
  pause(): void;

  /**
   * Get action by ID
   * @param {string} actionId The action ID.
   * @returns {Object} The action object.
   */
  getAction(actionId: string): {
    /**
     * Action object
     * @type {ITimelineAction}
     */
    action: ITimelineAction;
    /**
     * Track object
     * @type {ITimelineTrack}
     */
    track: ITimelineTrack;
  };

  /**
   * Get action by ID
   * @param {string} actionId The action ID.
   * @returns {Object} The action object.
   */
  getAction(actionId: string): {
    /**
     * Action object
     * @type {ITimelineAction}
     */
    action: ITimelineAction;
    /**
     * Track object
     * @type {ITimelineTrack}
     */
    track: ITimelineTrack;
  };

  /**
   * Get actions
   * @returns {Object} The actions object.
   */
  getActions(): Record<string, ITimelineAction>;

  /**
   * Add action to the timeline
   * @param {Object} action The new action.
   */
  addAction(action: ITimelineAction): void;

  /**
   * Remove action from the timeline
   * @param {string} actionId The action ID.
   */
  removeAction(actionId: string): void;
}

/**
 * Playback mode enum
 * @enum {number}
 */
enum PlaybackMode {
  // Add playback modes here...
}

/**
 * Event types
 * @typedef {Object} EventTypes
 */