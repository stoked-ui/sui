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
  DetailData,
  getTrackDetail,
  SelectionTypeName,
  SelectionDetail,
  getSelected,
  getFileDetail, SettingsDetail,
} from "@stoked-ui/timeline";
import { IEditorAction } from "../EditorAction/EditorAction";
import { IEditorTrack } from "../EditorTrack/EditorTrack";
import EditorFile, { IEditorFile } from "../EditorFile/EditorFile";

export type SelectionType = IEditorAction | IEditorTrack | IEditorFile;

export type DetailType = 'project' | 'track' | 'action' | 'settings';

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
  blendMode: string;
}

export type GetDetailProps = {
  file: IEditorFile,
  selectedAction: IEditorAction,
  selectedTrack: IEditorTrack,
  selectedType: SelectionTypeName
}

export interface IEditorTrackDetail extends ITimelineTrackDetail {
  blendMode: string;
  hidden: boolean;
}

export type EditorDetailData =
  ActionDetail<IEditorProjectDetail, IEditorTrackDetail, IEditorActionDetail, IFileDetail>
  | TrackDetail<IEditorProjectDetail, IEditorTrackDetail, IFileDetail>
  | ProjectDetail<IEditorProjectDetail>
  | SettingsDetail<IEditorProjectDetail>;

export function getEditorDetail(props: GetDetailProps & any): {
  selected: SelectionType,
  detail: EditorDetailData,
  type: SelectionTypeName
} | null {
  const { selectedAction: action, selectedTrack: track, file: project } = props;
  const selectedResult = getSelected(props);
  const type = selectedResult.type;
  const selected: any = selectedResult.selected;
  if (type === 'track') {
    return {
      detail: {
        type,
        project: getEditorProjectDetail(project),
        track: getEditorTrackDetail(track),
        file: getFileDetail(track.file),
      }, selected, type,
    }
  }
  if (type === 'action') {
    return {
      detail: {
        type,
        project: getEditorProjectDetail(project),
        track: getEditorTrackDetail(track),
        file: getFileDetail(track.file),
        action: getEditorActionDetail(action)
      }, selected, type,
    }
  }
  if (type === 'settings') {
    return {
      detail: {
        project: getEditorProjectDetail(project),
        type: 'settings',
      }, selected, type,
    }
  }
  if (type === 'project' && project) {
    return {
      detail: {
        type: 'project',
        project: getEditorProjectDetail(project),
      }, selected, type,
    }
  }
  return null;
}

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
    x: action.x || 0,
    y: action.y || 0,
    z: action.z,
    width: action.width,
    height: action.height,
    fit: action.fit || 'none',
    blendMode: action.blendMode || 'normal',
  }
}

export interface DetailViewProps {
  detail: DetailData;
  editMode: boolean,
  enableEdit: () => void,
  disableEdit: () => void
}
/*
// Define Yup schema for ITimelineActionDetail
export const actionDataSchema = yup.object({
  id: yup.string().required("ID is required"),
  name: yup.string().required("Name is required"),
  start: yup.number().required("Start time is required"),
  end: yup.number().required("End time is required"),
  blendMode: yup.string().required("Blend mode is required"),
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
}); */

/*

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
  type: yup.string().required('Type is required'),

})

export const trackSchema = yup.object({
  project: projectSchema,
  track: trackObjectSchema,
  file: fileObjectSchema,
  type: yup.string().required('Type is required'),
})

 */
// Define Yup schema for ITimelineActionDetail
export const actionDataSchema = yup.object({
  id: yup.string().required("ID is required"),
  name: yup.string().required("Name is required"),
  start: yup.number().required("Start time is required"),
  end: yup.number().required("End time is required"),
  blendMode: yup.string().required("Blend mode is required"),
  x: yup.number().optional(),
  y: yup.number().optional(),
  z: yup.number().required("Z-coordinate is required"),
  width: yup
  .number()
  .when('$fileMediaType', {
    is: (mediaType: string) => ['image', 'video'].includes(mediaType),
    then: (schema) => schema.required("Width is required"),
    otherwise: (schema) => schema.optional(),
  }),
  height: yup
  .number()
  .when('$fileMediaType', {
    is: (mediaType: string) => ['image', 'video'].includes(mediaType),
    then: (schema) => schema.required("Height is required"),
    otherwise: (schema) => schema.optional(),
  }),
  volume: yup
  .array()
  .of(
    yup
    .array()
    .of(yup.number().nullable())
    .length(3)
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

// Combined schema for validation
export const actionSchema = yup.object({
  project: projectSchema,
  track: trackObjectSchema,
  action: actionDataSchema,
  file: fileObjectSchema,
  type: yup.string().required('Type is required'),
}).test({
  name: 'file-and-action-dependency',
  test(_, { options }) {
    const fileMediaType = options.context?.file?.mediaType;
    if (fileMediaType && options.context) {
      options.context.fileMediaType = fileMediaType;
    }
    return true;
  },
});
