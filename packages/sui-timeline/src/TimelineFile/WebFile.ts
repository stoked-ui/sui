/*
/!* eslint-disable class-methods-use-this *!/
/!*  eslint-disable @typescript-eslint/naming-convention *!/

import {IMediaFile, saveFileDeprecated,  IMimeType, MimeRegistry } from "@stoked-ui/media-selector";
import { namedId} from '@stoked-ui/common';
import { FileState, SaveOptions } from "./TimelineFile.types";
import LocalDb, {  FileSaveRequest } from "../LocalDb/LocalDb";
import {
  WebFileInitializer,
  IWebFile,
  IWebFileProps,
  saveFileApi,
  IWebData,
  IFileParams, ReadBlob
} from "./WebFile.types";

export const SUIWebFileRefs: IMimeType = MimeRegistry.create('stoked-ui', 'webfile', '.suwr', 'Stoked UI - Editor Project File w/ Url Refs', false);
export const SUIWebFile: IMimeType = MimeRegistry.create('stoked-ui', 'webfile', '.suw', 'Stoked UI - Editor Project File', true);
export default class WebFile implements IWebFile {

  static PropsDelimiter = '---STOKED_UI_PROPS_END---';

  static FilesTableDelimiter = '---STOKED_UI_FILES_TABLE_END---'


  id: string;

  name: string;

  description?: string;

  author?: string;

  size?: number;

  url?: string;

  created: number;

  lastModified?: number;

  protected initialized: boolean = false;

  private _files?: IMediaFile[] = [];

  get files(): IMediaFile[] {
    return this._files || [];
  }

  constructor(props: IWebFileProps, files?: IMediaFile[]) {
    this.id = props.id ?? namedId('webfile');
    this.name = props.name ?? 'new file';
    this.description = props.description;
    this.author = props.author;
    this.created = props.created ?? Date.now();
    this.lastModified = props.lastModified;
    this.url = props.url;
    this._version = [0, undefined, null].includes(props.version) ? 1 : props.version;
    this._files = files;
    console.info(`WebFile: ${this.id} - ${this.name}`);
    this.state = FileState.CONSTRUCTED;
  }

  protected _version: number = 1;


  get fileParams(): IFileParams[] {
    return this.files.map((f) => { return { name: f.name, size: f.size, type: f.type }});
  }

  get version(): number {
    if (this._version === 0) {
      this._version = 1;
    }
    return this._version;
  }


  mimeTypes: IMimeType[] = [
    SUIWebFile,                 // embedded
    SUIWebFileRefs              // w/ url refs
  ];

  // last saved checksum
  protected lastChecksum: null | string = null;

  protected latestChecksum: null | string = null;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  initializer: WebFileInitializer = (fileParams, files) => {
    return Promise.resolve();
  };

  async getSaveRequest(embedded: boolean = !this.fileUrlsValid ): Promise<FileSaveRequest | false> {
    const dirty = await this.isDirty();
    if (!dirty) {
      return false;
    }
    let mime = this.mimeTypes[0];
    if (!embedded) {
      mime = this.mimeTypes[1];
    }
    return {
      id: this.id,
      version: this.version + 1,
      blob: await this.createBlob(false),
      embeddedBlob: await this.createBlob(),
      meta: this.fileData,
      mime,
      embedded
    }
  }

  getMimeType(embedded: boolean = true) {
    if (!embedded && !this.fileUrlsValid) {
      embedded = true;
    }
    return this.mimeTypes[embedded ? 0 : 1];
  }

  get fileData(): IWebData {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      author: this.author,
      created: this.created,
      lastModified: this.lastModified,
      url: this.url,
      version: this.version,
      mimeType: this.getMimeType().type
    };
  }

  getSaveApiOptions(optionProps: SaveOptions): SaveFilePickerOptions {
    if (!optionProps.suggestedName) {
      if (!optionProps.suggestedExt) {
        optionProps.suggestedExt = this.getMimeType().ext as FileExtension;
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

    try {
      const fileData = await this.getSaveRequest();
      if (!fileData) {
        console.info(`${this.name} has not changed. Save cancelled.`);
        return;
      }

      if (LocalDb) {
        await LocalDb.saveFile(fileData);
        this._version += 1;
        this.lastChecksum = await this.checksum();
      }

      if (!silent) {
        const saveOptions = this.getSaveApiOptions({ });
        const options = { ...saveOptions, fileBlob: fileData.blob };
        if ('showSaveFilePicker' in window) {
          await saveFileApi(options);
        } else {
          await saveFileDeprecated(options);
        }
      }
    } catch (ex) {
      console.error(ex);
      throw new Error(ex as string);
    }
  }

  // Function to create a combined file with JSON data and attached files
  async createBlob(embedded: boolean = true): Promise<Blob> {
    try {
      const fileData = this.fileData;
      const propsString = JSON.stringify({ ...fileData });
      const fileParams = this.fileParams;
      console.info('fileParamsString', JSON.stringify(fileParams, null, 2));

      const fileParamsString = JSON.stringify(fileParams);

      // eslint-disable-next-line consistent-this
      const instance = this; // Capture the `this` context
      const stream = new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder();

          try {
            const additionalStreams = instance.getDataStreams(); // Use captured instance

            const encodedPropsString = encoder.encode(propsString)
            // Encode and enqueue fileData
            controller.enqueue(encodedPropsString);
            if (embedded) {
              const encodedDelimiter = encoder.encode(WebFile.PropsDelimiter);
              controller.enqueue(encodedDelimiter);
              const fileParamsEncoded = encoder.encode(fileParamsString);
              controller.enqueue(fileParamsEncoded);
              const filesTableDelimiter = encoder.encode(WebFile.FilesTableDelimiter);
              controller.enqueue(filesTableDelimiter);
              // Get additional data streams and process them
              // eslint-disable-next-line no-restricted-syntax
              const fileWrites: number[] = [];
              // eslint-disable-next-line no-restricted-syntax
              for await (const readableStream of additionalStreams) {
                const reader = readableStream.getReader();
                let totalBytes = 0;
                let chunk: ReadableStreamReadResult<Uint8Array>;

                // eslint-disable-next-line no-cond-assign,no-await-in-loop
                while (!(chunk = await reader.read()).done) {
                  totalBytes += chunk.value.length;
                  controller.enqueue(chunk.value);
                }
                fileWrites.push(totalBytes);
                console.info('totalBytes', totalBytes);
              }

              console.info('file writes', fileWrites);
            }

            controller.close();
          } catch (err) {
            console.error("Stream error:", err);
            controller.error(err);
          }
        },
      });

      const response = new Response(stream);

      // Convert the Response stream to a blob
      return new Blob([await response.blob()], this.getMimeType().typeObj);
    } catch (ex) {
      console.error("Error in createBlob:", ex);
      throw new Error((ex as Error)?.message || "Unknown error");
    }
  }

  protected get fileUrlsValid(): boolean {
    return true;
  }

  protected getDataStreams(): AsyncIterable<ReadableStream<Uint8Array>> {
    // eslint-disable-next-line consistent-this
    const instance = this; // Preserve the `this` context
    return {
      async *[Symbol.asyncIterator]() {
        for (let i = 0; i < instance.files.length; i += 1) {
          const file = instance.files[i];
          // Create a ReadableStream for each file
          yield file.stream() as ReadableStream<Uint8Array>;
        }
      },
    };
  }

  get types() {
    return this.mimeTypes.map((mime) => {
      return {
        accept: mime.accept,
        description: mime.description,
      }
    });
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

  async initialize(): Promise<void> {
    await this.save(true);
    this.initialized = true;
  };

  async readBlob(blob: Blob, searchDb: boolean = false): Promise<IWebFile> {
    return ReadBlob<WebFile>(blob, searchDb) as unknown as Promise<IWebFile>;
  }

  static fileState: Record<string, FileState> = {};

  state: FileState = FileState.NONE;
}
*/
