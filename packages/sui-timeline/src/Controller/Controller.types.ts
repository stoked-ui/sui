import { IMediaFile2 } from "@stoked-ui/media-selector";
import { type BackgroundImageStyle, type ITimelineAction } from "../TimelineAction/TimelineAction.types";
import { type IEngine } from "../Engine";
import { PreloadParams } from "./ControllerParams";
import {ITimelineTrack} from "../TimelineTrack";


export type GetBackgroundImage = (file: IMediaFile2, options: any) => Promise<string>;
/*

export type ControllerFunc<
  ActionType extends ITimelineAction = ITimelineAction,
  EngineType extends IEngine = IEngine,
> =  (params: { action: ActionType, time: number, engine: EngineType }) => void

export type ControllerPreloadFunc<
  ActionType extends ITimelineAction = ITimelineAction,
  EngineType extends IEngine = IEngine,
> =  (params: { action: ActionType, file: IMediaFile2, engine: EngineType }) => Promise<ActionType>;
*/

export interface IController {
  start(params: { action: ITimelineAction, track: ITimelineTrack, time: number, engine: IEngine }): void
  stop(params: { action: ITimelineAction, track: ITimelineTrack, time: number, engine: IEngine }): void
  enter(params: { action: ITimelineAction, track: ITimelineTrack, time: number, engine: IEngine }): void
  leave(params: { action: ITimelineAction, track: ITimelineTrack, time: number, engine: IEngine }): void
  update(params: { action: ITimelineAction, track: ITimelineTrack, time: number, engine: IEngine }): void
  preload(params: PreloadParams): Promise<ITimelineAction>;

  viewerUpdate?: (engine: any) => void;
  destroy?: () => void;
  color?: string;
  colorSecondary?: string;
  logging: boolean;
  getBackgroundImage?: GetBackgroundImage;
  getActionStyle?: (action: ITimelineAction, scaleWidth: number, scale: number, trackHeight: number) => null | BackgroundImageStyle
}

export type VolumeSection = [volume: number, start?: number, end?: number];
export type VolumeSections = VolumeSection[];
