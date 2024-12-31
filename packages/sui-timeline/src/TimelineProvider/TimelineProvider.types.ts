import * as React from 'react';
import {isMobile} from "react-device-detect";
import {IMediaFile, App, Screenshot, Command} from '@stoked-ui/media-selector';
import {
  Constructor,
  createProviderState,
  FlagData,
  namedId,
  ProviderState,
  SortedList,
  IMimeType,
  LocalDbProps, Settings
} from "@stoked-ui/common";
import {IController} from "../Controller";
import TimelineFile, { ITimelineFile } from "../TimelineFile";
import { EngineState, IEngine } from "../Engine";
import { type ITimelineTrack } from "../TimelineTrack";
import {
  ADD_SCALE_COUNT,
  DEFAULT_MOBILE_TRACK_HEIGHT,
  DEFAULT_SCALE, DEFAULT_SCALE_COUNT,
  DEFAULT_SCALE_SPLIT_COUNT,
  DEFAULT_SCALE_WIDTH, DEFAULT_START_LEFT,
  DEFAULT_TRACK_HEIGHT,
  MIN_SCALE_COUNT
} from "../interface/const";
import {
  BackgroundImageStyle, initTimelineAction,
  ITimelineAction,
  ITimelineFileAction
} from "../TimelineAction/TimelineAction.types";
import {DetailData, getDetail, SelectionTypeName} from "./TimelineDetail";
// eslint-disable-next-line import/no-cycle
import {
  createActionEvent,
  fitScaleData,
  getActionHeight, getHeightScaleData,
  getTrackHeight,
  refreshActionState,
  refreshTrackState,
  setCursor,
  setHorizontalScroll,
  setScaleCount
} from "./TimelineProviderFunctions";
import StokedUiTimelineApp from "../Timeline/StokedUiTimelineApp";

export type Selection<FileType, TrackType, ActionType> = FileType | TrackType | ActionType | null;

export interface TimelineState<
  EngineType extends IEngine = IEngine,
  State extends string | EngineState = string | EngineState,
  FileType extends ITimelineFile = ITimelineFile,
  TrackType extends ITimelineTrack = ITimelineTrack,
  ActionType extends ITimelineAction = ITimelineAction,
  AppType extends App = StokedUiTimelineApp
> extends ProviderState {
  engine: EngineType;

  file: FileType | null;

  commandHistory: Command[];

  undoStack: Command[];

  selectedDetail: DetailData | null;

  selectedType: SelectionTypeName | null

  selected: Selection<FileType, TrackType, ActionType>;

  selectedAction: ActionType | null;

  selectedTrack: TrackType | null;

  getState: () => string | State;

  components: Record<string, React.PureComponent & { state: Readonly<any>} | React.Component | HTMLElement>;

  controllers: Record<string, IController>;

  localDbProps: LocalDbProps | null;

  preview?: boolean;

  createNewFile: () => any;

  app: AppType;
}

export interface ITimelineStateProps<
  EngineType extends IEngine = IEngine,
  EngineStateType extends string | EngineState = string | EngineState,
  FileType extends ITimelineFile = ITimelineFile,
  TrackType extends ITimelineTrack = ITimelineTrack,
  ActionType extends ITimelineAction = ITimelineAction,
  AppType extends App = StokedUiTimelineApp
> {
  engine: EngineType,
  file?: FileType,
  getState:() => string | EngineStateType
  selectedTrack?: TrackType,
  selectedAction?: ActionType,
  app?: AppType,
  initialSettings?: Settings,
}

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

function refreshState<State extends TimelineState = TimelineState>(state: State): State {
  const { file, selected, selectedTrack, selectedAction, flags } = state;
  let tracks = file?.tracks;
  if (!tracks) {
    return state;
  }
  tracks = tracks.map((track) => {
    track = { ...track, ...state.settings.refreshTrackState(track, state) };

    if (selectedTrack?.id === track.id) {
      state.selectedTrack = track;
      if (selected?.id === track.id) {
        state.selected = track;
      }
    }

    track.actions = track.actions.map((action) => {
      const actionNew = { ...action, ...state.settings.refreshActionState(action, track, state) };
      if (selectedAction?.id === action.id) {
        state.selectedAction = actionNew;
        state.selected = actionNew;
      }
      return actionNew;
    });

    return { ...track };
  });
  state.file!.tracks = [...tracks];
  return {...state, selectedAction, selectedTrack};
}

