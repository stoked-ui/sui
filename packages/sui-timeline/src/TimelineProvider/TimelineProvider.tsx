import * as React from 'react';
import {IMediaFile, Screenshot, ScreenshotQueue} from '@stoked-ui/media-selector';
import { LocalDb } from '@stoked-ui/common';
import Engine, { EngineState, IEngine } from '../Engine';
import {
  TimelineProviderProps,
  TimelineReducer,
  TimelineContext,
  TimelineContextType,
  TimelineStateAction,
  getDbProps,
  TimelineState,
  createTimelineState,
} from './TimelineProvider.types';
import TimelineFile, { ITimelineFile } from '../TimelineFile';
import type {ITimelineAction} from "../TimelineAction";
import type {ITimelineTrack} from "../TimelineTrack";
import AudioController from "../Controller/AudioController";
import StokedUiTimelineApp from '../Timeline/StokedUiTimelineApp';

function TimelineProvider<
  EngineType extends IEngine = IEngine,
  EngineStateType extends string | EngineState = string | EngineState,
  StateType extends TimelineState = TimelineState,
  StateActionType = TimelineStateAction,
  FileType extends ITimelineFile = ITimelineFile,
  TrackType extends ITimelineTrack = ITimelineTrack,
  ActionType extends ITimelineAction = ITimelineAction,
  AppType extends StokedUiTimelineApp = StokedUiTimelineApp
>(props: TimelineProviderProps<EngineType, StateType, StateActionType, FileType, TrackType, ActionType>) {
  const { children, engine  } = props;
  let { state: initialState } = props;

  if (!initialState) {
    const controllers = props.controllers ?? { audio: AudioController };
    TimelineFile.Controllers = controllers;

    const theEngine = (engine ?? new Engine({controllers})) as EngineType;
    const getStateBase = () => {
      return theEngine.state as EngineState;
    };

    const stateProps = {
      ...props,
      file: props.file,
      engine: theEngine,
      getState: getStateBase,
      selectedTrack: props.selectedTrack,
      selectedAction: props.selectedAction,
      app: (props.app ?? new StokedUiTimelineApp()) as AppType,
    };

    initialState = createTimelineState<StateType, EngineType, EngineStateType, FileType, TrackType, ActionType, AppType>(stateProps);
  }
  const reducer = props.reducer ?? TimelineReducer;
  const [startState, setStartState] = React.useState<any>(initialState);
  const [initialized, setInitialized] = React.useState<boolean>(false);
  React.useEffect(() => {
    setInitialized(true);
    LocalDb.init(props.localDb ? props.localDb : getDbProps(initialState.app.defaultInputFileType, props.localDb)).catch(
      (ex) => console.error(ex),
    );
  }, []);

  const [state, dispatch] = React.useReducer(reducer, startState);

  React.useEffect(() => {
    const setSetting = (key: string, value: any) => {
      dispatch({
        type: 'SET_SETTING',
        payload: {
          key,
          value
        }
      });
    }
    setSetting('setSetting', setSetting);
    window.setSetting = setSetting;

    const setScaleWidth = (value: number) => setSetting('scaleWidth', value);
    setSetting('setScaleWidth', setScaleWidth);
    window.setScaleWidth = setScaleWidth;

    const setScale = (value: number) => setSetting('scale', value);
    setSetting('setScale', setScale);
    window.setScale = setScale;

    const setScaleSplitCount = (value: number) => setSetting('scaleSplitCount', value);
    setSetting('setScaleSplitCount', setScaleSplitCount);
    window.setScaleSplitCount = setScaleSplitCount;

    const setMinScaleCount = (value: number) => setSetting('minScaleCount', value);
    setSetting('setMinScaleCount', setMinScaleCount);
    window.setMinScaleCount = setMinScaleCount;

    const setMaxScaleCount = (value: number) => setSetting('maxScaleCount', value);
    setSetting('setMaxScaleCount', setMaxScaleCount);
    window.setMaxScaleCount = setMaxScaleCount;

    const getSettings = () => state.settings;
    setSetting('getSettings', getSettings);
    window.getSetting = getSettings;

    const reRender = () => state.engine.reRender();
    setSetting('reRender', reRender);
    window.reRender = reRender;

  }, []);

  if (!TimelineProvider.dispatch) {
    TimelineProvider.dispatch = dispatch;
  }
  if (!initialized) {
    return null;
  }


  const screenshotsUpdate = (mediaFile: IMediaFile, screenshot: Screenshot) => {
    const screenshots = mediaFile.media?.screenshotStore?.screenshots;
    if (!screenshots) {
      return;
    }
    screenshots.push(screenshot);
    dispatch({
      type: 'UPDATE_SCREENSHOTS',
      payload: {
        screenshots: [...screenshots],
        mediaFile
      }
    });
  }

  ScreenshotQueue.getInstance(3).screenshotsUpdate = screenshotsUpdate;

  return (
    <TimelineContext.Provider value={{state, dispatch}} >
      {children}
    </TimelineContext.Provider>
  );
}

TimelineProvider.dispatch = null;

// Custom hook to access the extended context
function useTimeline(): TimelineContextType {
  const context = React.useContext(TimelineContext);
  if (!context) {
    throw new Error('useTimeline must be used within a TimelineProvider');
  }
  return context;
}

export { TimelineProvider, useTimeline };

