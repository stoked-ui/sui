/**
 * @typedef {Object} DetailData
 * @property {string} name - The name of the detail data
 * @property {number} id - The unique identifier of the detail data
 * @property {string} url - The URL associated with the detail data
 */

/**
 * @typedef {Object} ITimelineActionDetail
 * @property {string} actionId - The ID of the timeline action
 * @property {number} startTime - The start time of the action
 * @property {number} endTime - The end time of the action
 */

/**
 * @typedef {Object} IProjectDetail
 * @property {string} projectId - The ID of the project
 * @property {string} projectName - The name of the project
 */

/**
 * @typedef {Object} ITimelineTrackDetail
 * @property {string} trackId - The ID of the timeline track
 * @property {string} trackName - The name of the track
 */

/**
 * @typedef {Object} BlendModeAction
 * @property {'SET_BLEND_MODE'} type - The type of action to set blend mode
 * @property {Object} payload - The payload containing contextId and value of BlendMode
 */

/**
 * @typedef {Object} SetFitAction
 * @property {'SET_FIT'} type - The type of action to set fit
 * @property {Object} payload - The payload containing contextId and value of Fit
 */

/**
 * @typedef {Object} SetContextActions
 * @property {BlendModeAction | SetFitAction} - The set of actions to set blend mode or fit
 */

/**
 * @typedef {Object} IEditorStateUnselected
 * @property {DetailData} detail - The detail data associated with the editor state
 * @property {Selection} selected - The selected item within the editor state
 */

/**
 * Function to add new media files to the editor state
 * @param {EditorState} state - The current editor state
 * @param {IMediaFile[]} newMediaFiles - The array of new media files to add
 * @returns {EditorState} - The updated editor state with new media files added
 */
export const onAddFiles = (state, newMediaFiles) => {
  ...
};

/**
 * Function to set blend mode for editor state
 * @param {string} key - The key to set in the editor state
 * @param {EditorState} state - The current editor state
 * @param {SetContextActions} stateAction - The action to set context
 * @returns {EditorState} - The updated editor state with blend mode or fit set
 */
const setContext = (key, state, stateAction) => {
  ...
};

/**
 * Reducer function for the editor timeline state
 * @param {EditorState} state - The current editor state
 * @param {EditorStateAction} stateAction - The action to update the editor state
 * @returns {EditorState} - The updated editor state after applying the action
 */
const EditorTimelineReducer = (state, stateAction) => {
  ...
};

/**
 * Base reducer function for the editor state
 * @param {EditorState} state - The current editor state
 * @param {EditorStateAction} stateAction - The action to update the editor state
 * @returns {EditorState} - The updated editor state after applying the action
 */
export function EditorReducerBase(state, stateAction) {
  ...
}

/**
 * Reducer function for the editor state with additional functionality
 * @param {State} state - The current editor state
 * @param {StateAction} stateAction - The action to update the editor state
 * @returns {State} - The updated editor state after applying the action
 */
export function EditorReducer(state, stateAction) {
  ...
}

/**
 * Context type for the editor state and dispatch
 * @type {Object}
 * @property {EditorState} state - The current editor state
 * @property {React.Dispatch<EditorStateAction>} dispatch - The dispatch function for editor state actions
 */
export type EditorContextType = { state: EditorState, dispatch: React.Dispatch<EditorStateAction> };
*/