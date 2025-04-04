/**
 * Abstract base class for controllers in the media selector.
 *
 * Provides a basic implementation for controlling media playback and logging.
 */
abstract class Controller<ControlType> implements IController {
  /**
   * Map of cached controls by their IDs.
   */
  cacheMap: Record<string, ControlType>;

  /**
   * Unique ID for this controller instance.
   */
  id: string;

  /**
   * Name of this controller.
   */
  name: string;

  /**
   * Color used as the primary color of this controller.
   */
  colorSecondary: string;

  /**
   * Color used as the secondary color of this controller.
   */
  color: string;

  /**
   * Flag indicating whether logging is enabled for this controller.
   */
  logging: boolean = false;

  /**
   * Background image URL, if any, associated with this controller.
   */
  backgroundImage?: string;

  /**
   * Singleton instance of the ScreenshotQueue class used for screenshotting media.
   */
  screenshotQueue: ScreenshotQueue = ScreenshotQueue.getInstance(3);

  /**
   * Constructor to initialize a new controller instance.
   *
   * @param options - Options object containing the ID, name, color, and colorSecondary properties.
   */
  constructor(options: {
    id: string;
    name: string;
    color: string;
    colorSecondary: string;
  }) {
    this.id = options.id;
    this.name = options.name;
    this.color = options.color;
    this.colorSecondary = options.colorSecondary;
  }

  /**
   * Abstract method to retrieve an item based on the provided parameters.
   *
   * @param params - GetItemParams object containing the necessary information for retrieving the item.
   * @returns ControlType - The retrieved control type.
   */
  abstract getItem(params: GetItemParams): ControlType;

  /**
   * Checks if the media track is valid for this controller instance.
   *
   * @param engine - IEngine instance representing the current playback engine.
   * @param track - ITimelineTrack instance representing the media track being played.
   * @returns boolean - True if the media track is valid; false otherwise.
   */
  isValid(engine: IEngine, track: ITimelineTrack) {
    return !track.dim;
  }

  /**
   * Optional viewer update callback function to be executed when the viewer updates.
   *
   * @param engine - any - The current playback engine instance.
   */
  viewerUpdate?: (engine: any) => void;

  /**
   * Abstract method to destroy this controller instance.
   */
  abstract destroy() {}

  /**
   * Calculates the style for a given media action based on the provided parameters.
   *
   * @param action - ITimelineAction instance representing the media action being played.
   * @param track - ITimelineTrack instance representing the media track being played.
   * @param scaleWidth - number - The scaled width of the media window.
   * @param scale - number - The scaling factor for the media.
   * @returns null - An object containing the calculated style properties.
   */
  getActionStyle(action: ITimelineAction, track: ITimelineTrack, scaleWidth: number, scale: number, trackHeight: number) { return null; }

  /**
   * Abstract method to start playing the media based on the provided parameters.
   *
   * @param params - ControllerParams object containing the necessary information for starting playback.
   */
  abstract start(params: ControllerParams) {}

  /**
   * Abstract method to stop playing the media based on the provided parameters.
   *
   * @param params - ControllerParams object containing the necessary information for stopping playback.
   */
  abstract stop(params: ControllerParams) {}

  /**
   * Abstract method to enter a state of this controller instance based on the provided parameters.
   *
   * @param params - ControllerParams object containing the necessary information for entering the state.
   */
  abstract enter(params: ControllerParams): void;

  /**
   * Abstract method to leave a state of this controller instance based on the provided parameters.
   *
   * @param params - ControllerParams object containing the necessary information for leaving the state.
   */
  abstract leave(params: ControllerParams) {}

  /**
   * Abstract method to update the media playback state based on the provided parameters.
   *
   * @param params - object - The updated playback state.
   */
  abstract updateState(params: object) {}

  /**
   * Calculates the volume adjustment for a given media action based on the provided parameters.
   *
   * @param action - ITimelineAction instance representing the media action being played.
   * @returns undefined|{volume: number, volumeIndex: number} - The calculated volume adjustment properties or undefined if not applicable.
   */
  getVolumeAdjustment(action: ITimelineAction): undefined | { volume: number; volumeIndex: number } {
    return undefined;
  }

  /**
   * Calculates the total volume adjustment for a given media action based on the provided parameters.
   *
   * @param action - ITimelineAction instance representing the media action being played.
   * @returns number - The calculated total volume adjustment value.
   */
  getTotalVolumeAdjustment(action: ITimelineAction): number {
    return 1.0;
  }
}

/**
 * Interface for a controller in the media selector.
 *
 * Provides common properties and methods used by all controllers.
 */
interface IController {
  /**
   * Map of cached controls by their IDs.
   */
  cacheMap: Record<string, ControlType>;

  /**
   * Unique ID for this controller instance.
   */
  id: string;

  /**
   * Name of this controller.
   */
  name: string;

  /**
   * Color used as the primary color of this controller.
   */
  colorSecondary: string;

  /**
   * Color used as the secondary color of this controller.
   */
  color: string;

  /**
   * Flag indicating whether logging is enabled for this controller.
   */
  logging: boolean = false;

  /**
   * Background image URL, if any, associated with this controller.
   */
  backgroundImage?: string;
}