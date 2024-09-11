import * as React from "react";
import {MediaType} from "./MediaType";

export interface IMediaFileBase {
  readonly path?: string;
}
export interface IMediaDirectory extends IMediaFileBase{
  readonly lastModified: number;
  readonly name: string;
  readonly size: number;
  readonly webkitRelativePath: string;
}

export interface IMediaFile extends File, IMediaDirectory {
  readonly mediaType: MediaType;
  readonly id: string;
  duration?: number;
  icon: string | null;
  thumbnail: string | null;
  readonly blob: Blob;
  _url?: string;
  readonly url: string;
}

export const FILES_TO_IGNORE = [
  // Thumbnail cache files for macOS and Windows
  '.DS_Store', // macOs
  'Thumbs.db'  // Windows
];

export interface FileSystemFileHandle {
  getFile(): Promise<File>;
}

export interface I2d {
  width: number | string;
  height: number | string;
}

/**
 * Convert a DragEvent's DataTrasfer object to a list of File objects
 * NOTE: If some of the items are folders,
 * everything will be flattened and placed in the same list but the paths will be kept as a {path}
 * property.
 *
 * EXPERIMENTAL: A list of https://developer.mozilla.org/en-US/docs/Web/API/FileSystemHandle
 * objects can also be passed as an arg and a list of File objects will be returned.
 *
 * @param evt
 */
export type DropFile = (DataTransferItem | File);
export type DropFiles = [DropFile];
export type PragmaticDndEvent = { source: { items: DataTransferItem[] } };
export type FromEventInput = DragEvent | React.ChangeEvent<HTMLInputElement> | Event | FileSystemFileHandle[] | PragmaticDndEvent | DropFiles | DataTransferItem[];

// Infinite type recursion
// https://github.com/Microsoft/TypeScript/issues/3496#issuecomment-128553540
export interface FileArray extends Array<FileValue> {}
export type FileValue = IMediaFile
  | FileArray[];


