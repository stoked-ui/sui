import {IMediaFile, MediaFile } from '@stoked-ui/media-selector';
import {type ITimelineAction, ITimelineFileAction} from '../TimelineAction/TimelineAction.types';
import {IController} from "../Engine";

/**
 *Basic parameters of action lines
 * @export
 * @interface ITimelineTrack
 */
export interface ITimelineTrack {
  /** Action track id */
  id: string;

  name: string;
  /** Row action list */
  actions: ITimelineAction[];
  /** Extended class name of track */
  classNames?: string[];
  /** Whether the action is hidden */
  hidden?: boolean;
  /** Whether the action is hidden */
  lock?: boolean;

  file: MediaFile;

  image?: string;

  controllerName?: string;

  controller: IController;
}

export interface ITimelineFileTrack extends Omit<ITimelineTrack, 'id' | 'controller' | 'actions' | 'file'> {
  /** Action track id */
  id?: string;

  name: string;
  /** Row action list */
  actions: ITimelineFileAction[];

  url?: string;

  image?: string;

  file?: MediaFile;

  controllerName?: string;

  controller?: IController;
}

export interface ITimelineTrackNew extends Omit<ITimelineTrack, 'id' | 'file'> {

  id: 'newTrack';

  file: null;
}

export function FilesFromTracks(tracks: ITimelineTrack[] = []): IMediaFile[] {
  return tracks.map((track) => track.file);
}

export type TimelineTrackEx = ITimelineTrack | ITimelineTrackNew;
