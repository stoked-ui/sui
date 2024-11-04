import { IMediaFile } from "@stoked-ui/media-selector";
import {ControllerParams} from "./ControllerParams";
import { BackgroundImageStyle, type ITimelineAction } from "../TimelineAction/TimelineAction.types";

export interface PreloadParams extends Omit<ControllerParams & { file: IMediaFile }, 'time'> {}

export type GetBackgroundImage = (file: IMediaFile, options: any) => Promise<string>;

export interface IController {
  start?: (params: ControllerParams) => void;
  stop?: (params: ControllerParams) => void;
  enter?: (params: ControllerParams) => void;
  leave: (params: ControllerParams) => void;
  update?: (params: ControllerParams) => void;
  preload?: (params: PreloadParams) => Promise<ITimelineAction>;

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
