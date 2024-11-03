import {ControllerParams, type PreloadParams} from "@stoked-ui/timeline";
import {type IEditorEngine} from "../EditorEngine/EditorEngine.types";
import {IEditorAction} from "../EditorAction/EditorAction";

export interface EditorPreloadParams extends Omit<PreloadParams, 'engine' | 'time' | 'action'> {
  engine: IEditorEngine;
  action: IEditorAction;
}

export interface EditorControllerParams extends Omit<ControllerParams, 'engine'> {
  engine: IEditorEngine;
  action: IEditorAction;
}
