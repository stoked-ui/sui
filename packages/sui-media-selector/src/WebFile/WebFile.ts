import {
  namedId,
  Settings,
  FileSaveRequest,
  LocalDb,
  MimeRegistry,
  Constructor
} from "@stoked-ui/common";
import {
  OpenDialogProps,
  openFileApi,
  saveFileApi,
  saveFileDeprecated,
  openFileDeprecated
} from '../FileSystemApi/FileSystemApi';

/**
 * Represents a command with execute and undo operations.
 */
export interface Command {
  execute(): void;
  undo(): void;
}

/**
 * Props for a web file component.
 */
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

/**
 * Data for a web file.
 */
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

/**
 * Options for saving a web file.
 */
export interface IWebFileSaveOptions {
  silent?: boolean;
  url?: string;
}

/**
 * API interface for a web file.
 */
export interface IWebFileApi {
  getSaveRequest(): Promise<FileSaveRequest>;
  save(options?: IWebFileSaveOptions): Promise<void>;
  checksum(): Promise<string>;
  isDirty(): Promise<boolean>;
}

/**
 * Represents a web file with data and API functionality.
 */
export interface IWebFile extends IWebFileData, IWebFileApi {
  fullName: string,
}

/**
 * Abstract class for a web file.
 */
export default abstract class WebFile implements IWebFile {

  protected _id: string;

  protected _name: string;

  protected _version: number;

  protected _lastChecksum: string | null;

  protected _created: number;

  protected _lastModified: number;

  protected _metadata: Settings;

  protected _description = '';

  protected _author = '';

  protected _type = '';

  /**
   * Creates a new WebFile instance.
   * @param props Props for the WebFile.
   */
  constructor(props: IWebFileProps) {
    this._id = props?.id ?? namedId('webapp')
    this._name = props?.name;
    this._version = props?.version ?? 1;
    this._lastChecksum = props?.lastChecksum ?? null;
    this._created = props?.created ?? Date.now();
    this._lastModified = props?.lastModified ?? 0;
    this._metadata = props?.metadata ?? {};
    this._description = props?.description ?? '';
    this._author = props?.author ?? '';
    console.info(`WebFile(${this.name})`);
  }

  /**
   * Gets the ID of the web file.
   * @returns {string} The ID of the web file.
   */
  get id(): string {
    return this._id;
  }

  /**
   * Gets the name of the web file.
   * @returns {string} The name of the web file.
   */
  get name(): string {
    return this._name;
  }

  /**
   * Gets the full name of the web file.
   * @returns {string} The full name of the web file.
   */
  get fullName(): string {
    return `${this.name}${MimeRegistry.types[this._type].ext}`;
  }

  /**
   * Gets the version of the web file.
   * @returns {number} The version of the web file.
   */
  get version(): number {
    return this._version;
  }

  /**
   * Gets the created timestamp of the web file.
   * @returns {number} The created timestamp of the web file.
   */
  get created(): number {
    return this._created;
  }

  /**
   * Gets the last modified timestamp of the web file.
   * @returns {number} The last modified timestamp of the web file.
   */
  get lastModified(): number {
    return this._lastModified;
  }

  /**
   * Gets the metadata of the web file.
   * @returns {Settings} The metadata of the web file.
   */
  get metadata(): Settings {
    return this._metadata;
  }

  /**
   * Gets the author of the web file.
   * @returns {string} The author of the web file.
   */
  get author(): string {
    return this._author;
  }

  /**
   * Gets the description of the web file.
   * @returns {string} The description of the web file.
   */
  get description(): string {
    return this._description;
  }

