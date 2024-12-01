import {Howl} from "howler";
import { FetchBackoff } from '@stoked-ui/common';
import {
  DropFile,
  FileArray,
  FILES_TO_IGNORE,
  FileSystemFileHandle,
  FileValue,
  FromEventInput,
  IMediaFile,
  PragmaticDndEvent
} from './MediaFile.types'
import {MediaType, getMediaType} from '../MediaType/MediaType';
import {ExtensionMimeTypeMap} from "../MimeType/MimeType";
import namedId from "../namedId";
import ShadowStage from "../ShadowStage";

export default class MediaFile implements IMediaFile {
  readonly id: string;

  readonly path?: string;

  readonly created: number;

  readonly lastModified: number;

  readonly name: string;

  get size() {
    return this._metadataSize + this.blob.size;
  }

  readonly _metadataSize: number;

  readonly type: string;

  readonly mediaType: MediaType;

  readonly webkitRelativePath: string;

  element?: any;

  private _duration?: number;

  private _width?: number;

  private _height?: number;

  private _aspectRatio?: number;

  get duration() {
    if (this._duration) {
      return this._duration ?? null;
    }
    if (['video', 'audio'].includes(this.mediaType)) {
      if (this.mediaType === 'audio') {
        this._duration = (this.element as Howl).duration();
      }
      this._duration = this.element.duration;
      return this._duration ?? null;
    }
    return null;
  };

  get width() {
    if (this._width) {
      return this._width ?? null;
    }
    if (['video', 'image'].includes(this.mediaType)) {
      this._width = this.element.clientWidth;
      return this._width ?? null;
    }
    return null;
  }

  get height() {
    if (['video', 'image'].includes(this.mediaType)) {
      this._height = this.element.clientHeight;
      return this._height ?? null;
    }
    return null;
  }

  get aspectRatio() {
    if (this._aspectRatio) {
      return this._aspectRatio ?? null;
    }
    if (['video', 'image'].includes(this.mediaType)) {
      if (this.height && this.width) {
        this._aspectRatio = this.width / this.height;
        return this._aspectRatio;
      }
      return null;
    }
    return null;
  }

  readonly version: number;

  children?: IMediaFile[];

  visibleIndex?: number;

  expanded?: boolean;

  selected?: boolean;

  icon: string | null = null;

  thumbnail: string | null = null;

  tags?: any;

  readonly blob: Blob;

  _url?: string;

  image?: string;

  backgroundImage?: string;

  itemId: string;

  static container: HTMLDivElement;

  static renderer: HTMLCanvasElement;

  static renderCtx: CanvasRenderingContext2D;

  readonly _metadataBlob: Blob;

  slice(start?: number, end?: number, contentType?: string): Blob {
    const combinedBlob = new Blob([this._metadataBlob, this.blob], { type: this.type });
    return combinedBlob.slice(start, end, contentType);
  }

  async text(): Promise<string> {
    const combinedBlob = new Blob([this._metadataBlob, this.blob], { type: this.type });
    return combinedBlob.text();
  }

  async arrayBuffer(): Promise<ArrayBuffer> {
    const combinedBlob = new Blob([this._metadataBlob, this.blob], { type: this.type });
    return combinedBlob.arrayBuffer();
  }

  stream(): ReadableStream<Uint8Array> {
    const metadata = JSON.stringify({
      id: this.id,
      name: this.name,
      type: this.type,
      size: this.size,
      created: this.created,
      lastModified: this.lastModified,
      mediaType: this.mediaType,
      path: this.path,
    });

    const metadataUint8Array = new TextEncoder().encode(metadata);
    const metadataBlob = new Blob([metadataUint8Array], { type: 'application/json' });
    const combinedBlob = new Blob([metadataBlob, this.blob], { type: this.type });

    return combinedBlob.stream();
  }


  get url() {
    if (!this._url) {
      this._url = URL.createObjectURL(this.blob);
    }
    return this._url;
  }

