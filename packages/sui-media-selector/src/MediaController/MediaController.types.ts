import MediaAction from "../MediaAction/MediaAction";

export interface IEmitter<EventTypes> {
  events: { [key: string]: CallableFunction[] };
  on<K extends keyof EventTypes>(names: K | K[], handler: (args: EventTypes[K]) => boolean | unknown): this;
  trigger<K extends keyof EventTypes>(name: K, params: EventTypes[K]): boolean;
  bind(name: string): void;
  exist(name: string): boolean;
  off<K extends keyof EventTypes>(name: K, handler?: (args: EventTypes[K]) => boolean | unknown): void;
  offAll(): void;
}

export interface IMediaEngine extends IEmitter<EventTypes> {
  readonly isPlaying: boolean;
  readonly isPaused: boolean;
  actionTypes: Record<string, IMediaController>;
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

  getAction(actionId: string): { action: MediaAction, track: any };
  getActionTrack(actionId: string):  any;
  getSelectedActions(): { action: MediaAction, track: any }[];
}

export interface IEvents {
  handlers: EventTypes
}

export interface EventTypes {
  /**
   * Before setting time (manual)
   * @type {{ time: number, engine: IMediaEngine }}
   * @memberofEventTypes
   */
  beforeSetTime: { time: number; engine: IMediaEngine };
  /**
   * After setting time (manual)
   * @type {{ time: number, engine: IMediaEngine }}
   * @memberofEventTypes
   */
  afterSetTime: { time: number; engine: IMediaEngine };
  /**
   * After tick setting time
   * @type {{ time: number, engine: IMediaEngine }}
   * @memberofEventTypes
   */
  setTimeByTick: { time: number; engine: IMediaEngine };
  /**
   * Before setting the running speed
   * return false will prevent setting rate
   * @type {{ speed: number, engine: IMediaEngine }}
   * @memberofEventTypes
   */
  beforeSetPlayRate: { rate: number; engine: IMediaEngine };
  /**
   * After setting the running rate
   * @type {{ speed: number, engine: IMediaEngine }}
   * @memberofEventTypes
   */
  afterSetPlayRate: { rate: number; engine: IMediaEngine };
  /**
   * run
   * @type {{engine: IMediaEngine}}
   * @memberofEventTypes
   */
  play: { engine: IMediaEngine };
  /**
   * stop
   * @type {{ engine: IMediaEngine }}
   * @memberofEventTypes
   */
  paused: { engine: IMediaEngine };
  /**
   * End of operation
   * @type {{ engine: IMediaEngine }}
   * @memberofEventTypes
   */
  ended: { engine: IMediaEngine };
}

export type MediaControllerParams = {
  action: MediaAction;
  time: number;
  engine: IMediaEngine;
};

export type GetBackgroundImage = (action: MediaAction) => Promise<string>;

interface IMediaController {
  start?: (params: MediaControllerParams) => void;
  stop?: (params: MediaControllerParams) => void;
  enter?: (params: MediaControllerParams) => void;
  leave: (params: MediaControllerParams) => void;
  update?: (params: MediaControllerParams) => void;
  viewerUpdate?: (engine: any) => void;
  destroy?: () => void;
  color?: string;
  colorSecondary?: string;
  getBackgroundImage?: GetBackgroundImage;
}
export default IMediaController;
