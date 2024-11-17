
// Function to add files as tracks immutably

import * as React from "react";
import {
  BackgroundImageStyle,
  ITimelineState,
  TimelineProviderProps,
  TimelineReducer,
  TimelineStateAction,
  addFlag,
  removeFlag,
  setSetting,
  setFlags,
} from "@stoked-ui/timeline";
import { IMediaFile, namedId } from "@stoked-ui/media-selector";
import Controllers from "../Controllers";
import {
  BlendMode, Fit,
  IEditorAction,
  IEditorFileAction,
  initEditorAction
} from "../EditorAction/EditorAction";
import { IEditorTrack } from "../EditorTrack/EditorTrack";
import EditorFile, { IEditorFile, SUVideoFile } from "../EditorFile/EditorFile";
import { EditorEngineState, IEditorEngine } from "../EditorEngine";
import {
  DetailData,
  IDetailAction,
  IDetailProject,
  IDetailTrack,
  Selection, setDetail
} from "../DetailView/Detail.types";

// Editor-specific state interfaceæ
export interface IEditorState<
  EngineType extends IEditorEngine = IEditorEngine,
  State extends string | EditorEngineState = string | EditorEngineState,
  FileType extends IEditorFile = IEditorFile,
  ActionType extends IEditorAction = IEditorAction,
  TrackType extends IEditorTrack = IEditorTrack,
> extends ITimelineState<EngineType, State, FileType, ActionType, TrackType> {
  editorId: string;
  detail: DetailData;
  selected: Selection;
  detailOpen: boolean;
}

