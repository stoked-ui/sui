
interface ErrorCallback {
  (err: DOMException): void;
}

interface FileSystemEntriesCallback {
  (entries: FileSystemEntry[]): void;
}

interface FileCallback {
  (file: File): void;
}

interface FileSystemFlags {
  create?: boolean;
  exclusive?: boolean;
}

interface FileSystemDirectoryReader {
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/FileSystemDirectoryReader/readEntries) */
  readEntries(successCallback: FileSystemEntriesCallback, errorCallback?: ErrorCallback): void;
}

// eslint-disable-next-line no-var,vars-on-top,@typescript-eslint/no-redeclare
declare const FileSystemDirectoryReader: {
  prototype: FileSystemDirectoryReader;
  new(): FileSystemDirectoryReader;
};

/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/FileSystemDirectoryEntry) */
interface FileSystemDirectoryEntry extends FileSystemEntry {
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/FileSystemDirectoryEntry/createReader) */
  createReader(): FileSystemDirectoryReader;
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/FileSystemDirectoryEntry/getDirectory) */
  getDirectory(path?: string | null, options?: FileSystemFlags, successCallback?: FileSystemEntryCallback, errorCallback?: ErrorCallback): void;
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/FileSystemDirectoryEntry/getFile) */
  getFile(path?: string | null, options?: FileSystemFlags, successCallback?: FileSystemEntryCallback, errorCallback?: ErrorCallback): void;
}

// eslint-disable-next-line no-var,vars-on-top,@typescript-eslint/no-redeclare
declare const FileSystemDirectoryEntry: {
  prototype: FileSystemDirectoryEntry;
  new(): FileSystemDirectoryEntry;
};


/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/FileSystem) */
interface FileSystem {
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/FileSystem/name) */
  readonly name: string;
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/FileSystem/root) */
  readonly root: FileSystemDirectoryEntry;
}

// eslint-disable-next-line no-var,vars-on-top,@typescript-eslint/no-redeclare
declare const FileSystem: {
  prototype: FileSystem;
  new(): FileSystem;
};


/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/FileSystemEntry) */
  // eslint-disable-next-line @typescript-eslint/no-redeclare
interface FileSystemEntry {
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/FileSystemEntry/filesystem) */
  readonly filesystem: FileSystem;
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/FileSystemEntry/fullPath) */
  readonly fullPath: string;
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/FileSystemEntry/isDirectory) */
  readonly isDirectory: boolean;
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/FileSystemEntry/isFile) */
  readonly isFile: boolean;
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/FileSystemEntry/name) */
  readonly name: string;
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/FileSystemEntry/getParent) */
  getParent(successCallback?: FileSystemEntryCallback, errorCallback?: ErrorCallback): void;
}

// eslint-disable-next-line no-var,vars-on-top,@typescript-eslint/no-redeclare
declare const FileSystemEntry: {
  prototype: FileSystemEntry;
  new(): FileSystemEntry;
};

/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/FileSystemFileEntry) */
interface FileSystemFileEntry extends FileSystemEntry {
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/FileSystemFileEntry/file) */
  file(successCallback: FileCallback, errorCallback?: ErrorCallback): void;
}

// eslint-disable-next-line no-var,vars-on-top,@typescript-eslint/no-redeclare
declare const FileSystemFileEntry: {
  prototype: FileSystemFileEntry;
  new(): FileSystemFileEntry;
};

export { FileSystemFileEntry };
