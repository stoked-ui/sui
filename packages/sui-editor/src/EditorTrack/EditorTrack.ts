/**
 * Interface representing an editor track.
 * @typedef {object} IEditorTrack
 * @property {boolean} [hidden] - Indicates whether the action is hidden.
 * @property {BlendMode} blendMode - The blend mode of the track.
 * @property {Fit} fit - The fit of the track.
 * @property {string} [image] - Optional image for the track.
 */

/**
 * Interface representing an editor file track.
 * @typedef {object} IEditorFileTrack
 * @property {string} [id] - The action track id.
 * @property {string} name - The name of the track.
 * @property {IEditorAction[]} actions - The list of row actions.
 * @property {any} [file] - Optional file.
 * @property {string} [controllerName] - The name of the controller.
 * @property {IController} [controller] - The controller for the track.
 * @property {BlendMode} [blendMode] - The blend mode of the track.
 * @property {Fit} [fit] - The fit of the track.
 */

/**
 * Creates an editor track from a media file.
 * @param {IMediaFile} mediaFile - The media file to create a track from.
 * @param {number} [currentTime=0] - The current time.
 * @param {number} [duration=2] - The duration.
 * @param {number} [index=0] - The index.
 * @returns {IEditorTrack|undefined} The created editor track or undefined if no controller is found.
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
 * Creates editor tracks from multiple media files.
 * @param {IMediaFile[]} mediaFiles - The array of media files.
 * @param {number} [currentTime=0] - The current time.
 * @param {IEditorTrack[]} [existingTracks=[]] - The existing tracks.
 * @returns {IEditorTrack[]} The new editor tracks.
 */
export function getTracksFromMediaFiles(mediaFiles: IMediaFile[], currentTime: number = 0, existingTracks: IEditorTrack[] = []) {
  const newTracks: IEditorTrack[] = existingTracks;
  for (let i = 0; i < mediaFiles.length; i += 1) {
    const mediaFile = mediaFiles[i];
    newTracks.push(getTrackFromMediaFile(mediaFile, currentTime, i) as IEditorTrack);
  }
  return newTracks;
}