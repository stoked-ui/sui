import * as React from 'react';
import { IMediaFile } from '@stoked-ui/media-selector';
import { isMobile } from 'react-device-detect';
import { Controllers, IController } from "../Controller";
import Controller from '../Controller/Controller';
import { FileState, IMimeType, ITimelineFile } from "../TimelineFile";
import { EngineState, IEngine } from "../Engine";
import { type ITimelineTrack } from "../TimelineTrack";
import {
  DEFAULT_MOBILE_TRACK_HEIGHT,
  DEFAULT_TRACK_HEIGHT
} from "../interface/const";
import {
  BackgroundImageStyle, initTimelineAction,
  ITimelineAction,
  ITimelineFileAction
} from "../TimelineAction/TimelineAction.types";
import Settings from "./Settings";
import { LocalDbProps } from '../LocalDb/LocalDb';


export interface ITimelineState<
  EngineType extends IEngine = IEngine,
  State extends string | EngineState = string | EngineState,
  FileType extends ITimelineFile = ITimelineFile,
  ActionType extends ITimelineAction = ITimelineAction,
  TrackType extends ITimelineTrack = ITimelineTrack,
> {
  engine: EngineType,
  file: FileType | null,
  id: string,
  selected: ActionType | TrackType | FileType | null;
  selectedAction: ActionType | null;
  selectedTrack: TrackType | null;
  flags: string[];
  settings: Settings;
  versions: IMediaFile[];
  getState: () => string | State;
  setState: (newState: string | State) => void;
  components: Record<string, HTMLElement>;
  controllers: Record<string, Controller>;
  localDbProps: LocalDbProps | null;
  preview?: boolean;
}

export const onAddFiles = <
  EngineType extends IEngine = IEngine,
  State extends string | EngineState = string | EngineState,
  FileType extends ITimelineFile = ITimelineFile,
  ActionType extends ITimelineAction = ITimelineAction,
  TrackType extends ITimelineTrack = ITimelineTrack,
>(state: ITimelineState<EngineType, State, FileType, ActionType, TrackType>, newTracks) => {
  const { file } = state;

  state.file.tracks = file?.tracks.concat(newTracks);
  return {...state};
}

type SelectActionPayload<
  ActionType extends ITimelineAction,
  TrackType extends ITimelineTrack,
> = {
  action: ActionType,
  track: TrackType
};

export type TimelineStateAction<
  FileType extends ITimelineFile = ITimelineFile,
  FileActionType extends ITimelineFileAction = ITimelineFileAction,
  ActionType extends ITimelineAction = ITimelineAction,
  TrackType extends ITimelineTrack = ITimelineTrack,
> = {
  type: 'SELECT_ACTION',
  payload: ActionType,
} | {
  type: 'SELECT_TRACK',
  payload: TrackType,
} | {
  type: 'SELECT_PROJECT',
} | {
  type: 'TRACK_HOVER',
  payload: string
} | {
  type: 'CREATE_ACTION',
  payload: {
    action: FileActionType,
    track: TrackType
  }
} | {
  type: 'CREATE_TRACKS',
  payload: ITimelineTrack[]
} | {
  type: 'SET_SNAP_FLAGS',
  payload: string[]
} | {
  type: 'LOAD_VERSIONS',
  payload: IMediaFile[]
} | {
  type: 'SET_FILE',
  payload: FileType
} | {
  type: 'SET_TRACKS',
  payload: TrackType[]
} | {
  type: 'SET_SETTING',
  payload: {
    key: string,
    value: any
  }
} | {
  type: 'SET_FLAGS' | 'INITIAL_FLAGS',
  payload: {
    set: string[],
    values: string[]
  }
} | {
  type: 'UPDATE_ACTION_STYLE',
  payload: {
    action: ActionType,
    backgroundImageStyle: BackgroundImageStyle
  }
} | {
  type: 'TRACK_ENTER',
  payload: string
} | {
  type: 'SET_COMPONENT',
  payload: {
    key: string,
    value: HTMLElement,
    onSet?: () => void,
  }
}