export function updateSelection<State extends TimelineState = TimelineState>(state: State): State {
  state = processSelection(state);
  if (state.flags.detailMode) {
    state.file.tracks = state.file.tracks.map((track, index) => {
      return {
        ...track,
        disabled: state.settings.selectedTrackIndex !== index
      };
    })
  }
  const detailData = state.settings.getDetail(state)
  state.selectedDetail = detailData?.detail || null;
  state.selectedType = detailData?.type || null;
  return {...refreshState<State>(state)};
}

export function createTimelineState<
  State extends TimelineState = TimelineState,
  EngineType extends IEngine = IEngine,
  EngineStateType extends string | EngineState = string | EngineState,
  FileType extends ITimelineFile = ITimelineFile,
  TrackType extends ITimelineTrack = ITimelineTrack,
  ActionType extends ITimelineAction = ITimelineAction,
  AppType extends App = StokedUiTimelineApp
>(props: ITimelineStateProps<EngineType,EngineStateType, FileType, TrackType, ActionType, AppType>) {
  const initialFlags: FlagData[] = [{
    flag: 'isMobile',
    config: {
      defaultValue: isMobile,
    }
  },{
    flag: 'showViewControls',
    config: { defaultValue: false}
  }, {
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
  }]

  const detailData = getDetail(props);
  const FileConstructor: Constructor<FileType> = TimelineFile as unknown as Constructor<FileType>;

  const state =  {
    ...props,
    ...createProviderState({
      flags: initialFlags,
      settings: {
        trackHeight: isMobile ? DEFAULT_MOBILE_TRACK_HEIGHT : DEFAULT_TRACK_HEIGHT,
        shrinkScalar: -.15,
        growScalar: .6,
        scale: DEFAULT_SCALE,
        scaleSplitCount: DEFAULT_SCALE_SPLIT_COUNT,
        scaleWidth: DEFAULT_SCALE_WIDTH,
        minScaleCount: MIN_SCALE_COUNT,
        maxScaleCount: Infinity ,
        timelineWidth: Infinity,
        scaleCount: DEFAULT_SCALE_COUNT,
        startLeft: DEFAULT_START_LEFT,
        cursorTime: 0,
        versions: [],
        actionTime: 0,
        playbackMode: 'canvas',
        detailSelectedScale: .6,
        unselectedActionScale: -.1,
        trackFiles: {},
        setCursor,
        setHorizontalScroll,
        createAction: createActionEvent,
        setScaleCount,
        fitScaleData,
        getTrackHeight,
        getActionHeight,
        getHeightScaleData,
        refreshActionState,
        refreshTrackState,
        getDetail,
        ...{ ...props.initialSettings ?? {}},
      }}),
    app: props.app ? props.app : new StokedUiTimelineApp(),
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
    commandHistory: [],
    undoStack: [],
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

export type SelectSettings = {
  type: 'SELECT_SETTINGS'
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
  SelectSettings |
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
} | {
  type: 'UPDATE_SCREENSHOTS',
  payload: {
    screenshots: SortedList<Screenshot>,
    mediaFile: IMediaFile
  }
} | { type: 'EXECUTE_COMMAND'; payload: Command }
  | { type: 'UNDO' }
  | { type: 'REDO' };

export type TimelineContextType = { state: TimelineState, dispatch: React.Dispatch<TimelineStateAction> };
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
      state.selectedType = 'action';
      return updateSelection(state)
    }
    case 'SELECT_TRACK':{
      state.selectedAction = null;
      state.selectedTrack = {...stateAction.payload};
      state.selectedType = 'track';
      return updateSelection(state)

    }
    case 'SELECT_PROJECT':{
      state.selectedAction = null;
      state.selectedTrack = null;
      state.selectedType = 'project';
      return updateSelection(state)
    }
    case 'SELECT_SETTINGS':{
      state.selectedAction = null;
      state.selectedTrack = null;
      state.selectedType = 'settings';
      return updateSelection(state)
    }
    case 'SET_TRACKS': {
      const updatedTracks = [...(stateAction.payload ?? [])];
      updatedTracks.forEach((track) => {
        if (track.muted || track.locked) {
          console.info(`${track.id} ${track.name} muted: ${track.muted} locked: ${track.locked}`);
        }
        track.id = track.id || namedId('track');
        track.actions = track.actions.map((action) => {
          action.id = action.id || namedId('action');
          return action;
        });
      });
      state.engine.setTracks(updatedTracks);

      let file = null;
      if (state.file) {
        file = state.file;
        file.tracks = updatedTracks;

      }
      state.file = file;

      state.settings = { ...getHeightScaleData(state), ...state.settings };
      return TimelineReducer({ ...refreshState(state), file }, { type: 'SET_SETTING', payload: { key: 'maxScaleCount', value: state.engine.canvasDuration + 2 } });
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
      // state.file.state = stateAction.payload.state;
      // state.file.lastModified = Date.now();
      if (state.getState() === EngineState.LOADING) {
        state.engine.state = EngineState.READY;
      }
      const detailData = getDetail(state)
      state.selectedDetail = detailData.detail;
      state.selectedType = detailData.type;

      return TimelineReducerBase({...state}, {
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
          if (nestedKey.indexOf('scale') > -1) {
            // console.info('SET SCALE', key, value);
          }
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
            console.info('UPDATE_ACTION_STYLE', a.id, a.name);
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
      state.engine.setTracks([]);
      state.file = null;
      return {...state};
    }
    case 'EXECUTE_COMMAND': {
      stateAction.payload.execute(); // Execute the command
      return {
        ...state,
        commandHistory: [...state.commandHistory, stateAction.payload],
        undoStack: [], // Clear redo stack
      };
    }
    case 'UNDO': {
      const lastCommand = state.commandHistory.pop();
      if (lastCommand) {
        lastCommand.undo(); // Undo the command
        return {
          ...state,
          commandHistory: [...state.commandHistory],
          undoStack: [lastCommand, ...state.undoStack],
        };
      }
      return state;
    }
    case 'REDO': {
      const lastUndoneCommand = state.undoStack.shift();
      if (lastUndoneCommand) {
        lastUndoneCommand.execute(); // Redo the command
        return {
          ...state,
          commandHistory: [...state.commandHistory, lastUndoneCommand],
          undoStack: [...state.undoStack],
        };
      }
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
  const { settings } = state;

  settings.tracks = state.file?.tracks.reduce((acc, item) => {
    acc[item.id] = item; // Use the `id` as the key and the item itself as the value
    return acc;
  }, {} as Record<string, ITimelineTrack>) || {};

  settings.trackFiles = state.file?.tracks.reduce((acc, item) => {
    acc[item.id] = item.file; // Use the `id` as the key and the item itself as the value
    return acc;
  }, {} as Record<string, IMediaFile>) || {};

  const actions = state.file?.tracks.map((track) => track.actions).flat() || [];
  settings.actions = actions.reduce((acc, item) => {
    acc[item.id] = item; // Use the `id` as the key and the item itself as the value
    return acc;
  }, {} as Record<string, ITimelineAction>) || {};
  return TimelineReducerBase(state, stateAction);
}

export interface TimelineProviderProps<
  EngineType  = IEngine,
  State extends TimelineState = TimelineState,
  StateActionType  = TimelineStateAction,
  FileType = ITimelineFile,
  TrackType extends ITimelineTrack = ITimelineTrack,
  ActionType extends ITimelineAction = ITimelineAction,
  AppType extends App = StokedUiTimelineApp
> {
  state?: State,
  children: React.ReactNode,
  file?: FileType,
  controllers?: Record<string, IController>,
  engine?: EngineType,
  reducer?: (state: State, stateAction: StateActionType) => State;
  localDb?: LocalDbProps | false;
  selectedTrack?: TrackType | null;
  selectedAction?: ActionType | null;
  app?: AppType;
}

export function getDbProps(mimeType: IMimeType, localDbProps?: LocalDbProps | false): LocalDbProps {
  switch (localDbProps) {
    case false:
      return {
        type: mimeType.type,
        dbName: mimeType.application,
        stores: [{name: mimeType.name, type: mimeType.type }],
        initializeStores: [mimeType.name],
        disabled: true,
      };
    case undefined:
      return {
        type: mimeType.type,
        dbName: mimeType.application,
        stores: [{ name: mimeType.name, type: mimeType.type }],
        initializeStores: [mimeType.name],
        disabled: false,
      }
    default:
      return localDbProps;
  }
}
