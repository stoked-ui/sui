import React, { createContext, useReducer } from 'react';
import Controllers, {IController} from "../Controller";
import TimelineFile, {ITimelineFile} from "../TimelineFile";
import Engine, {IEngine} from "../Engine";
import {ITimelineTrack} from "../TimelineTrack";
import {ITimelineAction, ITimelineFileAction} from "../TimelineAction";
import { IMediaFile, namedId } from '@stoked-ui/media-selector';

export type ThemeMode = 'light' | 'dark';

export interface ITimelineState {
  engine: IEngine,
  file: TimelineFile,
  id: string,
  selectedAction: ITimelineAction | null;
  selectedTrack: ITimelineTrack | null;
  showDetail: boolean;
  theme: ThemeMode;
}

export type TimelineStateAction = {
  type: 'SET_THEME',
  payload: 'light' | 'dark',
} | {
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
  type: 'SET_TRACKS',
  payload: ITimelineTrack[]
} | {
  type: 'DETAIL',
  payload: boolean
} | {
  type: 'LOADED',
} | {
  type: 'STATE',
  payload: ITimelineState
} | {
  type: 'VIEWER',
  payload: HTMLDivElement
};

export type TimelineContextType = ITimelineState & {
  dispatch: React.Dispatch<TimelineStateAction>;
};

export const initialTimelineState = {
  theme: 'light' as ThemeMode,
  id: 'editor',
  selectedTrack: null,
  selectedAction: null,
  showDetail: false,
};

const TimelineContext = createContext<TimelineContextType | undefined>(undefined);

const onAddFiles = (state: ITimelineState, newMediaFiles: IMediaFile[]) => {
  const { engine, file: { tracks } } = state;
  newMediaFiles = newMediaFiles.filter((file) => Controllers[file.mediaType])
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
        width: file.width,
        height: file.height,
        z: tracks.length + index,
        fit: 'none'
      }],
      controllerName: file.mediaType,
    } as ITimelineTrack;
  });
  state.file.tracks = tracks.concat(newTracks);
  return state;
}

const TimelineReducer = (state: ITimelineState, stateAction: TimelineStateAction) => {
  switch (stateAction.type) {
    case 'SET_THEME':
      return {
        ...state,
        theme: stateAction.payload
      };
    case 'SELECT_ACTION':
      return {
        ...state,
        selectedAction: stateAction.payload.action,
        selectedTrack: stateAction.payload.track
      };
    case 'SELECT_TRACK':
      return {
        ...state,
        selectedAction: null,
        selectedTrack: stateAction.payload
      };
    case 'CREATE_ACTION':
      const {action, track} = stateAction.payload;
      const updatedTrackIndex = state.file.tracks.indexOf(track);
      const actions = [...state.file.tracks[updatedTrackIndex].actions];
      actions.push(TimelineFile.initializeAction(state.engine, action, updatedTrackIndex));
      state.file.tracks[updatedTrackIndex].actions = actions;
      return state;
    case 'CREATE_TRACKS':
      return onAddFiles(state, stateAction.payload);
    case 'SET_TRACKS':
      state.file.tracks = [...stateAction.payload];
      state.engine.setTracks(state.file.tracks);
      return state;
    case 'LOADED':
      state.engine.loaded();
      return state;
    case 'STATE':
      return stateAction.payload;
    case 'VIEWER':
      state.engine.viewer = stateAction.payload;
      return state;
    default:
      return state;
  }
};
export interface TimelineProviderProps {
  children: React.ReactNode,
  id: string,
  file?: TimelineFile,
  controllers: Record<string, IController>,
  engine?: IEngine,
}


const TimelineProvider = (props: TimelineProviderProps) => {
  const { children, id, file, controllers, engine } = props;
  const compState: ITimelineState = {
    ...initialTimelineState,
    id,
    file,
    engine: engine ?? new Engine({ controllers })
  };
  const [state, dispatch] = React.useReducer(TimelineReducer, compState);

  React.useEffect(() => {
    let theme: ThemeMode = 'light'
    if (window && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      theme = 'dark';
    }
    dispatch({ type: 'SET_THEME', payload: theme })

    window.matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', event => {
        dispatch({ type: 'SET_THEME', payload: event.matches ? "dark" : "light" })
      });

    //if (file?.generateRequired()) {

    // }
  }, [])

  return (
    <TimelineContext.Provider value={{ ...state, dispatch }}>
      {children}
    </TimelineContext.Provider>
  );
};

// Custom hook to access the extended context
function useTimeline(): TimelineContextType {
  const context = React.useContext(TimelineContext);
  if (!context) throw new Error("useTimeline must be used within a TimelineProvider");
  return context;
}

export { TimelineReducer, useTimeline };
export default TimelineProvider;

