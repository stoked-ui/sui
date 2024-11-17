import {
  TimelineFile,
  OutputBlob,
  ITimelineFile,
  ITimelineFileProps,
  Controller,
  FileTypeMeta, WebFile, IWebFileProps,
  ProjectOutputFile, IProjectOutputFileProps, Constructor
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

export interface IEditorFileProps<FileTrackType extends IEditorFileTrack = IEditorFileTrack> extends ITimelineFileProps<FileTrackType> {
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

export class SUVideoFileType extends FileTypeMeta {
  description: string = 'Stoked UI - Timeline Video File';

  ext: `.${string}` = '.suev'

  name: string = 'editor-video'
}

export class SUVideoFile extends ProjectOutputFile<SUVideoFileType> {
  file: IMediaFile;

  sourceId: string;det

  constructor(props: IProjectOutputFileProps) {
    super(props);
    this.file = props.file;
    this.sourceId = props.sourceId;
  }
}

export class SUAudioFileMeta extends FileTypeMeta {
  description: string = 'Stoked UI - Timeline Audio File';

  ext: `.${string}` = '.suea'

  name: string = 'editor-audio'
}

export class EditorFileType extends FileTypeMeta {

  description: string = 'Stoked UI - Editor Project File';

  ext: `.${string}` = '.sue'

  name: string = 'editor'
}

TimelineFile.globalControllers = Controllers;

export default class EditorFile<
  MimeType extends FileTypeMeta = EditorFileType,
  OutputMimeType extends FileTypeMeta = SUVideoFileType,
  FileActionType extends IEditorFileAction = IEditorFileAction,
  ActionType extends IEditorAction = IEditorAction,
  FileTrackType extends IEditorFileTrack = IEditorFileTrack,
  TrackType extends IEditorTrack = IEditorTrack,
  EngineType extends IEditorEngine = IEditorEngine,
> extends TimelineFile<
  MimeType, OutputMimeType, FileTrackType, TrackType
> implements IEditorFile<
  TrackType
> {

  protected _tracks?: TrackType[];

  blendMode: BlendMode;

  fit: Fit;

  backgroundColor?: string = '#000';

  width: number = 1920;

  height: number = 1080;

  constructor(props: IEditorFileProps<FileTrackType>) {
    editorFileCache[props.id as string] = JSON.stringify(props);
    super(props);

    this.backgroundColor = props.backgroundColor ?? '#000';
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
    const FileTypeConstructor = EditorFileType as unknown as Constructor<MimeType>;
    this.fileMeta = new FileTypeConstructor();

    const OutputFileTypeConstructor = SUVideoFileType as unknown as Constructor<OutputMimeType>;
    this.outputFileMeta = new OutputFileTypeConstructor();
  }


  get fileProps() {
    return {
      ...super.fileProps,

      backgroundColor: this.backgroundColor,
      width: 1920,
      height: 1080,
      version: this.version,
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


  async save( silent: boolean = false): Promise<void> {
    await this.initialize();
    return super.save(silent);
  }

/*

  static async SaveAs<FileType extends TimelineFile = EditorFile>(file: FileType) {
    return TimelineFile.SaveAs<FileType>(file);
  }

  static async fromFile<FileType = EditorFile>(file: File): Promise<FileType> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.addEventListener(
        "load",
        () => {
          // this will then display a text file
          const jsonFile = JSON.parse(reader.result as string);
          const addedProjectFile = new EditorFile(jsonFile);
          addedProjectFile.initialize(initEditorAction).then((loadedFile) => {
            resolve(addedProjectFile as FileType);
          })
        },
        false,
      );
      reader.readAsText(file);

    });
  }
*/

  static globalControllers: Record<string, Controller> = Controllers;


  static fileCache: Record<string, EditorFile> = {};
}


