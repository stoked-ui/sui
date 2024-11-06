import { ControllerParams, PreloadParams } from "@stoked-ui/timeline";
import { IMediaFile} from "@stoked-ui/media-selector";

import { type IEditorEngine } from "../EditorEngine";
import { type IEditorAction } from "../EditorAction/EditorAction";

export interface EditorControllerParams extends Omit<ControllerParams, 'action' | 'engine'> {
  action: IEditorAction;
  engine: IEditorEngine;
}
export interface EditorPreloadParams extends Omit<EditorControllerParams & { file: IMediaFile }, 'time'> {}
