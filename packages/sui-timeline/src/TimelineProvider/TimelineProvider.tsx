import * as React from 'react';
import {Controllers} from '../Controller/AudioController';
import {TimelineFile} from "../TimelineFile";
import Engine, {EngineState} from "../Engine";

import { TimelineProviderProps, ITimelineState, initialTimelineState, TimelineReducer, TimelineContext, TimelineContextType } from './TimelineProvider.types';

function TimelineProvider(props: TimelineProviderProps) {
  const { children, id, file, controllers, engine } = props;

  const theEngine = engine ?? new Engine({ controllers: controllers ?? Controllers });
  const getState = () => {
    return theEngine.state as EngineState;
  }
  const setState = (newState: EngineState | string) => {
    theEngine.state = newState;
  }
  const initialState: ITimelineState = {
    ...initialTimelineState,
    id: id ?? 'timeline',
    file: file ?? null,
    engine: theEngine,
    getState,
    setState
  };

  const reducer = props.reducer ?? TimelineReducer;
  const [state, dispatch] = React.useReducer(reducer, initialState);

  React.useEffect(() => {

    if (!file && props.actions) {
      TimelineFile.fromFileActions(props.actions)
        .then((timelineFile) => {
          dispatch({ type: 'SET_FILE', payload: timelineFile })
        })
    }
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

export { TimelineProvider, useTimeline };

