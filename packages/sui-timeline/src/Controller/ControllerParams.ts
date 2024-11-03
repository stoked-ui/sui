import {type IEngine} from "../Engine/Engine.types";
import {type ITimelineAction} from "../TimelineAction/TimelineAction.types";

export type ControllerParams = {
  action: ITimelineAction;
  time: number;
  engine: IEngine;
};