  /**
   * Creates a save request for the web file.
   * @returns {FileSaveRequest} The save request for the web file.
   */
  createSaveRequest() {
    return {
      name: this.fullName,
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

  /**
   * Saves the web file.
   * @param options Save options.
   * @returns {Promise<void>} A promise that resolves when the file is saved.
   */
  async save(options?: IWebFileSaveOptions): Promise<void {
    const { silent, url } = options || { silent: false };
    const isDirty = await this.isDirty();
    if (!isDirty && silent) {
      console.info(`${this.name} has not changed. Save cancelled.`);
      return;
    }

    try {
      this._version += 1;
      this._lastModified = Date.now();
      this._lastChecksum = await this.checksum();
      const saveRequest = await this.getSaveRequest();

      await LocalDb.saveFile({...saveRequest, url})
      if (!silent) {
        const { blob } = saveRequest;
        const saveOptions = {
          suggestedName: `${this.name}${saveRequest.mime.ext}`,
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

  /**
   * Opens multiple files using a file dialog.
   * @param options Options for opening files.
   * @returns {Promise<File[]>} A promise that resolves to an array of files.
   */
  static async open(options?: OpenDialogProps): Promise<File[]> {
    if ('showOpenFilePicker' in window) {
      return openFileApi(options);
    }
    return openFileDeprecated();
  }

  /**
   * Calculates the checksum of the web file.
   * @returns {Promise<string>} A promise that resolves to the checksum of the web file.
   */
  async checksum(): Promise<string> {
    const { blob } = await this.getSaveRequest();
    const buffer = await blob.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  }

  /**
   * Checks if the web file has been modified.
   * @returns {Promise<boolean>} A promise that resolves to a boolean indicating if the file is dirty.
   */
  async isDirty(): Promise<boolean> {
    const currentChecksum = await this.checksum();
    return this._lastChecksum !== currentChecksum;
  }

  /**
   * Gets the data for the web file.
   * @returns {IWebFileData} The data of the web file.
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

  /**
   * Loads a WebFile instance from a URL.
   * @param url The URL to load the file from.
   * @param FileConstructor Constructor of the specific WebFile type.
   * @returns {Promise<WebFileType | null>} A promise that resolves to the loaded WebFile instance.
   */
  static async fromUrl<WebFileType = WebFile>(
    url: string,
    FileConstructor: Constructor<WebFileType>
  ): Promise<WebFileType | null> {
    const response = await fetch(url);
    if (response.ok) {
      const blob = await response.blob() as Blob;
      return this.fromLocalFile<WebFileType>(blob, FileConstructor);
    }
    console.error(`Failed to fetch file from ${url}`);
    return null;
  }

  /**
   * Loads a WebFile instance from the local file system.
   * @param file A File object from an attached drive.
   * @param FileConstructor Constructor of the specific WebFile type.
   * @returns {Promise<WebFileType>} A promise that resolves to the loaded WebFile instance.
   */
  static async fromLocalFile<WebFileType = WebFile>(
    file: Blob,
    FileConstructor: Constructor<WebFileType>
  ): Promise<WebFileType> {
    const arrayBuffer = await file.arrayBuffer();
    const dataView = new DataView(arrayBuffer);

    // Read the first 4 bytes as the metadata length
    const metadataLength = dataView.getUint32(0, /* littleEndian= */ true);

    // Extract metadata
    const metadataStart = 4; // Metadata length occupies the first 4 bytes
    const metadataEnd = metadataStart + metadataLength;
    const metadataBuffer = arrayBuffer.slice(metadataStart, metadataEnd);
    const metadataText = new TextDecoder().decode(metadataBuffer);
    const metadata = JSON.parse(metadataText);

    return new FileConstructor({ content: file, ...metadata });
  }

  /**
   * Opens a file dialog to select multiple files.
   * @param FileConstructor Constructor of the specific WebFile type.
   * @returns {Promise<AppFileType[]>} A promise that resolves to an array of loaded WebFile instances.
   */
  static async fromOpenDialog<AppFileType = WebFile>(FileConstructor: Constructor<AppFileType>): Promise<AppFileType[]> {
    const files = await this.open();
    return Promise.all(files.map( async (file) => {
      return this.fromLocalFile<AppFileType>(file, FileConstructor);
    }));
  }
}