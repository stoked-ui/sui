import { IMediaFile, namedId } from "@stoked-ui/media-selector";
import * as yup from "yup";
import { IEditorAction } from "../EditorAction/EditorAction";
import { IEditorTrack } from "../EditorTrack/EditorTrack";
import EditorFile, { IEditorFile } from "../Editor/EditorFile";
import { IEditorState } from "../EditorProvider/EditorProvider.types";

export type Selection = IEditorAction | IEditorTrack | IEditorFile;

export type DetailType = 'project' | 'track' | 'action';

export interface IDetailProject {
  id: string;
  name: string;
  description?: string;
  author?: string;
  created: number;
  lastModified?: number;
  backgroundColor?: string;
  width: number;
  height: number;
}

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

export type DetailDataProject = {
  project: IDetailProject,
  type: 'project'
}

export type DetailDataTrack = {
  track: IDetailTrack,
  file: IDetailFile,
  project: IDetailProject,
  type: 'track',
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
  volume: [volume: number, start?: number, end?: number][] | undefined;
  fit?: 'contain' | 'cover' | 'fill' | 'none';
}

export type DetailDataAction = {
  action: IDetailAction,
  track: IDetailTrack,
  file: IDetailFile,
  project: IDetailProject,
  type: 'action',
}

export type DetailData = DetailDataAction | DetailDataTrack | DetailDataProject;

export const setSelection = (state: IEditorState) : IEditorState => {
  if (state.selectedAction) {
    state.selected = state.selectedAction;
    return state;
  }
  if (state.selectedTrack) {
    state.selected = state.selectedTrack;
    return state;
  }
  if (!state.file) {
    state.file = new EditorFile({name: 'new project', width: 1920, height: 1080});
  }
  state.selected =  state.file;
  return state;
}

export function getProjectDetail(project: IEditorFile): IDetailProject {
  if (!project || !project.id) {
    return new EditorFile({name: 'new project', width: 1920, height: 1080});
  }
  return {
    id: project.id ?? namedId('project'),
    name: project.name ?? '',
    description: project.description ?? '',
    author: project.author ?? '',
    created: project.created,
    lastModified: project.lastModified ?? 0,
    backgroundColor: project.backgroundColor ?? '#000000',
    width: project.width,
    height: project.height,
  }
}

export function getActionDetail(action: IEditorAction): IDetailAction {
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

export function getTrackDetail(track: IEditorTrack): IDetailTrack {
  return {
    id: track?.id || namedId('track'),
    name: track?.name || track.file?.name || '',
    hidden: track?.hidden ?? false,
    lock: track?.lock ?? false,
  };
}

export function getFileDetail(file: IMediaFile): IDetailFile {
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

export function setDetail(state: IEditorState): IEditorState {
  const { engine} = state;
  let { file } = state;
  state = setSelection(state);
  const { selected } = state;

  if (!engine) {
    throw new Error('Engine is required for detail view');
  }

  if (!file) {
    // throw new Error('Video is required for detail view');
    file = new EditorFile({ name: 'new project', width: 1920, height: 1080 }) as IEditorFile;
  }

  if ("actions" in selected! && 'file' in selected!) {
    if (!selected.file) {
      throw new Error('Track file not found');
    }
    const track = selected as IEditorTrack;
    state.detail =  {
      type: 'track',
      project: getProjectDetail(file),
      track: getTrackDetail(track),
      file: getFileDetail(selected.file),
    }
    return state;
  }
  if ("volume" in selected!) {
    const track = state.engine?.getActionTrack(selected.id) as IEditorTrack;
    if (!track) {
      console.error('Track not found for action (this should not happen)', selected);
      throw new Error('Track not found for action');
    }
    if (!track.file) {
      throw new Error('Action track file not found');
    }
    state.detail = {
      type: 'action',
      project: getProjectDetail(file),
      track: getTrackDetail(track),
      file: getFileDetail(track.file),
      action: getActionDetail(selected as IEditorAction)
    }
    return state;
  }
  state.detail ={
    type: 'project',
    project: getProjectDetail(file),
  }
  return state;
}

// Define Yup schema for IDetailAction
export const actionSchema = yup.object({
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

// Validator for IDetailFile
export const fileSchema = yup.object({
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

// Validator for IDetailTrack
export const trackSchema = yup.object({
  id: yup.string().required("ID is required"),
  name: yup.string().required("Name is required"),
  hidden: yup.boolean().required("Hidden flag is required"),
  lock: yup.boolean().required("Lock flag is required"),
});
