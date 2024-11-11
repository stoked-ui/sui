import {
  TimelineFile,
  OutputBlob,
  ITimelineFile,
  ITimelineFileProps,
  IController,
  ITimelineFileTrack
} from '@stoked-ui/timeline';
import {IEditorAction, IEditorFileAction, initEditorAction} from "../EditorAction/EditorAction";
import { IEditorEngine, IEditorTrack } from "../EditorEngine";

export const editorFileCache: Record<string, EditorFile> = {};

export interface IEditorFileProps<FileTrackType> extends ITimelineFileProps<FileTrackType> {}

export interface IEditorFile<
  FileActionType extends IEditorFileAction = IEditorFileAction,
  ActionType extends IEditorAction = IEditorAction,
  TrackType extends IEditorTrack = IEditorTrack,
  EngineType extends IEditorEngine = IEditorEngine
>  extends ITimelineFile< TrackType> { }

export default class EditorFile<
  FileActionType extends IEditorFileAction = IEditorFileAction,
  ActionType extends IEditorAction = IEditorAction,
  FileTrackType extends ITimelineFileTrack = ITimelineFileTrack,
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

  primaryType: FilePickerAcceptType = {
    description: 'Editor Video File',
    accept: {
      'application/stoked-ui-editor': ['.sue'],
    },
  };

  primaryExt: string = '.sue';

  OBJECT_STORE_NAME: string = 'editor';

  OBJECT_OUTPUT_STORE_NAME: string = 'editor-output';


  constructor(props: IEditorFileProps<FileTrackType>) {
    super(props);
    editorFileCache[props.id as string] = this;
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

  static fileCache: Record<string, EditorFile> = {};
}


