import * as React from 'react';
import { TimelineProvider, ITimelineState, TimelineContext, initialTimelineState } from '@stoked-ui/timeline';
import EditorEngine from "../EditorEngine/EditorEngine";
import {EditorEngineState } from "../EditorEngine/EditorEngine.types";
import { EditorEvents } from "../EditorEngine";
import Controllers from "../Controllers/Controllers";
import { EditorContextType, EditorProviderProps, EditorReducer } from "./EditorProvider.types";

export default function EditorProvider(props: EditorProviderProps & any) {

  const engine = props?.engine ?? new EditorEngine({ events: new EditorEvents(), controllers: props.controllers });
  const getState = () => {
    return engine.state as EditorEngineState;
  }
  const setState = (newState: EditorEngineState | string) => {
    engine.state = newState;
  }
  const editorProps: ITimelineState = {
    ...initialTimelineState,
    id: props.id ?? 'editor',
    engine,
    getState,
    setState,
  };

  return (
    <TimelineProvider {...props} {...editorProps} file={props.file} controllers={Controllers} reducer={EditorReducer}>
      {props.children}
    </TimelineProvider>
  );
}

// Custom hook to access the extended Editor context
export function useEditorContext(): EditorContextType {
  const context = React.useContext(TimelineContext);
  if (!context) {
    throw new Error("useEditorContext must be used within an EditorProvider");
  }
  return context as EditorContextType;
}

