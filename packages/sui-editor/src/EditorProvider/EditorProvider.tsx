import * as React from 'react';
import { IMediaFile, namedId } from '@stoked-ui/media-selector';
import {
  TimelineContextType, TimelineProvider, useTimeline, TimelineProviderProps, TimelineReducer,
  ITimelineState, TimelineStateAction, TimelineContext, initialTimelineState, ITimelineTrack,
  TimelineFile,
  EngineState,
  IEngine,
} from '@stoked-ui/timeline';
import EditorEngine from "../EditorEngine/EditorEngine";
import {EditorEngineState, IEditorEngine} from "../EditorEngine/EditorEngine.types";
import { EditorEvents } from "../EditorEngine";
import EditorFile from "../Editor/EditorFile";
import Controllers from "../Controllers/Controllers";
import { IEditorAction, initEditorAction } from "../EditorAction/EditorAction";

// Function to add files as tracks immutably
const onAddFiles = (state: IEditorState, newMediaFiles: IMediaFile[]) => {
  const { engine, file } = state;
  if (!file) return state;

  const { tracks } = file;
  const filteredFiles = newMediaFiles.filter((file) => Controllers[file.mediaType]);
  const newTracks: ITimelineTrack[] = filteredFiles.map((file, index) => ({
    id: namedId('track'),
    name: file.name,
    file,
    src: file._url,
    controller: Controllers[file.mediaType],
    actions: [{
      id: namedId('action'),
      name: file.name,
      start: engine.getTime() || 0,
      end: (engine.getTime() || 0) + 2,
      volumeIndex: -2,
      width: file.width,
      height: file.height,
      z: (tracks?.length || 0) + index,
      fit: 'none'
    } as IEditorAction],
    controllerName: file.mediaType,
  }));

  return {
    ...state,
    file: {
      ...file,
      tracks: [...tracks || [], ...newTracks],
    }
  };
};

export type EditorStateAction = TimelineStateAction |
  {
    type: 'LOAD_EDITOR_PROPS',
    payload: {
      tracks: ITimelineTrack[],
      viewer: HTMLDivElement
    }
} | {
  type: 'SCREENER',
  payload: HTMLElement | null
} | {
  type: 'VIEWER',
    payload: HTMLDivElement
};

function EditorReducer(state: ITimelineState, stateAction: EditorStateAction): ITimelineState {
  const engine = state.engine as IEditorEngine;
  switch (stateAction.type) {
    case 'VIEWER':
      engine.viewer = stateAction.payload;
      return {
        ...state,
        engine,
      };
    case 'CREATE_ACTION': {
      const { action, track } = stateAction.payload;
      const updatedTracks = state.file?.tracks.map((t, index) =>
        t.id === track.id ? { ...t, actions: [...t.actions, initEditorAction(state.engine as IEngine, action, index)] } : t
      ) ?? [];
      return {
        ...state,
        file: state.file ? { ...state.file, tracks: updatedTracks } : null,
      };
    }
    case 'LOAD_EDITOR_PROPS': {
      const { viewer, tracks } = stateAction.payload;
      let newState = EditorReducer(state, { type: 'VIEWER', payload: viewer });
      return TimelineReducer(newState, { type: 'SET_TRACKS', payload: tracks });
    }
    case 'SCREENER':
      return { ...state };
    default:
      return TimelineReducer(state, stateAction);
  }
}

// Editor-specific state interface
interface IEditorState extends Omit<ITimelineState, 'engine' | 'selectedAction' | 'state'> {
  engine: IEditorEngine;
  selectedAction: IEditorAction | null;
  state(): EditorEngineState;
}

type EditorContextType = IEditorState & {
  dispatch: React.Dispatch<EditorStateAction>;
};

interface EditorProviderProps extends Omit<TimelineProviderProps, 'engine'> {
  engine?: IEditorEngine;
}

export default function EditorProvider(props: EditorProviderProps) {
  const engine = props.engine ?? new EditorEngine({ events: new EditorEvents(), controllers: props.controllers });
  const getState = () => {
    return engine.state as EditorEngineState;
  }
  const setState = (newState: EditorEngineState | string) => {
    engine.state = newState;
  }
  const editorProps: ITimelineState = {
    ...initialTimelineState,
    id: props.id ?? 'editor',
    engine,
    getState,
    setState,
  };

  return (
    <TimelineProvider {...props} {...editorProps} file={props.file} controllers={Controllers} reducer={EditorReducer}>
      {props.children}
    </TimelineProvider>
  );
}

// Custom hook to access the extended Editor context
function useEditorContext(): EditorContextType {
  const context = React.useContext(TimelineContext);
  if (!context) throw new Error("useEditorContext must be used within an EditorProvider");
  return context as EditorContextType;
}

export { EditorReducer, useEditorContext, IEditorState, EditorProviderProps, EditorContextType };
