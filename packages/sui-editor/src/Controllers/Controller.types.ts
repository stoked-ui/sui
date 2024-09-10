import {ITimelineAction, ITimelineTrack} from "@stoked-ui/timeline";

export interface IEmitter<EventTypes> {
  events: { [key: string]: CallableFunction[] };
  on<K extends keyof EventTypes>(names: K | K[], handler: (args: EventTypes[K]) => boolean | unknown): this;
  trigger<K extends keyof EventTypes>(name: K, params: EventTypes[K]): boolean;
  bind(name: string): void;
  exist(name: string): boolean;
  off<K extends keyof EventTypes>(name: K, handler?: (args: EventTypes[K]) => boolean | unknown): void;
  offAll(): void;
}

export interface IEngine extends IEmitter<EventTypes> {
  readonly isPlaying: boolean;
  readonly isPaused: boolean;
  actionTypes: Record<string, IController>;
  viewer: HTMLElement;
  readonly renderer: HTMLCanvasElement;
  readonly renderCtx: CanvasRenderingContext2D;
  readonly preview: HTMLElement;

  /** Set playback rate */
  setPlayRate(rate: number): boolean;
  /** Get playback rate */
  getPlayRate(): number;
  /** Re-render the current time */
  reRender(): void;
  /** Set playback time */
  setTime(time: number, isTick?: boolean): boolean;
  /** Get playback time */
  getTime(): number;
  /** Play */
  play(param: {
    /** By default, it runs from beginning to end, with a priority greater than autoEnd */
    toTime?: number;
    /** Whether to automatically end after playing */
    autoEnd?: boolean;
  }): boolean;
  /** pause */
  pause(): void;

  getAction(actionId: string): { action: ITimelineAction, track: ITimelineTrack };
  getActionTrack(actionId: string):  any;
  getSelectedActions(): { action: ITimelineAction, track: ITimelineTrack }[];
}

export interface IEvents {
  handlers: EventTypes
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
  paused: { engine: IEngine };
  /**
   * End of operation
   * @type {{ engine: IEngine }}
   * @memberofEventTypes
   */
  ended: { engine: IEngine };
}

export type ControllerParams = {
  action: ITimelineAction;
  time: number;
  engine: IEngine;
};

export type GetBackgroundImage = (action: ITimelineAction) => Promise<string>;

interface IController {
  start?: (params: ControllerParams) => void;
  stop?: (params: ControllerParams) => void;
  enter?: (params: ControllerParams) => void;
  leave: (params: ControllerParams) => void;
  update?: (params: ControllerParams) => void;
  viewerUpdate?: (engine: any) => void;
  destroy?: () => void;
  color?: string;
  colorSecondary?: string;
  getBackgroundImage?: GetBackgroundImage;
}
export default IController;