export type TimelineContextType = ITimelineState & {
  dispatch: React.Dispatch<TimelineStateAction>;
};

export const TimelineContext = React.createContext<TimelineContextType | undefined>(undefined);

export function setSetting(key: string, value: any, state: ITimelineState): ITimelineState {
  state.settings[key] = value;
  return { ...state };
}

export function addFlag(key: string | string[], state: ITimelineState) {
  if (!Array.isArray(key)) {
    key = [key];
  }
  key.forEach((k) => {
    if (!state.flags.includes(k)) {
      state.flags.push(k);
    }
  });
  return state;
}

export function removeFlag(key: string | string[], state: ITimelineState) {
  if (!Array.isArray(key)) {
    key = [key];
  }
  key.forEach((k) => {
    state.flags = state.flags.filter((flag) => flag !== k);
  });
  return state;
}

function inSetOn(flag: string, set: string[], values: string[]) {
  return set.includes(flag) && values.includes(flag);
}

export function setFlags(set: string[], values: string[], state: ITimelineState) {
  let newState = {
    ...state,
    flags: [...state.flags].filter((flag) => !set.includes(flag))
  }
  if (inSetOn('detailMode', set, values)) {
     newState = removeFlag(['record', 'labels'], newState);
     newState = addFlag('noResizer', newState);
  }
  if (inSetOn('allControls', set, values)) {
    newState = addFlag(['fileView', 'trackControls', 'snapControls', 'openSaveControls'], newState);
  }
  if (inSetOn('minimal', set, values)) {
    newState = removeFlag(['labels', 'detailMode', 'trackControls'], newState);
    newState = addFlag(['noResizer'], newState);
  }

  newState.flags = newState.flags.concat(values);
  return newState;
}

function isObject(value: any): boolean {
  return typeof value === 'object' && value !== null;
}


