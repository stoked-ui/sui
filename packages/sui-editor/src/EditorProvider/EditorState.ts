import * as React from 'react';
import {namedId} from "@stoked-ui/media-selector";
import {
  TimelineState,
    ITimelineStateProps,
  createTimelineState, IEngine, DetailData
} from '@stoked-ui/timeline';
import {EditorEngineState, IEditorEngine} from "../EditorEngine";
import EditorFile, {IEditorFile} from "../EditorFile/EditorFile";
import {IEditorAction} from "../EditorAction";
import {IEditorTrack} from "../EditorTrack";

export default interface EditorState<
  EngineType extends IEditorEngine = IEditorEngine,
  EngineState extends string | EditorEngineState = string | EditorEngineState,
  FileType extends IEditorFile = IEditorFile,
  ActionType extends IEditorAction = IEditorAction,
  TrackType extends IEditorTrack = IEditorTrack,
> extends TimelineState<
  EngineType,
  EngineState,
  FileType,
  ActionType,
  TrackType
> {
  editorId: string;
  detailOpen: boolean;
}

export interface IEditorStateProps<
  EngineType extends IEditorEngine = IEditorEngine,
  EngineStateType extends string | EditorEngineState = string | EditorEngineState,
  FileType extends IEditorFile = IEditorFile,
> {
  file?: FileType,
  editorId?: string,
  timelineId?: string,
  engine: EngineType,
  getState:() => string | EngineStateType
}

export function createEditorState<
  EngineType extends IEditorEngine = IEditorEngine,
  EngineStateType extends string = EditorEngineState,
  FileType extends IEditorFile = IEditorFile,
  ActionType extends IEditorAction = IEditorAction,
  TrackType extends IEditorTrack = IEditorTrack,
>(props: IEditorStateProps<EngineType, EngineStateType, FileType>): EditorState  {

  const timelinePropsInput = { id: props.timelineId, engine: props.engine, getState: props.getState, file: props.file };
  const timelineStateProps = createTimelineState<EngineType, EngineStateType, FileType, ActionType, TrackType>(timelinePropsInput) as ITimelineStateProps;
  const unselectedStateProps = {
    ...timelineStateProps,
    engine: timelineStateProps.engine as EngineType,
    editorId: props.editorId ,
    createNewFile: () => {
      return new EditorFile({ name: 'New Editor Project' });
    },
  }
  return unselectedStateProps as EditorState<EngineType, EngineStateType, FileType, ActionType, TrackType>
}
