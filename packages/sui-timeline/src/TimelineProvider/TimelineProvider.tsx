import * as React from 'react';
import PropTypes from 'prop-types';
import {
  createSettings,
  FileSaveRequest,
  LocalDb,
  MimeRegistry,
  Settings,
} from '@stoked-ui/common';
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
import type { ITimelineAction } from '../TimelineAction';
import type { ITimelineTrack } from '../TimelineTrack';
import AudioController from '../Controller/AudioController';
import StokedUiTimelineApp from '../Timeline/StokedUiTimelineApp';

/**
 * The TimelineProvider is a React context provider that manages the state and dispatch
 * for the timeline functionality.
 *
 * @param props The props for the TimelineProvider, which include children,
 *              engine, initialState, controllers, file, reducer, localDb, and app.
 */
function TimelineProvider<
  EngineType extends IEngine = IEngine,
  EngineStateType extends string | EngineState = string | EngineState,
  StateType extends TimelineState = TimelineState,
  StateActionType = TimelineStateAction,
  FileType extends ITimelineFile = ITimelineFile,
  TrackType extends ITimelineTrack = ITimelineTrack,
  ActionType extends ITimelineAction = ITimelineAction,
  AppType extends StokedUiTimelineApp = StokedUiTimelineApp,
>(
  props: TimelineProviderProps<
    EngineType,
    StateType,
    StateActionType,
    FileType,
    TrackType,
    ActionType,
    AppType
  >,
) {
  const [state, dispatch] = React.useState(initialState);
  const [initialized, setInitialized] = React.useState(false);

  /**
   * The context value for the TimelineProvider, which includes the state and dispatch.
   */
  const contextValue = React.useMemo(
    () => ({
      state,
      dispatch,
    }),
    [state, dispatch],
  );

  if (!TimelineProvider.dispatch) {
    TimelineProvider.dispatch = dispatch;
  }

  // Initialize the provider with a loading state until the components are rendered
  if (!initialized) {
    return <div>loading</div>;
  }

  return (
    <TimelineContext.Provider value={contextValue}>
      {props.children}
    </TimelineContext.Provider>
  );
}

TimelineProvider.dispatch = null;

/**
 * A custom hook that accesses the extended context of the TimelineProvider.
 *
 * @returns The timeline context, which includes the state and dispatch.
 */
function useTimeline(): TimelineContextType {
  const context = React.useContext(TimelineContext);
  if (!context) {
    throw new Error('useTimeline must be used within a TimelineProvider');
  }
  return context;
}

export { TimelineProvider, useTimeline };