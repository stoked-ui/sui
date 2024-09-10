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

export type MediaFileParams =  {file: MediaFile, options?: { metadata?: true}};

export default class MediaFile implements IMediaFile {
  readonly id: string;

  readonly path?: string;

  readonly lastModified: number;

  readonly name: string;

  readonly size: number;

  readonly type: string;

  readonly mediaType: MediaType;

  readonly webkitRelativePath: string;

  metadata?: any;

  readonly blob: Blob;

  _url?: string;

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


  constructor(params: MediaFileParams) {
    const { file } = params;

    if (!file) {
      throw new Error('Either file or url must be provided');
    }

    this.id = namedId({id: 'mediaFile', length: 6});
    this.lastModified = file.lastModified;
    this.name = file.name;
    this.size = file.size;
    this.type = file.type;
    this.path = file.name;
    if ("webkitRelativePath" in file && file.webkitRelativePath.length > 0) {
      this.path = file.webkitRelativePath;
    }
    this.webkitRelativePath = file.webkitRelativePath;
    this.mediaType = file.mediaType;
    if (!this.mediaType && this.type) {
      this.mediaType = getMediaType(this.type);
    }

    this.arrayBuffer = file.arrayBuffer.bind(file);
    this.slice = file.slice.bind(file);
    this.stream = file.stream.bind(file);
    this.text = file.text.bind(file);
    /*
    if (params.options?.metadata) {
      getMetadata(this).then(() => {
        console.log('metadata', this.metadata);
      }).catch((err) => {
        console.error('Error getting metadata', err);
      });
    }
    */
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

  static async fromUrl(url: string) {
    const blob = await loadFileUrl(url) as File;

    const file = new File([blob], url.split('/').pop()!, { type: blob.type });
    return MediaFile.fromFile({...file, url} as IMediaFile);
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

    return f;
  }

  private static withMimeType(file: IMediaFile) {
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

function getUrlExtension( url ) {
  return url.split(/[#?]/)[0].split('.').pop().trim();
}

function getFileName(url: string, includeExtension?: boolean) {
  const matches = url && typeof url.match === "function" && url.match(/\/?([^/.]*)\.?([^/]*)$/);
  if (!matches) {
    return null;
  }
  if (includeExtension && matches.length > 2 && matches[2]) {
    return matches.slice(1).join(".");
  }
  return matches[1];
}

function loadFileUrl(url: string) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'arraybuffer';

    xhr.onload = async function onLoad() {
      if (xhr.status === 200) {
        try {
          if (xhr.response.byteLength === 0) {
            throw new Error('Fetched file data is empty.');
          }
          let contentType = xhr.getResponseHeader('Content-Type');
          if (contentType === null) {
            contentType = getUrlExtension(url);
          }
          // console.info('Fetched file data size:', xhr.response.byteLength);
          // console.info('Fetched file data type:', {type:  contentType});

          // new Blob([xhr.response], { type: contentType ?? 'application/octet-stream' });
          const file = new File([xhr.response], getFileName(url) ?? 'url-file', {type: contentType ?? 'application/octet-stream'});
          const mediaFile = MediaFile.fromFile(file as IMediaFile);
          resolve(mediaFile);
        } catch (error) {
          // console.error('Error fetching data:', error);
          // console.error('File data size:', xhr.response.byteLength);
          reject(error);
        }
      } else {
        reject(new Error(`HTTP error! status: ${xhr.status}`));
      }
    };

    xhr.onerror = function onError() {
      reject(new Error('Network error occurred'));
    };

    xhr.send();
  });
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
