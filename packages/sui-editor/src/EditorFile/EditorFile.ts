/**
 * Definition of file and blob imports.
 */
import { File, Blob } from 'formdata-node';

/**
 * Definition of timeline file interfaces and types.
 */
import {
  TimelineFile,
  ITimelineFile,
  ITimelineFileProps,
  ITimelineFileData,
  ITimelineTrackData,
} from '@stoked-ui/timeline';

/**
 * Definition of common interfaces and types.
 */
import {Constructor, IMimeType, LocalDb, Versions} from '@stoked-ui/common';

/**
 * Definition of media file interfaces and types.
 */
import {
  IMediaFile, AppOutputFile, AppFile, MediaType,
} from '@stoked-ui/media-selector';

/**
 * Definition of editor action interfaces and types.
 */
import {
  BlendMode, Fit,
  IEditorAction,
  IEditorFileAction,
} from "../EditorAction/EditorAction";

/**
 * Definition of editor track interfaces and types.
 */
import { IEditorFileTrack, IEditorTrack } from "../EditorTrack/EditorTrack";

/**
 * Definition of the Stoked UI Editor application.
 */
import {StokedUiEditorApp} from "../Editor";

/**
 * Import React library.
 */
import * as React from 'react';

/**
 * Import openDB and getOrFetchVideo functions from common package.
 */
import { openDB, getOrFetchVideo } from '@stoked-ui/common';

/**
 * Cache for editor files.
 */
export const editorFileCache: Record<string, any> = {};

/**
 * Props interface for editor file component.
 * @typedef {Object} IEditorFileProps
 * @property {BlendMode} [blendMode='normal'] - The blend mode of the editor file.
 * @property {Fit} [fit='none'] - The fit mode of the editor file.
 * @property {number} [width=1920] - The width of the editor file.
 * @property {number} [height=1080] - The height of the editor file.
 * @property {string} [backgroundColor='transparent'] - The background color of the editor file.
 */
export interface IEditorFileProps<FileTrackType extends IEditorFileTrack = IEditorFileTrack>
  extends ITimelineFileProps<FileTrackType> {
  blendMode?: BlendMode;
  fit?: Fit;
  width?: number;
  height?: number;
  backgroundColor?: string;
}

/**
 * Interface for editor file.
 * @typedef {Object} IEditorFile
 * @property {string} [image] - The image of the editor file.
 * @property {string} [backgroundColor] - The background color of the editor file.
 * @property {number} width - The width of the editor file.
 * @property {number} height - The height of the editor file.
 * @property {IMediaFile} video - The video of the editor file.
 * @property {BlendMode} blendMode - The blend mode of the editor file.
 * @property {Fit} fit - The fit mode of the editor file.
 */
export interface IEditorFile<
  TrackType extends IEditorTrack = IEditorTrack,
  FileDataType extends IEditorFileData = IEditorFileData
>  extends ITimelineFile< TrackType, FileDataType> {
  image?: string;
  backgroundColor?: string;
  width: number;
  height: number;
  video?: IMediaFile;
  blendMode: BlendMode;
  fit: Fit;
  updateStore(): Promise<void>;
}

/**
 * Class representing an SU Video File.
 */
export class SUVideoFile extends AppOutputFile {

}

/**
 * Data interface for editor track.
 * @typedef {Object} IEditorTrackData
 * @property {BlendMode} [blendMode] - The blend mode of the editor track.
 * @property {Fit} [fit] - The fit mode of the editor track.
 * @property {IEditorAction[]} actions - The actions associated with the editor track.
 */
export type IEditorTrackData<TrackType extends IEditorTrack = IEditorTrack> = ITimelineTrackData<TrackType> & {
  blendMode?: BlendMode;
  fit?: Fit;
  actions: IEditorAction[];
}

/**
 * Data interface for editor file.
 * @typedef {Object} IEditorFileData
 * @property {BlendMode} [blendMode] - The blend mode of the editor file data.
 * @property {Fit} [fit] - The fit mode of the editor file data.
 * @property {number} width - The width of the editor file data.
 * @property {number} height - The height of the editor file data.
 * @property {string} [backgroundColor] - The background color of the editor file data.
 * @property {TrackDataType[]} tracks - The tracks associated with the editor file data.
 */
