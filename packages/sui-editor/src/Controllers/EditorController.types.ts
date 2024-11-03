import { IMediaFile } from "@stoked-ui/media-selector";
import { IController } from "@stoked-ui/timeline";
import {EditorControllerParams, EditorPreloadParams} from "./EditorControllerParams";


export interface IEditorController extends Omit<IController, 'start' | 'stop' | 'enter' | 'leave' | 'update' | 'preload'> {
  start?: (params: EditorControllerParams) => void;
  stop?: (params: EditorControllerParams) => void;
  enter?: (params: EditorControllerParams) => void;
  leave: (params: EditorControllerParams) => void;
  update?: (params: EditorControllerParams) => void;
  preload?: (params: EditorPreloadParams) => Promise<IEditorController>;
}