  constructor(file: any) {

    if (!file) {
      throw new Error('Either file or url must be provided');
    }

    this.id = file.id ? file.id : namedId({id: 'mediaFile', length: 6});
    this.itemId = file.itemId ?? this.id;
    this.created = file.created ?? file.lastModified ?? Date.now();
    this.lastModified = file.lastModified;
    this.name = file.name;
    this.type = file.type;
    this.path = file.name;
    this._url = file._url ?? file.url;
    this.image = file.image;
    this.version = file.version ?? 1;
    if ("webkitRelativePath" in file && file.webkitRelativePath?.length > 0) {
      this.path = file.webkitRelativePath;
    }
    this.webkitRelativePath = file.webkitRelativePath;
    this.mediaType = file.mediaType;
    if (!this.mediaType && this.type) {
      this.mediaType = getMediaType(this.type);
    }
    this.children = file.children;
    this.expanded = file.expanded;
    this.selected = file.selected;
    this.visibleIndex = file.visibleIndex;

    this.blob = file instanceof Blob ? file : new Blob([file], { type: file.type });

    // Precompute metadata size
    const metadata = JSON.stringify({
      id: this.id,
      name: this.name,
      type: this.type,
      url: this._url,
      created: this.created,
      lastModified: this.lastModified,
      mediaType: this.mediaType,
      path: this.path,
    });

    const metadataUint8Array = new TextEncoder().encode(metadata);
    this._metadataBlob = new Blob([metadataUint8Array], { type: 'application/json' });
    this._metadataSize = metadataUint8Array.length;
  }


  async preload(): Promise<void> {
    await MediaFile.preload(this, this.url);
  }

  static ensureStaticHtml() {
    if (!MediaFile.container) {
      MediaFile.container = document.createElement('div');
      MediaFile.renderer = document.createElement('canvas');
      MediaFile.renderCtx = MediaFile.renderer.getContext('2d') as CanvasRenderingContext2D;
    }
  }

  static async from(input: FromEventInput | { source?: { items: unknown[] } }): Promise<IMediaFile[]> {
    this.ensureStaticHtml();

    const fromWrapper = (inputWrapper: FromEventInput | { source?: { items: unknown[] } }) => {
      if (isObject<DragEvent>(inputWrapper) && isDataTransfer(inputWrapper.dataTransfer)) {
        return getDataTransferFiles(inputWrapper.dataTransfer, inputWrapper.type);
      }
      if (isChangeEvt(inputWrapper)) {
        return getInputFiles(inputWrapper);
      }
      if ('source' in inputWrapper && inputWrapper.source && 'items' in inputWrapper.source && Array.isArray(inputWrapper.source.items) && inputWrapper.source.items.length > 0) {
        return getDropFiles(input as PragmaticDndEvent);
      }
      if ((Array.isArray(inputWrapper) && inputWrapper.every(item => 'getFile' in item && typeof item.getFile === 'function')) || (inputWrapper as FileSystemFileHandle[] !== undefined)) {
        return getFsHandleFiles(input as FileSystemFileHandle[])
      }
      return [];
    }
    const files = await fromWrapper(input) as IMediaFile[]
    const allFiles = noIgnoredFiles(files);
    const filePromises = allFiles.map((preloadFile) => this.preload(new MediaFile(preloadFile), preloadFile.url));
    await Promise.all(filePromises)
    return allFiles;
  }

  static fromFile(file: IMediaFile, path?: string) {
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
    console.info('f', f)
    const mediaFile = new MediaFile(f);
    console.info('mediaFile', mediaFile);
    return mediaFile;
  }

  static setProperty(o: any, name: string, value: any) {
    Object.defineProperty(o, name, {
      value,
      writable: false,
      configurable: false,
      enumerable: true
    });
  }

  static async fromUrl(url: string, throwOnError: boolean = false): Promise<IMediaFile | null> {
    if (!MediaFile.container) {
      MediaFile.container = document.createElement('div');
    }

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

    const contentType = response.headers.get("content-type");
    const blob = await response.blob()
    const file = new File([blob], getFileName(url, true) ?? 'url-file', {type: contentType ?? 'application/octet-stream'});
    const mediaFile = new MediaFile({file, url} );
    MediaFile.setProperty(mediaFile, '_url', url);
    MediaFile.setProperty(mediaFile, 'id', namedId('mediaFile'));

    const fullMediaFile: MediaFile = MediaFile.fromFile(mediaFile as IMediaFile);
    await this.preload(fullMediaFile,url)
    return fullMediaFile;
  }

