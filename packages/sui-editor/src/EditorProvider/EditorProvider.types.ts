import * as React from "react";
import {
  TimelineState,
  TimelineProviderProps,
  TimelineReducer,
  TimelineStateAction,
  FileState,
  DetailData,
  ITimelineActionDetail,
  IProjectDetail,
  ITimelineTrackDetail,
  SelectAction,
  SelectTrack,
  SelectProject,
} from "@stoked-ui/timeline";
import { namedId} from '@stoked-ui/common';
import { IMediaFile } from "@stoked-ui/media-selector";
import Controllers from "../Controllers";
import {
  BlendMode, Fit,
  IEditorAction,
  IEditorFileAction,
  initEditorAction
} from "../EditorAction/EditorAction";
import { IEditorTrack } from "../EditorTrack/EditorTrack";
import { IEditorFile, SUVideoFile } from "../EditorFile/EditorFile";
import { EditorEngineState, IEditorEngine } from "../EditorEngine";
import EditorState from "./EditorState";


export interface IEditorStateUnselected extends Omit<EditorState, 'detail' | 'selected'> {
  detail?: DetailData,
  selected?: Selection
}

export const onAddFiles = (state: EditorState, newMediaFiles: IMediaFile[]) => {
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
    src: mediaFile.url,
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
  file.tracks = [...tracks || [], ...newTracks];
  return {
    ...state,
    file
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
  TrackType extends IEditorTrack = IEditorTrack,
  ActionType extends IEditorAction = IEditorAction,
> = TimelineStateAction<FileType, FileActionType, TrackType, ActionType> | {
  type: 'SELECT_ACTION',
  payload: ActionType,
} | {
  type: 'SELECT_TRACK',
  payload: TrackType,
} | {
  type: 'SELECT_PROJECT',
} | {
  type: 'SELECT_SETTINGS',
} | {
  type: 'DETAIL_OPEN',
} | {
  type: 'SCREENER',
  payload: HTMLElement | null
} | {
  type: 'VIEWER',
  payload: HTMLDivElement
} | {
  type: 'UPDATE_PROJECT',
  payload: IProjectDetail,
} | {
  type: 'UPDATE_ACTION',
  payload: ITimelineActionDetail,
} |{
  type: 'UPDATE_TRACK',
  payload: ITimelineTrackDetail,
} | {
  type: 'SET_RENDERER',
  payload?: HTMLCanvasElement | null
} | {
  type: 'CLOSE_DETAIL'
} | {
  type: 'DISPLAY_CANVAS',
} | {
  type: 'DISPLAY_SCREENER',
  payload: IEditorTrack | IEditorAction
} | {
  type: 'VIDEO_CREATED',
  payload: SUVideoFile,
} | SetContextActions

const setContext = (key: string, state: EditorState, stateAction: SetContextActions) => {
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

const EditorTimelineReducer = (state: EditorState, stateAction: EditorStateAction) => {
  return TimelineReducer<EditorState, EditorStateAction>(state, stateAction)
}

export function EditorReducerBase(state: EditorState, stateAction: EditorStateAction): EditorState {
  switch (stateAction.type) {
    case 'SELECT_ACTION':
      state = EditorTimelineReducer(state, stateAction);
      if (!state.selectedAction) {
        return state;
      }
      return EditorReducer(state, { type: 'DISPLAY_SCREENER', payload: state.selectedAction })
    case 'SELECT_TRACK':
      state = EditorTimelineReducer(state, stateAction);
      if (!state.selectedTrack) {
        return state;
      }
      return EditorReducer(state, { type: 'DISPLAY_SCREENER', payload: state.selectedTrack })
    case 'SELECT_PROJECT':{
      state = EditorTimelineReducer(state, stateAction);
      if (!state.selected) {
        return state;
      }
      return EditorReducer(state, { type: 'DISPLAY_CANVAS' })
    }
    case 'SELECT_SETTINGS':{
      state = EditorTimelineReducer(state, stateAction);
      if (!state.selected) {
        return state;
      }
      return EditorReducer(state, { type: 'DISPLAY_CANVAS' })
    }
    case 'DETAIL_OPEN': {
      if (!state.selected) {
        return state;
      }
      state.settings.detailState = {
        selectedTrackId: state.selectedTrack?.id || null,
        selectedActionId: state.selectedAction?.id || null,
        selectedId: state.selected.id
      }
      state.flags.detailOpen = true;
      return state;
    }
    case 'VIEWER':
      state.engine.viewer = stateAction.payload;
      return state;
    case 'CREATE_ACTION': {
      const { action, track } = stateAction.payload;
      const updatedTracks = state.file?.tracks.map((t, index) =>
        t.id === track.id ? { ...t, actions: [...t.actions, initEditorAction(action, index)] } : t
      ) ?? [];
      let file: IEditorFile | null = null;
      if (state.file) {
        file = state.file;
        file!.tracks = updatedTracks as IEditorTrack[];
      }
      state.file = file;
      return state;
    }
    case 'UPDATE_PROJECT':{
      let file: any = null;
      if (state.file) {
        file = stateAction.payload as IEditorFile
      }
      if (state.settings['timeline.autoReRender']) {
        state.engine.reRender();
      }
      state.file = file;
      return state;
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
        file!.tracks = tracks as IEditorTrack[];
      }
      if (state.settings['timeline.autoReRender']) {
        state.engine.reRender();
      }
      state.file = file;
      return state;
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
        file!.tracks = tracks;
      }
      if (state.settings['timeline.autoReRender']) {
        state.engine.reRender();
      }
      state.file = file;
      return state;
    }
    case 'SCREENER':
      return state;
    case 'SET_RENDERER':
      if (stateAction.payload !== null) {
        state.engine.renderer = stateAction.payload as HTMLCanvasElement;
      } else {
        const canvas = document.getElementById(state.settings.editorId)?.querySelector("canvas[role='renderer']") as HTMLCanvasElement;
        if (!canvas) {
          state.engine.renderer = canvas as HTMLCanvasElement;
        }
      }
      return state;
    case 'CLOSE_DETAIL': {
      state.disableFlags('detailOpen')
      return {...state};
    }
    case 'SET_BLEND_MODE': {
      return setContext('blendMode', state, stateAction);
    }
    case 'SET_FIT': {
      return setContext('fit', state, stateAction);
    }
    case 'VIDEO_CREATED': {
      const { file } = state;
      const { payload: video } = stateAction;
      if (file) {
        // file.video = video.file;
      }
      video.save(true).catch(console.warn);
      state.file = file;
      return state;
    }
    case 'DISPLAY_CANVAS': {
      if (!state.flags.detailMode) {
        return state;
      }
      state.engine.renderer!.style.display = 'flex';
      state.engine.screener!.style.display = 'none';
      state.settings.playbackMode = 'canvas';
      return {...state};
    }
    case 'DISPLAY_SCREENER': {
      if (!state.flags.detailMode || !state?.engine?.renderer || !state?.engine?.screener) {
        return state;
      }

      state.engine.renderer.style.display = 'none';
      state.engine.screener.style.display = 'flex';
      if ("actions" in stateAction.payload) {
        const track = stateAction.payload as IEditorTrack;
        if (track.file) {
          state.engine.screener.src = track.file.url;
        }
      }

      state.engine.setPlayRate(1);
      state.engine.media = state.engine.screener;
      state.engine.playbackMode = 'media';
      return {...state};
    }
    default:
      return EditorTimelineReducer(state as EditorState, stateAction as EditorStateAction) as EditorState;
  }
}

export function EditorReducer<
  State extends EditorState = EditorState,
  StateAction extends EditorStateAction = EditorStateAction
>(state: State, stateAction: StateAction): State {
  const newState = EditorReducerBase(state, stateAction);
  return EditorTimelineReducer({...newState} as State, { ...stateAction, type: 'UPDATE_STATE'} as any) as State;
}

export type EditorContextType =  { state: EditorState, dispatch: React.Dispatch<EditorStateAction> }

