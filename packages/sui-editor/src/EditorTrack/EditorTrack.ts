import { IController, ITimelineFileTrack, ITimelineTrack } from "@stoked-ui/timeline";
import {
  BlendMode,
  Fit,
  type IEditorAction,
  type IEditorFileAction
} from "../EditorAction/EditorAction";


export interface IEditorTrack<
  ActionType extends IEditorAction = IEditorAction,
> extends ITimelineTrack<ActionType> {

  /** Whether the action is hidden */
  hidden?: boolean;

  blendMode: BlendMode;

  fit: Fit;

  image?: string;

}


export interface IEditorFileTrack extends Omit<IEditorTrack, 'id' | 'controller' | 'actions' | 'file' | 'blendMode' | 'fit'> {
  /** Action track id */
  id?: string;

  name: string;
  /** Row action list */
  actions: IEditorAction[];

  file?: any;

  controllerName?: string;

  controller?: IController;

  blendMode?: BlendMode;

  fit?: Fit;
}
