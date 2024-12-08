import {type IEngine} from "../Engine/Engine.types";
import {type ITimelineAction} from "../TimelineAction/TimelineAction.types";
import { ITimelineTrack } from "../TimelineTrack/TimelineTrack.types";


export type PreloadParams<
  ActionType extends ITimelineAction = ITimelineAction,
  TrackType extends ITimelineTrack = ITimelineTrack,
> = {
  action: ActionType;
  track: TrackType;
}

export type ControllerParams<
  ActionType extends ITimelineAction = ITimelineAction,
  TrackType extends ITimelineTrack = ITimelineTrack,
  EngineType extends IEngine = IEngine
> = PreloadParams<ActionType, TrackType> & {
  engine: EngineType;
  time: number;
};
