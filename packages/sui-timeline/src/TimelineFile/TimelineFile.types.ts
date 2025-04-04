import {IAppFile, IAppFileProps, IAppFileData } from "@stoked-ui/media-selector";
import {
  ITimelineFileTrack, ITimelineTrack, ITimelineTrackData,
} from "../TimelineTrack/TimelineTrack.types";

/**
 * The OutputBlob represents a file blob with metadata.
 */
export type OutputBlob = {
  /**
   * Unique identifier for the file.
   */
  id: string;
  /**
   * ID of the source where the file is located.
   */
  sourceId: string;
  /**
   * Version number of the file.
   */
  version: number;
  /**
   * Name of the file.
   */
  name: string;
  /**
   * Timestamp when the file was created.
   */
  created: number;
  /**
   * The actual file blob.
   */
  blob: Blob;
  /**
   * Size of the file in bytes.
   */
  size: number
};

/**
 * Interface representing a timeline file, extending IAppFile.
 *
 * @template TrackType Extends ITimelineTrack.
 * @template FileDataType Extends ITimelineFileData.
 */
export interface ITimelineFile<
  TrackType extends ITimelineTrack = ITimelineTrack,
  FileDataType extends ITimelineFileData = ITimelineFileData
> extends IAppFile {
  /**
   * Array of tracks in the timeline file.
   */
  tracks: TrackType[];
  
  /**
   * Preloads the editor with the given ID.
   *
   * @param {string} editorId - The ID of the editor to preload.
   * @returns {Promise<void>} A promise resolving when the editor is preloaded.
   */
  preload(editorId: string): Promise<void>;
  
  /**
   * Loads URLs in the timeline file.
   *
   * @returns {Promise<void>} A promise resolving when the URLs are loaded.
   */
  loadUrls(): Promise<void>;
  
  /**
   * Gets the data associated with this timeline file.
   *
   * @returns {FileDataType} The data associated with this timeline file.
   */
  get data(): FileDataType;
}

/**
 * Interface representing props for a timeline file, extending IAppFileProps.
 *
 * @template FileTrackType Extends ITimelineFileTrack.
 */
export interface ITimelineFileProps<FileTrackType = ITimelineFileTrack> extends Omit<IAppFileProps, 'mediaFiles'> {
  /**
   * Optional image URL for the timeline file.
   */
  image?: string;
  
  /**
   * Array of tracks in the timeline file.
   *
   * @default undefined
   */
  tracks?: FileTrackType[];
}

/**
 * Interface representing data associated with a timeline file, extending IAppFileData.
 *
 * @template TrackDataType Extends ITimelineTrackData.
 */
export interface ITimelineFileData<TrackDataType extends ITimelineTrackData = ITimelineTrackData> extends IAppFileData {
  /**
   * Array of track data in the timeline file.
   */
  tracks: TrackDataType[]
}

/**
 * Options for saving a file.
 */
export type SaveOptions = {
  /**
   * Optional ID for the saved file.
   */
  id?: string;
  /**
   * Acceptable types for files to be saved.
   *
   * @default undefined
   */
  types?: FilePickerAcceptType[];
  
  /**
   * Suggested name for the saved file.
   */
  suggestedName?: string;
  
  /**
   * Suggested file extension.
   */
  suggestedExt?: FileExtension,
};

/**
 * Props for a save dialog, combining SaveFilePickerOptions and { fileBlob: Blob }
 */
export type SaveDialogProps = SaveFilePickerOptions & { fileBlob: Blob }

/**
 * Enum representing the state of a file.
 */
export enum FileState {
  /**
   * The file is in an unknown state.
   */
  NONE = -1,
  /**
   * The file is being constructed.
   */
  CONSTRUCTED,
  /**
   * The file is initializing.
   */
  INITIALIZING,
  /**
   * The file is ready for use.
   */
  READY
}