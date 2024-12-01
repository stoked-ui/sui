import IMediaFile2 from "./IMediaFile2";
import MediaFile2 from "./MediaFile2";
import * as React from "react";
import {FileSystemFileHandle} from "../MediaFile";

export function isDataTransfer(value: unknown): value is DataTransfer {
  return isObject(value);
}

export function isChangeEvt(value: unknown): value is Event {
  return isObject<Event>(value) && isObject(value.target);
}

export function isObject<T>(v: unknown): v is T {
  return typeof v === 'object' && v !== null
}

export function getInputFiles(evt: Event) {
  return MediaFile2.fromList((evt.target as HTMLInputElement).files).map(file => MediaFile2.fromFile(file as IMediaFile2));
}

export type DropFile = (DataTransferItem | File);
export type DropFiles = [DropFile];
export type PragmaticDndEvent = { source: { items: DataTransferItem[] } };
export type FromEventInput = DragEvent | React.ChangeEvent<HTMLInputElement> | Event | FileSystemFileHandle[] | PragmaticDndEvent | DropFiles | DataTransferItem[];

// Infinite type recursion
// https://github.com/Microsoft/TypeScript/issues/3496#issuecomment-128553540
export interface FileArray extends Array<FileValue> {}
export type FileValue = IMediaFile2
  | FileArray[];

export const FILES_TO_IGNORE = [
  // Thumbnail cache files for macOS and Windows
  '.DS_Store', // macOs
  'Thumbs.db'  // Windows
];