  static async preload(mediaFile: MediaFile, url: string): Promise<void> {
    this.ensureStaticHtml();

    switch(mediaFile.mediaType) {
      case 'video':
      {
        const preloaded = !!mediaFile.element;
        if (preloaded) {
          return new Promise((resolve) => {
            resolve();
          });
        }
        const item = document.createElement('video') as HTMLVideoElement;
        mediaFile.element = item;
        ShadowStage.getStage().appendChild(item);

        item.preload = 'auto';
        return new Promise((resolve, reject) => {
          try {
            if (!item) {
              reject(new Error(`Video not loaded ${mediaFile.name} - ${mediaFile._url}`))
              return;
            }
            let loadedMetaData = false;
            item.addEventListener('loadedmetadata', () => {
              const ratio = item.clientWidth / item.clientHeight;
              item.style.aspectRatio = `${ratio}`;
              // this.cacheMap[action.id] = item;
              loadedMetaData = true;
              // console.info('action preload: video loadedmetadata', mediaFile.name)
            });

            let canPlayThrough = false;
            item.addEventListener('canplaythrough', () => {
              canPlayThrough = true;
              // console.info('action preload: video canplaythrough', mediaFile.name)
              // VideoControl.captureScreenshot(item, ((action.end - action.start) / 2) + action.start).then((screenshot) => {
              //  this.screenshots[action.id] = screenshot;
              // })
            })

            item.autoplay = false;

            item.style.display = 'flex';
            item.src = mediaFile.url;
            let intervalId;
            let loadingSeconds = 0;

            const isLoaded = () => {
              return item.readyState === 4 && loadedMetaData && canPlayThrough;
            }
            const waitUntilLoaded = () =>{
              intervalId = setInterval(() => {
                loadingSeconds += 1;
                if (isLoaded()) {
                  clearInterval(intervalId);
                  resolve();
                } else if (loadingSeconds > 20) {
                  clearInterval(intervalId);
                  console.info('MediaFile preload: video timeout', mediaFile.name)
                  resolve();
                }
              }, 1000); // Run every 1 second
            }

            if (!isLoaded()) {
              waitUntilLoaded();
            }

          } catch (ex) {
            reject(ex);
          }
        })
      }
      case 'audio': {
        return new Promise((resolve, reject) => {
          try {
            const item = new Howl({
              src: url,
              loop: false,
              autoplay: false,
              onload: () => {
                mediaFile.element = item;
                resolve();
              }
            });
          } catch(ex) {
            let msg = `Error loading audio file: ${url}`;
            if (ex as Error) {
              msg += (ex as Error).message;
            }
            reject(new Error(msg));
          }
        })
      }
      default: {
        return new Promise((resolve) => {
          resolve();
        });
      }
    }
  }
/*

  static async writeFiles(files: MediaFile[], controller: ReadableStreamDefaultController<Uint8Array>, chunkSize = 64 * 1024) {
    for (let i = 0; i < files.length; i += 1){
      const file = files[i];
      let position = 0;

      while (position < file.mediaFileSize) {
        // Read the chunk from the file
        // eslint-disable-next-line no-await-in-loop
        const chunk = await file.slice(position, position + chunkSize).arrayBuffer();

        // Write the chunk to the stream
        controller.enqueue(new Uint8Array(chunk));

        // Move the position for the next chunk
        position += chunkSize;
      }
    }
  }
*/

  static withMimeType(file: IMediaFile) {
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

    return file;
  }
}

async function getDropFiles(input: PragmaticDndEvent): Promise<IMediaFile[]> {
  if (!input?.source?.items) {
    return [] as IMediaFile[];
  }
  // console.log('input', JSON.stringify(input.source, null, 2));
  const files = input.source.items;
  const finalizedFiles = await Promise.all(files.map(async (item: DropFile) =>  {
    if (item as DataTransferItem) {
      const dti = item as DataTransferItem;
      return toFilePromises(dti);
    }
    return MediaFile.fromFile(item as IMediaFile);
  }));
  return noIgnoredFiles(finalizedFiles.flat() as IMediaFile[]);
}

export function getFileName(url: string, includeExtension?: boolean) {
  const matches = url && typeof url.match === "function" && url.match(/\/?([^/.]*)\.?([^/]*)$/);
  if (!matches) {
    return null;
  }
  if (includeExtension && matches.length > 2 && matches[2]) {
    return matches.slice(1).join(".");
  }
  return matches[1];
}

function isDataTransfer(value: unknown): value is DataTransfer {
  return isObject(value);
}

function isChangeEvt(value: unknown): value is Event {
  return isObject<Event>(value) && isObject(value.target);
}

function isObject<T>(v: unknown): v is T {
  return typeof v === 'object' && v !== null
}

function getInputFiles(evt: Event) {
  return fromList((evt.target as HTMLInputElement).files).map(file => MediaFile.fromFile(file as IMediaFile));
}

// Ee expect each handle to be https://developer.mozilla.org/en-US/docs/Web/API/FileSystemFileHandle
async function getFsHandleFiles(handles: FileSystemFileHandle[]) {
  const files = await Promise.all(handles.map(h => h.getFile()));
  return files.map(file => MediaFile.fromFile(file as IMediaFile));
}

