import * as React from 'react';
import PropTypes from 'prop-types';
import {
  TimelineProvider, getDbProps, TimelineProviderProps, ITimelineStateProps, createTimelineState,
  Controllers as TimelineControllers,
  TimelineFile,
} from '@stoked-ui/timeline';
import Controllers from '../Controllers/Controllers';
import EditorEngine from '../EditorEngine/EditorEngine';
import { EditorEngineState, IEditorEngine } from '../EditorEngine/EditorEngine.types';
import { EditorEvents } from '../EditorEngine';
import { EditorReducer, EditorStateAction } from './EditorProvider.types';
import { IEditorFile, SUIEditor } from '../EditorFile/EditorFile';
import EditorState from './EditorState';
import {IEditorAction} from "../EditorAction";
import {IEditorTrack} from "../EditorTrack";

function EditorProvider<
  EngineType extends IEditorEngine = IEditorEngine,
  EngineStateType extends EditorEngineState = EditorEngineState,
  State extends EditorState = EditorState,
  StateActionType extends EditorStateAction = EditorStateAction,
  FileType extends IEditorFile = IEditorFile,
  ActionType extends IEditorAction = IEditorAction,
  TrackType extends IEditorTrack = IEditorTrack,
>(props: TimelineProviderProps<EngineType, State, StateActionType, FileType, TrackType, ActionType>) {

  const controllers = props.controllers ?? Controllers;
  Object.entries(controllers).forEach(([name, controller]) => {
    TimelineControllers[name] = controller;
  });
  TimelineFile.Controllers = controllers;

  const engine =
    props?.engine ??
    (new EditorEngine({
      events: new EditorEvents(),
      controllers,
    }) as IEditorEngine);
  const getState = () => {
    return engine.state as EditorEngineState;
  };

  const editorStateProps: ITimelineStateProps<EngineType, EngineStateType, FileType, TrackType, ActionType> = {
    ...props,
    getState,
    engine: engine as EngineType,
    selectedTrack: props.selectedTrack || undefined,
    selectedAction: props.selectedAction || undefined,
  };
  const state = createTimelineState<State, EngineType, EngineStateType, FileType, TrackType, ActionType>(editorStateProps);

  const localDb = getDbProps(SUIEditor, props.localDb);
  const reducer = EditorReducer as (state: State, stateAction: StateActionType) => State;
  return (
    <TimelineProvider<EngineType, EngineStateType, State, StateActionType, FileType>
      state={state}
      reducer={reducer}
      localDb={localDb}
    >
      {props.children}
    </TimelineProvider>
  );
}

EditorProvider.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  children: PropTypes.any,
  controllers: PropTypes.object,
  engine: PropTypes.object,
  file: PropTypes.any,
  localDb: PropTypes.oneOfType([
    PropTypes.oneOf([false]),
    PropTypes.shape({
      dbName: PropTypes.string.isRequired,
      disabled: PropTypes.bool.isRequired,
      initializeStores: PropTypes.arrayOf(PropTypes.string).isRequired,
      stores: PropTypes.arrayOf(PropTypes.string).isRequired,
    }),
  ]),
  reducer: PropTypes.func,
} as any;

export default EditorProvider;
