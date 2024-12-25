import * as React from 'react';
import PropTypes from 'prop-types';
import { TimelineProvider, getDbProps, TimelineProviderProps, ITimelineStateProps, createTimelineState, TimelineFile } from '@stoked-ui/timeline';
import Controllers from '../Controllers/Controllers';
import EditorEngine from '../EditorEngine/EditorEngine';
import { EditorEngineState, IEditorEngine } from '../EditorEngine/EditorEngine.types';
import { EditorEvents } from '../EditorEngine';
import { EditorReducer, EditorStateAction } from './EditorProvider.types';
import { IEditorFile } from '../EditorFile/EditorFile';
import EditorState, {refreshActionState, refreshTrackState} from './EditorState';
import {IEditorAction} from "../EditorAction";
import {IEditorTrack} from "../EditorTrack";
import {StokedUiEditorApp} from "../Editor";
import {getEditorDetail} from "../DetailView/Detail.types";

TimelineFile.Controllers = Controllers;
function EditorProvider<
  EngineType extends IEditorEngine = IEditorEngine,
  EngineStateType extends EditorEngineState = EditorEngineState,
  State extends EditorState = EditorState,
  StateActionType extends EditorStateAction = EditorStateAction,
  FileType extends IEditorFile = IEditorFile,
  ActionType extends IEditorAction = IEditorAction,
  TrackType extends IEditorTrack = IEditorTrack,
  AppType extends StokedUiEditorApp = StokedUiEditorApp
>(props: TimelineProviderProps<EngineType, State, StateActionType, FileType, TrackType, ActionType, AppType>) {

  const controllers = props.controllers ?? Controllers;

  const engine =
    props?.engine ??
    (new EditorEngine({
      events: new EditorEvents(),
      controllers,
    }) as IEditorEngine);
  const getState = () => {
    return engine.state as EditorEngineState;
  };

  const editorStateProps: ITimelineStateProps<EngineType, EngineStateType, FileType, TrackType, ActionType, AppType> = {
    ...props,
    getState,
    engine: engine as EngineType,
    selectedTrack: props.selectedTrack || undefined,
    selectedAction: props.selectedAction || undefined,
    app: props.app || StokedUiEditorApp.getInstance() as AppType,
    initialSettings: { refreshActionState, refreshTrackState, getDetail: getEditorDetail }
  };

  const state = createTimelineState<State, EngineType, EngineStateType, FileType, TrackType, ActionType, AppType>(editorStateProps);

  const localDb = getDbProps(state.app.defaultInputFileType, props.localDb);
  const reducer = EditorReducer as (state: State, stateAction: StateActionType) => State;
  return (
    <TimelineProvider<
        EngineType,
        EngineStateType,
        State,
        StateActionType,
        FileType,
        TrackType,
        ActionType,
        AppType
      >
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
