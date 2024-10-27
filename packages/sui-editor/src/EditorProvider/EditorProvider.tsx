import * as React from 'react';
import {
  TimelineContextType, TimelineProvider, useTimeline, TimelineProviderProps, TimelineReducer,
  ITimelineState, initialTimelineState, TimelineStateAction,
  ThemeMode, TimelineFile,
  TimelineActionState
} from '@stoked-ui/timeline';
import EditorEngine from "../EditorEngine/EditorEngine";
import {EditorEngineState, IEditorEngine} from "../EditorEngine/EditorEngine.types";
import {EditorEventTypes} from "../EditorEngine";

interface IEditorState extends Omit<ITimelineState, 'engine'> {
  engine: IEditorEngine;
}

type EditorContextType = IEditorState & {
  dispatch: React.Dispatch<TimelineStateAction>;
};

const EditorContext = React.createContext<EditorContextType | undefined>(undefined);

interface EditorProviderProps extends Omit<TimelineProviderProps, 'engine'> {
  engine?: IEditorEngine
}

const EditorReducer = (state: IEditorState, stateAction: TimelineStateAction) => {
  return TimelineReducer(state, stateAction) as IEditorState;
}

function EditorProviderBase(props: EditorProviderProps) {
  const timelineState = useTimeline();
  // const { controllers, engine: inputEngine} = props;

  // const createNewEngine = !inputEngine || !("record" in inputEngine);
  // const engine: IEditorEngine = createNewEngine ? new EditorEngine({controllers}) :
  // inputEngine as EditorEngine;

  //const initialState: IEditorState = {...timelineState, engine };
  // const [state, dispatch] = React.useReducer(EditorReducer, initialState as IEditorState);
  // timelineState.dispatch({ type: 'STATE', payload: state });


  return (
    <React.Fragment>
      {props.children}
    </React.Fragment>
  );
}

export default function EditorProvider(props: EditorProviderProps) {
  const timelineProps = { ...props, engine: props.engine };
  if (!timelineProps.engine) {
    timelineProps.engine = new EditorEngine({controllers: props.controllers});
  }
  return (
    <TimelineProvider {...timelineProps}>
      {props.children}
    </TimelineProvider>
  )
}

function useEditorContext(): EditorContextType {
  const context = React.useContext(EditorContext);
  if (!context) throw new Error("useEditorContext must be used within a EditorProvider");
  return context;
}

export { useEditorContext, EditorReducer, IEditorState, EditorProviderProps, EditorContext, EditorContextType }
