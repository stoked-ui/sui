import * as React from 'react';
import { IMediaFile, namedId } from '@stoked-ui/media-selector';
import {isMobile} from 'react-device-detect';
import {Controllers} from '../Controller/AudioController';
import {IController} from "../Controller";
import {TimelineFile, ITimelineFile} from "../TimelineFile";
import {EngineState, IEngine} from "../Engine";
import {ITimelineTrack} from "../TimelineTrack";
import {initTimelineAction, ITimelineAction, ITimelineFileAction} from "../TimelineAction";
import {DEFAULT_MOBILE_ROW_HEIGHT, DEFAULT_TRACK_HEIGHT} from "../interface/const";

export interface ITimelineState {
  engine: IEngine,
  file: ITimelineFile | null,
  id: string,
  selectedAction: ITimelineAction | null;
  selectedTrack: ITimelineTrack | null;
  detailAnchor: HTMLElement | null;
  snapOptions: string[];
  isMobile: boolean;
  versions: IMediaFile[];

  getState: () => string | EngineState;
  setState: (newState: string | EngineState) => void;

  rowHeight: number;
}

export const onAddFiles = (state: ITimelineState, newMediaFiles: IMediaFile[]) => {
  const { engine, file } = state;

  if (!file) return state;

  const { tracks } = file;
  newMediaFiles = newMediaFiles.filter((file) => engine.controllers[file.mediaType])
  const newTracks: ITimelineTrack[] = newMediaFiles.map((file, index) => {
    return {
      id: namedId('track'),
      name: file.name,
      file: file,
      src: file._url,
      controller: Controllers[file.mediaType],
      actions: [{
        id: namedId('action'),
        name: file.name,
        start: engine.getTime() || 0,
        end: (engine.getTime() || 0) + 2,
        volumeIndex: -2,
      }],
      controllerName: file.mediaType,
    } as ITimelineTrack;
  });
  state.file.tracks = tracks.concat(newTracks);
  return {...state};
}

export type TimelineStateAction = {
  type: 'SELECT_ACTION',
  payload: {
    action: ITimelineAction,
    track: ITimelineTrack
  },
} | {
  type: 'SELECT_TRACK',
  payload: ITimelineTrack,
} | {
  type: 'CREATE_ACTION',
  payload: {
    action: ITimelineFileAction,
    track: ITimelineTrack
  }
} | {
  type: 'CREATE_TRACKS',
  payload: IMediaFile[]
} | {
  type: 'DETAIL',
  payload: HTMLElement | null
} | {
  type: 'SET_SNAP_OPTIONS',
  payload: string[]
} | {
  type: 'LOAD_VERSIONS',
  payload: IMediaFile[]
} | {
  type: 'SET_FILE',
  payload: TimelineFile
} | {
  type: 'SET_TRACKS',
  payload: ITimelineTrack[]
} | {
  type: 'SET_ROW_HEIGHT',
  payload: number
};

export type TimelineContextType = ITimelineState & {
  dispatch: React.Dispatch<TimelineStateAction>;
};

export const TimelineContext = React.createContext<TimelineContextType | undefined>(undefined);

export function TimelineReducer(state: ITimelineState, stateAction: TimelineStateAction): ITimelineState {
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
    case 'CREATE_TRACKS': {
      const newState = onAddFiles(state, stateAction.payload);
      newState.engine.setTracks(newState.file?.tracks ?? []);
      return { ...newState };
    }
    case 'SET_TRACKS': {
      const updatedTracks = [...stateAction.payload];
      state.engine.setTracks(updatedTracks);
      if (state.getState() === "loading") {
        state.setState("ready");
      }
      return {
        ...state,
        file: state.file ? { ...state.file, tracks: updatedTracks } : null,
      };
    }
    case 'DETAIL':
      return {
        ...state,
        detailAnchor: stateAction.payload,
      };
    case 'LOAD_VERSIONS':
      return {
        ...state,
        versions: [...stateAction.payload],
      };
    case 'CREATE_ACTION': {
      const { action, track } = stateAction.payload;
      const updatedTracks = state.file?.tracks.map((t, index) =>
        t.id === track.id ? { ...t, actions: [...t.actions, initTimelineAction(state.engine, action, index)] } : t
      ) ?? [];
      return {
        ...state,
        file: state.file ? { ...state.file, tracks: updatedTracks } : null,
      };
    }
    case 'SET_FILE':
      return {
        ...state,
        file: stateAction.payload,
      };
    case 'SET_SNAP_OPTIONS':
      return {
        ...state,
        snapOptions: [...stateAction.payload],
      };
    case 'SET_ROW_HEIGHT': {
      return {
        ...state,
        rowHeight: stateAction.payload,
      }
    }
    default:
      return state;
  }
}

export interface TimelineProviderProps {
  children: React.ReactNode,
  id?: string,
  file?: ITimelineFile,
  controllers?: Record<string, IController>,
  engine?: IEngine,
  reducer?: (state: ITimelineState, stateAction: TimelineStateAction) => ITimelineState;
  actions?: ITimelineFileAction[],
}

export const initialTimelineState: Omit<ITimelineState, 'engine' | 'getState' | 'setState'> = {
  selectedTrack: null,
  selectedAction: null,
  detailAnchor: null,
  isMobile,
  snapOptions: [],
  versions: [],
  id: 'timeline',
  file: null,
  rowHeight: isMobile ? DEFAULT_MOBILE_ROW_HEIGHT : DEFAULT_TRACK_HEIGHT,
}
