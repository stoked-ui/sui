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

export const getActionSchema = () => {
  const schemaObj = {
    id: yup.string().required('ID is required'),
    name: yup.string().required('Name is required'),
    start: yup.number().required('Start is required'),
    end: yup.number().required('End is required'),
    x: yup.number().optional(),
    y: yup.number().optional(),
    z: yup.number().required(),
    width: yup.number().required(),
    height: yup.number().required(),
  };
  return yup.object(schemaObj);
};

export interface IDetailAction {
  id: string;
  name: string;
  start: number;
  end: number;
  x?: number;
  y?: number;
  z: number;
  width: number;
  height: number;
}

export function getActionFormData(detail: DetailSelection): IDetailAction | undefined {
  const { action } = detail;
  if (action && !action.id) {
    throw new Error('can not load detail action view without a action id');
  }

  return action ? {
    id: action.id,
    name: action.name ?? '',
    start: action.start,
    end: action.end,
    x: action.x,
    y: action.y,
    z: action.z,
    width: action.width,
    height: action.height,
  } : undefined;
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
  hidden: boolean;
  lock: boolean;
}

export function getTrackFormData(detail: DetailSelection): IDetailTrack | undefined {
  const {track, selectedFile } = detail;
  if (!track) {
    return undefined;
  }

  if (!track.id) {
    throw new Error('can not load detail track view without a track id');
  }

  if (track.id === 'newTrack' && selectedFile === null) {
    return undefined;
  }

  return {
    id: track.id,
    name: track.name ?? selectedFile?.name,
    hidden: track.hidden ?? false,
    lock: track.lock ?? false,
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
