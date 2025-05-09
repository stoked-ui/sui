/**
 * Represents a file with additional properties for display order.
 * @typedef {Object} FileBase
 * @property {string} id - The unique identifier of the file.
 * @property {string} name - The name of the file.
 * @property {string} url - The URL of the file.
 * @property {number} size - The size of the file in bytes.
 * @property {string} type - The type of the file.
 * @property {number} visibleIndex - The index used for display order.
 */

/**
 * Extends the IMediaFile interface to include a visibleIndex property.
 * @interface
 * @extends IMediaFile
 */
export interface FileBase extends IMediaFile {
  visibleIndex?: number;
}