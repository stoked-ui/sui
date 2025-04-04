/**
 * Import required modules
 */
import { namedId } from "@stoked-ui/common";
import { IMediaFile } from "@stoked-ui/media-selector";
import { createAction, IController, ITimelineFileTrack, ITimelineTrack } from "@stoked-ui/timeline";
import {
  BlendMode,
  Fit,
  type IEditorAction,
} from "../EditorAction/EditorAction";
import Controllers from "../Controllers";

/**
 * Interface for an editor track
 */
export interface IEditorTrack<
  ActionType extends IEditorAction = IEditorAction,
> extends ITimelineTrack<ActionType> {

  /**
   * Whether the action is hidden
   */
  hidden?: boolean;

  /**
   * Blend mode for the track
   */
  blendMode: BlendMode;

  /**
   * Fit setting for the track
   */
  fit: Fit;

  /**
   * Optional image URL for the track
   */
  image?: string;
}

/**
 * Interface for an editor file track, omitting some properties from IEditorTrack
 */
export interface IEditorFileTrack extends Omit<IEditorTrack, 'id' | 'controller' | 'actions' | 'file' | 'blendMode' | 'fit'> {
  /**
   * Action track id
   */
  id?: string;

  /**
   * Name of the media file
   */
  name: string;
  /**
   * Row action list for the track
   */
  actions: IEditorAction[];

  /**
   * Optional media file object
   */
  file?: any;

  /**
   * Optional controller name
   */
  controllerName?: string;

  /**
   * Optional controller object
   */
  controller?: IController;

  /**
   * Optional blend mode for the track
   */
  blendMode?: BlendMode;

  /**
   * Optional fit setting for the track
   */
  fit?: Fit;
}

/**
 * Function to get an editor track from a media file
 *
 * @param mediaFile The media file object
 * @param currentTime The current time in the timeline (default: 0)
 * @param duration The duration of the track (default: 2)
 * @param index The index of the track (default: 0)
 * @returns The editor track or undefined if no controller is found
 */
export function getTrackFromMediaFile(mediaFile: IMediaFile, currentTime: number = 0, duration: number = 2, index: number = 0): IEditorTrack | undefined {
  const action = createAction<IEditorAction>({
    id: namedId('action'),
    name: mediaFile.name,
    start: currentTime,
    end: (mediaFile.media?.duration || 2) + currentTime,
    volumeIndex: -2,
    z: index,
    width: 1920,
    height: 1080,
    fit: 'cover',
    blendMode: 'normal',
  });

  const controller = Controllers[mediaFile.mediaType];
  if (!controller) {
    console.info('No controller found for', mediaFile.mediaType, mediaFile);
    return undefined;
  }
  // eslint-disable-next-line no-await-in-loop
  // await controller.preload({ action, file: mediaFile})
  return {
    id: namedId('track'),
    name: mediaFile.name,
    file: mediaFile,
    controller: Controllers[mediaFile.mediaType] as IController,
    actions: [action] as IEditorAction[],
    controllerName: mediaFile.mediaType,
    fit: 'cover',
    blendMode: 'normal',
  } as IEditorTrack;
}

/**
 * Function to get multiple editor tracks from media files
 *
 * @param mediaFiles The array of media file objects
 * @param currentTime The current time in the timeline (default: 0)
 * @param existingTracks The existing editor tracks (default: [])
 * @returns An array of new editor tracks
 */
export function getTracksFromMediaFiles(mediaFiles: IMediaFile[], currentTime: number = 0, existingTracks: IEditorTrack[] = []) {
  const newTracks: IEditorTrack[] = existingTracks;
  for (let i = 0; i < mediaFiles.length; i += 1) {
    const mediaFile = mediaFiles[i];
    newTracks.push(getTrackFromMediaFile(mediaFile, currentTime, i) as IEditorTrack);
  }
  return newTracks;
}