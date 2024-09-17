import ControllerParams from "./ControllerParams";
import {GetBackgroundImage, ITimelineAction} from "../TimelineAction";

export interface IController {
  start?: (params: ControllerParams) => void;
  stop?: (params: ControllerParams) => void;
  enter?: (params: ControllerParams) => void;
  leave: (params: ControllerParams) => void;
  update?: (params: ControllerParams) => void;
  viewerUpdate?: (engine: any) => void;
  destroy?: () => void;
  color?: string;
  colorSecondary?: string;
  getBackgroundImage?: GetBackgroundImage;
  preload?: (params: Omit<ControllerParams, 'time'>) => ITimelineAction;
}
