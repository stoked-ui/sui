/**
 * Import required modules and types
 */
import { type EngineState, IEngine } from "../Engine/Engine.types";
import { EventTypes } from "../Engine/events";
import { Emitter } from "../Engine";
import { parserPixelToTime, parserTimeToPixel } from "../utils";
import { RowRndApi } from "../TimelineTrack/TimelineTrackDnd.types";

/**
 * Interface for TimelineState
 *
 * @description This interface represents the state of a timeline.
 * It contains properties related to the DOM node, engine, playback state,
 * and methods for controlling playback.
 */
export interface TimelineState<EmitterEvents extends EventTypes = EventTypes,> {
  /**
   * The DOM node associated with this timeline.
   */
  target: HTMLElement;

  /**
   * The listener for events emitted by this timeline.
   */
  listener: Emitter<EmitterEvents>;

  /**
   * The engine used to power this timeline.
   */
  engine: IEngine;

  /**
   * Whether the playback is currently playing.
   */
  isPlaying: boolean;

  /**
   * Whether the playback is currently paused.
   */
  isPaused: boolean;

  /**
   * Sets the current playback time.
   *
   * @param time The new playback time.
   * @param move Whether to update the scroll position. Default is false.
   */
  setTime(time: number, move?: boolean): void;

  /**
   * Gets the current playback time.
   *
   * @returns The current playback time.
   */
  get time(): number;

  /**
   * Sets the playback rate.
   *
   * @param rate The new playback rate.
   */
  setPlayRate(rate: number): void;

  /**
   * Gets the current playback rate.
   *
   * @returns The current playback rate.
   */
  getPlayRate(): number;

  /**
   * Re-renders the current time.
   */
  reRender(): void;

  /**
   * The duration of the video in milliseconds.
   */
  duration: number;

  /**
   * Plays the timeline.
   *
   * @param param An object containing options for playing the timeline. See below for details.
   * @returns Whether the playback was successful.
   */
  play(param: {
    /**
     * The time to start playing from (optional). Defaults to the beginning of the video.
     */
    toTime?: number;

    /**
     * Whether to automatically end after playing (optional).
     */
    autoEnd?: boolean;

    /**
     * A list of action IDs to run, all run by default (optional).
     */
    runActionIds?: string[];
  }): boolean;

  /**
   * Pauses the playback.
   */
  pause(): void;

  /**
   * Sets the scroll left position.
   *
   * @param val The new scroll left value.
   */
  setScrollLeft(val: number): void;

  /**
   * Sets the scroll top position.
   *
   * @param val The new scroll top value.
   */
  setScrollTop(val: number): void;
}