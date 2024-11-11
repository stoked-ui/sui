import { ITimelineFileAction, ITimelineAction, initTimelineAction, IEngine } from '@stoked-ui/timeline';
import * as React from "react";
import { type DrawData, type IEditorEngine } from "../EditorEngine";

export interface IEditorFileAction extends ITimelineFileAction {

  style?: React.CSSProperties;

  velocity?: number;

  acceleration?: number;

  width?: number;

  height?: number;

  z?: number;

  x?: number | string;

  y?: number | string;

  fit?:
    'fill'    | // The action is resized to fill the given dimension. If necessary, the action will be stretched or squished to fit
    'cover'   | // The action keeps its aspect ratio and fills the given dimension. The action will be clipped to fit
    'contain' | // The action keeps its aspect ratio, but is resized to fit within the given dimension
    'none'      // DEFAULT - The action is not resized
}

export interface IEditorAction extends ITimelineAction {

  id: string;

  style?: React.CSSProperties;

  width: number;

  height: number;

  z: number;

  x?: number;

  y?: number;

  nextFrame?: DrawData;

  fit:
    'fill'    | // The action is resized to fill the given dimension. If necessary, the action will be stretched or squished to fit
    'cover'   | // The action keeps its aspect ratio and fills the given dimension. The action will be clipped to fit
    'contain' | // The action keeps its aspect ratio, but is resized to fit within the given dimension
    'none'      // DEFAULT - The action is not resized

}

export function initEditorAction(fileAction: ITimelineFileAction, trackIndex: number) {
  const newAction: IEditorAction = initTimelineAction(fileAction as ITimelineFileAction, trackIndex) as IEditorAction

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
