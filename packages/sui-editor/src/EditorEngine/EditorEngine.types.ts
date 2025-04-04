import {
  Engine,
  EngineState,
  ITimelineTrack,
  RowRndApi
} from '@stoked-ui/timeline';
import { type EditorEventTypes } from "./events";

/**
 * Interface representing the editor engine, which extends the base engine.
 *
 * @template State - The state of the engine, extending from 'EditorEngineState'
 * @template EmitterEvents - The events emitted by the engine, extending from 'EditorEventTypes'
 */
export interface IEditorEngine<
  State extends string = EditorEngineState,
  EmitterEvents extends EditorEventTypes = EditorEventTypes
>
  extends Engine<State, EmitterEvents> {

  /**
   * Whether the engine is currently recording.
   *
   * @readonly
   */
  readonly isRecording: boolean;

  /**
   * The viewer element of the editor engine.
   *
   * @type {HTMLElement | null}
   */
  viewer: HTMLElement | null;

  /**
   * The stage element of the editor engine.
   *
   * @type {HTMLDivElement | null}
   */
  readonly stage: HTMLDivElement | null;

  /**
   * The screener element of the editor engine.
   *
   * @type {HTMLVideoElement | null}
   */
  readonly screener: HTMLVideoElement | null;

  /**
   * The renderer element of the editor engine.
   *
   * @type {HTMLCanvasElement | null}
   */
  renderer: HTMLCanvasElement | null;

  /**
   * The rendering context of the editor engine.
   *
   * @type {CanvasRenderingContext2D | null}
   */
  readonly renderCtx: CanvasRenderingContext2D | null;

  /**
   * The width and height of the rendered image.
   *
   * @type {number}
   */
  readonly renderWidth: number;

  /**
   * The height of the rendered image.
   *
   * @type {number}
   */
  readonly renderHeight: number;

  /**
   * Draws an image on the editor engine.
   *
   * @param {DrawData} dd - The data containing the source, size, and position to draw.
   * @returns {void}
   */
  drawImage(dd: DrawData): void;

  /**
   * Records a new timeline track in the editor engine.
   *
   * @param {Object} param - The parameters for recording, including optional 'toTime', 'autoEnd', and 'name'.
   * @param {number} [param.toTime] - The time to record from (default: beginning).
   * @param {boolean} [param.autoEnd] - Whether to automatically end after playing (default: false).
   * @param {string} [param.name] - The name of the timeline track.
   * @returns {boolean}
   */
  record(param: {
    /** By default, it runs from beginning to end, with a priority greater than autoEnd */
    toTime?: number;
    /** Whether to automatically end after playing */
    autoEnd?: boolean;
    name?: string;
  }): boolean;

}

/**
 * Extended engine state, including the RECORDING status.
 *
 * @enum {string}
 */
export enum EngineStateEx {
  RECORDING = 'RECORDING'
}

/**
 * Type representing the editor engine state, which extends from 'EngineState' or 'EngineStateEx'.
 *
 * @type {EditorEngineState}
 */
export type EditorEngineState =  EngineState | EngineStateEx;

/**
 * Data structure containing information about an image to draw.
 *
 * @typedef {Object} DrawData
 * @property {HTMLImageElement | SVGImageElement | HTMLVideoElement | HTMLCanvasElement | ImageBitmap | OffscreenCanvas | VideoFrame} source - The source of the image.
 * @property {number} sx - The x-coordinate of the top-left corner of the image.
 * @property {number} sy - The y-coordinate of the top-left corner of the image.
 * @property {number} sWidth - The width of the image.
 * @property {number} sHeight - The height of the image.
 * @property {number} [dx] - The x-coordinate to draw the image (optional).
 * @property {number} [dy] - The y-coordinate to draw the image (optional).
 * @property {number} [dWidth] - The width of the image in the target coordinate system (optional).
 * @property {number} [dHeight] - The height of the image in the target coordinate system (optional).
 */

/**
 * Enum representing different view modes for the editor engine.
 *
 * @enum {string}
 */
export type ViewMode = 'Renderer' | 'Screener' | 'Edit';