import {
  TimelineFile,
  OutputBlob,
  ITimelineFile,
  ITimelineFileProps,
  Controller,
  IMimeType,
  ProjectOutputFile, IProjectOutputFileProps, Constructor,
  MimeRegistry,
} from '@stoked-ui/timeline';
import { getFileName, getMimeType, IMediaFile } from '@stoked-ui/media-selector';
import Controllers from '../Controllers/Controllers';
import {
  BlendMode, Fit,
  IEditorAction,
  IEditorFileAction,
  initEditorAction
} from "../EditorAction/EditorAction";
import { IEditorEngine, IEditorTrack } from "../EditorEngine";
import { IEditorFileTrack } from "../EditorTrack/EditorTrack";

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
>  extends ITimelineFile< TrackType> {
  image?: string;
  backgroundColor?: string;
  width: number;
  height: number;
  video?: IMediaFile;
  blendMode: BlendMode;
  fit: Fit;
}

// @ts-ignore
export const SUIEditor: IMimeType = MimeRegistry.create('stoked-ui', 'timeline', '.sue', 'Stoked UI - Editor Project File');
export const SUIVideo: IMimeType = MimeRegistry.create('stoked-ui', 'video', '.suv', 'Stoked UI - Video File');

export class SUVideoFile extends ProjectOutputFile {
  file: IMediaFile;

  sourceId: string;

  constructor(props: IProjectOutputFileProps) {
    super(props);
    this.file = props.file;
    this.sourceId = props.sourceId;
  }
}


TimelineFile.globalControllers = Controllers;

export default class EditorFile<
  FileActionType extends IEditorFileAction = IEditorFileAction,
  ActionType extends IEditorAction = IEditorAction,
  FileTrackType extends IEditorFileTrack = IEditorFileTrack,
  TrackType extends IEditorTrack = IEditorTrack,
  EngineType extends IEditorEngine = IEditorEngine,
> extends TimelineFile<
  FileTrackType, TrackType
> implements IEditorFile<
  TrackType
> {

  protected _tracks?: TrackType[];

  blendMode: BlendMode;

  fit: Fit;

  backgroundColor?: string;

  width: number = 1920;

  height: number = 1080;

  protected _version: number = 0;

  constructor(props: IEditorFileProps<FileTrackType>) {
    editorFileCache[props.id as string] = JSON.stringify(props);
    super(props);

    this.mimeType = SUIEditor;
    this.outputMimeTypes = [SUIVideo];

    this.backgroundColor = props.backgroundColor ?? 'transparent';
    this.width = props.width ?? 1920;
    this.height = props.height ?? 1080;

    props.tracks?.forEach((track) => {
      track.blendMode = track.blendMode ?? 'normal';
      track.fit = track.fit ?? 'none';
      track.actions?.forEach((action) => {
        action.blendMode = action.blendMode ?? 'normal';
        action.fit = action.fit ?? 'none';
      });
    });

    this.blendMode = props.blendMode ?? 'normal';

    this.fit = props.fit ?? 'none';
  }

  get fileProps() {
    return {
      ...super.fileProps,
      backgroundColor: this.backgroundColor,
      width: 1920,
      height: 1080,
      initialized: false,
      tracks: this.tracks.map((track) => {
        const { file, controller, ...trackJson } = track;
        return {
          ...trackJson,
          url: file?._url,
          controllerName: file?.mediaType,
        }
      }),
    };
  }

  static globalControllers: Record<string, Controller> = Controllers;


  static fileCache: Record<string, EditorFile> = {};
}


