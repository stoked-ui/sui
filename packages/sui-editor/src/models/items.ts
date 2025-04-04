/**
 * @interface FileId
 * @description The type of a file ID.
 * @property {string} id - Unique identifier for the file.
 */
export type FileId = string;

/**
 * @interface CommonBase
 * @description Shared base properties for files.
 * @property {string} [id] - Optional unique identifier for the file.
 * @property {string} [label] - Optional label for the file.
 * @property {string} [itemId] - Optional item ID for the file.
 */
type CommonBase = {
  id?: string;
  label?: string;
  itemId?: string;
}

/**
 * @interface FileBaseInput
 * @description Input type for the FileBase interface, excluding children.
 * @extends CommonBase
 * @param {object} R - Optional base object to extend.
 * @property {FileBaseInput<R>[]} [children] - Array of child files.
 * @property {number} [size] - Size of the file.
 * @property {number} [modified] - Timestamp of last modification.
 * @property {MediaType} [type] - Type of the media file.
 */
export type FileBaseInput<R extends {} = {}> = R & CommonBase & {
  children?: FileBaseInput<R>[];
  size?: number;
  modified?: number;
  type?: MediaType;
};