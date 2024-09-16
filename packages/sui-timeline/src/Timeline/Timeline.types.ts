import * as React from 'react';
import {Theme} from '@mui/material/styles';
import {SxProps} from '@mui/system';
import {SlotComponentProps} from '@mui/base/utils';
import {
  type IController, type ITimelineAction, type ITimelineActionInput
} from '../TimelineAction/TimelineAction.types';
import {TimelineClasses} from './timelineClasses';
import {type ITimelineTrack} from "../TimelineTrack/TimelineTrack.types";
import {type TimelineLabelsProps} from "../TimelineLabels/TimelineLabels.types";
import {type TimelineState} from "./TimelineState";
import TimelineControl, {TimelineControlProps} from "../TimelineControl";

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
  controllers: Record<string, any>;
  viewer: HTMLElement | null;
  readonly screener: HTMLVideoElement | null;
  readonly stage: HTMLDivElement | null;
  readonly renderer: HTMLCanvasElement | null;
  readonly renderCtx: CanvasRenderingContext2D | null;
  readonly duration: number;
  tracks: ITimelineTrack[];
  setTracks: React.Dispatch<React.SetStateAction<ITimelineTrack[]>> | undefined;
  readonly renderWidth: number;
  readonly renderHeight: number;
  buildTracks: (controllers: Record<string, IController>, actionData: ITimelineActionInput[]) => Promise<ITimelineTrack[]>
  action: ITimelineAction | undefined;

  setScrollLeft(left: number): void;
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

  setScrollLeft: { left: number, engine: IEngine };
}

export type TimelineComponent = ((
  props: TimelineProps & React.RefAttributes<HTMLDivElement>,
) => React.JSX.Element) & { propTypes?: any };

export interface TimelineSlots {
  /**
   * Element rendered at the root.
   * @default TimelineRoot
   */
  root?: React.ElementType;
  labels?: React.ElementType;
  control?: React.ElementType;
}

export interface TimelineSlotProps {
  root?: SlotComponentProps<'div', {}, TimelineProps>;
  labels?: SlotComponentProps<'div', {}, TimelineLabelsProps>;
  control?: SlotComponentProps<typeof TimelineControl, {}, TimelineControlProps>;
}

export interface TimelineProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  /**
   * Overridable component slots.
   * @default {}
   */
  slots?: TimelineSlots;
  /**
   * The props used for each component slot.
   * @default {}
   */
  slotProps?: TimelineSlotProps;
  className?: string;
  /**
   * Override or extend the styles applied to the component.
   */
  classes?: Partial<TimelineClasses>;
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx?: SxProps<Theme>;
  labelsSx?: SxProps<Theme>;
  labelSx?: SxProps<Theme>;
  controlSx?: SxProps<Theme>;
  trackSx?: SxProps<Theme>;

  tracks?: ITimelineTrack[];
  controllers?: Record<string, IController>;
  timelineState?: React.RefObject<TimelineState>;
  viewSelector?: string;
  engineRef?: React.RefObject<IEngine>;
  labels?: boolean;

  scaleWidth?: number;
  setScaleWidth?: (scaleWidth: number) => void;
  actionData?: ITimelineAction[];
}
