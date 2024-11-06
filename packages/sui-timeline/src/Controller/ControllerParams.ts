import { IMediaFile } from "@stoked-ui/media-selector";
import {type IEngine} from "../Engine/Engine.types";
import {type ITimelineAction} from "../TimelineAction/TimelineAction.types";


interface IControllerParamsBase {
  action: any;
  engine: any;
}

export interface IControllerParams extends IControllerParamsBase{
  time: number;
}

export type ControllerParams = {
  action: ITimelineAction;
  time: number;
  engine: IEngine;
};

export interface IPreloadParams extends IControllerParamsBase{
  file: IMediaFile;
}

export interface PreloadParams extends Omit<ControllerParams & { file: IMediaFile }, 'time'> {}
