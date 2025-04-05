/**
 * Interface for a media file.
 * @typedef {Object} IMediaFile
 * @property {string} id - The ID of the media file.
 * @property {string} name - The name of the media file.
 * @property {string} url - The URL of the media file.
 * @property {string} mediaType - The type of media.
 */

/**
 * Interface for a named ID.
 * @typedef {Function} namedId
 */

/**
 * Interface for a timeline action.
 * @typedef {Object} ITimelineAction
 */

/**
 * Interface for a timeline track.
 * @typedef {Object} ITimelineTrack
 */

/**
 * Interface for a timeline file.
 * @typedef {Object} ITimelineFile
 */

/**
 * Type representing different types of selections.
 * @typedef {ITimelineAction | ITimelineTrack | ITimelineFile} SelectionType
 */

/**
 * Interface for project details.
 * @typedef {Object} IProjectDetail
 * @property {string} id - The ID of the project.
 * @property {string} name - The name of the project.
 * @property {string} [description] - The description of the project.
 * @property {string} [author] - The author of the project.
 * @property {number} created - The creation timestamp.
 * @property {number} [lastModified] - The last modified timestamp.
 */

/**
 * Interface for file details.
 * @typedef {Object} IFileDetail
 * @property {string} id - The ID of the file.
 * @property {string} name - The name of the file.
 * @property {string} url - The URL of the file.
 * @property {string} mediaType - The type of media.
 * @property {string} [path] - The path of the file.
 * @property {string} webkitRelativePath - The webkitRelativePath.
 * @property {number} created - The creation timestamp.
 * @property {number} [lastModified] - The last modified timestamp.
 * @property {number} size - The size of the file.
 * @property {string} type - The type of the file.
 * @property {number} [duration] - The duration of the file.
 */

/**
 * Interface for timeline track details.
 * @typedef {Object} ITimelineTrackDetail
 * @property {string} id - The ID of the timeline track.
 * @property {string} name - The name of the timeline track.
 * @property {boolean} muted - Flag indicating if the track is muted.
 * @property {boolean} locked - Flag indicating if the track is locked.
 * @property {string} [url] - The URL of the track.
 */

/**
 * Interface for timeline action details.
 * @typedef {Object} ITimelineActionDetail
 * @property {string} id - The ID of the timeline action.
 * @property {string} name - The name of the timeline action.
 * @property {number} start - The start time of the action.
 * @property {number} end - The end time of the action.
 * @property {Array} volume - The volume settings of the action.
 * @property {number} trimStart - The start time for trimming.
 * @property {number} trimEnd - The end time for trimming.
 */

/**
 * Type representing project details.
 * @typedef {Object} ProjectDetail
 */

/**
 * Type representing track details.
 * @typedef {Object} TrackDetail
 */

/**
 * Type representing action details.
 * @typedef {Object} ActionDetail
 */

/**
 * Type representing settings details.
 * @typedef {Object} SettingsDetail
 */

/**
 * Type representing detail data.
 * @typedef {ActionDetail | TrackDetail | ProjectDetail | SettingsDetail} DetailData
 */

/**
 * Function to get project details.
 * @param {ITimelineFile} project - The project information.
 * @returns {IProjectDetail} - The project details.
 */
export function getProjectDetail(project: ITimelineFile): IProjectDetail {}

/**
 * Function to get action details.
 * @param {ITimelineAction} action - The action information.
 * @returns {ITimelineActionDetail} - The action details.
 */
export function getActionDetail(action: ITimelineAction): ITimelineActionDetail {}

/**
 * Function to get track details.
 * @param {ITimelineTrack} track - The track information.
 * @returns {ITimelineTrackDetail} - The track details.
 */
export function getTrackDetail(track: ITimelineTrack): ITimelineTrackDetail {}

/**
 * Function to get file details.
 * @param {IMediaFile} file - The file information.
 * @returns {IFileDetail} - The file details.
 */
export function getFileDetail(file: IMediaFile): IFileDetail {}

/**
 * Type representing props for getting detail.
 * @typedef {Object} GetDetailProps
 * @property {ITimelineFile} file - The timeline file.
 * @property {ITimelineAction} selectedAction - The selected action.
 * @property {ITimelineTrack} selectedTrack - The selected track.
 * @property {SelectionTypeName} selectedType - The selected type.
 */

/**
 * Type representing the result of a selection.
 * @typedef {Object} SelectionResult
 */

/**
 * Type representing the detail of a selection.
 * @typedef {Object} SelectionDetail
 */

/**
 * Function to get selected item.
 * @param {Object} props - The props object.
 * @returns {SelectionResult} - The selected item result.
 */
export function getSelected(props: { selectedAction: any, selectedTrack: any, file: any, selectedType: SelectionTypeName }): SelectionResult {}

/**
 * Function to get detail information.
 * @param {GetDetailProps} props - The props object.
 * @returns {SelectionDetail | null} - The detail information.
 */
export function getDetail(props: GetDetailProps & any): SelectionDetail | null {}

/**
 * Yup schema for ITimelineActionDetail.
 */
export const actionObjectSchema = yup.object({});

/**
 * Yup schema for project details.
 */
export const projectObjectSchema = yup.object({});

/**
 * Yup schema for ITimelineTrackDetail.
 */
export const trackObjectSchema = yup.object({});
