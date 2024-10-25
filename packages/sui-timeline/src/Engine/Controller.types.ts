import {ControllerParams} from "./ControllerParams";
import {type GetBackgroundImage, type ITimelineAction} from "../TimelineAction/TimelineAction.types";

export interface DrawData {
  source:  HTMLImageElement | SVGImageElement | HTMLVideoElement | HTMLCanvasElement | ImageBitmap | OffscreenCanvas | VideoFrame,
  sx: number,
  sy: number,
  sWidth: number,
  sHeight: number,
  dx?: number,
  dy?: number,
  dWidth?: number,
  dHeight?: number
}

export interface IController {
  start?: (params: ControllerParams) => void;
  stop?: (params: ControllerParams) => void;
  enter?: (params: ControllerParams) => void;
  leave: (params: ControllerParams) => void;
  update?: (params: ControllerParams) => void;
  viewerUpdate?: (engine: any) => void;
  draw?: (params: ControllerParams) => void;
  getDrawData?: (params: ControllerParams) => DrawData;
  destroy?: () => void;
  color?: string;
  colorSecondary?: string;
  logging: boolean;
  getBackgroundImage?: GetBackgroundImage;
  preload?: (params: Omit<ControllerParams, 'time'>) => Promise<ITimelineAction>;
  getElement: (actionId: string) => HTMLElement;
}

export type VolumeSection = [volume: number, start?: number, end?: number];
export type VolumeSections = VolumeSection[];
