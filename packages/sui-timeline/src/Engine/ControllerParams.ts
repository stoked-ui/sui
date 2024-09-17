import {type IEngine} from "./Engine.types";
import {type ITimelineAction} from "../TimelineAction/TimelineAction.types";

type ControllerParams = {
  action: ITimelineAction;
  time: number;
  engine: IEngine;
};

export default ControllerParams;
