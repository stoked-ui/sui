import * as React from 'react';
import PropTypes from 'prop-types';
import { TimelineProvider, getDbProps, TimelineProviderProps, ITimelineStateProps, createTimelineState, TimelineFile } from '@stoked-ui/timeline';

/**
 * The EditorProvider component provides a high-level interface for managing the editor state and rendering the timeline.
 *
 * @param props - The component props
 */
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

  /**
   * The controllers prop is optional and defaults to the Controllers class if not provided.
   */
  const controllers = props.controllers ?? Controllers;

  /**
   * The engine prop is required and creates a new instance of the EditorEngine component with the provided events and controllers.
   */
  const engine =
    props?.engine ??
    (new EditorEngine({
      events: new EditorEvents(),
      controllers,
    }) as IEditorEngine);

  /**
   * Returns the current state of the editor engine.
   */
  const getState = () => {
    return engine.state as EditorEngineState;
  };

  /**
   * The initial state props object is created by merging the provided props with the necessary configuration for the timeline provider.
   */
  const editorStateProps: ITimelineStateProps<EngineType, EngineStateType, FileType, TrackType, ActionType, AppType> = {
    ...props,
    getState,
    engine: engine as EngineType,
    selectedTrack: props.selectedTrack || undefined,
    selectedAction: props.selectedAction || undefined,
    app: props.app || StokedUiEditorApp.getInstance() as AppType,
    initialSettings: { refreshActionState, refreshTrackState, getDetail: getEditorDetail }
  };

  /**
   * Creates a new instance of the timeline state using the provided editor state props.
   */
  const state = createTimelineState<State, EngineType, EngineStateType, FileType, TrackType, ActionType, AppType>(editorStateProps);

  /**
   * The local db prop is used to configure the database for the timeline provider.
   */
  const localDb = getDbProps(state.app.defaultInputFileType, props.localDb);

  /**
   * The reducer function is required and must return a new state value after applying the provided state action.
   */
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