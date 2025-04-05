/** 
 * Represents a controller interface for managing timeline actions
 * @typedef {Object} IController
 * @property {Function} start - Starts the controller with specified parameters
 * @property {Function} stop - Stops the controller with specified parameters
 * @property {Function} enter - Enters the controller with specified parameters
 * @property {Function} leave - Leaves the controller with specified parameters
 * @property {Function} update - Updates the controller with specified parameters
 * @property {Function} preload - Preloads data with specified parameters and returns a Promise of ITimelineAction
 * @property {Function} getItem - Gets an item with specified parameters
 * @property {string} id - The unique identifier of the controller
 * @property {Function} viewerUpdate - A function to update the viewer with the engine
 * @property {Function} destroy - A function to destroy the controller
 * @property {string} color - The primary color of the controller
 * @property {string} colorSecondary - The secondary color of the controller
 * @property {boolean} logging - Indicates if logging is enabled for the controller
 * @property {Function} getActionStyle - Gets the style of the action for the timeline track
 * @property {Function} updateMediaFile - Updates the media file with the specified file
 */

export interface IController {
  start(params: ControllerParams): void
  stop(params: ControllerParams): void
  enter(params: ControllerParams): void
  leave(params: ControllerParams): void
  update(params: ControllerParams): void
  preload(params: PreloadParams): Promise<ITimelineAction>;
  getItem(params: GetItemParams): any;

  id: string;
  viewerUpdate?: (engine: any) => void;
  destroy?: () => void;
  color?: string;
  colorSecondary?: string;
  logging: boolean;
  getActionStyle?: (action: ITimelineAction, track: ITimelineTrack, scaleWidth: number, scale: number, trackHeight: number) => null | BackgroundImageStyle
  updateMediaFile?: (mediaFile: IMediaFile) => void;
}

/** 
 * Represents a volume section with optional start and end points
 * @typedef {Array} VolumeSection
 * @property {number} volume - The volume value
 * @property {number} [start] - The optional start point
 * @property {number} [end] - The optional end point
 */
export type VolumeSection = [volume: number, start?: number, end?: number];

/** 
 * Represents an array of volume sections
 * @typedef {Array} VolumeSections
 */
export type VolumeSections = VolumeSection[];