function TimelineReducerBase(state: ITimelineState, stateAction: TimelineStateAction): ITimelineState {
  switch (stateAction.type) {
    case 'SELECT_ACTION': {
      const action = stateAction.payload;
      const trackIndex = state.file?.tracks.findIndex((t) => t.actions.some((a) => a.id === action.id))
      return {
        ...state,
        selectedAction: action,
        selectedTrack: state.file!.tracks[trackIndex],
        selected: action,
      }
    }
    case 'SELECT_TRACK':{
      return {
        ...state,
        selectedAction: null,
        selectedTrack: stateAction.payload,
        selected: stateAction.payload,
      }
    }
    case 'SELECT_PROJECT':{
      return {
        ...state,
        selectedAction: null,
        selectedTrack: null,
        selected: state.file,
      }
    }
    case 'CREATE_TRACKS': {
      const newState = onAddFiles(state, stateAction.payload);
      newState.engine.setTracks(newState.file?.tracks ?? []);
      return { ...newState };
    }
    case 'SET_TRACKS': {
      const updatedTracks = [...(stateAction.payload ?? [])];
      state.engine.setTracks(updatedTracks);
      if (state.getState() === "loading") {
        state.setState("ready");
      }
      let file = null;
      if (state.file) {
        file = state.file;
        file.tracks = updatedTracks;
      }
      return {
        ...state,
        file,
      };
    }
    case 'TRACK_HOVER': {
      return setSetting('hoverTrack',stateAction.payload, state);
    }
    case 'LOAD_VERSIONS':
      return {
        ...state,
        versions: [...stateAction.payload],
      };
    case 'CREATE_ACTION': {
      const { action, track } = stateAction.payload;
      const updatedTracks = state.file?.tracks?.map((t, index) =>
        t.id === track.id ? { ...t, actions: [...t.actions, initTimelineAction( action, index)] } : t
      ) ?? [];
      let file = null;
      if (state.file) {
        file = state.file;
        file.tracks = updatedTracks;
      }
      return {
        ...state,
        file,
      };
    }
    case 'SET_FILE': {
      const stateWithFile = {
        ...state,
        file: stateAction.payload,
      };
      return TimelineReducerBase(stateWithFile, {
        type: 'SET_TRACKS',
        payload: stateAction.payload.tracks
      });
    }
    case 'SET_SNAP_FLAGS':
      return {
        ...state,
        flags: [...stateAction.payload],
      };
    case 'SET_SETTING': {
      const { key, value } = stateAction.payload;

      if (isObject(value)) {
        const keys = Object.keys(value);
        const result = keys.reduce((obj, nestedKey) => {
          obj[`${key ? `${key}.` : ''}${nestedKey}`] = value[nestedKey];
          return obj;
        }, {});
        Object.entries(result).forEach(([nestedKey, nestedValue]) => {
          state = setSetting(nestedKey, nestedValue, state);
        });
        return state;
      }
      return setSetting(key, value, state);
    }
    case 'INITIAL_FLAGS': {

      console.info('initial-flags', stateAction.payload, state);
    }
    // eslint-disable-next-line no-fallthrough
    case 'SET_FLAGS': {
      const { set, values } = stateAction.payload;
      if (set.includes('labels')) {
        state = setSetting('timeline.startLeft', values.includes('labels') ? 7 : 72, state);
      }
      return setFlags(set, values , state);
    }
    case 'UPDATE_ACTION_STYLE': {
      const { action, backgroundImageStyle } = stateAction.payload;
      const updatedTracks = state.file?.tracks?.map((t) => {
        t.actions = t.actions.map((a) => {
          if (a.id === action.id) {
            a.backgroundImageStyle = backgroundImageStyle;
          }
          return a;
        })
        return t;
      });
      let file = null;
      if (state.file) {
        file = state.file;
        file.tracks = updatedTracks;
      }
      return {
        ...state,
        file,
      };
    }
    case 'SET_COMPONENT': {
      const { key, value, onSet } = stateAction.payload;
      const { components } = state;
//      console.info('@'.repeat(process.stdout.columns))
      // console.info('@'.repeat(process.stdout.columns))
      if (!components[key] && onSet) {
        onSet();
      }
      return {
        ...state,
        components: {
          ...state.components,
          [key]: value,
        },
      };
    }
    default:
      return state;
  }
}

export function TimelineReducer(state: ITimelineState, stateAction: TimelineStateAction): ITimelineState {
  const newState = TimelineReducerBase(state, stateAction);
  const { engine, file } = newState;
  newState.getState = () => {
    if (!file || file?.state === FileState.READY) {
      return engine.state as EngineState;
    }
    return 'loading';
  }
  return newState;
}

export interface TimelineProviderProps<
  EngineType  = IEngine,
  State extends ITimelineState = ITimelineState,
  StateActionType  = TimelineStateAction
> {
  children: React.ReactNode,
  id?: string,
  controllers?: Record<string, IController>,
  engine?: EngineType,
  reducer?: (state: State, stateAction: StateActionType) => State;
  localDb?: LocalDbProps | false;
}

export const initialTimelineState: Omit<ITimelineState, 'engine' | 'getState' | 'setState'> = {
  selectedTrack: null,
  selectedAction: null,
  flags: isMobile ? ['isMobile'] : [],
  settings: new Settings({ timeline: {trackHeight: isMobile ? DEFAULT_MOBILE_TRACK_HEIGHT : DEFAULT_TRACK_HEIGHT } }),
  versions: [],
  id: 'timeline',
  file: null,
  components: {},
  controllers: Controllers,
  localDbProps: null,
  selected: null,
}

export function getDbProps(mimeType: IMimeType, localDbProps?: LocalDbProps | false): LocalDbProps {
  switch (localDbProps) {
    case false:
      return {
        dbName: mimeType.subType,
        stores: [mimeType.name],
        initializeStores: [mimeType.name],
        disabled: true,
      };
    case undefined:
      return {
        dbName: mimeType.subType,
        stores: [mimeType.name],
        initializeStores: [mimeType.name],
        disabled: false,
      }
    default:
      return localDbProps;
  }
}
