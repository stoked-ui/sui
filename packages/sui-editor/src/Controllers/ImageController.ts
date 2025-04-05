/**
 * @typedef {Object} EditorPreloadParams - Parameters for preloading an editor item
 * @property {ITimelineAction} action - The timeline action to preload
 * @property {ITimelineTrack} track - The timeline track to preload the action into
 * @property {string} editorId - The ID of the editor
 */

/**
 * @typedef {Object} EditorGetItemParams - Parameters for getting an editor item
 * @property {ITimelineAction} action - The timeline action to get the item for
 * @property {ITimelineTrack} track - The timeline track to get the item from
 */

/**
 * @typedef {Object} IEditorEngine - Interface for an editor engine
 */

/**
 * Represents an image controller for the timeline editor.
 * @class
 * @extends Controller
 */
class ImageControl extends Controller<HTMLImageElement> implements IController {
  /** @type {Record<string, HTMLImageElement>} */
  cacheMap = {};

  /** @type {boolean} */
  logging = false;

  /** @type {string} */
  editorId = '';

  /**
   * Creates an instance of ImageControl.
   */
  constructor() {
    super({
      id: 'image', name: 'Image', color: '#6b3514', colorSecondary: '#d76d2b',
    });
  }

  /**
   * Preloads an image for the editor.
   * @param {EditorPreloadParams} params - The parameters for preloading
   * @returns {Promise<ITimelineAction>} The preloaded timeline action
   */
  async preload(params) {
    const { action, track, editorId } = params;
    this.editorId = editorId;
    return action;
  }

  /**
   * Enters the image control mode.
   * @param {EditorControllerParams} params - The controller parameters
   */
  enter(params) {
    const { action, engine, track } = params;
    const item = this.getItem(params);
    ImageControl.setDisplay(track, item);
    ImageControl.attachItemToViewer(item, engine);
    ImageControl.renderImage(item, engine);
  }

  /**
   * Gets an image item for the specified track.
   * @param {EditorGetItemParams} params - The parameters for getting the item
   * @returns {HTMLImageElement} The retrieved image item
   */
  getItem(params) {
    const { action, track } = params;
    let item = this.cacheMap[track.id];
    if (item) {
      return item;
    }
    const { file } = track;
    if (!file) {
      throw new Error('no file found for image controlled item');
    }
    item = ImageControl.createNewImage(action, file);
    this.cacheMap[track.id] = item;
    return item;
  }

  /**
   * Sets the display style for the item.
   * @param {IEditorTrack} track - The editor track
   * @param {HTMLImageElement} item - The image item
   */
  static setDisplay(track, item) {
    item.style.display = track.hidden ? 'none' : 'flex';
  }

  /**
   * Creates a new image element.
   * @param {ITimelineAction} action - The timeline action
   * @param {IMediaFile} file - The media file
   * @returns {HTMLImageElement} The created image element
   */
  static createNewImage(action, file) {
    throw new Error('createNewImage')
    const item = document.createElement('img');
    item.src = file.url;
    item.style.display = 'flex';
    ImageControl.applyStyles(action, item);
    return item;
  }

  /**
   * Applies styles to the image element.
   * @param {ITimelineAction} action - The timeline action
   * @param {HTMLImageElement} item - The image element
   */
  static applyStyles(action, item) {
    if (action?.style) {
      const keys = Object.keys(action.style);
      for (let i = 0; i < keys.length; i += 1) {
        const prop = keys[i];
        item.style[prop] = action.style[prop];
      }
    }
  }

  /**
   * Attaches the image item to the viewer.
   * @param {HTMLImageElement} item - The image item
   * @param {IEditorEngine} engine - The editor engine
   */
  static attachItemToViewer(item, engine) {
    if (engine.viewer && engine.renderer) {
      engine.viewer.appendChild(item);
    } else {
      console.warn('no viewer specified when image control loaded meta data', item.src);
    }
  }

  /**
   * Renders the image on the editor canvas.
   * @param {HTMLImageElement} item - The image item
   * @param {IEditorEngine} engine - The editor engine
   */
  static renderImage(item, engine) {
    engine.renderCtx?.drawImage(item, 0, 0, engine.renderWidth, engine.renderHeight);
  }

  /**
   * Updates the image control state.
   * @param {EditorControllerParams} params - The controller parameters
   */
  update(params) {
    const { action, engine, track } = params;
    const item = this.cacheMap[track.id];
    if (!item) {
      return;
    }
    if (track.hidden) {
      item.style.display = 'none';
    } else {
      engine.renderCtx?.drawImage(item, 0, 0, engine.renderWidth, engine.renderHeight);
    }
  }

  /**
   * Leaves the image control mode.
   * @param {ControllerParams} params - The controller parameters
   */
  leave(params) {
    const { action, time, engine, track } = params;
    const item = this.cacheMap[track.id];
    if (!item) {
      return;
    }

    if (time > action.end || time < action.start) {
      item.style.display = 'none';
    } else {
      item.style.display = 'block';
    }
  }

  /**
   * Gets the cached element by action ID.
   * @param {string} actionId - The ID of the action
   * @returns {HTMLImageElement} The cached image element
   */
  getElement(actionId) {
    return this.cacheMap[actionId];
  }
}

export { ImageControl };

const ImageController = new ImageControl();
export default ImageController;
