import { MediaFile } from '@stoked-ui/media-selector';
import {FileBase, FileBaseFromMediaFile} from '@stoked-ui/file-explorer';
import {type ITimelineAction, ITimelineFileAction} from '../TimelineAction/TimelineAction.types';
import {IController} from "../Engine";
import controller from "../Controller/Controller";

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
  /** Whether the track is selected */
  selected?: boolean;
  /** Extended class name of track */
  classNames?: string[];
  /** Whether the action is hidden */
  hidden?: boolean;
  /** Whether the action is hidden */
  lock?: boolean;

  file: MediaFile;

  controller: IController;
}

export interface ITimelineFileTrack extends Omit<ITimelineTrack, 'id' | 'controller' | 'actions' | 'file'> {
  /** Action track id */
  id?: string;

  name: string;
  /** Row action list */
  actions: ITimelineFileAction[];

  src: string;

  file?: MediaFile;

  controllerName?: string;

  controller?: IController;
}

export interface ITimelineTrackNew extends Omit<ITimelineTrack, 'id' | 'file'> {

  id: 'newTrack';

  file: null;
}

export function FilesFromTracks(tracks: ITimelineTrack[] = []): FileBase[] {
  return tracks.map((track) => FileBaseFromMediaFile(track.file));
}

export type TimelineTrackEx = ITimelineTrack | ITimelineTrackNew;
