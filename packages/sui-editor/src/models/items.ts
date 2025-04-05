import { MediaFile, MediaType } from "@stoked-ui/media-selector";

export type FileId = string;

/**
 * Common base properties for a file object.
 * @typedef {Object} CommonBase
 * @property {string} [id] - The unique identifier of the file.
 * @property {string} [label] - The label or name of the file.
 * @property {string} [itemId] - The unique identifier of the item associated with the file.
 */

/**
 * Input properties for a file object.
 * @typedef {Object} FileBaseInput
 * @property {Object[]} [children] - An array of child file objects.
 * @property {number} [size] - The size of the file in bytes.
 * @property {number} [modified] - The timestamp of when the file was last modified.
 * @property {MediaType} [type] - The type of media the file represents.
 */

type CommonBase = {
  id?: string;
  label?: string;
  itemId?: string;
}

/**
 * Input properties for a file object with generic type.
 * @typedef {Object} FileBaseInput
 * @property {Object[]} [children] - An array of child file objects.
 * @property {number} [size] - The size of the file in bytes.
 * @property {number} [modified] - The timestamp of when the file was last modified.
 * @property {MediaType} [type] - The type of media the file represents.
 */

/*
export type FileBase<R extends {} = {}> = R & CommonBase & {
  children?: FileBase<R>[];
  size?: number;
  modified?: number;
  type?: MediaType;
  file?: MediaFile;
  visibleIndex?: number;
  expanded?: boolean;
  selected?: boolean;
  name?: string;
}; */

/**
 * Input properties for a file object with generic type.
 * @typedef {Object} FileBaseInput
 * @property {Object[]} [children] - An array of child file objects.
 * @property {number} [size] - The size of the file in bytes.
 * @property {number} [modified] - The timestamp of when the file was last modified.
 * @property {MediaType} [type] - The type of media the file represents.
 */

export type FileBaseInput<R extends {} = {}> = R & CommonBase & {
  children?: FileBaseInput<R>[];
  size?: number;
  modified?: number;
  type?: MediaType;
};