import { IMediaFile2 } from "@stoked-ui/media-selector";
import {type IEngine} from "../Engine/Engine.types";
import {type ITimelineAction} from "../TimelineAction/TimelineAction.types";
import { ITimelineTrack } from "../TimelineTrack/TimelineTrack.types";

export type ControllerParams = {
  action: ITimelineAction;
  track: ITimelineTrack;
  time: number;
  engine: IEngine;
};

export type PreloadParams = {
  action: ITimelineAction;
  track: ITimelineTrack;
  stageHost?: HTMLElement;
}
