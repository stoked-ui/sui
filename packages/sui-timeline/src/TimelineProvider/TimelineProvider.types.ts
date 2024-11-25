import * as React from 'react';
import {isMobile} from "react-device-detect";
import { IMediaFile } from '@stoked-ui/media-selector';
import {createProviderState, FlagData, ProviderState, Settings} from "@stoked-ui/common";
import Controller  from "../Controller";
import TimelineFile, { FileState, IMimeType, ITimelineFile } from "../TimelineFile";
import { EngineState, IEngine } from "../Engine";
import { type ITimelineTrack } from "../TimelineTrack";
import {
  ADD_SCALE_COUNT,
  DEFAULT_MOBILE_TRACK_HEIGHT,
  DEFAULT_SCALE,
  DEFAULT_SCALE_SPLIT_COUNT,
  DEFAULT_SCALE_WIDTH,
  DEFAULT_TRACK_HEIGHT,
  MIN_SCALE_COUNT
} from "../interface/const";
import {
  BackgroundImageStyle, initTimelineAction,
  ITimelineAction,
  ITimelineFileAction
} from "../TimelineAction/TimelineAction.types";
import { LocalDbProps } from '../LocalDb/LocalDb';
import {DetailData, getDetail, SelectionTypeName} from "./TimelineDetail";
// eslint-disable-next-line import/no-cycle
import { createAction, fitScaleData, getTrackHeight, setCursor, setHorizontalScroll, setScaleCount } from "./TimelineProviderFunctions";

export interface TimelineState<
  EngineType extends IEngine = IEngine,
  State extends string | EngineState = string | EngineState,
  FileType extends ITimelineFile = ITimelineFile,
  ActionType extends ITimelineAction = ITimelineAction,
  TrackType extends ITimelineTrack = ITimelineTrack,
> extends ProviderState {
  engine: EngineType;

  file: FileType | null;

  id: string;

  selectedDetail: DetailData | null;

  selectedType: SelectionTypeName | null

  selected: ActionType | TrackType | FileType | null;

  selectedAction: ActionType | null;

  selectedTrack: TrackType | null;

  getState: () => string | State;

  components: Record<string, React.PureComponent & { state: Readonly<any>} | React.Component | HTMLElement>;

  controllers: Record<string, Controller>;

  localDbProps: LocalDbProps | null;

  preview?: boolean;

  createNewFile: () => any;
}

export interface ITimelineStateProps<
  EngineType extends IEngine = IEngine,
  EngineStateType extends string | EngineState = string | EngineState,
  FileType extends ITimelineFile = ITimelineFile,
> {
  id?: string,
  engine: EngineType,
  file?: FileType,
  getState:() => string | EngineStateType
}

export function createTimelineState<
  EngineType extends IEngine = IEngine,
  EngineStateType extends string | EngineState = string | EngineState,
  FileType extends ITimelineFile = ITimelineFile,
  ActionType extends ITimelineAction = ITimelineAction,
  TrackType extends ITimelineTrack = ITimelineTrack,
