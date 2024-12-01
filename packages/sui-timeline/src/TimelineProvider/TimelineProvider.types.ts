import * as React from 'react';
import {isMobile} from "react-device-detect";
import { IMediaFile2 } from '@stoked-ui/media-selector';
import { Constructor, createProviderState, FlagData, ProviderState } from "@stoked-ui/common";
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
import { createAction, fitScaleData, setCursor, setHorizontalScroll, setScaleCount } from "./TimelineProviderFunctions";

export type Selection<FileType, TrackType, ActionType> = FileType | TrackType | ActionType | null;

export interface TimelineState<
  EngineType extends IEngine = IEngine,
  State extends string | EngineState = string | EngineState,
  FileType extends ITimelineFile = ITimelineFile,
  TrackType extends ITimelineTrack = ITimelineTrack,
  ActionType extends ITimelineAction = ITimelineAction,
> extends ProviderState {
  engine: EngineType;

  file: FileType | null;

  selectedDetail: DetailData | null;

  selectedType: SelectionTypeName | null

  selected: Selection<FileType, TrackType, ActionType>;

  selectedAction: ActionType | null;

  selectedTrack: TrackType | null;

  getState: () => string | State;

  components: Record<string, React.PureComponent & { state: Readonly<any>} | React.Component | HTMLElement>;

  controllers: Record<string, Controller>;

  localDbProps: LocalDbProps | null;

  preview?: boolean;

  createNewFile: () => any;

  /* detailOpen: boolean;
  detailState: {
    selectedTrackId: string | null,
      selectedActionId: string | null,
      selectedId: string | null
  } */
}

export interface ITimelineStateProps<
  EngineType extends IEngine = IEngine,
  EngineStateType extends string | EngineState = string | EngineState,
  FileType extends ITimelineFile = ITimelineFile,
  TrackType extends ITimelineTrack = ITimelineTrack,
  ActionType extends ITimelineAction = ITimelineAction
> {
  engine: EngineType,
  file?: FileType,
  getState:() => string | EngineStateType
  selectedTrack?: TrackType,
  selectedAction?: ActionType,
}


/*
function setDetailModeFlags<State extends TimelineState = TimelineState>(state: State): State {
  const {selectedType } = state;
  const isProject = selectedType === 'project';
  if (!state.file) {
    return state;
  }
  const { tracks } = state.file;

  if (!state.flags.detailMode || isProject) {
    tracks.forEach((track) => {
      track.disabled = false;
      track.actions.forEach((action) => { action.disabled = false; });
    });
    return state;
  }
  const isAction = selectedType === 'action';
  const isTrack = selectedType === 'track';
  tracks.forEach((track, trackIndex) => {
    if (isProject) {
      track.disabled = false;
    } else if (isTrack) {
      track.disabled = trackIndex !== state.settings.selectedTrackIndex;
    } else {
      track.disabled = true;
    }
    console.info('trackIndex', trackIndex, track.disabled ? 'disabled' : 'enabled', state.settings.selectedTrackIndex, state.settings.selectedActionIndex)
    track.actions.forEach((action, actionIndex) => {
      action.disabled = isAction ? actionIndex !== state.settings.selectedActionIndex : true;
    })
  })
  state.file.tracks = [...tracks ];
  return { ...state, }
} */

function processSelection<State extends TimelineState = TimelineState>(state: State): State {
  const { selectedAction, settings, selectedTrack, file} = state;
  const tracks = file?.tracks ?? [];
  settings.selectedTrackIndex = -1;
  settings.selectedActionIndex = -1;
  state.selected = state.file;
  if (selectedAction) {
    state.selected = selectedAction;
    for (let i = 0; i < tracks.length; i += 1) {
      const t = tracks[i];
      const actionIndex = t.actions.findIndex((a) => a.id === selectedAction?.id);
      if (actionIndex > -1) {
        settings.selectedTrackIndex = i;
        settings.selectedActionIndex = actionIndex;

        state = { ...state, settings, selectedTrack: {...tracks[state.settings.selectedTrackIndex]} };
        break;
      }
    }
  } else if (selectedTrack){
    state.settings.selectedTrackIndex = tracks.findIndex((track) => track.id === selectedTrack.id);
    state.selected = selectedTrack;
  }
  return {...state} // setDetailModeFlags({...state});
}

function updateSelection<State extends TimelineState = TimelineState>(state: State): State {
  state = processSelection(state);
  if (state.flags.detailMode) {
    state.file.tracks = state.file.tracks.map((track, index) => {
      return {
        ...track,
        disabled: state.settings.selectedTrackIndex !== index
      };
    })
  }
  const detailData = getDetail(state)
  state.selectedDetail = detailData?.detail || null;
  state.selectedType = detailData?.type || null;
  return {...state};
}

export function createTimelineState<
  State extends TimelineState = TimelineState,
  EngineType extends IEngine = IEngine,
  EngineStateType extends string | EngineState = string | EngineState,
  FileType extends ITimelineFile = ITimelineFile,
  TrackType extends ITimelineTrack = ITimelineTrack,
  ActionType extends ITimelineAction = ITimelineAction,
