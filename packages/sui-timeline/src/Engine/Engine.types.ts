import type { ITimelineTrack } from "../TimelineTrack";
import type { IController } from '../Controller/Controller.types';
import type { ITimelineAction } from "../TimelineAction";
import type { EventTypes } from './events';
import { Emitter } from "./emitter";

/**
 * Represents the Engine interface for controlling timeline playback and actions.
 * @template EmitterEvents - The event types supported by the engine
 */
export interface IEngine<EmitterEvents extends EventTypes = EventTypes> extends Emitter<EmitterEvents> {
  readonly isPlaying: boolean;
  readonly isPaused: boolean;
  readonly isLoading: boolean;
  logging: boolean;
  controllers: Record<string, any>;
  readonly duration: number;
  maxDuration: number;
  readonly canvasDuration: number;
  readonly actions: Record<string, ITimelineAction>;
  state: string;
  playbackMode: PlaybackMode;

  /**
   * Get the start time of the timeline.
   * @returns {number} The start time
   */
  getStartTime(): number;

  /**
   * Get the end time of the timeline.
   * @returns {number} The end time
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
   * Set the scroll position of the timeline.
   * @param {number} left - The left scroll position
   */
  setScrollLeft(left: number): void;

  /**
   * Set the playback rate of the timeline.
   * @param {number} rate - The playback rate to set
   * @returns {boolean} True if successful, false otherwise
   */
  setPlayRate(rate: number): boolean;

  /**
   * Get the current playback rate of the timeline.
   * @returns {number} The current playback rate
   */
  getPlayRate(): number;

  /**
   * Re-render the current time on the timeline.
   */
  reRender(): void;

  /**
   * Process a single tick at the specified time.
   * @param {number} time - The time to process the tick
   */
  tickAction(time: number): void;

  /**
   * Set the playback time of the timeline.
   * @param {number} time - The time to set
   * @param {boolean} isTick - Whether it is a tick action
   * @returns {boolean} True if successful, false otherwise
   */
  setTime(time: number, isTick?: boolean): boolean;

  /**
   * Get the current playback time of the timeline.
   * @returns {number} The current playback time
   */
  get time(): number;

  /**
   * Rewind the timeline by the specified delta.
   * @param {number} delta - The delta value to rewind by
   */
  rewind(delta: number): void;

  /**
   * Fast forward the timeline by the specified delta.
   * @param {number} delta - The delta value to fast forward by
   */
  fastForward(delta: number): void;

  /**
   * Start playing the timeline with optional parameters.
   * @param {object} param - The parameters for playing
   * @param {number} param.toTime - The time to play up to
   * @param {boolean} param.autoEnd - Whether to automatically end after playing
   * @returns {boolean} True if successful, false otherwise
   * @example
   * play({ toTime: 1000, autoEnd: true });
   */
  play(param: { toTime?: number, autoEnd?: boolean }): boolean;

  /**
   * Pause the timeline.
   */
  pause(): void;

  /**
   * Get the action and track associated with the specified action ID.
   * @param {string} actionId - The ID of the action
   * @returns {{ action: ITimelineAction, track: ITimelineTrack }} The action and track
   */
  getAction(actionId: string): { action: ITimelineAction, track: ITimelineTrack };

  /**
   * Get the track associated with the specified action ID.
   * @param {string} actionId - The ID of the action
   * @returns {ITimelineTrack} The timeline track
   */
  getActionTrack(actionId: string): ITimelineTrack;

  /**
   * Get the selected actions and their associated tracks.
   * @returns {{ action: ITimelineAction, track: ITimelineTrack }[]} Array of selected actions and tracks
   */
  getSelectedActions(): { action: ITimelineAction, track: ITimelineTrack }[];

  /**
   * Set the tracks for the timeline.
   * @param {ITimelineTrack[]} tracks - The array of timeline tracks to set
   */
  setTracks(tracks: ITimelineTrack[]): void;
}

/**
 * Enum representing the possible states of the Engine.
 */
export enum EngineState {
  LOADING = 'LOADING',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  READY = 'READY',
  PREVIEW = 'PREVIEW',
}

/**
 * Options for configuring the Engine.
 */
export type EngineOptions = {
  viewer?: HTMLElement;
  controllers?: Record<string, IController>;
  events?: any;
}

/**
 * Represents a version with an ID, version number, and key.
 */
export type Version = { id: string, version: number, key: string };

/**
 * Enum representing the playback modes of the Engine.
 */
export enum PlaybackMode {
  TRACK_FILE = 'TRACK_FILE',
  CANVAS = 'CANVAS',
  MEDIA = 'MEDIA'
}