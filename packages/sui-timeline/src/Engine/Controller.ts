import {IController } from "./Controller.types";
import ControllerParams from './ControllerParams';
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

  static getActionTime(time: number, action: ITimelineAction) {
    const startDelta = time - action.start;
    const durationAdjusted = action.duration ? startDelta % action.duration : startDelta;;
    return durationAdjusted;
  }


}

export default Controller;
