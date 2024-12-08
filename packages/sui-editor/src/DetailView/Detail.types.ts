import * as yup from "yup";

import {
  TimelineState,
  getDetail,
  IFileDetail,
  ITimelineActionDetail,
  ITimelineTrackDetail,
  IProjectDetail,
  ActionDetail,
  TrackDetail,
  ProjectDetail,
  getProjectDetail,
  getActionDetail,
  DetailData, getTrackDetail,
} from "@stoked-ui/timeline";
import { IEditorAction } from "../EditorAction/EditorAction";
import { IEditorTrack } from "../EditorTrack/EditorTrack";
import EditorFile, { IEditorFile } from "../EditorFile/EditorFile";

export type SelectionType = IEditorAction | IEditorTrack | IEditorFile;

export type DetailType = 'project' | 'track' | 'action';

export interface IEditorProjectDetail extends IProjectDetail {
  backgroundColor?: string;
  width: number;
  height: number;
}

export interface IEditorActionDetail extends ITimelineActionDetail {
  x?: number;
  y?: number;
  z: number;
  width: number;
  height: number;
  fit?: 'contain' | 'cover' | 'fill' | 'none';
}

export interface IEditorTrackDetail extends ITimelineTrackDetail {
  blendMode: string;
  hidden: boolean;
}

export type EditorDetailData =
  ActionDetail<IEditorProjectDetail, IEditorTrackDetail, IEditorActionDetail, IFileDetail>
  | TrackDetail<IEditorProjectDetail, IEditorTrackDetail, IFileDetail>
  | ProjectDetail<IEditorProjectDetail>;

export function getEditorProjectDetail(project: IEditorFile): IEditorProjectDetail {
  if (!project || !project.id) {
    return new EditorFile({name: 'new project', width: 1920, height: 1080});
  }
  return {
    ...getProjectDetail(project),
    backgroundColor: project.backgroundColor ?? '#000000',
    width: project.width,
    height: project.height,
  }
}


export function getEditorTrackDetail(track: IEditorTrack): IEditorTrackDetail {
  return {
    ...getTrackDetail(track),
    hidden: track?.hidden ?? false,
    blendMode: track.blendMode || 'normal',
  };
}

export function getEditorActionDetail(action: IEditorAction): IEditorActionDetail {
  return {
    ...getActionDetail(action),
    x: action.x,
    y: action.y,
    z: action.z,
    width: action.width,
    height: action.height,
    fit: action.fit || 'none',
  }
}

export interface DetailViewProps {
  detail: DetailData;
  editMode: boolean,
  enableEdit: () => void,
  disableEdit: () => void
}

// Define Yup schema for ITimelineActionDetail
export const actionDataSchema = yup.object({
  id: yup.string().required("ID is required"),
  name: yup.string().required("Name is required"),
  start: yup.number().required("Start time is required"),
  end: yup.number().required("End time is required"),
  x: yup.number().optional(),
  y: yup.number().optional(),
  z: yup.number().required("Z-coordinate is required"),
  width: yup.number().required("Width is required"),
  height: yup.number().required("Height is required"),
  volume: yup
  .array()
  .of(
    yup
    .array()
    .of(yup.number().nullable()) // Allowing number or null
    .length(3) // Ensure the array is exactly of length 3
    .test('valid-volume', 'Invalid volume structure', (value) => {
      if (!value) {
        return false;
      }
      const [volume, start, end] = value;
      return (
        typeof volume === 'number' &&
        (start === undefined || typeof start === 'number') &&
        (end === undefined || typeof end === 'number')
      );
    })
  )
  .optional(),
  fit: yup
  .mixed<'contain' | 'cover' | 'fill' | 'none'>()
  .oneOf(['contain', 'cover', 'fill', 'none'])
  .optional(),
});


// Validator for IDetailVideo
export const projectSchema = yup.object({
  id: yup.string().required("ID is required"),
  name: yup.string().required("Name is required"),
  description: yup.string().optional(),
  author: yup.string().optional(),
  created: yup.number().required("Creation timestamp is required"),
  lastModified: yup.number().optional(),
  backgroundColor: yup
  .string()
  // .matches(/^#([0-9A-Fa-f]{3}){1,2}$/, "Must be a valid hex color")
  .optional(),
  width: yup.number().required("Width is required"),
  height: yup.number().required("Height is required"),
});


// Validator for ITimelineTrackDetail
export const trackObjectSchema = yup.object({
  id: yup.string().required("ID is required"),
  name: yup.string().required("Name is required"),
  hidden: yup.boolean().required("Hidden flag is required"),
  muted: yup.boolean().required("Muted flag is required"),
  locked: yup.boolean().required("Lock flag is required"),
  blendMode: yup.string().required(),
});

// Validator for IFileDetail
export const fileObjectSchema = yup.object({
  id: yup.string().required("ID is required"),
  name: yup.string().required("Name is required"),
  url: yup.string().url("Must be a valid URL").required("URL is required"),
  mediaType: yup.string().required("Media type is required"),
  path: yup.string().optional(),
  webkitRelativePath: yup.string().required("webkitRelativePath is required"),
  created: yup.number().required("Creation timestamp is required"),
  lastModified: yup.number().optional(),
  size: yup.number().required("File size is required"),
  type: yup.string().required("Type is required"),
  duration: yup.number().optional(),
});

export const actionSchema = yup.object({
  project: projectSchema,
  track: trackObjectSchema,
  action: actionDataSchema,
  file: fileObjectSchema,
})

export const trackSchema = yup.object({
  project: projectSchema,
  track: trackObjectSchema,
  file: fileObjectSchema,
})
