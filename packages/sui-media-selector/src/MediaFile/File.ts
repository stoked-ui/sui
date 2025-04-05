export interface Blob {
  /** Represents a Blob object that can be used to store binary data. */
  readonly size: number; // The size of the Blob in bytes.
  readonly type: string; // The MIME type of the Blob.
  
  /**
   * Returns a promise that resolves with an ArrayBuffer containing the entire contents of the Blob.
   * @returns {Promise<ArrayBuffer>} The ArrayBuffer containing the Blob's data.
   */
  arrayBuffer(): Promise<ArrayBuffer>;
  
  /**
   * Creates a new Blob object containing the specified range of data from the original Blob.
   * @param {number} start - The start index of the data to include in the new Blob.
   * @param {number} end - The end index of the data to include in the new Blob.
   * @param {string} contentType - The MIME type to assign to the new Blob.
   * @returns {Blob} The new Blob containing the specified data range.
   */
  slice(start?: number, end?: number, contentType?: string): Blob;
  
  /**
   * Returns a ReadableStream for reading the contents of the Blob as bytes.
   * @returns {ReadableStream<Uint8Array>} The ReadableStream for the Blob's data.
   */
  stream(): ReadableStream<Uint8Array>;
  
  /**
   * Returns a promise that resolves with a string containing the entire contents of the Blob interpreted as text.
   * @returns {Promise<string>} The text content of the Blob.
   */
  text(): Promise<string>;
}

interface File extends Blob {
  /** Represents a File object that extends Blob and provides additional properties specific to files. */
  readonly lastModified: number; // The last modified timestamp of the File.
  readonly name: string; // The name of the File.
  readonly webkitRelativePath: string; // The relative path of the File in the file system.

}

/**
 * Represents the type of line endings to use in a Blob.
 * @typedef {'native' | 'transparent'} EndingType
 */

export interface BlobPropertyBag {
  endings?: EndingType; // The type of line endings to use in the Blob.
  type?: string; // The MIME type of the Blob.
}

export interface FilePropertyBag extends BlobPropertyBag {
  lastModified?: number; // The last modified timestamp of the File.
}

/**
 * Represents a part that can be used in a Blob.
 * @typedef {BufferSource | Blob | string} BlobPart
 */

declare const File: {
  prototype: File;
  new(fileBits: BlobPart[], fileName: string, options?: FilePropertyBag): File;
};

export { File };