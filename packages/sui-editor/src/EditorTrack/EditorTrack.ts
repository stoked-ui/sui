import {ITimelineFileTrack, ITimelineTrack } from "@stoked-ui/timeline";
import { IEditorAction, IEditorFileAction } from "../EditorAction/EditorAction";

export interface IEditorTrack extends Omit<ITimelineTrack, 'actions'> {
  actions: IEditorAction[]
}

export interface IEditorFileTrack extends Omit<ITimelineFileTrack, 'actions'> {
  actions: IEditorFileAction[]
}
