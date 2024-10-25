import {type ITimelineAction} from "@stoked-ui/timeline";
import {type IEditorEngine} from "../EditorEngine/EditorEngine.types";

type EditorControllerParams = {
  action: ITimelineAction;
  time: number;
  engine: IEditorEngine;
};

export default EditorControllerParams;
