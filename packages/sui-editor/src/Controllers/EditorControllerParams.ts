import { ControllerParams, PreloadParams } from "@stoked-ui/timeline";
import { IMediaFile} from "@stoked-ui/media-selector";

import { type IEditorEngine } from "../EditorEngine";
import { type IEditorAction } from "../EditorAction/EditorAction";

export interface EditorControllerParams extends ControllerParams {
  action: IEditorAction;
  engine: IEditorEngine;
}

export interface EditorPreloadParams extends PreloadParams {
  action: IEditorAction;
}
