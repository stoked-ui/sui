import {ITimelineAction} from "@stoked-ui/timeline";
import {IEditorController } from "./EditorController.types";
import EditorControllerParams from './EditorControllerParams';

abstract class EditorController implements IEditorController {
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

  abstract enter(params: EditorControllerParams): void;

  abstract leave(params: EditorControllerParams): void;
}

export default EditorController;
