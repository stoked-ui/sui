/**
 * @typedef {Object} ControllerParams
 * @property {ITimelineAction} action - The timeline action
 * @property {number} time - The time
 * @property {IEngine} engine - The engine
 */

/**
 * @typedef {Object} GetItemParams
 * @property {ITimelineAction} action - The timeline action
 * @property {number} time - The time
 * @property {IEngine} engine - The engine
 */

/**
 * @typedef {Object} PreloadParams
 * @property {ITimelineAction} action - The timeline action
 * @property {number} time - The time
 * @property {IEngine} engine - The engine
 */

/**
 * @class
 * @description Abstract class representing a controller.
 */
abstract class Controller<ControlType> implements IController {
  /** @type {Record<string, ControlType>} */
  cacheMap = {};

  /** @type {string} */
  id;

  /** @type {string} */
  name;

  /** @type {string} */
  colorSecondary;

  /** @type {string} */
  color;

  /** @type {boolean} */
  logging = false;

  /** @type {string|undefined} */
  backgroundImage;

  /** @type {ScreenshotQueue} */
  screenshotQueue = ScreenshotQueue.getInstance(3);

  /**
   * @description Constructor for the Controller class.
   * @param {Object} options - The options for the controller.
   * @param {string} options.id - The id of the controller.
   * @param {string} options.name - The name of the controller.
   * @param {string} options.color - The color of the controller.
   * @param {string} options.colorSecondary - The secondary color of the controller.
   */
  constructor(options) {
    this.id = options.id;
    this.name = options.name;
    this.color = options.color;
    this.colorSecondary = options.colorSecondary;
  }

  /**
   * @description Abstract method to get an item.
   * @param {GetItemParams} params - The parameters for getting the item.
   * @returns {ControlType} The item.
   */
  abstract getItem(params);

  /**
   * @description Method to check if the controller is valid.
   * @param {IEngine} engine - The engine.
   * @param {ITimelineTrack} track - The timeline track.
   */
  isValid(engine, track) {
    return !track.dim;
  }

  /**
   * @description Method to destroy the controller.
   */
  destroy() {}

  /**
   * @description Method to get the action style.
   * @param {ITimelineAction} action - The timeline action.
   * @param {ITimelineTrack} track - The timeline track.
   * @param {number} scaleWidth - The scale width.
   * @param {number} scale - The scale.
   * @param {number} trackHeight - The track height.
   * @returns {null} Null.
   */
  getActionStyle(action, track, scaleWidth, scale, trackHeight) {
    return null;
  }

  /**
   * @description Method to start the controller.
   * @param {ControllerParams} params - The parameters for starting.
   */
  start(params) {}

  /**
   * @description Method to stop the controller.
   * @param {ControllerParams} params - The parameters for stopping.
   */
  stop(params) {}

  /**
   * @description Abstract method to enter the controller.
   * @param {ControllerParams} params - The parameters for entering.
   */
  abstract enter(params);

  /**
   * @description Abstract method to leave the controller.
   * @param {ControllerParams} params - The parameters for leaving.
   */
  abstract leave(params);

  /**
   * @description Abstract method to update the controller.
   * @param {Object} params - The parameters for updating.
   * @param {ITimelineAction} params.action - The timeline action.
   * @param {number} params.time - The time.
   * @param {IEngine} params.engine - The engine.
   */
  abstract update(params);

  /**
   * @description Method to preload an action.
   * @param {PreloadParams} params - The parameters for preloading.
   * @returns {Promise<ITimelineAction>} The preloaded action.
   */
  async preload(params) {
    return params.action;
  }

  /**
   * @description Static method to get volume information.
   * @param {Array<number>} volumePart - The volume part array.
   * @returns {Object} The volume information.
   */
  static getVol(volumePart) {
    return { volume: volumePart[0], start: volumePart[1], end: volumePart[2] };
  }

  /**
   * @description Method to log information.
   * @param {Object} params - The parameters for logging.
   * @param {ITimelineAction} params.action - The timeline action.
   * @param {number} params.time - The time.
   * @param {string} msg - The message to log.
   */
  log(params, msg) {
    const { action, time } = params;
    if (this.logging) {
      console.info(`[${time}] ${action.name} => ${msg} `);
    }
  }

  /**
   * @description Static method to get the action time.
   * @param {ControllerParams} params - The parameters for getting the action time.
   * @returns {number} The action time.
   */
  static getActionTime(params) {
    const { action, time } = params;
    if (action?.duration === undefined) {
      return action?.trimStart || 0;
    }
    return (time - action.start + (action?.trimStart || 0)) % (action?.duration ?? 0);
  }

  /**
   * @description Static method to get volume update.
   * @param {ControllerParams} params - The parameters for getting the volume update.
   * @param {number} actionTime - The action time.
   * @returns {Object|undefined} The volume update or undefined.
   */
  static getVolumeUpdate(params, actionTime) {
    const { action } = params;

    if (action.volumeIndex === -2) {
      return undefined;
    }

    if (action.volumeIndex >= 0) {
      const { start, end } = Controller.getVol(action.volume[action.volumeIndex]);
      if ((start && actionTime < start) || (end && actionTime >= end)) {
        return { volume: 1.0, volumeIndex: -1 };
      }
    }

    if (action.volumeIndex === -1) {
      for (let i = 0; i < action.volume.length; i += 1) {
        const { volume, start, end } = Controller.getVol(action.volume[i]);
        if ((start === undefined || actionTime >= start) && (end === undefined || actionTime < end)) {
          return { volume, volumeIndex: i };
        }
      }
    }

    return undefined;
  }
}

export default Controller;