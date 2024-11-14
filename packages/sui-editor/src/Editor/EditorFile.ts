import {
  TimelineFile,
  OutputBlob,
  ITimelineFile,
  ITimelineFileProps,
  IController,
  ITimelineFileTrack,
  Controller, TimelineFileMeta
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

export interface IEditorFileProps<FileTrackType> extends ITimelineFileProps<FileTrackType> {
  blendMode?: BlendMode;
  fit?: Fit;
}

export interface IEditorFile<
  FileActionType extends IEditorFileAction = IEditorFileAction,
  ActionType extends IEditorAction = IEditorAction,
  TrackType extends IEditorTrack = IEditorTrack,
  EngineType extends IEditorEngine = IEditorEngine
>  extends ITimelineFile< TrackType> {
  image?: string;
  backgroundColor?: string;
  width: number;
  height: number;
  video?: IMediaFile;
  blendMode: BlendMode;
  fit: Fit;
}

export class EditorFileMeta extends TimelineFileMeta {
  primaryType: FilePickerAcceptType = {
    description: 'Editor Video File',
    accept: {
      'application/stoked-ui-editor': ['.sue'],
    },
  };

  primaryExt: string = '.sue';

  primaryMimeSubtypeSuffix: string = 'editor';

  primaryOutputMimeSubtypeSuffix: string = 'editor-output';

  get mimeSubtype() {
    return `${this.primaryMimeSubtype}-${this.primaryMimeSubtypeSuffix}`;
  }

  get outputMimeSubtype() {
    return `${this.primaryMimeSubtype}-${this.primaryOutputMimeSubtypeSuffix}`;
  }

  get mimeType() {
    return `application/${this.mimeSubtype}`;
  }

  get outputMimeType() {
    return `application/${this.outputMimeSubtype}`;
  }

  get MimeType() {
    return getMimeType({
      type: 'application',
      subType: this.primaryMimeSubtype,
      subTypePrefix: this.primaryMimeSubtypeSuffix
    });
  }

  get OutputMimeType() {
    return getMimeType({
      type: 'application',
      subType: this.primaryMimeSubtype,
      subTypePrefix: this.primaryOutputMimeSubtypeSuffix
    });
  }
}

const fileMeta = new EditorFileMeta();
TimelineFile.globalControllers = Controllers;
TimelineFile.fileMeta = fileMeta;

export default class EditorFile<
  FileActionType extends IEditorFileAction = IEditorFileAction,
  ActionType extends IEditorAction = IEditorAction,
  FileTrackType extends IEditorFileTrack = IEditorFileTrack,
  EngineType extends IEditorEngine = IEditorEngine,
  TrackType extends IEditorTrack = IEditorTrack,
> extends TimelineFile<
  FileActionType, ActionType, FileTrackType, TrackType
> implements IEditorFile<
  FileActionType,
  ActionType,
  TrackType,
  EngineType
> {

  protected _tracks?: TrackType[];

  readonly fileMeta: EditorFileMeta = fileMeta;

  blendMode: BlendMode;

  fit: Fit;

  constructor(props: IEditorFileProps<FileTrackType>) {
    editorFileCache[props.id as string] = JSON.stringify(props);
    super(props);

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

  async initialize( initAction: any) {
    await super.initialize(initAction );
  }

  async save( silent: boolean = false): Promise<void> {
    await this.initialize(initEditorAction);
    return super.save(silent);
  }

  async saveDb(blob: Blob): Promise<IDBValidKey> {
    return super.saveDb(blob);
  }

  async saveOutput(blob: OutputBlob): Promise<IDBValidKey> {
    return super.saveOutput(blob);
  }

  static async load(file: IEditorFile, initAction: any): Promise<IEditorFile> {
    if (!file.initialized) {
      await file.initialize(initAction);
    }
    return file;
  }

  static async SaveAs<FileType extends TimelineFile = EditorFile>(file: FileType) {
    return TimelineFile.SaveAs<FileType>(file);
  }

  static async fromUrl<FileType = EditorFile>(url: string): Promise<FileType> {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    try {
      const contentType = response.headers.get("content-type");
      const blob = await response.blob()
      const file = new File([blob], getFileName(url, true) ?? 'url-file', contentType ? { type: contentType } : TimelineFile.fileMeta.MimeType);
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
    } catch (ex) {
      throw new Error(`Error loading file from url: ${url}`);
    }
  }

  static globalControllers: Record<string, Controller> = Controllers;


  static fileCache: Record<string, EditorFile> = {};
}


