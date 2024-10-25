import * as React from "react";
import {ITimelineFile, ITimelineTrack } from "@stoked-ui/timeline";
import { namedId } from "@stoked-ui/media-selector";
import * as yup from "yup";
import {DetailSelection} from "./Detail";
import {getTrackSchema} from "./DetailTrackView.types";
/*

export interface IDetailVideo {
  id: string;
  name: string;
  description?: string;
  author?: string
  created: number;
  lastModified?: number;
  backgroundColor?: string;
  width: number;
  height: number;
  data: any;
}
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

export function getVideoFormData(detail: DetailSelection, tracks: ITimelineTrack[]): ITimelineFile {
  const {video} = detail;
          if (video && !video.id) {
    throw new Error('can not load detail video view without a video id');
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