export interface IEditorStateUnselected extends Omit<IEditorState, 'detail' | 'selected'> {
  detail?: DetailData,
  selected?: Selection
}

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
    blendMode: 'normal',
    fit: 'none',
    actions: [{
      id: namedId('action'),
      name: file.name,
      start: engine.time || 0,
      end: (engine.time || 0) + 2,
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

export type BlendModeAction = {
  type: 'SET_BLEND_MODE',
  payload:  { contextId: string, value: BlendMode }
}

export type SetFitAction = {
  type: 'SET_FIT',
  payload:  { contextId: string, value: Fit }
}

export type SetContextActions = BlendModeAction | SetFitAction


export type EditorStateAction<
  FileType extends IEditorFile = IEditorFile,
  FileActionType extends IEditorFileAction = IEditorFileAction,
  ActionType extends IEditorAction = IEditorAction,
  TrackType extends IEditorTrack = IEditorTrack,
> = TimelineStateAction<FileType, FileActionType, ActionType, TrackType> | {
  type: 'SELECT_ACTION' | 'ACTION_DETAIL',
  payload: ActionType,
} | {
  type: 'SELECT_TRACK' | 'TRACK_DETAIL';
  payload: TrackType,
} | {
  type: 'SELECT_PROJECT' | 'PROJECT_DETAIL';
} | {
  type: 'ENGINE_INIT',
  payload: {
    file: FileType,
    viewer: HTMLDivElement
  }
} | {
  type: 'SCREENER',
  payload: HTMLElement | null
} | {
  type: 'VIEWER',
  payload: HTMLDivElement
} | {
  type: 'UPDATE_PROJECT',
  payload: IDetailProject,
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
} | {
  type: 'SET_POPOVER',
  payload: { open: boolean, name: string }
} | {
  type: 'SET_RENDERER',
  payload?: HTMLCanvasElement | null
} | {
  type: 'CACHE_LOADED_FILE',
  payload: FileType
} | {
  type: 'CLOSE_DETAIL'
} | {
  type: 'VIDEO_CREATED',
  payload: SUVideoFile,
} | SetContextActions

const setContext = (key: string, state: IEditorState, stateAction: SetContextActions) => {
  const { file } = state;
  if (!file) {
    return state;
  }
  const { tracks } = file;
  const { contextId, value } = stateAction.payload;
  if (!tracks && file?.id === contextId) {
    file[key] = value;
    return {
      ...state,
      file,
    }
  }
  if (!tracks) {
    throw new Error('Invalid context');
  }
  tracks.forEach((track) => {
    if (track.id === contextId) {
      track[key] = value;
    }
    track.actions.forEach((action) => {
      if (action.id === contextId) {
        action[key] = value;
      }
    });
  })
  return {
    ...state,
  }
}


export function EditorReducer(state: IEditorState, stateAction: EditorStateAction): IEditorState {
  const engine = state.engine;
  switch (stateAction.type) {
    case 'SELECT_ACTION':
    case 'ACTION_DETAIL': {
      const action = stateAction.payload as IEditorAction;
      const track = state.file?.tracks.filter((t) => t.actions.some((a) => a.id === action.id))
      const newState = setDetail({
        ...state,
        selectedAction: action,
        selectedTrack: track,
        selected: action,
      });
      if (stateAction.type === 'SELECT_ACTION') {
        return newState;
      }
      return { ...newState, detailOpen: true };
    }
    case 'SELECT_TRACK':
    case 'TRACK_DETAIL': {
      const newState = setDetail({
        ...state,
        selectedAction: null,
        selectedTrack: stateAction.payload,
        selected: stateAction.payload,
      });
      if (stateAction.type === 'SELECT_TRACK') {
        return newState;
      }
      return { ...newState, detailOpen: true };
    }
    case 'SELECT_PROJECT':
    case 'PROJECT_DETAIL': {
      const newState = setDetail({
        ...state,
        selectedAction: null,
        selectedTrack: null,
        selected: state.file as Selection,
      });
      if (stateAction.type === 'SELECT_PROJECT') {
        return newState;
      }
      return { ...newState, detailOpen: true };
    }
    case 'VIEWER':
      engine.viewer = stateAction.payload;
      return {
        ...state,
        engine,
      };
    case 'CREATE_ACTION': {
      const { action, track } = stateAction.payload;
      const updatedTracks = state.file?.tracks.map((t, index) =>
        t.id === track.id ? { ...t, actions: [...t.actions, initEditorAction(action, index)] } : t
      ) ?? [];
      let file: IEditorFile | null = null;
      if (state.file) {
        file = state.file;
        file.tracks = updatedTracks as IEditorTrack[];
      }
      return {
        ...state,
        file,
      };
    }
    /*
    case 'ENGINE_INIT': {
      const { viewer, file } = stateAction.payload;
      let newState = EditorReducer(state, { type: 'VIEWER', payload: viewer });
      newState = EditorReducer(newState as IEditorState, { type: 'CACHE_LOADED_FILE', payload: file });
      return TimelineReducer(newState, { type: 'SET_TRACKS', payload: file.tracks }) as IEditorState;
    }
    */
    case 'CACHE_LOADED_FILE':
      return {
        ...state,
        file: stateAction.payload,
      };
    case 'UPDATE_PROJECT':{
      let file: any = null;
      if (state.file) {
        file = stateAction.payload as IEditorFile
      }
      return {
        ...state,
        file
      }
    }
    case 'UPDATE_ACTION': {
     if (!state.file) {
        return state;
      }
      const action = { ...state.selectedAction, ...stateAction.payload };

      const tracks = state.file?.tracks.map((track) => {
        if (track.id === state.selectedTrack?.id) {
          return { ...track, actions: track.actions.map((a) => a.id === action.id ? action : a) };
        }
        return track;
      });
      let file: IEditorFile | null= null;
      if (state.file) {
        file = state.file;
        file.tracks = tracks as IEditorTrack[];
      }
      return {
        ...state, file
      };
    }
    case 'UPDATE_TRACK': {
      if (!state.file) {
        return state;
      }
      const tracks = state.file?.tracks.map((currentTrack) => {
        if (currentTrack.id === state.selectedTrack?.id) {
          return { ...currentTrack, ...stateAction.payload };
        }
        return currentTrack;
      });

      let file: IEditorFile | null= null;
      if (state.file) {
        file = state.file;
        file.tracks = tracks;
      }

      return {
        ...state,
        file
      };
    }
    case 'SCREENER':
      return { ...state };
    case 'SET_POPOVER': {
      const isOpen = !!state.flags[stateAction.payload.name];
      if (isOpen === stateAction.payload.open) {
        return state;
      }
      let flags = [...state.flags];
      if (stateAction.payload.open) {
        flags.push(stateAction.payload.name);
      } else {
        flags = flags.filter((name) => name !== stateAction.payload.name);
      }
      return {
        ...state,
        flags,
      };
    }
    case 'SET_RENDERER':
      if (stateAction.payload !== null) {
        state.engine.renderer = stateAction.payload as HTMLCanvasElement;
      } else {
        const canvas = document.getElementById(state.id)?.querySelector("canvas[role='renderer']") as HTMLCanvasElement;
        if (!canvas) {
          state.engine.renderer = canvas as HTMLCanvasElement;
        }
      }
      return {
        ...state,
      };
    case 'CLOSE_DETAIL': {
      return {
        ...state,
        detailOpen: false,
      };
    }
    case 'SET_BLEND_MODE': {
      return setContext('blendMode', state, stateAction);
    }
    case 'SET_FIT': {
      return setContext('fit', state, stateAction);
    }
    default:
      return TimelineReducer(state as ITimelineState, stateAction as TimelineStateAction) as IEditorState;
  }
}

export type EditorContextType = IEditorState & {
  dispatch: React.Dispatch<EditorStateAction>;
};

export interface EditorProviderProps<EngineType, StateType extends IEditorState, StateActionType > extends TimelineProviderProps<EngineType, StateType, StateActionType> {}
