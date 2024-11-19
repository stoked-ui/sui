/* eslint-disable class-methods-use-this */
/*  eslint-disable @typescript-eslint/naming-convention */
import { namedId } from "@stoked-ui/media-selector";
import { FileState, SaveOptions } from "./TimelineFile.types";
import LocalDb, { FileLoadRequest, FileSaveRequest } from "../LocalDb/LocalDb";
import { IMimeType, MimeType } from "./MimeType";
import {
  WebFileInitializer,
  Constructor,
  IBaseDecodedFile,
  IWebFile,
  IWebFileProps, saveFileApi, saveFileHack, IWebData
} from "./WebFile.types";

const PropsDelimiter = '---STOKED_UI_PROPS_END---';
const FilesTableDelimiter = '---STOKED_UI_FILES_TABLE_END---'

export default abstract class WebFile implements IWebFile {

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
    console.info(`WebFile: ${this.id} - ${this.name}`);
    this.state = FileState.CONSTRUCTED;
  }

  protected _version: number = 0;

  get version(): number {
    return this._version;
  }

  protected FileConstructor: Constructor<WebFile> = WebFile as unknown as Constructor<WebFile>;

  mimeType: IMimeType;

  // last saved checksum
  protected lastChecksum: null | string = null;

  protected latestChecksum: null | string = null;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  initializer: WebFileInitializer = (fileParams, files, ...args) => {
    return Promise.resolve();
  };

  async getSaveRequest(embedded: boolean = !this.fileUrlsValid ): Promise<FileSaveRequest> {
    return {
      id: this.id,
      version: this.version,
      blob: await this.createBlob(),
      meta: this.fileProps,
      type: this.mimeType.name,
      embedded
    }
  }

  get metaData(): IWebFileProps & { mimeType: IMimeType } {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      author: this.author,
      created: this.created,
      lastModified: this.lastModified,
      url: this.url,
      version: this.version,
      mimeType: this.mimeType,
    };
  }

  get fileProps(): IWebData {
    return this.metaData as IWebData;
  }

  get fileParams(): IBaseDecodedFile[] {
    return [];
  }

  getSaveApiOptions(optionProps: SaveOptions): SaveFilePickerOptions {
    if (!optionProps.suggestedName) {
      if (!optionProps.suggestedExt) {
        optionProps.suggestedExt = this.mimeType.ext as FileExtension;
      }
      optionProps.suggestedName = `${this.name}${optionProps.suggestedExt}`
    }
    const { id, types, suggestedName } = optionProps;

    return {
      id: id ?? this.id,
      suggestedName,
      excludeAcceptAllOption: false,
      types: types || this.types,
      startIn: id ? undefined : 'documents'
    }
  }

  async save(silent: boolean = false): Promise<void> {
    const isDirty = await this.isDirty()
    if (!isDirty) {
      return;
    }

    const fileData = await this.getSaveRequest();
  console.log('fileData', fileData);
    await LocalDb.saveFile(fileData);

    if (!silent) {
      const saveOptions = this.getSaveApiOptions({ });
      const options = { ...saveOptions, fileBlob: fileData.blob };
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

      const embedded = !this.fileUrlsValid;
      const stream = new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder();
          // Encode fileProps as Uint8Array and enqueue it
          controller.enqueue(encoder.encode(propsString));
          if (embedded) {
            controller.enqueue(encoder.encode(PropsDelimiter));
            // Encode filesMeta as Uint8Array and enqueue it
            controller.enqueue(encoder.encode(fileParamsString));
            controller.enqueue(encoder.encode(FilesTableDelimiter));
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
          }
          controller.close();
        }
      });

      const response = new Response(stream);

      // Convert the Response stream to a blob, which can then be saved as a File
      return new Blob([await response.blob()], this.mimeType.typeObj);
    } catch (ex) {
      console.error(ex);
      throw new Error(ex as string);
    }
  }

  static async readBlob(mimeType: string, blob: Blob, searchDb: boolean = false): Promise<{
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
    const propsString = await readUntilDelimiter(PropsDelimiter);
    const props: IWebData = JSON.parse(`${propsString}`);

    if (searchDb) {
      const loadRequest: FileLoadRequest = {
        id: props.id,
        type: props.mimeType.name,
        version: props.version,
      }
      const dbBlob = await LocalDb.loadId(loadRequest);
      if (dbBlob !== null) {
        return this.readBlob(mimeType,dbBlob, false);
      }
    }

    // Read the JSON file parameters
    const fileParamsString = await readUntilDelimiter( FilesTableDelimiter);
    const fileParams: IBaseDecodedFile[] = JSON.parse(`${fileParamsString}`);

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

  protected get fileUrls(): string[] {
    return [];
  }

  protected get fileUrlsValid(): boolean {
    return true;
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

  get types() {
    return [{
      accept: this.mimeType.accept,
      description: this.mimeType.description,
    }];
  };

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

  static async fromUrl(url: string): Promise<WebFile> {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    try {
      const contentType = response.headers.get("content-type") as MimeType;
      console.info(`Load: ${url} Content-Type: ${contentType}`);
      const blob = await response.blob()
      // const file = new File([blob], getFileName(url, true) ?? 'url-file', contentType ? { type: contentType } : this.fileMeta.MimeType);
      return this.fromBlob(contentType,blob, true, );
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

    await this.save(true);
    this.state = FileState.READY;
  };

  static async fromBlob<
    FileType extends WebFile
  >(
    mimeType: string,
    blob: Blob,
    dbLoad: boolean = true,
  ): Promise<FileType>
  {
    try {
      const FileConstructor: Constructor<FileType> = WebFile as unknown as Constructor<FileType>;
      const { props, files } = await WebFile.readBlob(mimeType,blob, dbLoad);
      const projectFile = new FileConstructor(props);
      await projectFile.initialize(files);
      return projectFile;
    } catch (ex) {
      throw new Error(`Error loading file from blob: ${blob}`);
    }
  }

  static fileState: Record<string, FileState> = {};


  state: FileState = FileState.NONE;
}
