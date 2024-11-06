import * as React from 'react';
import { SlotComponentProps } from '@mui/base/utils';
import { ITimelineFileBase } from '@stoked-ui/timeline';
import * as yup from "yup";
import { IMediaFile, MediaFile, namedId } from '@stoked-ui/media-selector';
import {
  SlotComponentPropsFromProps,
} from '../internals/models';
import { DetailSelection, IDetailData } from "./Detail";
import { EditorFile } from "../Editor";

export interface DetailViewSlots {
  root?: React.ElementType;

  mediaTypeItem?:  React.ElementType;
}

export interface DetailViewSlotProps {
  root?: SlotComponentProps<'div', {}, DetailViewSlots>;

  mediaTypeItem?: SlotComponentPropsFromProps<IMediaFile, {}, MediaFile>;
}

export interface DetailViewProps {
  slots?: DetailViewSlots;

  slotProps?: DetailViewSlotProps;
}

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
  volume: [volume: number, start: number | undefined, end: number | undefined][] | undefined;
  fit?: 'contain' | 'cover' | 'fill' | 'none';
}

export interface IDetailVideo extends ITimelineFileBase {}

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

export type FormData = {
  video: IDetailVideo,
  track?: IDetailTrack,
  action?: IDetailAction,
  file?: IDetailFile,
}

export type FormInfo = {
  detail: DetailSelection,
  data: FormData
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

export const getFormSchema = () => {

  return {
    video: getVideoSchema(),
    track: getTrackSchema(),
    file: getMediaFileSchema(),
    action: getActionSchema(),
  }
};
/*

export const getTrackFormSchema = (data: FormData) => {
  const { track, action, file } = data;

  return {
    video: getVideoSchema(),
    track: getTrackSchema(),
    file: getMediaFileSchema(),
  }
};


export const getVideoFormSchema = (data: FormData) => {
  const { track, action, file } = data;

  return {
    video: getVideoSchema(),
  }
};
*/

export const getVideoSchema = () => {

  const schemaObj = {
    id: yup.string().required(),
    name: yup.string().required(),
    description: yup.string().optional(),
    author: yup.string().optional(),
    created: yup.number().required(),
    modified: yup.number().optional(),
    backgroundColor: yup.string().optional(),
    width: yup.number().required(),
    height: yup.number().required(),
  }
  return yup.object(schemaObj).required();
}

export function getVideoFormData(detail: DetailSelection): IDetailVideo {
  const {video} = detail;
  if (!video || !video.id) {
    return new EditorFile({name: 'new video', width: 1920, height: 1080});
  }
  return {
    id: video.id,
    name: video.name,
    description: video.description,
    author: video.author,
    created: video.created,
    lastModified: video.lastModified,
    backgroundColor: video.backgroundColor,
    width: video.width,
    height: video.height,
  }
}

export function getActionFormData(detail: DetailSelection): IDetailAction | undefined{
  const { action } = detail;
  if (!action) {
    return undefined;
  }

  return {
    id: action.id || namedId('action'),
    name: action.name || '',
    start: action.start,
    end: action.end,
    x: action.x,
    y: action.y,
    z: action.z,
    width: action.width,
    height: action.height,
    volume: action.volume as [volume: number, start: number | undefined, end: number | undefined][] | undefined,
    fit: action.fit || 'none',
  }
}

export function getTrackFormData(detail: DetailSelection): IDetailTrack {
  const {track } = detail;

  if (!track?.id) {
    throw new Error('can not load detail track view without a track id');
  }

  return {
    id: track.id || namedId('track'),
    name: track.name || track?.file?.name || '',
    hidden: track.hidden ?? false,
    lock: track.lock ?? false,
  };
}

export function getFileFormData(detail: DetailSelection): IDetailFile | undefined {
  const { track } = detail;
  if (!track?.file) {
    return undefined;
  }
  const { file } = track;
  return {
    id: file.id,
    name: file.name,
    url: file.url,
    mediaType: file.mediaType as string,
    path: file.path,
    webkitRelativePath: file.webkitRelativePath,
    created: file.created,
    lastModified: file.lastModified,
    size: file.size,
    type: file.type,
    duration: file.duration,
  };
}

