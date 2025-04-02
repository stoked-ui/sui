import { type BackgroundImageStyle, type ITimelineAction } from "../TimelineAction/TimelineAction.types";
import {PreloadParams, ControllerParams, GetItemParams} from "./ControllerParams";
import {ITimelineTrack} from "../TimelineTrack";
import { IMediaFile } from "@stoked-ui/media-selector";

export interface IController {
  start(params: ControllerParams): void
  stop(params: ControllerParams): void
  enter(params: ControllerParams): void
  leave(params: ControllerParams): void
  update(params: ControllerParams): void
  preload(params: PreloadParams): Promise<ITimelineAction>;
  getItem(params: GetItemParams): any;

  id: string;
  viewerUpdate?: (engine: any) => void;
  destroy?: () => void;
  color?: string;
  colorSecondary?: string;
  logging: boolean;
  getActionStyle?: (action: ITimelineAction, track: ITimelineTrack, scaleWidth: number, scale: number, trackHeight: number) => null | BackgroundImageStyle
  updateMediaFile?: (mediaFile: IMediaFile) => void;
}

export type VolumeSection = [volume: number, start?: number, end?: number];
export type VolumeSections = VolumeSection[];

