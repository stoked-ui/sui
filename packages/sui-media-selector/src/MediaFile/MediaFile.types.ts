/**
 * Check if a value is of type DataTransfer.
 * @param {unknown} value - The value to check.
 * @returns {boolean} - True if the value is of type DataTransfer, false otherwise.
 */
export function isDataTransfer(value: unknown): value is DataTransfer {
  return isObject(value);
}

/**
 * Check if a value is of type Event with target property.
 * @param {unknown} value - The value to check.
 * @returns {boolean} - True if the value is of type Event with target property, false otherwise.
 */
export function isChangeEvt(value: unknown): value is Event {
  return isObject<Event>(value) && isObject(value.target);
}

/**
 * Check if a value is of type T.
 * @template T
 * @param {unknown} v - The value to check.
 * @returns {boolean} - True if the value is of type T, false otherwise.
 */
export function isObject<T>(v: unknown): v is T {
  return typeof v === 'object' && v !== null
}

/**
 * Get input files from an event.
 * @param {Event} evt - The event containing input files.
 * @returns {MediaFile[]} - Array of MediaFile objects from input files.
 */
export function getInputFiles(evt: Event) {
  return MediaFile.fromList((evt.target as HTMLInputElement).files)
}

/**
 * Represents a file that can be dropped, which can be a DataTransferItem or a File.
 */
export type DropFile = (DataTransferItem | File);

/**
 * Represents files that can be dropped, which can be an array of DropFile or a single DropFile.
 */
export type DropFiles = [DropFile] | DropFile[];

/**
 * Represents various types of events that can be used as input for drag and drop functionality.
 */
export type PragmaticDndEvent = { source: { items: DataTransferItem[] } };

/**
 * Represents input types that can be used as event input for various functionalities.
 */
export type FromEventInput = DragEvent | React.ChangeEvent<HTMLInputElement> | Event | FileSystemFileHandle[] | PragmaticDndEvent | DropFiles | DataTransferItem[];

/**
 * Represents a file system file handle that can get a File object.
 */
export interface FileSystemFileHandle {
  getFile(): Promise<File>;
}

/**
 * Represents an array of FileValue, which can be MediaFile or nested FileArray.
 */
export interface FileArray extends Array<FileValue> {}

/**
 * Represents a value that can be a MediaFile or an array of nested FileArray.
 */
export type FileValue = MediaFile | FileArray[];

/**
 * List of file names to ignore for drag and drop functionality.
 */
export const FILES_TO_IGNORE = [
  // Thumbnail cache files for macOS and Windows
  '.DS_Store', // macOs
  'Thumbs.db'  // Windows
];