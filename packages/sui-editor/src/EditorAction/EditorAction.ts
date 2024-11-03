import { ITimelineFileAction, ITimelineAction, initTimelineAction, IEngine } from '@stoked-ui/timeline';
import * as React from "react";
import {CSSProperties} from "@mui/system/CSSProperties";
import {DrawData, IEditorEngine} from "../EditorEngine";

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

  style?: CSSProperties;

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

export function initEditorAction(engine: IEngine, fileAction: ITimelineFileAction, trackIndex: number) {
  const newAction: IEditorAction = initTimelineAction(engine, fileAction as ITimelineFileAction, trackIndex) as IEditorAction

  const editorEngine = engine as IEditorEngine;
  if (!newAction.z) {
    newAction.z = trackIndex;
  }

  if (!newAction.width) {
    newAction.width = editorEngine.renderWidth;
  }

  if (!newAction.height) {
    newAction.height = editorEngine.renderHeight;
  }

  if (!newAction.fit) {
    newAction.fit = 'none';
  }

  return newAction;
}
