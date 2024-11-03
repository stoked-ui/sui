import { TimelineFile, SaveDialogProps, OutputBlob, ITimelineFile, ITimelineFileProps, IEngine, IController, ActionInitFunc } from '@stoked-ui/timeline';
import { namedId } from 'packages/sui-media-selector/build';
import {IEditorFileTrack, IEditorTrack} from "../EditorTrack/EditorTrack";
import {IEditorAction, IEditorFileAction, initEditorAction} from "../EditorAction/EditorAction";
import {IEditorEngine} from "../EditorEngine";

export const editorFileCache: Record<string, EditorFile> = {};

export interface IEditorFileProps extends Omit<ITimelineFileProps, 'tracks'> {
  tracks?: IEditorFileTrack[];
}

export interface IEditorFile extends Omit<ITimelineFile, 'tracks'> {
  tracks?: IEditorFileTrack[];
}

export default class EditorFile extends TimelineFile implements IEditorFile {

  protected _tracks?: IEditorTrack[];

  protected primaryType: FilePickerAcceptType = {
    description: 'Editor Video File',
    accept: {
      'application/stoked-ui-editor': ['.sue'],
    },
  };

  protected primaryExt: string = '.sue';

  protected OBJECT_STORE_NAME: string = 'editor';

  protected OBJECT_OUTPUT_STORE_NAME: string = 'editor-output';


  constructor(props: IEditorFileProps) {
    super(props);
    editorFileCache[props.id as string] = this;
  }
  async generateTracks(controllers: Record<string, IController>, engine: IEngine, initAction: ActionInitFunc = initEditorAction) {
    await super.generateTracks(controllers, engine, initAction);
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

function getName(props: ITimelineFileProps): string {
    throw new Error('Function not implemented.');
}

