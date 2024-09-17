import {IController } from "./Controller.types";
import ControllerParams from './ControllerParams';

abstract class Controller implements IController {
  id: string;

  name: string;

  colorSecondary: string;

  color: string;

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
}

export default Controller;
