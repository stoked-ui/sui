import * as React from "react";
import {ITimelineFileBase, ITimelineTrack } from "@stoked-ui/timeline";
import * as yup from "yup";
import {DetailSelection} from "./Detail";

export const getVideoSchema = () => {

  const schemaObj = {
    id: yup.string().required(),
    name: yup.string().required(),
    description: yup.string().optional(),
    author: yup.string().optional(),
    created: yup.number().required(),
    lastModified: yup.number().optional(),
    backgroundColor: yup.string().optional(),
    width: yup.number().required(),
    height: yup.number().required(),
  }
  return yup.object(schemaObj).required();
}

export function getVideoFormData(detail: DetailSelection): ITimelineFileBase {
  const {video} = detail;
  if (!video || !video.id) {
    throw new Error('can not load detail view without a video id');
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
