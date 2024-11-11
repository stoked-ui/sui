import { IMediaFile } from "@stoked-ui/media-selector";
import {type IEngine} from "../Engine/Engine.types";
import {type ITimelineAction} from "../TimelineAction/TimelineAction.types";

export type ControllerParams = {
  action: ITimelineAction;
  time: number;
  engine: IEngine;
};

export type PreloadParams = {
  action: ITimelineAction;
  file: IMediaFile;
  stageHost?: HTMLElement;
}
