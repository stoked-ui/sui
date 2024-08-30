import { Emitter, EventTypes } from "../TimelineEngine";

export default interface TimelineState {
  /** dom node */
  target: HTMLElement;
  /** labels node */
  labels: HTMLElement;
  /** time area node */
  time: HTMLElement;
  /** tracks node */
  tracks: HTMLElement;
  /** player node */
  // player: HTMLElement;
  /** scroll node */
  scroll: HTMLElement;
  /** Run the listener */
  listener: Emitter<EventTypes>;
  /** Whether it is playing */
  isPlaying: boolean;
  /** Whether it is paused */
  isPaused: boolean;
  /** Set the current playback time */
  setTime: (time: number) => void;
  /** Get the current playback time */
  getTime: () => number;
  /** Set playback rate */
  setPlayRate: (rate: number) => void;
  /** Set playback rate */
  getPlayRate: () => number;
  /** Re-render the current time */
  reRender: () => void;
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
  /**
   * Set scroll left
   */
  setScrollLeft: (scrollLeft: number) => void;
  /**
   * Set scroll top
   */
  setScrollTop: (scrollTop: number) => void;
}
