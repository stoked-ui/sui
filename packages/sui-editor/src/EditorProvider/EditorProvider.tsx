/**
 * Provides a timeline editor component with state management.
 * @param {TimelineProviderProps} props - The props for the EditorProvider component.
 * @returns {JSX.Element} - The rendered EditorProvider component.
 */
function EditorProvider(props) {
  const controllers = props.controllers ?? Controllers;

  const engine =
    props?.engine ??
    (new EditorEngine({
      events: new EditorEvents(),
      controllers,
    }) as IEditorEngine);
  
  /**
   * Get the current state of the editor engine.
   * @returns {EditorEngineState} - The current state of the editor engine.
   */
  const getState = () => {
    return engine.state as EditorEngineState;
  };

  const editorStateProps = {
    ...props,
    getState,
    engine: engine as EngineType,
    selectedTrack: props.selectedTrack || undefined,
    selectedAction: props.selectedAction || undefined,
    app: props.app || StokedUiEditorApp.getInstance() as AppType,
    initialSettings: { refreshActionState, refreshTrackState, getDetail: getEditorDetail }
  };

  const state = createTimelineState(editorStateProps);

  const localDb = getDbProps(state.app.defaultInputFileType, props.localDb);
  
  const reducer = EditorReducer as (state: State, stateAction: StateActionType) => State;
  
  return (
    <TimelineProvider
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
