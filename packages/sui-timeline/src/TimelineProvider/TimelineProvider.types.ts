import * as React from 'react';
import { IMediaFile, namedId } from '@stoked-ui/media-selector';
import { isMobile } from 'react-device-detect';
import { IController } from "../Controller";
import { ITimelineFile, TimelineFile} from "../TimelineFile";
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
  selectedAction: ActionType | null;
  selectedTrack: TrackType | null;
  flags: string[];
  settings: Settings;
  versions: IMediaFile[];
  getState: () => string | State;
  setState: (newState: string | State) => void;
  components: Record<string, HTMLElement>;
}

export const onAddFiles = <
  EngineType extends IEngine = IEngine,
  State extends string | EngineState = string | EngineState,
  FileType extends ITimelineFile = ITimelineFile,
  ActionType extends ITimelineAction = ITimelineAction,
  TrackType extends ITimelineTrack = ITimelineTrack,
>(state: ITimelineState<EngineType, State, FileType, ActionType, TrackType>, newMediaFiles: IMediaFile[]) => {
  const { engine, file } = state;

  if (!file) {
    return state;
  }

  const { tracks } = file;
  newMediaFiles = newMediaFiles.filter((mediaFile) => engine.controllers[mediaFile.mediaType])
  const newTracks = newMediaFiles.map((mediaFile) => {
    return {
      id: namedId('track'),
      name: mediaFile.name,
      file: mediaFile,
      controller: TimelineFile.globalControllers[mediaFile.mediaType] as IController,
      actions: [{
        id: namedId('action'),
        name: file.name,
        start: engine.getTime() || 0,
        end: (engine.getTime() || 0) + 2,
        volumeIndex: -2,
      }] as ActionType[],
      controllerName: mediaFile.mediaType,
    } as ITimelineTrack;
  })
  state.file.tracks = tracks.concat(newTracks);
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
  payload: SelectActionPayload<ActionType, TrackType>,
} | {
  type: 'SELECT_TRACK',
  payload: TrackType,
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
  payload: IMediaFile[]
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
  type: 'SET_FLAGS',
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

export function addFlag(key: string, state: ITimelineState) {
  if (!state.flags.includes(key)) {
    state.flags.push(key);
  }
  return state;
}

export function removeFlag(key: string, state: ITimelineState) {
  if (state.flags.includes(key)) {
    state.flags = state.flags.filter((flag) => flag !== key);
  }
  return state;
}

function flagTrigger(flag: string, set: boolean, key: string, value: any, state: ITimelineState) {
  if (set) {
    return setSetting(key, value, state);
  }
  return setSetting(key, value, state);
}

const flagTriggers = {
  labels: {
    'timeline.startLeft': {
      enabled: 7,
      disabled: 72,
    },
  }
}
const settingOverrides = Object.keys(Object.values(flagTriggers)) as string[];
const settingOverridesEnabled = settingOverrides.reduce((acc, overrideKey ) => {
  acc[overrideKey] = false;
  return acc;
}, {} as { [key: string]: boolean });

function executeFlagTriggers(set: string[], values: string[], state: ITimelineState) {
  const triggers = Object.keys(flagTriggers).filter((key) => set.includes(key));

  triggers.forEach((key) => {
    const enabled = values.includes(key);
    const overrideSettings = Object.keys(flagTriggers[key]);
    overrideSettings.forEach((setting) => {
      settingOverridesEnabled[setting] = true;
      if (enabled) {
        state = flagTrigger(key, true, setting, flagTriggers[key].enabled, state);
      } else {
        state =  flagTrigger(key, false, setting, flagTriggers[key].disabled, state);
      }
    });
  })
  return state;
}

export function setFlags(set: string[], values: string[], state: ITimelineState) {
  const newState = {
    ...state,
    flags: [...state.flags].filter((flag) => !set.includes(flag))
  }
  newState.flags = newState.flags.concat(values);
  return executeFlagTriggers(set, values, newState);
}


function isObject(value: any): boolean {
  return typeof value === 'object' && value !== null;
}

export function TimelineReducer(state: ITimelineState, stateAction: TimelineStateAction): ITimelineState {
  switch (stateAction.type) {

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
      return TimelineReducer(stateWithFile, {
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
      const valIsObject = isObject(value);
      let newState = state;
      if (valIsObject) {
        const keys = Object.keys(value);

        const result = keys.reduce((obj, nestedKey) => {
          obj[`${key}.${nestedKey}`] = value[nestedKey];
          return obj;
        }, {});
        Object.entries(result).forEach(([nestedKey, nestedValue]) => {
          if (!settingOverridesEnabled[nestedKey]) {
            newState = setSetting(nestedKey, nestedValue, newState);
          }
        });
        return newState;
      }
      if (!settingOverridesEnabled[key]) {
        newState =  setSetting(key, value, state);
      }
      return newState;
    }
    case 'SET_FLAGS': {
      const { set, values } = stateAction.payload;
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
}
