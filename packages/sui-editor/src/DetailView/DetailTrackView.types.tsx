import * as React from "react";
import * as yup from "yup";
import { DetailSelection } from "./Detail";

/**
 * Format bytes as human-readable text.
 *
 * @param bytes Number of bytes.
 * @param si True to use metric (SI) units, aka powers of 1000. False to use
 *           binary (IEC), aka powers of 1024.
 * @param dp Number of decimal places to display.
 *
 * @return Formatted string.
 */
export function humanFileSize(bytes: number, si=false, dp=1) {
  const thresh = si ? 1000 : 1024;

  if (Math.abs(bytes) < thresh) {
    return `${bytes} B`;
  }

  const units = si
    ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
  let u = -1;
  const r = 10**dp;

  do {
    bytes /= thresh;
    // eslint-disable-next-line no-plusplus
    ++u;
  } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);


  return `${bytes.toFixed(dp)} ${units[u]}`;
}

export const getMediaFileSchema = () => {
  const schemaObj = {
    id: yup.string().required(),
    url: yup.string().required(),
    mediaType: yup.string().required(),
    path: yup.string().optional(),
    webkitRelativePath: yup.string().optional(),
    created: yup.number().required(),
    lastModified: yup.number().optional(),
    size: yup.number().required(),
    type: yup.string().required(),
    duration: yup.number().optional(),
  }
  return yup.object(schemaObj);
}

export const getTrackSchema = () => {
  const schemaObj = {
    file: yup.object().required('File is required'),
    lock: yup.boolean().required(),
    hidden: yup.boolean().required(),
    selected: yup.boolean().required(),
    name: yup.string().required('Name is required'),
    id: yup.string().required('ID is required'),
  };
  return yup.object(schemaObj);
};

export interface IDetailFile {
  id: string;
  name: string;
  url: string;
  mediaType: string;
  path?: string;
  webkitRelativePath: string;
  created: number;
  lastModified?: number;
  size: number;
  type: string;
  duration?: number;
}

export interface IDetailTrack {
  id: string;
  name: string;
  selected: boolean;
  hidden: boolean;
  lock: boolean;
  file: object;
}

export function getTrackFormData(detail: DetailSelection): IDetailTrack | undefined {
  const {track} = detail;
  if (!track) {
    return undefined;
  }

  if (!track.id) {
    throw new Error('can not load detail track view without a track id');
  }

  if (track.id === 'newTrack' && track.file === null) {
    return undefined;
  }

  return {
    id: track.id,
    name: track.name ?? track.actionRef!.name!,
    selected: track.selected ?? false,
    hidden: track.hidden ?? false,
    lock: track.lock ?? false,
    file: track.actionRef!.file,
  };
}

export function getFileFormData(detail: DetailSelection): IDetailFile | undefined {
  const { selectedFile } = detail;
  if (selectedFile && !selectedFile.id) {
    throw new Error('can not load detail selectedFile view without a selectedFile id');
  }
  return selectedFile ? {
    id: selectedFile.id,
    name: selectedFile.name,
    url: selectedFile.url,
    mediaType: selectedFile.mediaType as string,
    path: selectedFile.path,
    webkitRelativePath: selectedFile.webkitRelativePath,
    created: selectedFile.created,
    lastModified: selectedFile.lastModified,
    size: selectedFile.size,
    type: selectedFile.type,
    duration: selectedFile.duration,
  } : undefined;
}
