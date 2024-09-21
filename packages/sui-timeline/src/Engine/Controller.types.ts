import ControllerParams from "./ControllerParams";
import {type GetBackgroundImage, type ITimelineAction} from "../TimelineAction/TimelineAction.types";
import {IEngine} from "./Engine.types";

export interface IController {
  start?: (params: ControllerParams) => void;
  stop?: (params: ControllerParams) => void;
  enter?: (params: ControllerParams) => void;
  leave: (params: ControllerParams) => void;
  update?: (params: ControllerParams) => void;
  viewerUpdate?: (engine: any) => void;
  draw?: (engine: IEngine, action: ITimelineAction) => void;
  destroy?: () => void;
  color?: string;
  colorSecondary?: string;
  getBackgroundImage?: GetBackgroundImage;
  preload?: (params: Omit<ControllerParams, 'time'>) => ITimelineAction;
}
