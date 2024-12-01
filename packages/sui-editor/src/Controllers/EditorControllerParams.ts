import { ControllerParams, PreloadParams } from "@stoked-ui/timeline";

import { type IEditorEngine } from "../EditorEngine";
import { type IEditorAction } from "../EditorAction/EditorAction";
import { IEditorTrack } from "../EditorTrack/EditorTrack";

export interface EditorControllerParams extends ControllerParams {
  action: IEditorAction;
  track: IEditorTrack;
  engine: IEditorEngine;
}

export interface EditorPreloadParams extends PreloadParams {
  action: IEditorAction;
}
