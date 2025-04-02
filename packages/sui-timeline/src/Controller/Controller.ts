import {ScreenshotQueue} from "@stoked-ui/media-selector";
import { type IController } from "./Controller.types";
import type {ControllerParams, GetItemParams, PreloadParams} from './ControllerParams';
import type { ITimelineAction } from "../TimelineAction";
import {IEngine, PlaybackMode} from "../Engine";
import {ITimelineTrack} from "../TimelineTrack";

abstract class Controller<ControlType> implements IController {
  cacheMap: Record<string, ControlType> = {};

  id: string;

  name: string;

  colorSecondary: string;

  color: string;

  logging: boolean = false;

  backgroundImage?: string;

  screenshotQueue: ScreenshotQueue = ScreenshotQueue.getInstance(3);

  constructor(options: {
    id: string,
    name: string,
    color: string,
    colorSecondary: string
  }) {
    this.id = options.id;
    this.name = options.name;
    this.color = options.color;
    this.colorSecondary = options.colorSecondary;
  }

  abstract getItem(params: GetItemParams): ControlType;

  // eslint-disable-next-line class-methods-use-this
  isValid(engine: IEngine, track: ITimelineTrack) {
    return !track.dim;
  }

  viewerUpdate?: (engine: any) => void;

  // eslint-disable-next-line class-methods-use-this
  destroy(){ };

  // eslint-disable-next-line class-methods-use-this,@typescript-eslint/no-unused-vars
  getActionStyle(action: ITimelineAction, track: ITimelineTrack, scaleWidth: number, scale: number, trackHeight: number) { return null };

  // eslint-disable-next-line class-methods-use-this,@typescript-eslint/no-unused-vars
  start(params: ControllerParams) { }

  // eslint-disable-next-line class-methods-use-this,@typescript-eslint/no-unused-vars
  stop(params: ControllerParams) { }

  abstract enter(params: ControllerParams): void;

  abstract leave(params: ControllerParams): void;

  abstract update(params: { action: ITimelineAction, time: number, engine: IEngine }): void

  // eslint-disable-next-line class-methods-use-this
  async preload(params: PreloadParams): Promise<ITimelineAction> { return params.action; }

  static getVol(volumePart: [volume: number, start?: number, end?: number]) {
    return { volume: volumePart[0], start: volumePart[1], end: volumePart[2] };
  }

  // eslint-disable-next-line class-methods-use-this
  log(params: { action: ITimelineAction, time: number }, msg: string) {
    const { action, time } = params;
    if (this.logging) {
      console.info(`[${time}] ${action.name} => ${msg} `)
    }
  }

  static getActionTime(params: ControllerParams) {
    const { action, time } = params;
    if (action?.duration === undefined) {
      return action?.trimStart || 0;
    }
    return (time - action.start + (action?.trimStart || 0)) % (action?.duration ?? 0);
  }

  static getVolumeUpdate(params: ControllerParams, actionTime: number): { volumeIndex: number, volume: number } | undefined {
    const { action } = params;

    if (action.volumeIndex === -2) {
      return undefined;
    }

    if (action.volumeIndex >= 0) {
      const { start, end } = Controller.getVol(action.volume![action.volumeIndex]);
      if ((start && actionTime < start) || (end && actionTime >= end)) {
        return { volume: 1.0, volumeIndex: -1 };
      }
    }


    if (action.volumeIndex === -1) {
      for (let i = 0; i < action.volume!.length; i += 1) {
        const { volume, start, end } = Controller.getVol(action.volume![i]);
        if ((start === undefined || actionTime >= start) && (end === undefined || actionTime < end)) {
          return { volume, volumeIndex: i };
        }
      }
    }

    return undefined;
  }

}

export default Controller;

