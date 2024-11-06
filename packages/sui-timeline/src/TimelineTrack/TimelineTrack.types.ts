import { IMediaFile } from '@stoked-ui/media-selector';
import { type ITimelineAction, type ITimelineFileAction } from '../TimelineAction/TimelineAction.types';
import { type IController } from "../Controller/Controller.types";

/**
 *Basic parameters of action lines
 * @export
 * @interface ITimelineTrack
 */
export interface ITimelineTrack<
  ActionType extends ITimelineAction = ITimelineAction,
> {
  /** Action track id */
  id: string;

  name: string;
  /** Row action list */
  actions: ActionType[];
  /** Extended class name of track */
  classNames?: string[];
  /** Whether the action is hidden */
  hidden?: boolean;
  /** Whether the action is hidden */
  lock?: boolean;

  file?: IMediaFile;

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

  file?: IMediaFile;

  controllerName?: string;

  controller?: IController;
}

export interface ITimelineTrackNew<
  ActionType extends ITimelineAction = ITimelineAction,
>
  extends Omit<ITimelineTrack<ActionType>, 'id' | 'file'> {

  id: 'newTrack';

  file: null;
}
/*

export function FilesFromTracks(tracks: ITimelineTrack[] = []): IMediaFile[] {
  return tracks.map((track) => track.file);
}

export type TimelineTrackEx = ITimelineTrack | ITimelineTrackNew;
*/
