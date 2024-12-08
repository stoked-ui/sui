import { IController, ITimelineFileTrack, ITimelineTrack } from "@stoked-ui/timeline";
import {
  BlendMode,
  Fit,
  type IEditorAction,
  type IEditorFileAction
} from "../EditorAction/EditorAction";
// import { type IEditorController } from "../Controllers/EditorController.types";
import { MediaFile } from "@stoked-ui/media-selector";


export interface IEditorTrack<
  ActionType extends IEditorAction = IEditorAction,
> extends ITimelineTrack<ActionType> {

  /** Whether the action is hidden */
  hidden?: boolean;

  blendMode: BlendMode;

  fit: Fit;
}


export interface IEditorFileTrack extends Omit<IEditorTrack, 'id' | 'controller' | 'actions' | 'file' | 'blendMode' | 'fit'> {
  /** Action track id */
  id?: string;

  name: string;
  /** Row action list */
  actions: IEditorAction[];

  url?: string;

  image?: string;

  file?: MediaFile;

  controllerName?: string;

  controller?: IController;

  blendMode?: BlendMode;

  fit?: Fit;
}
