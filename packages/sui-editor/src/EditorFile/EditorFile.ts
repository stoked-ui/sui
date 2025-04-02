import { File, Blob } from 'formdata-node';
import {
  TimelineFile,
  ITimelineFile,
  ITimelineFileProps,
  ITimelineFileData,
  ITimelineTrackData,
} from '@stoked-ui/timeline';
import {Constructor, IMimeType, LocalDb, Versions} from '@stoked-ui/common';

import {
  IMediaFile, AppOutputFile, AppFile, MediaType,
} from '@stoked-ui/media-selector';
import {
  BlendMode, Fit,
  IEditorAction,
  IEditorFileAction,
} from "../EditorAction/EditorAction";
import { IEditorFileTrack, IEditorTrack } from "../EditorTrack/EditorTrack";
import {StokedUiEditorApp} from "../Editor";
import * as React from 'react';
import { openDB, getOrFetchVideo } from '@stoked-ui/common';

export const editorFileCache: Record<string, any> = {};

export interface IEditorFileProps<FileTrackType extends IEditorFileTrack = IEditorFileTrack>
  extends ITimelineFileProps<FileTrackType> {
  blendMode?: BlendMode;
  fit?: Fit;
  width?: number;
  height?: number;
  backgroundColor?: string;
}

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

export class SUVideoFile extends AppOutputFile {

}

export type IEditorTrackData<TrackType extends IEditorTrack = IEditorTrack> = ITimelineTrackData<TrackType> & {
  blendMode?: BlendMode;
  fit?: Fit;
  actions: IEditorAction[];
}

export interface IEditorFileData<TrackDataType extends IEditorTrackData = IEditorTrackData> extends ITimelineFileData<TrackDataType> {
  blendMode?: BlendMode;
  fit?: Fit;
  width?: number;
  height?: number;
  backgroundColor?: string;
  tracks: TrackDataType[];
}

// Define a type guard for checking track source
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

  blendMode: BlendMode;

  fit: Fit;

  backgroundColor?: string;

  width: number = 1920;

  height: number = 1080;

  private _videoSources: Record<string, string> = {};
  private _isVideoLoaded: boolean = false;

  constructor(props: IEditorFileProps<FileTrackType>) {
    // editorFileCache[props.id as string] = JSON.stringify(props);
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

  async updateStore() {
    const editor = StokedUiEditorApp.getInstance();
    const nameLookup = await LocalDb.loadByName({store: editor.defaultInputFileType.name, name: this.fullName});

    this.versions = nameLookup?.versions || [];
    this.videos = nameLookup?.videos || [];
  }

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

  async preload(editorId: string) {
    // Call parent preload first
    await super.preload(editorId);

    // Show loader while we're loading videos
    this._isVideoLoaded = false;

    try {
      // Open IndexedDB
      const db = await openDB();

      // Collect all video sources from tracks that have a source URL
      const videoSourcesToLoad: { url: string; id: string }[] = [];

      this.tracks.forEach(track => {
        // Use the type guard to check for valid source
        if (hasValidSource(track)) {
          videoSourcesToLoad.push({
            url: track.source.url,
            id: `${editorId}_${track.id}`
          });
        }
      });

      // Load all videos into IndexedDB and create object URLs
      await Promise.all(
        videoSourcesToLoad.map(async ({ url, id }) => {
          const blob = await getOrFetchVideo(db, url, id);
          this._videoSources[id] = URL.createObjectURL(blob);
        })
      );

      // Update tracks with object URLs
      this.tracks.forEach(track => {
        // Use the type guard again for updating the tracks
        if (hasValidSource(track)) {
          const videoId = `${editorId}_${track.id}`;
          if (this._videoSources[videoId]) {
            // Now we can safely assign to cachedUrl
            track.source.cachedUrl = this._videoSources[videoId];
          }
        }
      });

      this._isVideoLoaded = true;

      // Update store after modifying tracks
      await this.updateStore();
    } catch (error) {
      console.error("Error preloading videos:", error);
      // Still mark as loaded even on error so the UI doesn't get stuck
      this._isVideoLoaded = true;
    }
  }

  // Add cleanup method to be called when editor file is disposed
  cleanup(): void {
    // Revoke all object URLs to prevent memory leaks
    Object.values(this._videoSources).forEach(url => URL.revokeObjectURL(url));
    this._videoSources = {};

    // Since super.cleanup() doesn't exist, don't call it
    // The error showed that TimelineFile doesn't have a cleanup method
  }

  // Method to check if videos are loaded
  isVideoLoaded(): boolean {
    return this._isVideoLoaded;
  }

  /**
   * Loads a AppFile instance from the local file system.
   * @param file A File object from an attached drive.
   * @param FileConstructor
   */
  static async fromLocalFile<AppFileType = EditorFile>(file: Blob, FileConstructor: Constructor<AppFileType>): Promise<AppFileType> {
    const editorFile = await TimelineFile.fromLocalFile<AppFileType>(file, FileConstructor) as EditorFile;
    await editorFile.updateStore();
    return editorFile as unknown as AppFileType;
  }

  static fileCache: Record<string, EditorFile> = {};

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

  static mimeType: IMimeType
}