>(props: ITimelineStateProps<EngineType,EngineStateType, FileType>) {

  const initialFlags: FlagData[] = [{
    flag: 'isMobile',
    config: {
      defaultValue: isMobile,
    }
  },{
    flag: 'noLabels',
    config: { defaultValue: false}
  }, {
    flag: 'fileView',
    config: { defaultValue: false },
  }, {
    flag: 'noTrackControls',
    config: { defaultValue: false },
  }, {
    flag: 'noSnapControls',
    config: { defaultValue: false },
  }, {
    flag: 'localDb',
    config: { defaultValue: true },
  }, {
    flag: 'noSaveControls',
    config: { defaultValue: false }
  }, {
    flag: 'record',
    config: { defaultValue: true }
  }, {
    flag: 'noResizer',
    config: { defaultValue: false }
  }, {
    flag: 'collapsed',
    config: { defaultValue: false }
  }, {
    flag: 'allControls',
    config: { defaultValue: false
    }
  }, {
    flag: 'newTrack',
    config: {defaultValue: true}
  }, {
    flag: 'detailMode',
    config: { defaultValue: false,
      addTriggers: ['minimal'],
      removeTriggers: ['record', 'newTrack']
    }
  }, {
    flag: 'minimal',
    config: {
      defaultValue: false,
      addTriggers: ['noLabels', 'noResizer', 'noTrackControls', 'noSnapControls', 'noViewControls']
    }
  },]

  const detailData = getDetail({ file: props.file });
  return {
    ...createProviderState({
      flags: initialFlags,
      settings: {
        trackHeight: isMobile ? DEFAULT_MOBILE_TRACK_HEIGHT : DEFAULT_TRACK_HEIGHT,
        scale: DEFAULT_SCALE,
        scaleSplitCount: DEFAULT_SCALE_SPLIT_COUNT,
        scaleWidth: DEFAULT_SCALE_WIDTH,
        minScaleCount: MIN_SCALE_COUNT,
        maxScaleCount: Infinity ,
        timelineWidth: Infinity,
        scaleCount: 40,
        startLeft: 7,
        cursorTime: 0,
        versions: [],
        setCursor,
        setHorizontalScroll,
        createAction,
        setScaleCount,
        fitScaleData,
        getTrackHeight
      }}),
    selectedTrack: null,
    selectedAction: null,
    engine: props.engine,
    // versions: [],
    id: props.id,
    file: props.file ?? null,
    selectedDetail: detailData?.detail ?? null,
    selectedType: detailData?.type ?? null,
    selected: props.file ?? null,
    components: {},
    controllers: {},
    localDbProps: null,
    createNewFile: function newFile(){
      return new TimelineFile({ name: 'New Timeline Project' });
    },
    getState: props.getState,
    // setState: setStateBase
  } as TimelineState<EngineType, EngineStateType, FileType, ActionType, TrackType>;
}

export const onAddFiles = <
  EngineType extends IEngine = IEngine,
  State extends string | EngineState = string | EngineState,
  FileType extends ITimelineFile = ITimelineFile,
  ActionType extends ITimelineAction = ITimelineAction,
  TrackType extends ITimelineTrack = ITimelineTrack,
>(state: TimelineState<EngineType, State, FileType, ActionType, TrackType>, newTracks: TrackType[]) => {
  const { file } = state;

  state.file.tracks = file?.tracks.concat(newTracks);
  return {...state};
}

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
    key?: string,
    value: any
  }
} | {
  type: 'SET_FLAGS',
  payload: {
    add: string[],
    remove: string[]
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
    value:  HTMLElement | React.Component | React.PureComponent & { state: Readonly<any> },
    onSet?: () => void,
  }
} | {
  type: 'DISCARD_FILE'
}

export type TimelineContextType = TimelineState & {
  dispatch: React.Dispatch<TimelineStateAction>;
};

export const TimelineContext = React.createContext<TimelineContextType | undefined>(undefined);

export function setSetting<
  State extends TimelineState = TimelineState
>(key: string, value: any, state: State): State {
  state.settings[key] = value;
  return state as State;
}

function isObject(value: any): boolean {
  return typeof value === 'object' && value !== null;
}

function updateTrackData<State extends TimelineState = TimelineState>(state: State): State {
  if (state.flags.detailMode) {
    state.file.tracks = state.file.tracks.map((track, index) => {
      return {
        ...track,
        disabled: state.settings.selectedTrackIndex !== index
      };
    })
  }
  const detailData = getDetail(state)
  state.selectedDetail = detailData.detail;
  state.selectedType = detailData.type;
  return {...state};
}

const setIndexes = (tracks: ITimelineTrack[], settings: Settings, actionId: string) => {
  for (let i = 0; i < tracks.length; i += 1){
    const t = tracks[i];
    const actionIndex = t.actions.findIndex((a) => a.id === actionId);
    if (actionIndex > -1) {
      settings.selectedTrackIndex = i;
      settings.selectedActionIndex = actionIndex;
      return true;
    }
  }
  return false;
}

function TimelineReducerBase<
  State extends TimelineState = TimelineState,
  StateActionType extends TimelineStateAction = TimelineStateAction
