/* eslint-disable class-methods-use-this */
/*  eslint-disable @typescript-eslint/naming-convention */
import { FileState, SaveOptions } from "./TimelineFile.types";
import LocalDb from "../LocalDb/LocalDb";
import FileTypeMeta from "./FileTypeMeta";
import {
  WebFileInitializer,
  Constructor,
  IBaseDecodedFile,
  IWebFile,
  IWebFileProps, saveFileApi, saveFileHack, IWebData
} from "./WebFile.types";
import { namedId } from "@stoked-ui/media-selector";


export default class WebFile<MimeType extends FileTypeMeta> implements IWebFile {

  id: string;

  name: string;

  description?: string;

  author?: string;

  size?: number;

  url?: string;

  created: number;

  lastModified?: number;

  constructor(props: IWebFileProps) {
    this.id = props.id ?? namedId('webfile');
    this.name = props.name ?? 'new file';
    this.description = props.description;
    this.author = props.author;
    this.created = props.created ?? Date.now();
    this.lastModified = props.lastModified;
    this.url = props.url;
    this._version = props.version ?? 1;

    const FileTypeConstructor: Constructor<MimeType> = FileTypeMeta as unknown as Constructor<MimeType>;
    this.fileMeta = new FileTypeConstructor();

    console.info(`WebFile: ${this.id} - ${this.name} - ${JSON.stringify(this.fileMeta)}`);
    this.state = FileState.CONSTRUCTED;
  }

  protected _version: number = 0;

  get version(): number {
    return this._version;
  }

  protected FileConstructor: Constructor<WebFile<MimeType>> = WebFile as unknown as Constructor<WebFile<MimeType>>;

  fileMeta: FileTypeMeta;

  // last saved checksum
  protected lastChecksum: null | string = null;

  protected latestChecksum: null | string = null;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  initializer: WebFileInitializer = (fileParams, files, ...args) => {
    return Promise.resolve();
  };

