import {namedId, Settings, FileSaveRequest, LocalDb, MimeRegistry} from "@stoked-ui/common";
import {
  OpenDialogProps,
  openFileApi,
  openFileDeprecated,
  saveFileApi,
  saveFileDeprecated
} from './FileSystemApi';

export interface Command {
  execute(): void;
  undo(): void;
}

export interface IWebFileProps {
  id?: string,
  name: string,
  version?: number,
  lastChecksum?: string | null,
  commandHistory?: Command[],
  undoStack?: Command[],
  created?: number,
  lastModified?: number,
  metadata?: any,
  description?: string,
  author?: string
}

export interface IWebFileData {
  id: string;
  name: string;
  version: number;
  created: number;
  lastModified: number;
  metadata: Settings;
  description: string;
  author: string;
}

export interface IWebFileApi {
  getSaveRequest(): Promise<FileSaveRequest>;
  save(silent?: boolean): Promise<void>;
  checksum(): Promise<string>;
  isDirty(): Promise<boolean>;

  // Command pattern operations
  executeCommand(command: Command): void;
  undo(): void;
  redo(): void;
  getHistory(): Command[];
}

export interface IWebFile extends IWebFileData, IWebFileApi {}

export default abstract class WebFile implements IWebFile {

  protected _id: string;

  protected _name: string;

  protected _version: number;

  protected _lastChecksum: string | null;

  private _commandHistory: Command[] = [];

  private _undoStack: Command[] = [];

  protected _created: number;

  protected _lastModified: number;

  protected _metadata: Settings;

  protected _description = '';

  protected _author = '';

  protected _type = '';

  constructor(props: IWebFileProps) {
    this._id = props?.id ?? namedId('webapp')
    this._name = props?.name;
    this._version = props?.version ?? 0;
    this._lastChecksum = props?.lastChecksum ?? null;
    this._created = props?.created ?? Date.now();
    this._lastModified = props?.lastModified ?? 0;
    this._metadata = props?.metadata ?? {};
    this._description = props?.description ?? '';
    this._author = props?.author ?? '';
    console.info(`WebFile(${this.name})`);
  }

  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get version(): number {
    return this._version;
  }

  get created(): number {
    return this._created;
  }

  get lastModified(): number {
    return this._lastModified;
  }

  get metadata(): Settings {
    return this._metadata;
  }

  get author(): string {
    return this._author;
  }

  get description(): string {
    return this._description;
  }

  createSaveRequest() {
    return {
      id: this.id,
      version: this.version,
      meta: {
        id: this.id,
        name: this.name,
        version: this.version,
        created: this.created,
        lastModified: this.lastModified,
        metadata: this.metadata,
        description: this.description,
        author: this.author,
      },
      mime: MimeRegistry.types[this._type],
      metadata: this.data
    };
  }

  // Abstract method to generate a save request - implement in derived classes
  abstract getSaveRequest(): Promise<FileSaveRequest>;

  async save(silent: boolean = false): Promise<void> {
    const isDirty = await this.isDirty();
    if (!isDirty && silent) {
      console.info(`${this.name} has not changed. Save cancelled.`);
      return;
    }

    try {
      this._version += 1;
      this._lastChecksum = await this.checksum();
      const saveRequest = await this.getSaveRequest();

      await LocalDb.saveFile(saveRequest)
      if (!silent) {
        const { blob } = saveRequest;
        const saveOptions = {
          suggestedName: this.name,
          fileBlob: blob,
        };

        if ('showSaveFilePicker' in window) {
          await saveFileApi(saveOptions);
        } else {
          await saveFileDeprecated(saveOptions);
        }
      }
    } catch (error) {
      console.error('Error saving file:', error);
      throw error;
    }
  }

  static async open(options?: OpenDialogProps): Promise<File[]> {
    if ('showOpenFilePicker' in window) {
      return openFileApi(options);
    }
    return openFileDeprecated();
  }

  async checksum(): Promise<string> {
    const { blob } = await this.getSaveRequest();
    const buffer = await blob.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  }

  async isDirty(): Promise<boolean> {
    const currentChecksum = await this.checksum();
    return this._lastChecksum !== currentChecksum;
  }

  // Command Pattern: Execute, Undo, and History Management
  executeCommand(command: Command): void {
    command.execute();
    this._commandHistory.push(command);
    this._undoStack = []; // Clear redo stack on new command
  }

  undo(): void {
    const command = this._commandHistory.pop();
    if (command) {
      command.undo();
      this._undoStack.push(command);
    } else {
      console.info('No more commands to undo.');
    }
  }

  redo(): void {
    const command = this._undoStack.pop();
    if (command) {
      command.execute();
      this._commandHistory.push(command);
    } else {
      console.info('No more commands to redo.');
    }
  }

  getHistory(): Command[] {
    return [...this._commandHistory];
  }

  /**
   * Gets data for the WebFile.
   */
  get data(): IWebFileData {
    return {
      id: this.id,
      name: this.name,
      created: this.created,
      lastModified: this.lastModified,
      metadata: this.metadata,
      author: this.author,
      description: this.description,
      version: this.version,
    };
  }
}
