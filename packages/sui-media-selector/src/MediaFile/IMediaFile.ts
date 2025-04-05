import { Settings } from "@stoked-ui/common";

/**
 * Represents a media file with additional metadata and methods for accessing content.
 * @typedef {Object} IMediaFile
 * @property {number} created - The timestamp when the file was created.
 * @property {string} mediaType - The media type (e.g., 'video', 'image', 'audio').
 * @property {string} path - The path of the file.
 * @property {string} url - The URL associated with the file.
 * @property {Settings} media - Additional metadata or media-related properties.
 * @property {string} id - A unique identifier for the file.
 * @property {IMediaFile[]} children - An array of child media files.
 */
export default interface IMediaFile extends File {
  url: string;

  /**
   * Retrieves a URL for the file if one isn't available, it will create one.
   * @returns {string} The URL for the file.
   */
  getUrl(): string;

  /**
   * Retrieves the combined metadata and file content as a `Blob`.
   * @returns {Promise<Blob>} A Promise resolving to the Blob containing the file content.
   */
  toBlob(): Promise<Blob>;

  /**
   * Reads the file and metadata as an `ArrayBuffer`.
   * @returns {Promise<ArrayBuffer>} A Promise resolving to the ArrayBuffer representing the file content.
   */
  arrayBuffer(): Promise<ArrayBuffer>;

  /**
   * Reads the file and metadata as a `string`.
   * @returns {Promise<string>} A Promise resolving to the string representation of the file content.
   */
  text(): Promise<string>;

  /**
   * Streams the file and metadata as a `ReadableStream`.
   * @returns {ReadableStream<Uint8Array>} A ReadableStream for streaming the file content.
   */
  stream(): ReadableStream<Uint8Array>;

  /**
   * Creates a new `Blob` containing the specified portion of the file and metadata.
   * @param {number} start - The start byte index.
   * @param {number} end - The end byte index.
   * @param {string} contentType - The MIME type of the slice.
   * @returns {Blob} The Blob containing the specified portion of the file content.
   */
  slice(start?: number, end?: number, contentType?: string): Blob;

  /**
   * Retrieves metadata for the media file.
   */
  readonly metadata: {
    id: string;
    name: string;
    type: string;
    size: number;
    created: number;
    lastModified?: number;
    mediaType: string;
    path: string;
    url: string;
    media: any;
  };

  /**
   * Extracts metadata for the media file.
   * @returns {Promise<void>} A Promise that resolves when the metadata extraction is complete.
   */
  extractMetadata(): Promise<void>;
}