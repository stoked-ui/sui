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
  ControllerType extends IController = IController,
  FileActionType extends IEditorFileAction = IEditorFileAction,
  ActionType extends IEditorAction = IEditorAction,
  TrackType extends IEditorTrack = IEditorTrack,
  EngineType extends IEditorEngine = IEditorEngine
>  extends ITimelineFile<ControllerType, FileActionType, ActionType, TrackType, EngineType> { }

export default class EditorFile<
  ControllerType extends IController = IController,
  FileActionType extends IEditorFileAction = IEditorFileAction,
  ActionType extends IEditorAction = IEditorAction,
  FileTrackType extends ITimelineFileTrack = ITimelineFileTrack,
  EngineType extends IEditorEngine = IEditorEngine,
  TrackType extends IEditorTrack = IEditorTrack,
> extends TimelineFile<
  ControllerType, FileActionType, ActionType, FileTrackType, EngineType, TrackType
> implements IEditorFile<
  ControllerType,
  FileActionType,
  ActionType,
  TrackType,
  EngineType
> {

  protected _tracks?: TrackType[];

  protected primaryType: FilePickerAcceptType = {
    description: 'Editor Video File',
    accept: {
      'application/stoked-ui-editor': ['.sue'],
    },
  };

  protected primaryExt: string = '.sue';

  protected OBJECT_STORE_NAME: string = 'editor';

  protected OBJECT_OUTPUT_STORE_NAME: string = 'editor-output';


  constructor(props: IEditorFileProps<FileTrackType>) {
    super(props);
    editorFileCache[props.id as string] = this;
  }

  async generateTracks(controllers: Record<string, ControllerType>, engine: EngineType, initAction: any) {
    await super.generateTracks(controllers, engine, initAction );
  }

  async save(silent: boolean = false) {
    return super.save(silent);
  }

  async saveDb(blob: Blob): Promise<IDBValidKey> {
    return super.saveDb(blob);
  }

  async saveOutput(blob: OutputBlob): Promise<IDBValidKey> {
    return super.saveOutput(blob);
  }
}


