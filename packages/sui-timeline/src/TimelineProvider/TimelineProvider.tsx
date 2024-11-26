import * as React from 'react';
import Engine, { EngineState, IEngine } from '../Engine';
import {
  TimelineProviderProps,
  TimelineReducer,
  TimelineContext,
  TimelineContextType,
  TimelineStateAction,
  getDbProps,
  TimelineState,
  createTimelineState
} from './TimelineProvider.types';
import LocalDb from '../LocalDb';
import TimelineFile, { ITimelineFile, SUITimeline } from '../TimelineFile';
import type {ITimelineAction} from "../TimelineAction";
import type {ITimelineTrack} from "../TimelineTrack";

function TimelineProvider<
  EngineType extends IEngine = IEngine,
  EngineStateType extends string | EngineState = string | EngineState,
  StateType extends TimelineState = TimelineState,
  StateActionType = TimelineStateAction,
  FileType extends ITimelineFile = ITimelineFile,
  ActionType extends ITimelineAction = ITimelineAction,
  TrackType extends ITimelineTrack = ITimelineTrack,
>(props: TimelineProviderProps<EngineType, StateType, StateActionType, FileType>) {
  const { children, id, engine } = props;

  const controllers = props.controllers;
  TimelineProvider.Controllers = controllers;
  TimelineFile.Controllers = controllers;

  const theEngine = (engine ?? new Engine({ controllers })) as EngineType;
  const getStateBase = () => {
    return theEngine.state as EngineState;
  };

  const stateProps = {
    id,
    file: props.file,
    engine: theEngine,
    getState: getStateBase,
    selectedTrack: props.selectedTrack ?? null,
    selectedAction: props.selectedAction ?? null,
  };

  const timelineState = createTimelineState<EngineType, EngineStateType, FileType, ActionType, TrackType>(stateProps);


  const reducer = props.reducer ?? TimelineReducer;
  const [state, dispatch] = React.useReducer(reducer, timelineState);

  React.useEffect(() => {
    if (!LocalDb.initialized) {
      LocalDb.init(props.localDb ? props.localDb : getDbProps(SUITimeline, props.localDb)).catch(
        (ex) => console.error(ex),
      );
    }
  }, [state.flags.localDb]);


  return (
    <TimelineContext.Provider
      value={React.useMemo(() => ({ ...state, dispatch }), [state, dispatch])}
    >
      {children}
    </TimelineContext.Provider>
  );
}

TimelineProvider.Controllers = null;

// Custom hook to access the extended context
function useTimeline(): TimelineContextType {
  const context = React.useContext(TimelineContext);
  if (!context) {
    throw new Error('useTimeline must be used within a TimelineProvider');
  }
  return context;
}

export { TimelineProvider, useTimeline };