async function getDataTransferFiles(dt: DataTransfer, type: string) {
  // IE11 does not support dataTransfer.items
  // See https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer/items#Browser_compatibility
  if (dt.items) {
    const items = fromList(dt.items)
    .filter(item => (item as DataTransferItem).kind === 'file');
    // According to https://html.spec.whatwg.org/multipage/dnd.html#dndevents,
    // only 'dragstart' and 'drop' has access to the data (source node)
    if (type !== 'drop') {
      return [];
    }
    const files = await Promise.all((items as DataTransferItem[]).map(toFilePromises));
    return noIgnoredFiles(files.flat() as IMediaFile[]);
  }

  return noIgnoredFiles(fromList(dt.files)
  .map((file) => MediaFile.fromFile(file as IMediaFile)));
}

function noIgnoredFiles(files: IMediaFile[]) {
  return files.flat(Infinity).filter(file => {
    // console.log('ignore name: ', file.name, FILES_TO_IGNORE.indexOf(file.name) );
    return FILES_TO_IGNORE.indexOf(file.name) === -1
  });
}
/*


async function loadFileUrl(url: string): Promise<any> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  const contentType = response.headers.get("content-type");
  const blob = await response.blob()
  const file = new File([blob], getFileName(url, true) ?? 'url-file', {type: contentType ?? 'application/octet-stream'});
  return MediaFile.fromFile({...file, url} as IMediaFile);
}
*/

// IE11 does not support Array.from()
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from#Browser_compatibility
// https://developer.mozilla.org/en-US/docs/Web/API/FileList
// https://developer.mozilla.org/en-US/docs/Web/API/DataTransferItemList
export function fromList(items: DataTransferItemList | FileList | null): (IMediaFile | DataTransferItem)[] {
  if (items === null) {
    return [];
  }

  const files : (IMediaFile | DataTransferItem)[] = [];

  // tslint:disable: prefer-for-of
  for (let i = 0; i < items.length; i += 1) {
    const file = items[i] as IMediaFile | DataTransferItem
    files.push(file);
  }
  return files as (IMediaFile | DataTransferItem)[];
}

// https://developer.mozilla.org/en-US/docs/Web/API/DataTransferItem
function toFilePromises(item: DataTransferItem) {
  if (typeof item.webkitGetAsEntry !== 'function') {
    return fromDataTransferItem(item);
  }

  const entry = item.webkitGetAsEntry();

  // Safari supports dropping an image node from a different window and can be retrieved using
  // the DataTransferItem.getAsFile() API
  // NOTE: FileSystemEntry.file() throws if trying to get the file
  if (entry && entry.isDirectory) {
    return fromDirEntry(entry as FileSystemDirectoryEntry);
  }

  return fromDataTransferItem(item);
}

/*
 function flatten<T = []>(items: T): T[] {
 return items.reduce((acc, files) => [
 ...acc,
 ...(Array.isArray(files) ? flatten(files) : [files])
 ], []);
 }
 */

function fromDataTransferItem(item: DataTransferItem) {
  const file = item.getAsFile();
  if (!file) {
    return Promise.reject(new Error(`${item} is not a File`));
  }
  const fwp = MediaFile.fromFile(file as IMediaFile);
  return Promise.resolve(fwp);
}

// https://developer.mozilla.org/en-US/docs/Web/API/FileSystemEntry
async function fromEntry(entry: FileSystemEntry) {
  return entry.isDirectory ? fromDirEntry(entry as FileSystemDirectoryEntry) : fromFileEntry(entry as FileSystemFileEntry);
}

// https://developer.mozilla.org/en-US/docs/Web/API/FileSystemDirectoryEntry
function fromDirEntry(entry: FileSystemDirectoryEntry) {
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
          const items = Promise.all((batch as FileSystemEntry[]).map(fromEntry));
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

// https://developer.mozilla.org/en-US/docs/Web/API/FileSystemFileEntry
// type ToMediaFile = (file: MediaFile) => void;
// type ErrorFunc = (err: unknown) => void;
// type FileFunc = (toFile: ToMediaFile, errorFunc: ErrorFunc) => void
// type EntryFile = { fullPath: string, file: FileFunc };
async function fromFileEntry(entry: FileSystemFileEntry) {
  return new Promise<IMediaFile>((resolve, reject) => {
    entry.file((file: File) => {
      const fwp = MediaFile.fromFile(file as IMediaFile, entry.fullPath);
      resolve(fwp);
    },  (err: unknown) => {
      reject(err);
    });
  });
}

export async function base64Encode (file: Blob): Promise<string> {
  const reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
