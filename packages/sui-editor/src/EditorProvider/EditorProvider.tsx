import * as React from 'react';
import { namedId } from '@stoked-ui/media-selector';
import { initialTimelineState, ITimelineFile, TimelineProvider } from '@stoked-ui/timeline';
import EditorEngine from "../EditorEngine/EditorEngine";
import { EditorEngineState } from "../EditorEngine/EditorEngine.types";
import { EditorEvents } from "../EditorEngine";
import Controllers from "../Controllers/Controllers";
import { EditorProviderProps, EditorReducer, IEditorState, } from "./EditorProvider.types";
import { setDetail } from "../DetailView/Detail.types";
import EditorFile from "../Editor/EditorFile";

export default function EditorProvider(props: EditorProviderProps) {
  const engine = props?.engine ?? new EditorEngine({ events: new EditorEvents(), controllers: props.controllers });
  const getState = () => {
    return engine.state as EditorEngineState;
  }
  const setState = (newState: EditorEngineState | string) => {
    engine.state = newState;
  }
  const [originalFile, setOriginalFile] = React.useState<EditorFile>(props.file);

  const stateProps = {
    ...initialTimelineState,
    editorId: props.id ?? namedId('editor'),
    engine,
    getState,
    setState,
  };

  const detailState = setDetail(stateProps as IEditorState);

  const editorProps: IEditorState = {
    ...detailState,
    id: props.id ??
    engine,
    getState,
    setState,
  }

  return (
    <TimelineProvider {...props} {...editorProps} file={props.file as ITimelineFile} controllers={Controllers} reducer={EditorReducer}>
      {props.children}
    </TimelineProvider>
  );
}
