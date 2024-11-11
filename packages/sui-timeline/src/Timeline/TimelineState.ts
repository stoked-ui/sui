import { type EngineState, IEngine } from "../Engine/Engine.types";
import {EventTypes} from "../Engine/events";
import {Emitter} from "../Engine";
import { parserPixelToTime, parserTimeToPixel } from "../utils";
import { RowRndApi } from "../TimelineTrack/TimelineTrackDnd.types";

export interface TimelineState<EmitterEvents extends EventTypes = EventTypes,> {
  /** dom node */
  target: HTMLElement;
  /** Run the listener */
  listener: Emitter<EmitterEvents>;
  /** attached engine */
  engine: IEngine;
  /** Whether it is playing */
  isPlaying: boolean;
  /** Whether it is paused */
  isPaused: boolean;
  /** Set the current playback time */
  setTime: (time: number, move?: boolean) => void;
  /** Get the current playback time */
  getTime: () => number;
  /** Set playback rate */
  setPlayRate: (rate: number) => void;
  /** Set playback rate */
  getPlayRate: () => number;
  /** Re-render the current time */
  reRender: () => void;
  /** Current video duration time */
  duration: number;
  /** Play */
  play: (param: {
    /** By default, it runs from beginning to end, with a priority greater than autoEnd */
    toTime?: number;
    /** Whether to automatically end after playing */
    autoEnd?: boolean;
    /** List of actionIds to run, all run by default */
    runActionIds?: string[];
  }) => boolean;
  /** pause */
  pause: () => void;
  /** Set scroll left */
  setScrollLeft: (val: number) => void;
  /** Set scroll top */
  setScrollTop: (val: number) => void;
}
