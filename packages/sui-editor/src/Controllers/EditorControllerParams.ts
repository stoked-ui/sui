import { ControllerParams, PreloadParams } from "@stoked-ui/timeline";

import { type IEditorEngine } from "../EditorEngine";
import { type IEditorAction } from "../EditorAction/EditorAction";
import { IEditorTrack } from "../EditorTrack/EditorTrack";

export interface EditorPreloadParams extends PreloadParams<IEditorAction, IEditorTrack> {}

export interface EditorControllerParams extends ControllerParams<IEditorAction, IEditorTrack, IEditorEngine> {}

