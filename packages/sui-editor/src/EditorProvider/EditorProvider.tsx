import * as React from 'react';
import { namedId } from '@stoked-ui/media-selector';
import {
  initialTimelineState,
  ITimelineFile, ITimelineState, LocalDb,
  TimelineProvider,
  TimelineReducer,
  TimelineStateAction,
  LocalDbProps,
  getDbProps
} from '@stoked-ui/timeline';
import EditorEngine from "../EditorEngine/EditorEngine";
import { EditorEngineState, IEditorEngine } from "../EditorEngine/EditorEngine.types";
import { EditorEvents } from "../EditorEngine";
import Controllers from "../Controllers/Controllers";
import {
  EditorProviderProps,
  EditorReducer,
  EditorStateAction,
  IEditorState, IEditorStateUnselected,
} from "./EditorProvider.types";
import { setDetail } from "../DetailView/Detail.types";
import { IDetailStateUnselected } from '../DetailView/DetailProvider.types';
import EditorFile, { SUIEditor } from "../EditorFile/EditorFile";

export default function EditorProvider<
  EngineType extends IEditorEngine = IEditorEngine,
  State extends IEditorState = IEditorState,
  StateActionType extends EditorStateAction = EditorStateAction,
>(props: EditorProviderProps<EngineType, State, StateActionType>) {
  const engine = props?.engine ?? new EditorEngine({ events: new EditorEvents(), controllers: props.controllers });
  const getState = () => {
    return engine.state as EditorEngineState;
  }
  const setState = (newState: EditorEngineState | string) => {
    engine.state = newState;
  }

  const stateProps = {
    ...initialTimelineState,
    editorId: props.id ?? namedId('editor'),
    engine,
    getState,
    setState,
    detailOpen: false,
  } as any;

  const detailState = setDetail(stateProps);

  const editorProps: IEditorState = {
    ...detailState,
    id: props.id ?? namedId('timeline'),
    engine: engine as EditorEngine,
    getState,
    setState,
  }
/*
  React.useEffect(() => {
    if (flags){
      LocalDb.init({ dbName: EditorFile.fileMeta.mimeSubtype, EditorFile.fileMeta.primaryMimeSubtype).then((initResults) => {
        console.info('db init results', initResults);
      });
    }
    }, [flags.includes('idb')]);
    */

  return (
    <TimelineProvider<IEditorEngine, IEditorState, EditorStateAction>
      {...props}
      {...editorProps}
      controllers={Controllers}
      reducer={EditorReducer}
      localDb={getDbProps(SUIEditor, props.localDb)}
    >
      {props.children}
    </TimelineProvider>
  );
}
