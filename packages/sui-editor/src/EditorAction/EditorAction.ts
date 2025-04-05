/**
 * @typedef {('normal' | 'multiply' | 'screen' | 'overlay' | 'darken' | 'lighten' | 'color-dodge' | 'color-burn' |
 * 'hard-light' | 'soft-light' | 'difference' | 'exclusion' | 'hue' | 'saturation' | 'color' | 'luminosity' |
 * 'plus-darker' | 'plus-lighter')} BlendMode
 * @typedef {('fill' | 'cover' | 'contain' | 'none')} Fit
 */

import { ITimelineFileAction, ITimelineAction, initTimelineAction, IEngine } from '@stoked-ui/timeline';
import * as React from "react";
import { type DrawData, type IEditorEngine } from "../EditorEngine";

/**
 * @interface IEditorFileAction
 * @extends ITimelineFileAction
 * @property {React.CSSProperties} style - Style of the file action
 * @property {number} velocity - Velocity of the file action
 * @property {number} acceleration - Acceleration of the file action
 * @property {number} width - Width of the file action
 * @property {number} height - Height of the file action
 * @property {number} z - Z-index of the file action
 * @property {number | string} x - X-coordinate of the file action
 * @property {number | string} y - Y-coordinate of the file action
 * @property {Fit} fit - Fit mode for the file action
 * @property {BlendMode} blendMode - Blend mode for the file action
 */
export interface IEditorFileAction extends ITimelineFileAction {
  style?: React.CSSProperties;
  velocity?: number;
  acceleration?: number;
  width?: number;
  height?: number;
  z?: number;
  x?: number | string;
  y?: number | string;
  fit?: Fit;
  blendMode?: BlendMode;
}

/**
 * @interface IEditorAction
 * @extends ITimelineAction
 * @property {string} id - Unique identifier of the action
 * @property {React.CSSProperties} style - Style of the action
 * @property {number} width - Width of the action
 * @property {number} height - Height of the action
 * @property {number} z - Z-index of the action
 * @property {number} x - X-coordinate of the action
 * @property {number} y - Y-coordinate of the action
 * @property {DrawData} nextFrame - Data for the next frame
 * @property {Fit} fit - Fit mode for the action
 * @property {BlendMode} blendMode - Blend mode for the action
 */
export interface IEditorAction extends ITimelineAction {
  id: string;
  style?: React.CSSProperties;
  width: number;
  height: number;
  z: number;
  x?: number;
  y?: number;
  nextFrame?: DrawData;
  fit: Fit;
  blendMode: BlendMode;
}

/**
 * Initializes an editor action based on a timeline file action and track index
 * @function initEditorAction
 * @param {ITimelineFileAction} fileAction - The timeline file action to initialize
 * @param {number} trackIndex - The index of the track
 * @returns {ITimelineAction} The initialized editor action
 */
export function initEditorAction(fileAction: ITimelineFileAction, trackIndex: number) {
  const newAction: IEditorAction = initTimelineAction(fileAction as ITimelineFileAction, trackIndex) as IEditorAction;

  if (!newAction.z) {
    newAction.z = trackIndex;
  }

  if (!newAction.width) {
    newAction.width = 1920;
  }

  if (!newAction.height) {
    newAction.height = 1080;
  }

  if (!newAction.fit) {
    newAction.fit = 'none';
  }

  return newAction as ITimelineAction;
}