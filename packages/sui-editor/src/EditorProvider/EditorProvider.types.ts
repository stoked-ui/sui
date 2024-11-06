
// Function to add files as tracks immutably

import * as React from "react";
import {
  BackgroundImageStyle,
  ITimelineState,
  TimelineProviderProps,
  TimelineReducer,
  TimelineStateAction
} from "@stoked-ui/timeline";
import { IMediaFile, namedId } from "@stoked-ui/media-selector";
import Controllers from "../Controllers";
import { IEditorAction, IEditorFileAction, initEditorAction } from "../EditorAction/EditorAction";
import { IEditorTrack } from "../EditorTrack/EditorTrack";
import { IEditorFile } from "../Editor/EditorFile";
import { EditorEngineState, IEditorEngine } from "../EditorEngine";
import { type IDetailAction, type IDetailTrack, type IDetailVideo } from "../DetailView/DetailView.types";

// Editor-specific state interfaceæ
export interface IEditorState<
  EngineType extends IEditorEngine = IEditorEngine,
  State extends string | EditorEngineState = string | EditorEngineState,
  FileType extends IEditorFile = IEditorFile,
  ActionType extends IEditorAction = IEditorAction,
  TrackType extends IEditorTrack = IEditorTrack,
> extends ITimelineState<EngineType, State, FileType, ActionType, TrackType> {}

export const onAddFiles = (state: IEditorState, newMediaFiles: IMediaFile[]) => {
  const { engine, file } = state;
  if (!file) {
    return state;
  }

  const { tracks } = file;
  const filteredFiles = newMediaFiles.filter((mediaFile) => Controllers[mediaFile.mediaType]);
  const newTracks = filteredFiles.map((mediaFile, index) => ({
    id: namedId('track'),
    name: mediaFile.name,
    file: mediaFile,
    src: mediaFile._url,
    controller: Controllers[mediaFile.mediaType],
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
    }] as IEditorAction[],
    controllerName: mediaFile.mediaType,
  })) as IEditorTrack[];

  return {
    ...state,
    file: {
      ...file,
      tracks: [...tracks || [], ...newTracks],
    }
  };
};

type SelectActionPayload<
  ActionType extends IEditorAction,
  TrackType extends IEditorTrack,
> = {
  action: ActionType | null,
  track: TrackType
};

export type EditorStateAction<
  FileType extends IEditorFile = IEditorFile,
  FileActionType extends IEditorFileAction = IEditorFileAction,
  ActionType extends IEditorAction = IEditorAction,
  TrackType extends IEditorTrack = IEditorTrack,
> = TimelineStateAction<FileType, FileActionType, ActionType, TrackType> | {
  type: 'SELECT_ACTION',
  payload: SelectActionPayload<ActionType, TrackType>,
} | {
  type: 'SELECT_TRACK',
  payload: TrackType,
} | {
  type: 'SELECT_VIDEO',
} | {
    type: 'LOAD_EDITOR_PROPS',
    payload: {
      tracks: TrackType[],
      viewer: HTMLDivElement
    }
  } | {
  type: 'SCREENER',
  payload: HTMLElement | null
} | {
  type: 'VIEWER',
  payload: HTMLDivElement
} | {
  type: 'UPDATE_VIDEO',
  payload: IDetailVideo
} | {
  type: 'UPDATE_ACTION',
  payload: IDetailAction,
} |{
  type: 'UPDATE_TRACK',
  payload: IDetailTrack,
} |  {
  type: 'UPDATE_ACTION_STYLE',
  payload: {
    action: IEditorAction,
    backgroundImageStyle: BackgroundImageStyle
  }
};

export function EditorReducer(state: IEditorState, stateAction: EditorStateAction): ITimelineState {
  const engine = state.engine;
  switch (stateAction.type) {
    case 'SELECT_ACTION':
      return {
        ...state,
        selectedAction: stateAction.payload.action,
        selectedTrack: stateAction.payload.track,
      };
    case 'SELECT_TRACK':
      return {
        ...state,
        selectedAction: null,
        selectedTrack: stateAction.payload,
      };
    case 'SELECT_VIDEO':
      return {
        ...state,
        selectedAction: null,
        selectedTrack: null,
      };
    case 'VIEWER':
      engine.viewer = stateAction.payload;
      return {
        ...state,
        engine,
      };
    case 'CREATE_ACTION': {
      const { action, track } = stateAction.payload;
      const updatedTracks = state.file?.tracks.map((t, index) =>
        t.id === track.id ? { ...t, actions: [...t.actions, initEditorAction(state.engine, action, index)] } : t
      ) ?? [];
      return {
        ...state,
        file: state.file ? { ...state.file, tracks: updatedTracks } : null,
      };
    }
    case 'LOAD_EDITOR_PROPS': {
      const { viewer, tracks } = stateAction.payload;
      const newState = EditorReducer(state, { type: 'VIEWER', payload: viewer });
      return TimelineReducer(newState, { type: 'SET_TRACKS', payload: tracks });
    }
    case 'UPDATE_VIDEO':
      return { ...state, file: { ...state.file, ...stateAction.payload } as IEditorFile };
    case 'UPDATE_ACTION': {
      const action = { ...state.selectedAction, ...stateAction.payload };
      if (!state.file) {
        return state;
      }
      // const tracks =  [...state.file.tracks];
      const tracks = state.file?.tracks.map((track) => {
        if (track.id === state.selectedTrack?.id) {
          return { ...track, actions: track.actions.map((a) => a.id === action.id ? action : a) };
        }
        return track;
      });

      return { ...state, file: {
        ...state.file,
        tracks
      }};
    }
    case 'UPDATE_TRACK': {
      const track = { ...state.selectedTrack, ...stateAction.payload };
      if (!state.file) {
        return state;
      }
      const tracks = state.file?.tracks.map((currentTrack) => {
        if (currentTrack.id === state.selectedTrack?.id) {
          return { ...currentTrack, ...stateAction.payload };
        }
        return currentTrack;
      });

      return { ...state, file: {
          ...state.file,
          tracks
        }};
    }
    case 'SCREENER':
      return { ...state };
    default:
      return TimelineReducer(state as ITimelineState, stateAction as TimelineStateAction);
  }
}

export type EditorContextType = IEditorState & {
  dispatch: React.Dispatch<EditorStateAction>;
};
export interface EditorProviderProps extends TimelineProviderProps<IEditorFile, IEditorEngine, IEditorAction, IEditorState, EditorStateAction> {}
