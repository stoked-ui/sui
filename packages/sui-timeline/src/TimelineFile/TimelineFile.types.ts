/**
 * @typedef {Object} OutputBlob
 * @property {string} id - The unique identifier of the output blob
 * @property {string} sourceId - The source identifier of the output blob
 * @property {number} version - The version number of the output blob
 * @property {string} name - The name of the output blob
 * @property {number} created - The creation timestamp of the output blob
 * @property {Blob} blob - The blob data of the output
 * @property {number} size - The size of the output blob
 */

/**
 * @interface ITimelineFile
 * @extends IAppFile
 * @template TrackType - The type of tracks in the timeline file
 * @template FileDataType - The type of data in the timeline file
 */
export interface ITimelineFile<
  TrackType extends ITimelineTrack = ITimelineTrack,
  FileDataType extends ITimelineFileData = ITimelineFileData
> extends IAppFile {
  tracks: TrackType[];
  /**
   * Preloads the timeline file for the specified editor.
   * @param {string} editorId - The editor identifier
   * @returns {Promise<void>}
   */
  preload(editorId: string): Promise<void>;
  /**
   * Loads URLs for the timeline file.
   * @returns {Promise<void>}
   */
  loadUrls(): Promise<void>;
  /**
   * Gets the data of the timeline file.
   * @returns {FileDataType}
   */
  get data(): FileDataType;
}

/**
 * @interface ITimelineFileProps
 * @extends Omit<IAppFileProps, 'mediaFiles'>
 * @template FileTrackType - The type of tracks in the timeline file props
 */
export interface ITimelineFileProps<FileTrackType = ITimelineFileTrack> extends Omit<IAppFileProps, 'mediaFiles'> {
  /**
   * The image associated with the timeline file props.
   * @type {string}
   */
  image?: string;
  /**
   * The tracks associated with the timeline file props.
   * @type {FileTrackType[]}
   */
  tracks?: FileTrackType[];
}

/**
 * @interface ITimelineFileData
 * @extends IAppFileData
 * @template TrackDataType - The type of track data in the timeline file
 */
export interface ITimelineFileData<TrackDataType extends ITimelineTrackData = ITimelineTrackData> extends IAppFileData {
  /**
   * The tracks data of the timeline file.
   * @type {TrackDataType[]}
   */
  tracks: TrackDataType[]
}

/**
 * @typedef {Object} SaveOptions
 * @property {string} id - The identifier for saving options
 * @property {FilePickerAcceptType[]} types - The accepted file types for saving
 * @property {string} suggestedName - The suggested name for saving
 * @property {FileExtension} suggestedExt - The suggested extension for saving
 */

/**
 * @typedef {Object} SaveDialogProps
 * @property {SaveFilePickerOptions} - The options for saving dialog
 * @property {Blob} fileBlob - The blob data for saving
 */

/**
 * Enum representing the state of a file.
 * @enum {number}
 */
export enum FileState {
  NONE = -1,
  CONSTRUCTED,
  INITIALIZING,
  READY
}
**/