>(props: ITimelineStateProps<EngineType,EngineStateType, FileType, TrackType, ActionType>) {

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
    config: { defaultValue: true }
  }, {
    flag: 'fullscreen',
    config: { defaultValue: true,
      addTriggers: ['fileView'],
    }
  }, {
    flag: 'newTrack',
    config: { defaultValue: true }
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
      addTriggers: ['noLabels', 'noResizer', 'noTrackControls', 'noSnapControls', 'noSaveControls']
    }
  },]

  const detailData = getDetail(props);
  const FileConstructor: Constructor<FileType> = TimelineFile as unknown as Constructor<FileType>;

  const state =  {
    ...props,
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
        actionTime: 0,
        playbackMode: 'canvas',
        setCursor,
        setHorizontalScroll,
        createAction,
        setScaleCount,
        fitScaleData,
      }}),
    selectedTrack: null as TrackType | null,
    selectedAction: null as ActionType | null,
    engine: props.engine as EngineType,
    file: (props.file ?? null) as FileType | null,
    selectedDetail: detailData?.detail ?? null,
    selectedType: detailData?.type ?? null,
    selected: (props.file ?? null) as Selection<FileType, TrackType, ActionType>,
    components: {},
    controllers: {},
    localDbProps: null,
    createNewFile: () =>{
      return new FileConstructor({ name: 'New Project' });
    },
    getState: props.getState,
  };
  return updateSelection<State>(state as any);
}

export const onAddFiles = <
  EngineType extends IEngine = IEngine,
  State extends string | EngineState = string | EngineState,
  FileType extends ITimelineFile = ITimelineFile,
  TrackType extends ITimelineTrack = ITimelineTrack,
  ActionType extends ITimelineAction = ITimelineAction,
>(state: TimelineState<EngineType, State, FileType, TrackType, ActionType>, newTracks: TrackType[]) => {
  const { file } = state;

  state.file.tracks = file?.tracks.concat(newTracks);
  return {...state};
}
export type SelectAction<ActionType extends ITimelineAction = ITimelineAction> = {
  type: 'SELECT_ACTION',
  payload: ActionType,
}

export type SelectTrack<TrackType extends ITimelineTrack = ITimelineTrack> = {
  type: 'SELECT_TRACK',
  payload: TrackType,
}

export type SelectProject = {
  type: 'SELECT_PROJECT'
}

export type TimelineStateAction<
  FileType extends ITimelineFile = ITimelineFile,
  FileActionType extends ITimelineFileAction = ITimelineFileAction,
  TrackType extends ITimelineTrack = ITimelineTrack,
  ActionType extends ITimelineAction = ITimelineAction,
> =
  SelectAction |
  SelectTrack |
  SelectProject |
{
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
  payload: IMediaFile2[]
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
    add?: string | string[],
    remove?: string | string[]
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

function TimelineReducerBase<
  State extends TimelineState = TimelineState,
  StateActionType extends { type: string, payload?: any } = TimelineStateAction
>(state: State, stateAction: StateActionType): State {
  switch (stateAction.type) {
    case 'SELECT_ACTION': {
      state.selectedAction = {...stateAction.payload};
      return updateSelection(state)
    }
    case 'SELECT_TRACK':{
      state.selectedAction = null;
      state.selectedTrack = {...stateAction.payload};
      return updateSelection(state)

    }
    case 'SELECT_PROJECT':{
      state.selectedAction = null;
      state.selectedTrack = null;
      return updateSelection(state)
    }
    case 'SET_TRACKS': {
      const updatedTracks = [...(stateAction.payload ?? [])];
      updatedTracks.forEach((track) => {
        if (track.muted || track.locked) {
          console.info(`${track.id} ${track.name} muted: ${track.muted} locked: ${track.locked}`);
        }
      });
      state.engine.setTracks(updatedTracks);

      let file = null;
      if (state.file) {
        file = state.file;
        file.tracks = updatedTracks;
      }
      state.file = file;
      return TimelineReducer(state, { type: 'SET_SETTING', payload: { key: 'maxScaleCount', value: state.engine.canvasDuration + ADD_SCALE_COUNT } });
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
      if (process.env.FLAG_DEBUGGING) {
        console.info('SET FLAGS', {add, remove});
      }
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
  StateActionType extends { type: string, payload?: any } = TimelineStateAction
>(state: State, stateAction: StateActionType): State {
  const newState = TimelineReducerBase(state, stateAction);
  const { engine, file } = newState;
  newState.getState = () => {
    if (!file || file?.state === FileState.READY) {
      return engine.state as EngineState;
    }
    return EngineState.LOADING;
  }
  return {...newState};
}

export interface TimelineProviderProps<
  EngineType  = IEngine,
  State extends TimelineState = TimelineState,
  StateActionType  = TimelineStateAction,
  FileType = ITimelineFile,
  TrackType extends ITimelineTrack = ITimelineTrack,
  ActionType extends ITimelineAction = ITimelineAction,
> {
  state?: State,
  children: React.ReactNode,
  file?: FileType,
  controllers?: Record<string, Controller>,
  engine?: EngineType,
  reducer?: (state: State, stateAction: StateActionType) => State;
  localDb?: LocalDbProps | false;
  selectedTrack?: TrackType | null;
  selectedAction?: ActionType | null;
}

export function getDbProps(mimeType: IMimeType, localDbProps?: LocalDbProps | false): LocalDbProps {
  switch (localDbProps) {
    case false:
      return {
        dbName: mimeType.application,
        stores: [mimeType.name],
        initializeStores: [mimeType.name],
        disabled: true,
      };
    case undefined:
      return {
        dbName: mimeType.application,
        stores: [mimeType.name],
        initializeStores: [mimeType.name],
        disabled: false,
      }
    default:
      return localDbProps;
  }
}
