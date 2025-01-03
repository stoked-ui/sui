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

  protected _version: number = 0;


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

  static async fromUrl<AppFileType = EditorFile>(url: string, FileConstructor: Constructor<AppFileType> = EditorFile as unknown as Constructor<AppFileType>): Promise<AppFileType | null> {
    const editor = StokedUiEditorApp.getInstance();

    /*
    const urlLookup  = await LocalDb.loadByUrl({store: editor.defaultInputFileType.name, url});
    if (urlLookup) {
      const editorFile = await TimelineFile.fromLocalFile<AppFileType>(urlLookup.blob as Blob, FileConstructor) as EditorFile;
      if (editorFile) {
        editorFile.versions = urlLookup.versions;
      }
      return editorFile as AppFileType;
    }
    */
    const file = await TimelineFile.fromUrl<AppFileType>(url, FileConstructor) as ITimelineFile;
    if (!file) {
      return file;
    }

    await file.save({ silent: true, url });
    return file as AppFileType;
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
