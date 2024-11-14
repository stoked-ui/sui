import safeStringify from "safe-stringify";
import {Howl} from "howler";
import {MediaType, getMediaType} from './MediaType';
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
import {ExtensionMimeTypeMap} from "./MimeType";
import namedId from "../namedId";

export default class MediaFile implements IMediaFile {
  readonly id: string;

  readonly path?: string;

  readonly created: number;


  readonly lastModified: number;

  readonly name: string;

  readonly size: number;

  get mediaFileSize() {
    return this.size;
  }

  readonly type: string;

  readonly mediaType: MediaType;

  readonly webkitRelativePath: string;

  readonly element?: any;

  readonly duration?: number;

  readonly width?: number;

  readonly height?: number;

  readonly aspectRatio?: number;

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

  arrayBuffer: () => Promise<ArrayBuffer>;

  slice: (start?: number, end?: number, contentType?: string) => Blob;

  stream: () => ReadableStream<Uint8Array>;

  text: () => Promise<string>;


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
    this.size = file.size;
    this.type = file.type;
    this.path = file.name;
    this._url = file._url ?? file.url;
    this.image = file.image;
    this.version = file.version ?? 1;
    if ("webkitRelativePath" in file && file.webkitRelativePath.length > 0) {
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

    this.arrayBuffer = file.arrayBuffer.bind(file);
    this.slice = file.slice.bind(file);
    this.stream = file.stream.bind(file);
    this.text = file.text.bind(file);

    this.blob = new Blob([file], { type: file.type });
  }

  static async from(input: FromEventInput | { source?: { items: unknown[] } }): Promise<IMediaFile[]> {
    if (!MediaFile.container) {
      MediaFile.container = document.createElement('div');
      MediaFile.renderer = document.createElement('canvas');
      MediaFile.renderCtx = MediaFile.renderer.getContext('2d') as CanvasRenderingContext2D;
    }
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
    return noIgnoredFiles(files);
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

    return new MediaFile(f);
  }

  static setProperty(o: any, name: string, value: any) {
    Object.defineProperty(o, name, {
      value,
      writable: false,
      configurable: false,
      enumerable: true
    });
  }

  static async fromUrl(url: string, container?: HTMLDivElement): Promise<IMediaFile> {
    if (!container) {
      if (!MediaFile.container) {
        MediaFile.container = document.createElement('div');
      }
      container = MediaFile.container;
    }
    const response = await fetch(url, {cache: "no-store"});
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const contentType = response.headers.get("content-type");
    const blob = await response.blob()
    const file = new File([blob], getFileName(url, true) ?? 'url-file', {type: contentType ?? 'application/octet-stream'});
    const mediaFile = file as IMediaFile;
    MediaFile.setProperty(mediaFile, '_url', response.url);
    MediaFile.setProperty(mediaFile, 'id', namedId('mediaFile'));

    const fullMediaFile: MediaFile = MediaFile.fromFile(mediaFile as IMediaFile);

    switch(fullMediaFile.mediaType) {
      case 'video':
      {
        const item = document.createElement('video') as HTMLVideoElement;
        item.id = fullMediaFile.id;
        item.preload = 'auto';
        container.appendChild(item);
        return new Promise((resolve, reject) => {
          try {
            let loadedMetaData = false;
            item.addEventListener('loadedmetadata', () => {
              MediaFile.setProperty(fullMediaFile, 'duration', item.duration);
              MediaFile.setProperty(fullMediaFile, 'width', item.videoWidth);
              MediaFile.setProperty(fullMediaFile, 'height', item.videoHeight);
              const ratio = item.videoWidth / item.videoHeight;
              MediaFile.setProperty(fullMediaFile, 'aspectRatio', ratio);
              item.style.aspectRatio = `${ratio}`;
              // item.style.objectFit = action.fit as string;
              loadedMetaData = true;
            });

            let canPlayThrough = false;
            item.addEventListener('canplaythrough', () => {
              canPlayThrough = true;
            })

            item.autoplay = false;
            item.style.display = 'flex';
            item.src = url;
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
                  MediaFile.setProperty(fullMediaFile, 'element', item);
                  resolve(fullMediaFile);
                } else if (loadingSeconds > 20) {
                  reject(new Error(`didn't load video ${fullMediaFile.url} within 20 seconds'`));
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
                MediaFile.setProperty(fullMediaFile, 'element', item);
                resolve(fullMediaFile);
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
        return fullMediaFile;
      }
    }
    return fullMediaFile;
  }

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

async function loadTrack(track: { id?: string, src: string; name?: string }): Promise<any> {

}

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
