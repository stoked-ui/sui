import { IMediaFile } from "@stoked-ui/media-selector";
import { type BackgroundImageStyle, type ITimelineAction } from "../TimelineAction/TimelineAction.types";
import { type IEngine } from "../Engine";


export type GetBackgroundImage = (file: IMediaFile, options: any) => Promise<string>;
/*

export type ControllerFunc<
  ActionType extends ITimelineAction = ITimelineAction,
  EngineType extends IEngine = IEngine,
> =  (params: { action: ActionType, time: number, engine: EngineType }) => void

export type ControllerPreloadFunc<
  ActionType extends ITimelineAction = ITimelineAction,
  EngineType extends IEngine = IEngine,
> =  (params: { action: ActionType, file: IMediaFile, engine: EngineType }) => Promise<ActionType>;
*/

export interface IController{
  start?: (params: { action: ITimelineAction, time: number, engine: IEngine }) => void
  stop?: (params: { action: ITimelineAction, time: number, engine: IEngine }) => void
  enter?: (params: { action: ITimelineAction, time: number, engine: IEngine }) => void
  leave: (params: { action: ITimelineAction, time: number, engine: IEngine }) => void
  update?: (params: { action: ITimelineAction, time: number, engine: IEngine }) => void
  preload?: (params: { action: ITimelineAction, file: IMediaFile, engine: IEngine }) => Promise<ITimelineAction>;

  viewerUpdate?: (engine: any) => void;
  destroy?: () => void;
  color?: string;
  colorSecondary?: string;
  logging: boolean;
  getBackgroundImage?: GetBackgroundImage;
  getActionStyle?: (action: ITimelineAction, scaleWidth: number, scale: number, rowHeight: number) => null | BackgroundImageStyle
}

export type VolumeSection = [volume: number, start?: number, end?: number];
export type VolumeSections = VolumeSection[];
