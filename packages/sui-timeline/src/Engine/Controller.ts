import {IController } from "./Controller.types";
import {ControllerParams} from './ControllerParams';
import {ITimelineAction} from "../TimelineAction";

abstract class Controller implements IController {
  id: string;

  name: string;

  colorSecondary: string;

  color: string;

  logging: boolean = false;

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

  abstract enter(params: ControllerParams): void;

  abstract leave(params: ControllerParams): void;

  // (time - action.start + (action?.trimStart || 0)) % (action?.duration ?? 0)
  static getActionTime(params: ControllerParams) {
    const { action, time } = params;
    const startDelta = time - action.start;
    const durationAdjusted = action.duration ? startDelta % action.duration : startDelta;
    // return durationAdjusted;
    const actionTime = (time - action.start + (action?.trimStart || 0)) % (action?.duration ?? 0);
    // console.info(`${action.name} getActionTime() => ${actionTime} --------- ${durationAdjusted}`)
    return actionTime;
  }

  static getVol(volumePart: [volume: number, start?: number, end?: number]) {
    return { volume: volumePart[0], start: volumePart[1], end: volumePart[2] };
  }

  abstract getElement(actionId: string): any

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

        if (volume < 0 || volume > 1) {
          console.warn(`${action.name} `)
        }

        if ((start === undefined || actionTime >= start) && (end === undefined || actionTime < end)) {
          return { volume, volumeIndex: i };
        }
      }
    }

    return undefined;
  }

}

export default Controller;
