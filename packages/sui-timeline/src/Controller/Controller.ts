import { GetBackgroundImage, type IController } from "./Controller.types";
import { ControllerParams, PreloadParams } from './ControllerParams';
import type { BackgroundImageStyle, ITimelineAction } from "../TimelineAction";
import type { IEngine } from "../Engine";

abstract class Controller implements IController {
  id: string;

  name: string;

  colorSecondary: string;

  color: string;

  logging: boolean = false;

  backgroundImage?: string;

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

  viewerUpdate?: (engine: any) => void;

  // eslint-disable-next-line class-methods-use-this
  destroy(){ };

  getBackgroundImage?: GetBackgroundImage;

  // eslint-disable-next-line class-methods-use-this,@typescript-eslint/no-unused-vars
  getActionStyle(action: ITimelineAction, scaleWidth: number, scale: number, trackHeight: number) { return null };

  abstract getElement(actionId: string): any

  // eslint-disable-next-line class-methods-use-this
  start(params: { action: ITimelineAction, time: number, engine: IEngine }) { }

  // eslint-disable-next-line class-methods-use-this
  stop(params: { action: ITimelineAction, time: number, engine: IEngine }) { }

  abstract enter(params: ControllerParams): void;

  abstract leave(params: ControllerParams): void;

  abstract update(params: { action: ITimelineAction, time: number, engine: IEngine }): void

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
    const actionTime = (time - action.start + (action?.trimStart || 0)) % (action?.duration ?? 0);
    return actionTime;
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
