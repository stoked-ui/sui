import {FetchBackoff} from "@stoked-ui/common";
import namedId from "../namedId";
import IMediaFile2 from './IMediaFile2';
import { getMediaType, MediaType } from '../MediaType/MediaType';
import {DropFile,
  getInputFiles, FileArray, FileValue, FromEventInput, FILES_TO_IGNORE, isChangeEvt, isDataTransfer, isObject, PragmaticDndEvent} from "./MediaFile2.types";
import {ExtensionMimeTypeMap} from "../MimeType/MimeType";
import {IMediaFile} from "../MediaFile";

export default class MediaFile2 extends File implements IMediaFile2 {
  readonly created: number;

  readonly mediaType: MediaType;

  readonly path: string;

  readonly url: string;

  readonly media: any;

  readonly id: string;

  readonly children?: IMediaFile[];

  constructor(
    fileBits: BlobPart[],
    fileName: string,
    options: FilePropertyBag & {
      created?: number;
      path?: string;
      url?: string;
      media?: any;
      id?: string;
      children?: IMediaFile[];
    }
  ) {
    super(fileBits, fileName, options);

    this.created = options.created ?? Date.now();
    this.mediaType = getMediaType(options.type ?? this.type); // Automatically assign mediaType
    this.path = options.path ?? '';
    this.url = options.url ?? '';
    this.media = options.media ?? {};
    this.children = options.children ?? [];
    this.id = options.id ?? MediaFile2.generateId;
  }

  private static get generateId(): string {
    return namedId('mediafile');
  }

  get metadataBlob(): Blob {
    return new Blob(
      [JSON.stringify(this.mediaProps)], { type: 'application/json' }
    );
  }

  async toBlob(): Promise<Blob> {
    return new Blob([this.metadataBlob, this], { type: this.type });
  }

  getUrl() {
    if (this.url.length > 0) {
      return this.url;
    }
    return URL.createObjectURL(this);
  }

  async arrayBuffer(): Promise<ArrayBuffer> {
    const blob = await this.toBlob();
    return blob.arrayBuffer();
  }

  async text(): Promise<string> {
    const blob = await this.toBlob();
    return blob.text();
  }

  stream(): ReadableStream<Uint8Array> {
    const streamBlob = new Blob([JSON.stringify(this.mediaProps), this], { type: this.type });
    return streamBlob.stream();
  }

  slice(start?: number, end?: number, contentType?: string): Blob {
    const combinedBlob = new Blob([JSON.stringify(this.mediaProps), this], { type: this.type });
    return combinedBlob.slice(start, end, contentType);
  }

  private get mediaProps() {
    return {
      created: this.created,
      mediaType: this.mediaType,
      path: this.path,
      url: this.url,
      media: this.media,
      id: this.id,
      children: this.children,
    };
  }

