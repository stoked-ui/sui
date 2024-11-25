import {
  TimelineFile,
  OutputBlob,
  ITimelineFile,
  ITimelineFileProps,
  Controller,
  IMimeType,
  ProjectOutputFile, IProjectOutputFileProps, Constructor,
  MimeRegistry,
  FileState,
} from '@stoked-ui/timeline';
import { getFileName, getMimeType, IMediaFile } from '@stoked-ui/media-selector';
import Controllers from '../Controllers/Controllers';
import {
  BlendMode, Fit,
  IEditorAction,
  IEditorFileAction,
  initEditorAction
} from "../EditorAction/EditorAction";
import { IEditorEngine } from "../EditorEngine";
import { IEditorFileTrack, IEditorTrack } from "../EditorTrack/EditorTrack";

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
export const SUIEditorRefs: IMimeType = MimeRegistry.create('stoked-ui', 'timeline', '.suer', 'Stoked UI - Editor Project File w/ Url Refs', false);
export const SUIEditor: IMimeType = MimeRegistry.create('stoked-ui', 'timeline', '.sue', 'Stoked UI - Editor Project File', true);
export const SUIVideoRefs: IMimeType = MimeRegistry.create('stoked-ui', 'video', '.suvr', 'Stoked UI - Video File w/ Url Refs', false);
export const SUIVideo: IMimeType = MimeRegistry.create('stoked-ui', 'video', '.suv', 'Stoked UI - Video File', true);

export class SUVideoFile extends ProjectOutputFile {
  file: IMediaFile;

  sourceId: string;

  constructor(props: IProjectOutputFileProps) {
    super(props);
    this.file = props.file;
    this.sourceId = props.sourceId;
  }


  async initialize(files?: File[]) {
    if (this.state !== FileState.CONSTRUCTED) {
      return;
    }
    this.state = FileState.INITIALIZING;

    await this.initializer(files);

    await this.save(true);
    this.state = FileState.READY;
  };

  protected getDataStreams(): AsyncIterable<ReadableStream<Uint8Array>> {
    // eslint-disable-next-line consistent-this
    const instance = this; // Preserve the `this` context
    return {
      async *[Symbol.asyncIterator]() {
        // Create a ReadableStream for each file
        yield instance.file.stream() as ReadableStream<Uint8Array>;
      },
    };
  }
}


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

  mimeTypes: IMimeType[] = [
    SUIEditor,                 // embedded
    SUIEditorRefs              // w/ url refs
  ];

  outputMimeTypes: IMimeType[] = [
    SUIVideo,                 // embedded
    SUIVideoRefs              // w/ url refs
  ];

  get fileProps() {
    return {
      ...super.fileProps,
      backgroundColor: this.backgroundColor,
      width: 1920,
      height: 1080,
      blendMode: this.blendMode,
      initialized: false,
      tracks: this._tracks?.map((track) => {
        const { file, controller, ...trackJson } = track;
        return {
          ...trackJson,
          url: file?._url,
          controllerName: file!.mediaType,
        }
      }) || [],
    };
  }

  static fileCache: Record<string, EditorFile> = {};
}


