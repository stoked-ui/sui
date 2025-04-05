/**
 * Defines a callback function for handling errors.
 * @typedef {Function} ErrorCallback
 * @param {DOMException} err - The DOMException error object.
 */

/**
 * Defines a callback function for handling an array of FileSystemEntry objects.
 * @typedef {Function} FileSystemEntriesCallback
 * @param {FileSystemEntry[]} entries - An array of FileSystemEntry objects.
 */

/**
 * Defines a callback function for handling a single File object.
 * @typedef {Function} FileCallback
 * @param {File} file - The File object.
 */

/**
 * Represents flags that can be set for file system operations.
 * @typedef {Object} FileSystemFlags
 * @property {boolean} [create] - Indicates if creation is allowed.
 * @property {boolean} [exclusive] - Indicates if exclusive access is required.
 */

/**
 * Represents a directory reader object for reading directory entries.
 * @interface FileSystemDirectoryReader
 */
interface FileSystemDirectoryReader {
  /**
   * Reads entries from a directory.
   * @param {FileSystemEntriesCallback} successCallback - The callback for successful reading.
   * @param {ErrorCallback} [errorCallback] - The callback for error handling.
   */
  readEntries(successCallback: FileSystemEntriesCallback, errorCallback?: ErrorCallback): void;
}

/**
 * Represents a directory entry in the file system.
 * @interface FileSystemDirectoryEntry
 * @extends FileSystemEntry
 */
interface FileSystemDirectoryEntry extends FileSystemEntry {
  /**
   * Creates a directory reader object for the current directory entry.
   * @returns {FileSystemDirectoryReader} A FileSystemDirectoryReader object.
   */
  createReader(): FileSystemDirectoryReader;

  /**
   * Retrieves a directory.
   * @param {string | null} [path] - The path to the directory.
   * @param {FileSystemFlags} [options] - The flags for directory retrieval.
   * @param {FileSystemEntryCallback} [successCallback] - The callback for successful retrieval.
   * @param {ErrorCallback} [errorCallback] - The callback for error handling.
   */
  getDirectory(path?: string | null, options?: FileSystemFlags, successCallback?: FileSystemEntryCallback, errorCallback?: ErrorCallback): void;

  /**
   * Retrieves a file.
   * @param {string | null} [path] - The path to the file.
   * @param {FileSystemFlags} [options] - The flags for file retrieval.
   * @param {FileSystemEntryCallback} [successCallback] - The callback for successful retrieval.
   * @param {ErrorCallback} [errorCallback] - The callback for error handling.
   */
  getFile(path?: string | null, options?: FileSystemFlags, successCallback?: FileSystemEntryCallback, errorCallback?: ErrorCallback): void;
}

/**
 * Represents a file system object.
 * @interface FileSystem
 */
interface FileSystem {
  /**
   * The name of the file system.
   * @type {string}
   */
  readonly name: string;

  /**
   * The root directory of the file system.
   * @type {FileSystemDirectoryEntry}
   */
  readonly root: FileSystemDirectoryEntry;
}

/**
 * Represents a file system entry.
 * @interface FileSystemEntry
 */
interface FileSystemEntry {
  /**
   * The file system to which the entry belongs.
   * @type {FileSystem}
   */
  readonly filesystem: FileSystem;

  /**
   * The full path of the entry.
   * @type {string}
   */
  readonly fullPath: string;

  /**
   * Indicates if the entry is a directory.
   * @type {boolean}
   */
  readonly isDirectory: boolean;

  /**
   * Indicates if the entry is a file.
   * @type {boolean}
   */
  readonly isFile: boolean;

  /**
   * The name of the entry.
   * @type {string}
   */
  readonly name: string;

  /**
   * Retrieves the parent directory entry.
   * @param {FileSystemEntryCallback} [successCallback] - The callback for successful retrieval.
   * @param {ErrorCallback} [errorCallback] - The callback for error handling.
   */
  getParent(successCallback?: FileSystemEntryCallback, errorCallback?: ErrorCallback): void;
}

/**
 * Represents a file system file entry.
 * @interface FileSystemFileEntry
 * @extends FileSystemEntry
 */
interface FileSystemFileEntry extends FileSystemEntry {
  /**
   * Retrieves the file object.
   * @param {FileCallback} successCallback - The callback for successful retrieval.
   * @param {ErrorCallback} [errorCallback] - The callback for error handling.
   */
  file(successCallback: FileCallback, errorCallback?: ErrorCallback): void;
}

export { FileSystemFileEntry };
