import {
  TimelineContextType,
  TimelineState,
  refreshActionState as refreshTimelineActionState,
  refreshTrackState as refreshTimelineTrackState,
} from '@stoked-ui/timeline';
import {EditorEngineState, IEditorEngine} from "../EditorEngine";
import {IEditorFile} from '../EditorFile';
import {IEditorTrack} from "../EditorTrack";
import {IEditorAction} from "../EditorAction";

/**
 * The state of the editor.
 *
 * @extends {TimelineState<IEditorEngine, string | EditorEngineState, IEditorFile, IEditorTrack, IEditorAction>}
 */
export default interface EditorState extends TimelineState<
  IEditorEngine,
  string | EditorEngineState,
  IEditorFile,
  IEditorTrack,
  IEditorAction
> { }

/**
 * Retrieves the selection data for an action.
 *
 * @param {string} actionId - The ID of the action to retrieve data for.
 * @param {TimelineState} state - The current state of the timeline.
 * @returns {EditorState} The updated state with the action selection data.
 */
export const getActionSelectionData = (actionId: string, state: TimelineState) => {
  /**
   * Extracts settings and file from the state.
   *
   * @type {Object}
   */
  const { settings, file } = state;
  
  /**
   * Gets an array of tracks for the current file.
   *
   * @type {Array<IEditorTrack>}
   */
  const tracks = file?.tracks ?? [];
  
  for (let i = 0; i < tracks.length; i += 1) {
    const t = tracks[i];
    
    /**
     * Finds the index of the action in the track's actions array.
     *
     * @type {number}
     */
    const actionIndex = t.actions.findIndex((a) => a.id === actionId);
    
    if (actionIndex > -1) {
      settings.selectedTrackIndex = i;
      settings.selectedActionIndex = actionIndex;
      
      /**
       * Updates the state with the selected track and actions.
       *
       * @type {EditorState}
       */
      state = { ...state, settings, selectedTrack: {...tracks[state.settings.selectedTrackIndex]} };
      
      break;
    }
  }
  
  return state;
}

/**
 * Refreshes the action state for a given action, track, and state.
 *
 * @param {IEditorAction} action - The action to refresh.
 * @param {IEditorTrack} track - The track for which to refresh the action.
 * @param {EditorState} state - The current state of the editor.
 * @returns {IEditorAction} The refreshed action state.
 */
export const refreshActionState = (action: IEditorAction, track: IEditorTrack, state: EditorState) => {
  /**
   * Refreshes the action using the `refreshTimelineActionState` function from '@stoked-ui/timeline'.
   *
   * @type {IEditorAction}
   */
  action = { ...action, ...refreshTimelineActionState(action, track, state) }
  
  /**
   * Sets the dim attribute of the action to either track.hidden or track.dim.
   *
   * @type {boolean}
   */
  action.dim = action.dim || track.hidden;
  
  return action;
}

/**
 * Refreshes the track state for a given track and state.
 *
 * @param {IEditorTrack} track - The track to refresh.
 * @param {EditorState} state - The current state of the editor.
 * @returns {IEditorTrack} The refreshed track state.
 */
export const refreshTrackState = (track: IEditorTrack, state: EditorState) => {
  /**
   * Refreshes the actions for the track using `refreshTimelineTrackState` from '@stoked-ui/timeline'.
   *
   * @type {Object}
   */
  const { actions: timelineActions, ...timelineTrack } = refreshTimelineTrackState(track, state);
  
  /**
   * Creates a new track object with the refreshed actions and other properties.
   *
   * @type {IEditorTrack}
   */
  track = {
    ...track, 
    ...timelineTrack,
  };
  
  /**
   * Sets the dim attribute of the track to either track.hidden or track.dim.
   *
   * @type {boolean}
   */
  track.dim = track.dim || track.hidden;
  
  if (track.hidden && track.file?.media?.element) {
    /**
     * Updates the display style of the media element based on the track's hidden state.
     *
     * @type {string}
     */
    track.file.media.element.style.display = track.hidden ? 'none' : 'flex';
  }
  
  /**
   * Maps over the actions array and refreshes each action using `refreshActionState`.
   *
   * @type {Array<IEditorAction>}
   */
  const actions = track.actions.map((action, index) => {
    return {...action, ...refreshActionState(action, track, state)}
  });
  
  /**
   * Returns the updated track object with refreshed actions.
   *
   * @type {IEditorTrack}
   */
  return { ...track, actions }
}