/**
 * Controller interface for managing the controller's state and behavior.
 */
export interface IController {
  /**
   * Starts the controller with the provided parameters.
   * 
   * @param {ControllerParams} params - Parameters for starting the controller.
   */
  start(params: ControllerParams): void;

  /**
   * Stops the controller with the provided parameters.
   * 
   * @param {ControllerParams} params - Parameters for stopping the controller.
   */
  stop(params: ControllerParams): void;

  /**
   * Enters the controller with the provided parameters.
   * 
   * @param {ControllerParams} params - Parameters for entering the controller.
   */
  enter(params: ControllerParams): void;

  /**
   * Leaves the controller with the provided parameters.
   * 
   * @param {ControllerParams} params - Parameters for leaving the controller.
   */
  leave(params: ControllerParams): void;

  /**
   * Updates the controller's state with the provided parameters.
   * 
   * @param {ControllerParams} params - Parameters for updating the controller.
   */
  update(params: ControllerParams): void;

  /**
   * Preloads the timeline action with the provided preload parameters.
   * 
   * @param {PreloadParams} params - Parameters for preloading the timeline action.
   * @returns {Promise<ITimelineAction>} A promise resolving to the preloaded timeline action.
   */
  preload(params: PreloadParams): Promise<ITimelineAction>;

  /**
   * Gets an item from the controller with the provided get item parameters.
   * 
   * @param {GetItemParams} params - Parameters for getting an item from the controller.
   * @returns {any} The retrieved item.
   */
  getItem(params: GetItemParams): any;

  /**
   * The unique identifier of the controller.
   */
  id: string;

  /**
   * A callback function to be executed when the viewer updates.
   * 
   * @param {any} engine - The engine object.
   */
  viewerUpdate?: (engine: any) => void;

  /**
   * A callback function to destroy the controller.
   * 
   * @returns {void}
   */
  destroy?: () => void;

  /**
   * The color of the controller.
   */
  color?: string;

  /**
   * The secondary color of the controller.
   */
  colorSecondary?: string;

  /**
   * A flag indicating whether logging is enabled.
   */
  logging: boolean;

  /**
   * A function to get the background image style for a timeline action.
   * 
   * @param {ITimelineAction} action - The timeline action.
   * @param {ITimelineTrack} track - The timeline track.
   * @param {number} scaleWidth - The scaled width of the track.
   * @param {number} scale - The scaling factor.
   * @param {number} trackHeight - The height of the track.
   * @returns {(null | BackgroundImageStyle)} The background image style or null.
   */
  getActionStyle?: (action: ITimelineAction, track: ITimelineTrack, scaleWidth: number, scale: number, trackHeight: number) => null | BackgroundImageStyle;

  /**
   * A function to update the media file for the controller.
   * 
   * @param {IMediaFile} mediaFile - The media file object.
   */
  updateMediaFile?: (mediaFile: IMediaFile) => void;
}

/**
 * An array of volume sections, each containing a volume range and optional start and end times.
 */
export type VolumeSection = [number, number?, number?];

/**
 * An array of volume sections.
 */
export type VolumeSections = VolumeSection[];
