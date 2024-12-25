import { namedId } from "@stoked-ui/common";
import { IMediaFile } from "@stoked-ui/media-selector";
import { createAction, IController, ITimelineFileTrack, ITimelineTrack } from "@stoked-ui/timeline";
import {
  BlendMode,
  Fit,
  type IEditorAction,
} from "../EditorAction/EditorAction";
import Controllers from "../Controllers";



export interface IEditorTrack<
  ActionType extends IEditorAction = IEditorAction,
> extends ITimelineTrack<ActionType> {

  /** Whether the action is hidden */
  hidden?: boolean;

  blendMode: BlendMode;

  fit: Fit;

  image?: string;
}

export interface IEditorFileTrack extends Omit<IEditorTrack, 'id' | 'controller' | 'actions' | 'file' | 'blendMode' | 'fit'> {
  /** Action track id */
  id?: string;

  name: string;
  /** Row action list */
  actions: IEditorAction[];

  file?: any;

  controllerName?: string;

  controller?: IController;

  blendMode?: BlendMode;

  fit?: Fit;
}

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

export function getTracksFromMediaFiles(mediaFiles: IMediaFile[], currentTime: number = 0, existingTracks: IEditorTrack[] = []) {
  const newTracks: IEditorTrack[] = existingTracks;
  for (let i = 0; i < mediaFiles.length; i += 1) {
    const mediaFile = mediaFiles[i];
    newTracks.push(getTrackFromMediaFile(mediaFile, currentTime, i) as IEditorTrack);
  }
  return newTracks;
}