  get metadata() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      size: this.size,
      created: this.created,
      lastModified: this.lastModified,
      mediaType: this.mediaType,
      children: this.children,
      path: this.path,
      url: this.url,
      media: this.media,
    };
  }

  static withMimeType(file: File) {
    const {name} = file;
    const hasExtension = name && name.lastIndexOf('.') !== -1;
    if (hasExtension) {
      const ext = name.split('.')
      .pop()!.toLowerCase();

      const type = ExtensionMimeTypeMap.get(ext);
      if (type) {
        Object.defineProperty(file, 'type', {
          value: type,
          writable: false,
          configurable: false,
          enumerable: true
        });
        Object.defineProperty(file, 'mediaType', {
          value: getMediaType(type),
          writable: false,
          configurable: false,
          enumerable: true
        })
      }
    }

    return file as IMediaFile2;
  }

  static fromFile(file: File, path?: string): MediaFile2 {
    const f = this.withMimeType(file);
    const {webkitRelativePath} = file;
    let pathValue = file.name;
    if (typeof path === 'string') {
      pathValue = path;
    } else if (webkitRelativePath && webkitRelativePath.length > 0) {
      pathValue = webkitRelativePath
    }
    if (typeof f.path !== 'string') { // on electron, path is already set to the absolute path
      Object.defineProperty(f, 'path', {
        value: pathValue,
        writable: false,
        configurable: false,
        enumerable: true
      });
    }
    const mediaFileOptions = {
      type: file.type,
      created: file.lastModified, // Using lastModified date as the creation time
      path: `/files/${file.name}`, // Example path
      url: URL.createObjectURL(file),
      media: {
        description: "Automatically generated file metadata",
        tags: [],
      },
      id: this.generateId, // Generate a unique ID
    };

    // Automatically determine mediaType using the file's MIME type
    mediaFileOptions['mediaType'] = getMediaType(file.type);

    // Create MediaFile2 instance
    return new MediaFile2([file], file.name, mediaFileOptions);
  }

  static async fromUrl(url: string, throwOnError: boolean = false): Promise<MediaFile2 | null> {
    // Attempt to fetch the data from the provided URL
    const response = await FetchBackoff(url, {
      method: "GET",
    }, {
      retries: 5,
      initialDelay: 1000,
      backoffFactor: 2,
      retryCondition: (res: any, error: Error) => {
        if (error) {
          return true; // Retry on network errors
        }
        return res?.status === 503; // Retry on service unavailable
      },
    });

    // Check if the response status is OK (status code 2xx)
    if (!response.ok) {
      // Log the response status and potentially the response body for debugging
      const errorMessage = await response.text();
      console.error(`Failed to fetch data from URL: ${url} - Status: ${response.status} - Message: ${errorMessage}`);
      if (throwOnError) {
        throw new Error(`Network response was not ok. Status: ${response.status}`);
      }
      return null;
    }
    const blob = await response.blob();
    const fileName = url.split('/').pop() || 'downloaded-file';
    const options = {
      type: blob.type,
      created: Date.now(),
      path: url,
      url,
      media: {
        description: "Fetched from URL",
        tags: [],
      },
      id: this.generateId,
    };

    return new MediaFile2([blob], fileName, options);
  }

  static async fromUrls(urls: string[]): Promise<MediaFile2[]> {
    const mediaFiles = await Promise.all(
      urls.map(async (url) => {
        try {
          return await this.fromUrl(url);
        } catch (error) {
          console.error(`Failed to fetch MediaFile2 from URL: ${url}`, error);
          return null; // Handle failure by returning null
        }
      })
    );

    // Filter out any null results caused by failed fetches
    return mediaFiles.filter((file): file is MediaFile2 => file !== null);
  }

  static async  getDropFiles(input: PragmaticDndEvent): Promise<IMediaFile2[]> {
    if (!input?.source?.items) {
      return [] as IMediaFile2[];
    }
    // console.log('input', JSON.stringify(input.source, null, 2));
    const files = input.source.items;
    const finalizedFiles = await Promise.all(files.map(async (item: DropFile) =>  {
      if (item as DataTransferItem) {
        const dti = item as DataTransferItem;
        return this.toFilePromises(dti);
      }
      return MediaFile2.fromFile(item as IMediaFile2);
    }));
    return this.noIgnoredFiles(finalizedFiles.flat() as IMediaFile2[]);
  }

  // Ee expect each handle to be https://developer.mozilla.org/en-US/docs/Web/API/FileSystemFileHandle
  static async getFsHandleFiles(handles: FileSystemFileHandle[]) {
    const files = await Promise.all(handles.map(h => h.getFile()));
    return files.map(file => MediaFile2.fromFile(file as IMediaFile2));
  }

  static async from(input: FromEventInput | { source?: { items: unknown[] } }): Promise<IMediaFile2[]> {

    const fromWrapper = (inputWrapper: FromEventInput | { source?: { items: unknown[] } }) => {
      if (isObject<DragEvent>(inputWrapper) && isDataTransfer(inputWrapper.dataTransfer)) {
        return this.fromDataTransfer(inputWrapper.dataTransfer, inputWrapper.type);
      }
      if (isChangeEvt(inputWrapper)) {
        return getInputFiles(inputWrapper);
      }
      if ('source' in inputWrapper && inputWrapper.source && 'items' in inputWrapper.source && Array.isArray(inputWrapper.source.items) && inputWrapper.source.items.length > 0) {
        return this.getDropFiles(input as PragmaticDndEvent);
      }
      if ((Array.isArray(inputWrapper) && inputWrapper.every(item => 'getFile' in item && typeof item.getFile === 'function')) || (inputWrapper as FileSystemFileHandle[] !== undefined)) {
        return this.getFsHandleFiles(input as FileSystemFileHandle[])
      }
      return [];
    }
    const files = await fromWrapper(input) as IMediaFile2[]
    const allFiles = this.noIgnoredFiles(files);
    // const filePromises = allFiles.map((preloadFile) => this.preload(new
    // MediaFile2(preloadFile), preloadFile.url));
    // await Promise.all(filePromises)
    return allFiles;
  }


  static noIgnoredFiles(files: IMediaFile2[]) {
    return files.flat(Infinity).filter(file => {
      // console.log('ignore name: ', file.name, FILES_TO_IGNORE.indexOf(file.name) );
      return FILES_TO_IGNORE.indexOf(file.name) === -1
    });
  }

  static fromDataTransferItem(item: DataTransferItem) {
    const file = item.getAsFile();
    if (!file) {
      return Promise.reject(new Error(`${item} is not a File`));
    }
    const fwp = MediaFile2.fromFile(file as IMediaFile2);
    return Promise.resolve(fwp);
  }

  static async fromFileEntry(entry: FileSystemFileEntry) {
    return new Promise<IMediaFile2>((resolve, reject) => {
      entry.file((file: File) => {
        const fwp = MediaFile2.fromFile(file as IMediaFile2, entry.fullPath);
        resolve(fwp);
      },  (err: unknown) => {
        reject(err);
      });
    });
  }

  // https://developer.mozilla.org/en-US/docs/Web/API/FileSystemEntry
  static async fromEntry(entry: FileSystemEntry) {
    return entry.isDirectory ? this.fromDirEntry(entry as FileSystemDirectoryEntry) : this.fromFileEntry(entry as FileSystemFileEntry);
  }


  static fromDirEntry(entry: FileSystemDirectoryEntry) {
    const reader = entry.createReader();

    return new Promise<FileArray[]>((resolve, reject) => {
      const entries: Promise<FileValue[]>[] = [];

      function readEntries() {
        // https://developer.mozilla.org/en-US/docs/Web/API/FileSystemDirectoryEntry/createReader
        // https://developer.mozilla.org/en-US/docs/Web/API/FileSystemDirectoryReader/readEntries
        reader.readEntries(async (batch: unknown[]) => {
          if (!batch.length) {
            // Done reading directory
            try {
              const files = await Promise.all(entries);
              resolve(files);
            } catch (err) {
              reject(err);
            }
          } else {
            const items = Promise.all((batch as FileSystemEntry[]).map(MediaFile2.fromEntry));
            entries.push(items);

            // Continue reading
            readEntries();
          }
        }, (err: unknown) => {
          reject(err);
        });
      }

      readEntries();
    });
  }

  static toFilePromises(item: DataTransferItem) {
    if (typeof item.webkitGetAsEntry !== 'function') {
      return this.fromDataTransferItem(item);
    }

    const entry = item.webkitGetAsEntry();

    // Safari supports dropping an image node from a different window and can be retrieved using
    // the DataTransferItem.getAsFile() API
    // NOTE: FileSystemEntry.file() throws if trying to get the file
    if (entry && entry.isDirectory) {
      return this.fromDirEntry(entry as FileSystemDirectoryEntry);
    }

    return this.fromDataTransferItem(item);
  }

  // IE11 does not support Array.from()
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from#Browser_compatibility
  // https://developer.mozilla.org/en-US/docs/Web/API/FileList
  // https://developer.mozilla.org/en-US/docs/Web/API/DataTransferItemList
  static fromList(items: DataTransferItemList | FileList | null): (IMediaFile2 | DataTransferItem)[] {
    if (items === null) {
      return [];
    }

    const files : (IMediaFile2 | DataTransferItem)[] = [];

    // tslint:disable: prefer-for-of
    for (let i = 0; i < items.length; i += 1) {
      const file = items[i] as IMediaFile2 | DataTransferItem
      files.push(file);
    }
    return files as (IMediaFile2 | DataTransferItem)[];
  }

  static async fromDataTransfer(dt: DataTransfer, type: string) {
    // IE11 does not support dataTransfer.items
    // See https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer/items#Browser_compatibility
    if (dt.items) {
      const items = this.fromList(dt.items)
      .filter(item => (item as DataTransferItem).kind === 'file');
      // According to https://html.spec.whatwg.org/multipage/dnd.html#dndevents,
      // only 'dragstart' and 'drop' has access to the data (source node)
      if (type !== 'drop') {
        return [];
      }
      const files = await Promise.all((items as DataTransferItem[]).map(this.toFilePromises));
      return this.noIgnoredFiles(files.flat() as IMediaFile2[]);
    }

    return this.noIgnoredFiles(this.fromList(dt.files).map((file) => MediaFile2.fromFile(file as IMediaFile2)));
  }
}

