import MediaType, { getMediaType } from './MediaType';
import {
  IMediaFile,
  IMediaDirectory,
  FromEventInput,
  PragmaticDndEvent,
  DropFile,
  FileSystemFileHandle,
  FileArray,
  FileValue,
  FILES_TO_IGNORE
} from './MediaFile.types'
import {ExtensionMimeTypeMap} from "./MimeType";
import namedId from "../namedId";

interface MediaDirectoryProps {
  path?: string;
  lastModified?: number;
  name: string;
  size?: number;
  webkitRelativePath?: string;
  fullPath: string;
}

export class MediaDirectory implements IMediaDirectory {
  readonly path?: string;
  readonly lastModified: number;
  readonly name: string;
  readonly size: number;
  readonly webkitRelativePath: string;

  constructor(file: MediaDirectoryProps) {
    this.lastModified = file.lastModified ?? 0;
    this.name = file.name;
    this.size = file.size ?? 0;
    this.path = file.fullPath;
    if ("webkitRelativePath" in file && file.webkitRelativePath && file.webkitRelativePath.length > 0) {
      this.path = file.webkitRelativePath;
    }
    this.webkitRelativePath = file.webkitRelativePath ?? '';
  }

  static fromDirectory(entry: FileSystemDirectoryEntry, path?: string): MediaDirectory {
    const directory = new MediaDirectory(entry)
    console.log('from directory', directory)
    if (typeof directory.path !== 'string') { // on electron, path is already set to the absolute path
      const {webkitRelativePath} = directory;
      Object.defineProperty(directory, 'path', {
        value: typeof path === 'string' ? path
          // If <input webkitdirectory> is set,
          // the File will have a {webkitRelativePath} property
          // https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/webkitdirectory
          : typeof webkitRelativePath === 'string' && webkitRelativePath.length > 0 ? webkitRelativePath : directory.name,
        writable: false,
        configurable: false,
        enumerable: true
      });
    }
    return directory;
  }
}

export default class MediaFile implements IMediaFile {
  readonly id: string;
  readonly path?: string;
  readonly lastModified: number;
  readonly name: string;
  readonly size: number;
  readonly type: string;
  readonly mediaType: MediaType;
  readonly webkitRelativePath: string;
  arrayBuffer: () => Promise<ArrayBuffer>;
  slice: (start?: number, end?: number, contentType?: string) => Blob;
  stream: () => ReadableStream<Uint8Array>;
  text: () => Promise<string>;

  constructor(file: MediaFile) {
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
  }
  static async from(input: FromEventInput | { source?: { items: unknown[] } }): Promise<IMediaFile[]> {
    const fromWrapper = (input: FromEventInput | { source?: { items: unknown[] } }) => {
      if (isObject<DragEvent>(input) && isDataTransfer(input.dataTransfer)) {
        return getDataTransferFiles(input.dataTransfer, input.type);
      } else if (isChangeEvt(input)) {
        return getInputFiles(input);
      } else if ('source' in input && input.source && 'items' in input.source && Array.isArray(input.source.items) && input.source.items.length > 0) {
        return getDropFiles(input as PragmaticDndEvent);
      } else if ((Array.isArray(input) && input.every(item => 'getFile' in item && typeof item.getFile === 'function')) || (input as FileSystemFileHandle[] !== undefined)) {
        return getFsHandleFiles(input as FileSystemFileHandle[])
      }
      return [];
    }
    const files = await fromWrapper(input) as IMediaFile[]
    return noIgnoredFiles(files);
  }

  static fromFile(file: MediaFile, path?: string): MediaFile {
    const f = this.withMimeType(file);
    console.log('from file', file)
    if (typeof f.path !== 'string') { // on electron, path is already set to the absolute path
      const {webkitRelativePath} = file;
      Object.defineProperty(f, 'path', {
        value: typeof path === 'string'
          ? path
          // If <input webkitdirectory> is set,
          // the File will have a {webkitRelativePath} property
          // https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/webkitdirectory
          : typeof webkitRelativePath === 'string' && webkitRelativePath.length > 0
            ? webkitRelativePath
            : file.name,
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

async function getDropFiles(input: PragmaticDndEvent): Promise<MediaFile[]> {
  if (!input?.source?.items) {
    return [] as MediaFile[];
  }
  console.log('input', JSON.stringify(input.source, null, 2));
  const files = input.source.items;
  const finalizedFiles = await Promise.all(files.map(async (item: DropFile) =>  {
    if (item as DataTransferItem) {
      const dti = item as DataTransferItem;
      const files = toFilePromises(dti);
      return files;
    }
    return MediaFile.fromFile(item as MediaFile);
  }));
  return noIgnoredFiles(finalizedFiles.flat() as MediaFile[]);
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
  return fromList((evt.target as HTMLInputElement).files).map(file => MediaFile.fromFile(file as MediaFile));
}

// Ee expect each handle to be https://developer.mozilla.org/en-US/docs/Web/API/FileSystemFileHandle
async function getFsHandleFiles(handles: FileSystemFileHandle[]) {
  const files = await Promise.all(handles.map(h => h.getFile()));
  return files.map(file => MediaFile.fromFile(file as MediaFile));
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
    return noIgnoredFiles(files.flat() as MediaFile[]);
  }

  return noIgnoredFiles(fromList(dt.files)
  .map((file) => MediaFile.fromFile(file as MediaFile)));
}

function noIgnoredFiles(files: MediaFile[]) {
  return files.flat(Infinity).filter(file => {
    console.log('ignore name: ', file.name, FILES_TO_IGNORE.indexOf(file.name) );
    return FILES_TO_IGNORE.indexOf(file.name) === -1
  });
}

// IE11 does not support Array.from()
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from#Browser_compatibility
// https://developer.mozilla.org/en-US/docs/Web/API/FileList
// https://developer.mozilla.org/en-US/docs/Web/API/DataTransferItemList
export function fromList(items: DataTransferItemList | FileList | null): (MediaFile | DataTransferItem)[] {
  if (items === null) {
    return [];
  }

  const files : (MediaFile | DataTransferItem)[] = [];

  // tslint:disable: prefer-for-of
  for (let i = 0; i < items.length; i++) {
    const file = items[i] as MediaFile | DataTransferItem
    files.push(file);
  }
  return files as (MediaFile | DataTransferItem)[];
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
 }*/

function fromDataTransferItem(item: DataTransferItem) {
  const file = item.getAsFile();
  if (!file) {
    return Promise.reject(`${item} is not a File`);
  }
  const fwp = MediaFile.fromFile(file as MediaFile);
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
  return new Promise<MediaFile>((resolve, reject) => {
    entry.file((file: File) => {
      const fwp = MediaFile.fromFile(file as MediaFile, entry.fullPath);
      resolve(fwp);
    },  (err: unknown) => {
      reject(err);
    });
  });
}