export interface IEditorFileData<TrackDataType extends IEditorTrackData = IEditorTrackData> extends ITimelineFileData<TrackDataType> {
  blendMode?: BlendMode;
  fit?: Fit;
  width?: number;
  height?: number;
  backgroundColor?: string;
  tracks: TrackDataType[];
}

/**
 * Type guard for checking track source validity.
 * @param {any} track - The track to check.
 * @returns {boolean} - True if track has valid source, false otherwise.
 */
function hasValidSource(track: any): track is { source: { url: string, cachedUrl?: string }, id: string } {
  return track
    && typeof track === 'object'
    && 'source' in track
    && track.source
    && typeof track.source === 'object'
    && 'url' in track.source
    && typeof track.source.url === 'string'
    && 'id' in track
    && typeof track.id === 'string';
}

/**
 * Class representing an Editor File.
 */
export default class EditorFile<
  FileTrackType extends IEditorFileTrack = IEditorFileTrack,
  TrackType extends IEditorTrack = IEditorTrack,
  FileActionType extends IEditorFileAction = IEditorFileAction,
  ActionType extends IEditorAction = IEditorAction,
  FileDataType extends IEditorFileData = IEditorFileData,
> extends TimelineFile<
  FileTrackType,
  TrackType,
  FileActionType,
  ActionType,
  FileDataType
> implements IEditorFile<
  TrackType,
  FileDataType
