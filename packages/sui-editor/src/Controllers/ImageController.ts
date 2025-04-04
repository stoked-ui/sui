/**
 * The ImageControl class is a controller for handling image operations in the timeline editor.
 *
 * @extends Controller<HTMLImageElement>
 */
class ImageControl extends Controller<HTMLImageElement> implements IController {
  /**
   * A cache map to store images by track id.
   */
  cacheMap: Record<string, HTMLImageElement> = {};

  /**
   * A flag for logging purposes.
   */
  logging: boolean = false;

  /**
   * The ID of the editor.
   */
  editorId: string = '';

  /**
   * Initializes the ImageControl instance with the required properties.
   */
  constructor() {
    super({
      id: 'image', name: 'Image', color: '#6b3514', colorSecondary: '#d76d2b',
    });
  }

  /**
   * Preloads the timeline action for preloading images.
   *
   * @param {EditorPreloadParams} params The preload parameters.
   * @returns {Promise<ITimelineAction>} A promise resolving to the preloaded timeline action.
   */
  async preload(params: EditorPreloadParams): Promise<ITimelineAction> {
    const { action, track, editorId } = params;
    this.editorId = editorId;
    return action;
  }

  /**
   * Enters the image control and performs the necessary actions.
   *
   * @param {EditorControllerParams} params The controller parameters.
   */
  enter(params: EditorControllerParams) {
    const {action, engine, track} = params;
    const item: HTMLImageElement = this.getItem(params as EditorGetItemParams);
    ImageControl.setDisplay(track, item);
    ImageControl.attachItemToViewer(item, engine);
    ImageControl.renderImage(item, engine);
  }

  /**
   * Gets the image element for a given track id.
   *
   * @param {EditorGetItemParams} params The get item parameters.
   * @returns {HTMLImageElement} The image element.
   */
  getItem(params: EditorGetItemParams) {
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
   * Sets the display style of an image element.
   *
   * @param {IEditorTrack} track The track object.
   * @param {HTMLImageElement} item The image element.
   */
  static setDisplay(track: IEditorTrack, item: HTMLImageElement) {
    item.style.display = track.hidden ? 'none' : 'flex';
  }

  /**
   * Creates a new image element with the given action and file.
   *
   * @param {ITimelineAction} action The timeline action.
   * @param {IMediaFile} file The media file.
   * @returns {HTMLImageElement} The new image element.
   */
  static createNewImage(action: ITimelineAction, file: IMediaFile): HTMLImageElement {
    throw new Error('createNewImage');
    const item = document.createElement('img') as HTMLImageElement;
    item.src = file.url;
    item.style.display = 'flex';
    ImageControl.applyStyles(action, item);
    return item;
  }

  /**
   * Applies the styles from an action to an image element.
   *
   * @param {ITimelineAction} action The timeline action.
   * @param {HTMLImageElement} item The image element.
   */
  static applyStyles(action: ITimelineAction, item: HTMLImageElement) {
    if (action?.style) {
      // eslint-disable-next-line guard-for-in
      const keys = Object.keys(action.style);
      for (let i = 0; i <  keys.length; i += 1) {
        const prop = keys[i];
        item.style[prop] = action.style[prop];
      }
    }
  }

  /**
   * Updates the image element's display style based on the timeline time.
   *
   * @param {ControllerParams} params The controller parameters.
   */
  update(params: ControllerParams) {
    const {time, engine, track} = params;
    if (time > track.end || time < track.start) {
      this.cacheMap[track.id].style.display = 'none';
      // engine.renderCtx.clearRect(0, 0, engine.renderWidth, engine.renderHeight);
    } else {
      this.cacheMap[track.id].style.display = 'block';
    }
  }

  /**
   * Gets the image element for a given action id.
   *
   * @param {string} actionId The action id.
   * @returns {HTMLImageElement} The image element.
   */
  getElement(actionId: string) {
    return this.cacheMap[actionId];
  }
}

export { ImageControl };
const ImageController = new ImageControl();
export default ImageController;