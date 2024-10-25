import {type GetBackgroundImage, type ITimelineAction} from "@stoked-ui/timeline";
import EditorControllerParams from "./EditorControllerParams";
import {IEditorEngine} from "../EditorEngine/EditorEngine.types";

export interface IEditorController {
  start?: (params: EditorControllerParams) => void;
  stop?: (params: EditorControllerParams) => void;
  enter?: (params: EditorControllerParams) => void;
  leave: (params: EditorControllerParams) => void;
  update?: (params: EditorControllerParams) => void;
  viewerUpdate?: (engine: any) => void;
  draw?: (engine: IEditorEngine, action: ITimelineAction) => void;
  destroy?: () => void;
  color?: string;
  colorSecondary?: string;
  getBackgroundImage?: GetBackgroundImage;
  preload?: (params: Omit<EditorControllerParams, 'time'>) => ITimelineAction;
}