> {

  /**
   * The blend mode of the editor file.
   */
  blendMode: BlendMode;

  /**
   * The fit mode of the editor file.
   */
  fit: Fit;

  /**
   * The background color of the editor file.
   */
  backgroundColor?: string;

  /**
   * The width of the editor file.
   */
  width: number = 1920;

  /**
   * The height of the editor file.
   */
  height: number = 1080;

  /**
   * Record to store video sources.
   */
  private _videoSources: Record<string, string> = {};

  /**
   * Flag to indicate if videos are loaded.
   */
  private _isVideoLoaded: boolean = false;

  /**
   * Constructor for EditorFile class.
   * @param {IEditorFileProps<FileTrackType>} props - The props for the editor file.
   */
  constructor(props: IEditorFileProps<FileTrackType>) {
    super(props);

    this.backgroundColor = props.backgroundColor ?? 'transparent';
    this.width = props.width ?? 1920;
    this.height = props.height ?? 1080;
    this._type = 'application/stoked-ui-editor-project';
    let baseIndex = 0;
    this._tracks?.forEach((track, trackIndex) => {
      baseIndex = trackIndex;
      track.blendMode = track.blendMode ?? 'normal';
      track.fit = track.fit ?? 'none';
      track.actions?.forEach((action, actionIndex) => {
        action.z = baseIndex;
        action.blendMode = action.blendMode ?? 'normal';
        action.fit = action.fit ?? 'none';
      });
    });

    this.blendMode = props.blendMode ?? 'normal';
    this.fit = props.fit ?? 'none';
  }

  /**
   * Get the data of the editor file.
   * @returns {FileDataType} - The data of the editor file.
   */
  get data(): FileDataType {
    const timelineTracks = super.data.tracks;
    const editorTracks = (timelineTracks.map((trackData) => {
      return {
        ...trackData,
        blendMode: trackData.blendMode ?? 'normal',
        fit: trackData.fit ?? 'normal',
        actions: trackData.actions.map((actionData) => {
          return {
            ...actionData,
            blendMode: actionData.blendMode ?? 'normal',
            fit: actionData.fit ?? 'normal',
          }
        })
      }
    }) || []) as IEditorTrackData[];

    return {
      ...super.data,
      backgroundColor: this.backgroundColor,
      width: 1920,
      height: 1080,
      blendMode: this.blendMode,
      tracks: editorTracks as IEditorTrackData[],
    } as FileDataType;
  }

  /**
   * Asynchronously update the store of the editor file.
   */
  async updateStore() {
    const editor = StokedUiEditorApp.getInstance();
    const nameLookup = await LocalDb.loadByName({store: editor.defaultInputFileType.name, name: this.fullName});

    this.versions = nameLookup?.versions || [];
    this.videos = nameLookup?.videos || [];
  }

  /**
   * Asynchronously create an editor file instance from a URL.
   * @param {string} url - The URL of the editor file.
   * @param {Constructor<AppFileType>} [FileConstructor=EditorFile] - The file constructor.
   * @returns {Promise<AppFileType | null>} - A promise resolving to the editor file instance or null.
   */
  static async fromUrl<AppFileType = EditorFile>(url: string, FileConstructor: Constructor<AppFileType> = EditorFile as unknown as Constructor<AppFileType>): Promise<AppFileType | null> {

    const editor = StokedUiEditorApp.getInstance();
    const urlLookup = await LocalDb.loadByUrl({store: editor.defaultInputFileType.name, url});
    if (urlLookup) {
      const editorFile = await this.fromLocalFile<AppFileType>(urlLookup.blob as Blob, FileConstructor) as EditorFile;
      await editorFile.updateStore();
      return editorFile as AppFileType;
    }
    const file = await TimelineFile.fromUrl<AppFileType>(url, FileConstructor) as IEditorFile;

    if (!file) {
      return file;
    }

    await file.updateStore();
    await file.save({ silent: true, url });

    return file as AppFileType;
  }

  /**
   * Asynchronously preload the editor file.
   * @param {string} editorId - The ID of the editor.
   */
  async preload(editorId: string) {
    await super.preload(editorId);
    this._isVideoLoaded = false;

    try {
      const db = await openDB();
      const videoSourcesToLoad: { url: string; id: string }[] = [];

      this.tracks.forEach(track => {
        if (hasValidSource(track)) {
          videoSourcesToLoad.push({
            url: track.source.url,
            id: `${editorId}_${track.id}`
          });
        }
      });

      await Promise.all(
        videoSourcesToLoad.map(async ({ url, id }) => {
          const blob = await getOrFetchVideo(db, url, id);
          this._videoSources[id] = URL.createObjectURL(blob);
        }
      );

      this.tracks.forEach(track => {
        if (hasValidSource(track)) {
          const videoId = `${editorId}_${track.id}`;
          if (this._videoSources[videoId]) {
            track.source.cachedUrl = this._videoSources[videoId];
          }
        }
      });

      this._isVideoLoaded = true;
      await this.updateStore();
    } catch (error) {
      console.error("Error preloading videos:", error);
      this._isVideoLoaded = true;
    }
  }

  /**
   * Clean up method to be called when editor file is disposed.
   */
  cleanup(): void {
    Object.values(this._videoSources).forEach(url => URL.revokeObjectURL(url));
    this._videoSources = {};
  }

  /**
   * Check if videos are loaded.
   * @returns {boolean} - True if videos are loaded, false otherwise.
   */
  isVideoLoaded(): boolean {
    return this._isVideoLoaded;
  }

  /**
   * Asynchronously load an AppFile instance from a local file.
   * @param {Blob} file - The file object from an attached drive.
   * @param {Constructor<AppFileType>} FileConstructor - The file constructor.
   * @returns {Promise<AppFileType>} - A promise resolving to the AppFile instance.
   */
  static async fromLocalFile<AppFileType = EditorFile>(file: Blob, FileConstructor: Constructor<AppFileType>): Promise<AppFileType> {
    const editorFile = await TimelineFile.fromLocalFile<AppFileType>(file, FileConstructor) as EditorFile;
    await editorFile.updateStore();
    return editorFile as unknown as AppFileType;
  }

  /**
   * Static method to convert editor files to file base array.
   * @param {IEditorFile[]} files - The editor files to convert.
   * @param {IMimeType} mime - The mime type.
   * @returns {Object[]} - An array of file base objects.
   */
  static toFileBaseArray(files: IEditorFile[], mime: IMimeType) {
    return files.map((file, index) => {
      const editorFile = file as IEditorFile;
      return {
        id: editorFile.id,
        name: editorFile.name,
        lastModified: editorFile.lastModified,
        mediaType: 'project',
        type: mime.type,
        created: editorFile.created,
        visibleIndex: index,
      }
    })
  }

  /**
   * The mime type for the editor file.
   */
  static mimeType: IMimeType
}