>(state: State, stateAction: StateActionType): State {
  switch (stateAction.type) {
    case 'SELECT_ACTION': {
      const action = stateAction.payload;
      const tracks = state.file?.tracks;
      if (!setIndexes(tracks, state.settings, action.id)) {
        return state;
      }
      state.selectedAction = {...action};
      state.selectedTrack = {...state.file.tracks[state.settings.selectedTrackIndex]};
      state.selected = state.selectedAction;
      return updateTrackData<State>(state);
    }
    case 'SELECT_TRACK':{
      state.selectedAction = null;
      state.settings.selectedActionIndex = -1;
      state.selectedTrack = {...stateAction.payload};
      state.settings.selectedTrackIndex = state.file.tracks.indexOf(state.selectedTrack);
      state.selected = state.selectedTrack;
      return updateTrackData(state);
    }
    case 'SELECT_PROJECT':{
      state.selectedAction = null;
      state.selectedTrack = null;
      state.settings.selectedTrackIndex = -1;
      state.settings.selectedActionIndex = -1;
      state.selected = state.file;
      return updateTrackData(state);
    }
    case 'SET_TRACKS': {
      const updatedTracks = [...(stateAction.payload ?? [])];
      state.engine.setTracks(updatedTracks);

      let file = null;
      if (state.file) {
        file = state.file;
        file.tracks = updatedTracks;
      }
      state.file = file;
      return TimelineReducer(state, { type: 'SET_SETTING', payload: { key: 'maxScaleCount', value: state.engine.duration + ADD_SCALE_COUNT } });
    }
    case 'TRACK_HOVER': {
      return setSetting('hoverTrack',stateAction.payload, state);
    }
    case 'LOAD_VERSIONS':
      return state;
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
      state.file = file;
      return state;
    }
    case 'SET_FILE': {
      state.file = stateAction.payload;
      state.file.state = stateAction.payload.state;
      state.file.lastModified = Date.now();
      if (state.getState() === EngineState.LOADING) {
        state.engine.state = EngineState.READY;
      }
      const detailData = getDetail(state)
      state.selectedDetail = detailData.detail;
      state.selectedType = detailData.type;

      return TimelineReducerBase(state, {
        type: 'SET_TRACKS',
        payload: stateAction.payload.tracks
      });
    }
    case 'SET_SETTING': {
      const { key, value } = stateAction.payload;

      if (isObject(value)) {
        const keys = Object.keys(value);
        const result = keys.reduce((obj, nestedKey) => {
          obj[`${key ? `${key}.` : ''}${nestedKey}`] = value[nestedKey];
          return obj;
        }, {});
        Object.entries(result).forEach(([nestedKey, nestedValue]) => {
          state = setSetting<State>(nestedKey, nestedValue, state);
        });
        return state;
      }
      return setSetting(key, value, state);
    }
    case 'SET_FLAGS': {
      const { add, remove } = stateAction.payload;
      /* if (set.includes('noLabels')) {
        state = setSetting('timeline.startLeft', values.includes('noLabels') ? 72 : 7, state, stateAction.type);
      } */
      state.enableFlags(add);
      state.disableFlags(remove);
      return state;
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
      state.file = file;
      return state;
    }
    case 'SET_COMPONENT': {
      const { key, value, onSet } = stateAction.payload;
      const { components } = state;
//      console.info('@'.repeat(process.stdout.columns))
      // console.info('@'.repeat(process.stdout.columns))
      if (!components[key] && onSet) {
        onSet();
      }
      state.components = {
        ...state.components,
        [key]: value,
      };
      return state;
    }
    case 'DISCARD_FILE': {
      const newFile = state.createNewFile();
      newFile.state = FileState.READY;
      state.file = newFile;
      return state;
    }
    default:
      return state;
  }
}

export function TimelineReducer<
  State extends TimelineState = TimelineState,
  StateActionType extends TimelineStateAction = TimelineStateAction
>(state: State, stateAction: StateActionType): State {
  const newState = TimelineReducerBase(state, stateAction);
  const { engine, file } = newState;
  newState.getState = () => {
    if (!file || file?.state === FileState.READY) {
      return engine.state as EngineState;
    }
    return EngineState.LOADING;
  }
  const { type, ...rest } = stateAction;
  return {...newState};
}

export interface TimelineProviderProps<
  EngineType  = IEngine,
  State extends TimelineState = TimelineState,
  StateActionType  = TimelineStateAction,
  FileType = ITimelineFile
> {
  children: React.ReactNode,
  id?: string,
  file?: FileType,
  controllers?: Record<string, Controller>,
  engine?: EngineType,
  reducer?: (state: State, stateAction: StateActionType) => State;
  localDb?: LocalDbProps | false;
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
