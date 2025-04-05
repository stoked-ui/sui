/**
 * Interface representing the Editor State extending TimelineState.
 * 
 * @typedef {TimelineState<IEditorEngine, string | EditorEngineState, IEditorFile, IEditorTrack, IEditorAction>} EditorState
 */

/**
 * Retrieves action selection data based on the action ID and state.
 * 
 * @param {string} actionId - The ID of the action to retrieve
 * @param {TimelineState} state - The current timeline state
 * @returns {TimelineState} The updated timeline state with selected action data
 */
export const getActionSelectionData = (actionId, state) => {
  const { settings, file} = state;
  const tracks = file?.tracks ?? [];
  for (let i = 0; i < tracks.length; i += 1) {
    const t = tracks[i];
    const actionIndex = t.actions.findIndex((a) => a.id === actionId);
    if (actionIndex > -1) {
      settings.selectedTrackIndex = i;
      settings.selectedActionIndex = actionIndex;
      state = { ...state, settings, selectedTrack: {...tracks[state.settings.selectedTrackIndex]} };
      break;
    }
  }
  return state;
}

/**
 * Refreshes the state of a specific action within a track.
 * 
 * @param {IEditorAction} action - The action to refresh
 * @param {IEditorTrack} track - The track containing the action
 * @param {EditorState} state - The current editor state
 * @returns {IEditorAction} The updated action with refreshed state
 */
export const refreshActionState = (action, track, state) => {
  action = { ...action, ...refreshTimelineActionState(action, track, state)}
  action.dim = action.dim || track.hidden;
  return action;
}

/**
 * Refreshes the state of a specific track within the editor state.
 * 
 * @param {IEditorTrack} track - The track to refresh
 * @param {EditorState} state - The current editor state
 * @returns {IEditorTrack} The updated track with refreshed state
 */
export const refreshTrackState = (track, state) => {
  const {actions: timelineActions, ...timelineTrack} = refreshTimelineTrackState(track, state);
  track = {
    ...track, ...timelineTrack,
  };
  track.dim = track.dim || track.hidden;

  if (track.hidden && track.file?.media?.element) {
    track.file.media.element.style.display = track.hidden ? 'none' : 'flex';
  }
  const actions = track.actions.map((action, index) => {
    return {...action, ...refreshActionState(action, track, state)}
  });
  return { ...track, actions }
}