import { Controller } from "@stoked-ui/timeline";
import {IEditorController} from "./EditorController.types";
import {EditorControllerParams} from "./EditorControllerParams";

export default abstract class EditorController extends Controller implements IEditorController {

  abstract enter(params: EditorControllerParams): void;

  abstract leave(params: EditorControllerParams): void;

}