  get metaData(): IWebFileProps {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      author: this.author,
      created: this.created,
      lastModified: this.lastModified,
      url: this.url,
      version: this.version,
    };
  }

  get fileProps(): IWebData {
    return this.metaData as IWebData;
  }

  get fileParams(): IBaseDecodedFile[] {
    return [];
  }

  async saveAs() {
    const fileBlob = await this.createBlob();
    const saveOptions = this.getSaveApiOptions({ });
    if ('showSaveFilePicker' in window) {
      return saveFileApi({ ...saveOptions, fileBlob });
    }
    return saveFileHack({ ...saveOptions, fileBlob });
  }

  getSaveApiOptions(optionProps: SaveOptions): SaveFilePickerOptions {
    if (!optionProps.suggestedName) {
      if (!optionProps.suggestedExt) {
        const exts = Object.values(this.fileMeta.primaryType.accept);
        optionProps.suggestedExt = (exts.length ? exts[0] : this.fileMeta.ext) as FileExtension;
      }
      optionProps.suggestedName = `${this.name}${Object.values(this.fileMeta.primaryType.accept)}`
    }
    const { id, types, suggestedName } = optionProps;
    return {
      id: id ?? this.id,
      suggestedName,
      excludeAcceptAllOption: false,
      types: types || [this.fileMeta.primaryType, ...this.types],
      startIn: id ? undefined : 'documents'
    }
  }

  async save(silent: boolean = false, embedded: boolean = true): Promise<void> {
    const isDirty = await this.isDirty()
    if (!isDirty) {
      return;
    }
    const fileBlob = await LocalDb.saveFile(this);

    if (!silent) {
      const saveOptions = this.getSaveApiOptions({ });
      const options = { ...saveOptions, fileBlob };
      if ('showSaveFilePicker' in window) {
        await saveFileApi(options);
      } else {
        await saveFileHack(options);
      }
    }
    this._version += 1;
  }

  // Function to create a combined file with JSON data and attached files
  async createBlob(): Promise<Blob> {
    try {
      const fileProps = this.fileProps;
      const propsString = JSON.stringify(fileProps);
      const fileParams = this.fileParams;
      const fileParamsString = JSON.stringify(fileParams);

      const stream = new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder();
          // Encode fileProps as Uint8Array and enqueue it
          controller.enqueue(encoder.encode(propsString));
          // Encode filesMeta as Uint8Array and enqueue it
          controller.enqueue(encoder.encode(fileParamsString));
          // Get additional data streams and pipe them
          const additionalStreams = this.getDataStreams();
          // eslint-disable-next-line no-restricted-syntax
          for await (const readableStream of additionalStreams) {
            const reader = readableStream.getReader();
            let chunk: ReadableStreamReadResult<Uint8Array>;

            // eslint-disable-next-line no-cond-assign,no-await-in-loop
            while (!(chunk = await reader.read()).done) {
              controller.enqueue(chunk.value);
            }
          }
          controller.close();
        }
      });

      const response = new Response(stream);

      // Convert the Response stream to a blob, which can then be saved as a File
      return new Blob([await response.blob()], this.fileMeta.MimeType);
    } catch (ex) {
      console.error(ex);
      throw new Error(ex as string);
    }
  }

  static async readBlob(fileMeta: FileTypeMeta, blob: Blob, searchDb: boolean = false): Promise<{
    props: IWebFileProps;
    fileParams: IBaseDecodedFile[];
    files: File[];
  }> {
    const reader = blob.stream().getReader();
    const decoder = new TextDecoder();

    // Helper function to read a portion of the stream until a delimiter
    async function readUntilDelimiter(delimiter: string): Promise<string> {
      let done = false;
      let text = "";
      while (!done) {
        // eslint-disable-next-line no-await-in-loop
        const { value, done: readerDone } = await reader.read();
        if (value) {
          text += decoder.decode(value, { stream: true });
          const delimiterIndex = text.indexOf(delimiter);
          if (delimiterIndex !== -1) {
            // Slice up to the delimiter and return
            const result = text.slice(0, delimiterIndex);
            text = text.slice(delimiterIndex + delimiter.length);
            reader.releaseLock();
            return result;
          }
        }
        done = readerDone;
      }
      return text;
    }

    // Read the JSON props
    const propsString = await readUntilDelimiter('}');
    const props: IWebFileProps = JSON.parse(`${propsString}}`);

    if (searchDb) {
      const dbBlob = await LocalDb.loadId(fileMeta.mimeSubtype, props.id, props.version);
      if (dbBlob !== null) {
        const dbFile = new File([dbBlob], this.name, fileMeta.MimeType)
        return this.readBlob(fileMeta,dbFile, false);
      }
    }

    // Read the JSON file parameters
    const fileParamsString = await readUntilDelimiter(']');
    const fileParams: IBaseDecodedFile[] = JSON.parse(`${fileParamsString}]`);

    // Read and parse file data based on fileParams
    const files: File[] = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const { name, size, type } of fileParams) {
      const chunks: Uint8Array[] = [];
      let remainingSize = size;

      while (remainingSize > 0) {
        // eslint-disable-next-line no-await-in-loop
        const { value, done } = await reader.read();
        if (done) {
          throw new Error("Unexpected end of stream while reading file data");
        }
        const chunk = value.subarray(0, Math.min(remainingSize, value.length));
        chunks.push(chunk);
        remainingSize -= chunk.length;
      }

      // Create a File object from the chunks
      const fileData = new Blob(chunks, { type });
      files.push(new File([fileData], name, { type }));
    }

    return { props, fileParams, files };
  }

  protected get files(): File[] {
    return [];
  }

  // Method to be overridden by subclasses for providing data streams
  protected getDataStreams(): AsyncIterable<ReadableStream<Uint8Array>> {
    return {
      async *[Symbol.asyncIterator]() {
        for (let i = 0; i < this.files.length; i += 1) {
          const file = this.files[i];
          // Create a ReadableStream for each file
          yield file.stream() as ReadableStream<Uint8Array>;
        }
      }
    };
  }

  protected types: FilePickerAcceptType[] = [];

  async hashString(canonicalString: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(canonicalString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async checksum(): Promise<string> {
    return 'default';
  }

  async isDirty(): Promise<boolean> {
    const checksum = await this.checksum();
    if (this.lastChecksum === checksum || checksum === 'default') {
      return false;
    }
    return true;
  }

  static async fromUrl<MimeType extends FileTypeMeta>(url: string): Promise<WebFile<MimeType>> {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    try {
      const contentType = response.headers.get("content-type");
      console.info(`Load: ${url} Content-Type: ${contentType}`);
      const blob = await response.blob()
      // const file = new File([blob], getFileName(url, true) ?? 'url-file', contentType ? { type: contentType } : this.fileMeta.MimeType);
      return this.fromBlob<MimeType>(blob, true, );
    } catch (ex) {
      throw new Error(`Error loading file from url: ${url}`);
    }
  }

  async initialize(files?: File[], ...args: any[]) {
    if (this.state !== FileState.CONSTRUCTED) {
      return;
    }
    this.state = FileState.INITIALIZING;

    await this.initializer(files, args);

    await LocalDb.saveFile(this);
    this.state = FileState.READY;
  };

  static async fromBlob<
    MimeType extends FileTypeMeta,
    FileType extends WebFile<MimeType> = WebFile<MimeType>
  >(
    blob: Blob,
    dbLoad: boolean = true,
  ): Promise<FileType>
  {
    try {
      const FileConstructor: Constructor<FileType> = WebFile as unknown as Constructor<FileType>;
      const MetaFileConstructor: Constructor<MimeType> = FileTypeMeta as Constructor<MimeType>;
      const fileMeta = new MetaFileConstructor();
      const { props, files } = await WebFile.readBlob(fileMeta,blob, dbLoad);
      const projectFile = new FileConstructor(props);
      await projectFile.initialize(files);
      return projectFile;
    } catch (ex) {
      throw new Error(`Error loading file from blob: ${blob}`);
    }
  }

  static fileState: Record<string, FileState> = {};

  get state(): FileState {
    return WebFile.fileState[this.id];
  }

  set state(state: FileState) {
    WebFile.fileState[this.id] = state;
  }
}
