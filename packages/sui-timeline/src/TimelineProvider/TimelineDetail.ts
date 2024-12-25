import { IMediaFile  } from "@stoked-ui/media-selector";
import { namedId} from '@stoked-ui/common';
import * as yup from "yup";
import { ITimelineAction } from "../TimelineAction/TimelineAction.types";
import { ITimelineTrack } from "../TimelineTrack/TimelineTrack.types";
import TimelineFile, { ITimelineFile } from "../TimelineFile";

export type SelectionType = ITimelineAction | ITimelineTrack | ITimelineFile;


export interface IProjectDetail {
  id: string;
  name: string;
  description?: string;
  author?: string;
  created: number;
  lastModified?: number;
}

export interface IFileDetail {
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

export interface ITimelineTrackDetail {
  id: string;
  name: string;
  muted: boolean;
  locked: boolean;
  url?: string;
}

export interface ITimelineActionDetail {
  id: string;
  name: string;
  start: number;
  end: number;
  volume: [volume: number, start?: number, end?: number][] | undefined;
  trimStart: number;
  trimEnd: number;
}

export type ProjectDetail<ProjectType extends IProjectDetail = IProjectDetail> = {
  project: ProjectType,
  type: 'project'
}

export type TrackDetail<
  ProjectType extends IProjectDetail = IProjectDetail,
  TrackType extends ITimelineTrackDetail = ITimelineTrackDetail,
  FileType extends IFileDetail = IFileDetail
> = {
  track: TrackType,
  file: FileType,
  project: ProjectType,
  type: 'track',
};

export type ActionDetail<
  ProjectType extends IProjectDetail = IProjectDetail,
  TrackType extends ITimelineTrackDetail = ITimelineTrackDetail,
  ActionType extends ITimelineActionDetail = ITimelineActionDetail,
  FileType extends IFileDetail = IFileDetail
> = {
  action: ActionType,
  track: TrackType,
  file: FileType,
  project: ProjectType,
  type: 'action',
}

export type SettingsDetail<
  ProjectType extends IProjectDetail = IProjectDetail,
> = {
  project: ProjectType,
  type: 'settings',
}

export type DetailData = ActionDetail | TrackDetail | ProjectDetail | SettingsDetail;

export function getProjectDetail(project: ITimelineFile): IProjectDetail {
  if (!project || !project.id) {
    return new TimelineFile({name: 'new project'});
  }
  return {
    id: project.id ?? namedId('project'),
    name: project.name ?? '',
    description: project.description ?? '',
    author: project.author ?? '',
    created: project.created,
    lastModified: project.lastModified ?? 0,
  }
}

export function getActionDetail(action: ITimelineAction): ITimelineActionDetail {
  return {
    id: action.id || namedId('action'),
    name: action.name || '',
    start: action.start,
    end: action.end,
    volume: action.volume as [volume: number, start: number | undefined, end: number | undefined][] | undefined,
    trimStart: action.trimStart || 0,
    trimEnd: action.trimEnd || 0,

  }
}

export function getTrackDetail(track: ITimelineTrack): ITimelineTrackDetail {
  return {
    id: track?.id || namedId('track'),
    name: track?.name || track.file?.name || '',
    muted: track?.muted ?? false,
    locked: track?.locked ?? false,
    url: track?.url,
  };
}

export function getFileDetail(file: IMediaFile): IFileDetail {
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
    duration: file.media.duration,
  };
}

export type GetDetailProps = {
  file: ITimelineFile,
  selectedAction: ITimelineAction,
  selectedTrack: ITimelineTrack,
  selectedType: SelectionTypeName
}
export type SelectionTypeName = 'project' | 'track' | 'action' | 'settings';

export type SelectionResult<Selection = SelectionType> = { selected: Selection, type: SelectionTypeName }
export type SelectionDetail<Selection = SelectionType, Detail = DetailData> = { selected: Selection, detail: Detail, type: SelectionTypeName }

export function getSelected(props: { selectedAction: any, selectedTrack: any, file: any, selectedType: SelectionTypeName }): SelectionResult {
  const { selectedAction, selectedTrack, file, selectedType } = props;
  if (selectedAction && !selectedTrack) {
    throw new Error('Selected Action should not be set without a Selected Track');
  }
  if(selectedAction && selectedTrack.actions.indexOf(selectedAction) !== -1) {
    throw new Error('Selected Action not found in Selected Track');
  }
  if (selectedAction) {
    return { selected: selectedAction, type: 'action' };
  }
  if (selectedTrack) {
    return { selected: selectedTrack, type: 'track' };
  }
  return{ selected: file, type: selectedType === 'settings' ? 'settings' : 'project' };
}

export function getDetail(props: GetDetailProps & any): SelectionDetail | null {
  const { selectedAction: action, selectedTrack: track, file: project } = props;
  const { type, selected } = getSelected(props);
  if (type === 'track') {
    return {
      detail: {
        type,
        project: getProjectDetail(project),
        track: getTrackDetail(track),
        file: getFileDetail(track.file),
      }, selected, type,
    }
  }
  if (type === 'action') {
    return {
      detail: {
        type,
        project: getProjectDetail(project),
        track: getTrackDetail(track),
        file: getFileDetail(track.file),
        action: getActionDetail(action)
      }, selected, type,
    }
  }
  if (type === 'settings') {
    return {
      detail: {
        project: getProjectDetail(project),
        type: 'settings',
      }, selected, type,
    }
  }
  if (type === 'project' && project) {
    return {
      detail: {
        type: 'project',
        project: getProjectDetail(project),
      }, selected, type,
    }
  }
  return null;
}

// Define Yup schema for ITimelineActionDetail
export const actionObjectSchema = yup.object({
  id: yup.string().required("ID is required"),
  name: yup.string().required("Name is required"),
  start: yup.number().required("Start time is required"),
  end: yup.number().required("End time is required"),
  blendMode: yup.string().optional(),
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
});


// Validator for IDetailVideo
export const projectObjectSchema = yup.object({
  id: yup.string().required("ID is required"),
  name: yup.string().required("Name is required"),
  description: yup.string().optional(),
  author: yup.string().optional(),
  created: yup.number().required("Creation timestamp is required"),
  lastModified: yup.number().optional(),
 });

// Validator for ITimelineTrackDetail
export const trackObjectSchema = yup.object({
  id: yup.string().required("ID is required"),
  name: yup.string().required("Name is required"),
  muted: yup.boolean().required("Hidden flag is required"),
  locked: yup.boolean().required("Lock flag is required"),
});
