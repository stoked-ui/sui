/**
 * Represents a controller for managing image elements in the timeline editor.
 */
class ImageControl extends Controller {
  /**
   * A map to cache image elements based on action IDs.
   */
  cacheMap: Record<string, HTMLImageElement> = {};

  /**
   * Flag to enable/disable logging.
   */
  logging: boolean = false;

  /**
   * Constructs an instance of ImageControl.
   */
  constructor() {
    super({
      id: 'image', name: 'Image', color: '#6b3514', colorSecondary: '#d76d2b',
    });
  }

  /**
   * Handles entering the image control mode.
   * @param {EditorControllerParams} params - The parameters for the editor controller.
   */
  enter(params: EditorControllerParams) {
    const { action, engine } = params;
    let item: HTMLImageElement;
    const track = engine.getActionTrack(action.id);
    if (!track) {
      return;
    }
    if (this.cacheMap[action.id]) {
      item = this.cacheMap[action.id];
      ImageControl.toggleDisplay(action, item);
    } else if (!action.hidden) {
      item = ImageControl.createNewImage(action, track.file!);
      this.cacheMap[action.id] = item;
      ImageControl.attachItemToViewer(item, engine);
      ImageControl.renderImage(item, engine);
    }
  }

  /**
   * Toggles the display of the image element.
   * @param {ITimelineAction} action - The timeline action object.
   * @param {HTMLImageElement} item - The image element to toggle.
   */
  static toggleDisplay(action: ITimelineAction, item: HTMLImageElement) {
    item.style.display = action.hidden ? 'none' : 'flex';
  }

  /**
   * Creates a new image element based on the provided action and media file.
   * @param {ITimelineAction} action - The timeline action object.
   * @param {IMediaFile} file - The media file for the image.
   * @returns {HTMLImageElement} The created image element.
   */
  static createNewImage(action: ITimelineAction, file: IMediaFile): HTMLImageElement {
    const item = document.createElement('img') as HTMLImageElement;
    item.src = file.url;
    item.style.display = 'flex';
    ImageControl.applyStyles(action, item);
    return item;
  }

  /**
   * Applies styles to the image element based on the provided action.
   * @param {ITimelineAction} action - The timeline action object with styles.
   * @param {HTMLImageElement} item - The image element to apply styles to.
   */
  static applyStyles(action: ITimelineAction, item: HTMLImageElement) {
    if (action?.style) {
      const keys = Object.keys(action.style);
      for (let i = 0; i < keys.length; i += 1) {
        const prop = keys[i];
        item.style[prop] = action.style[prop];
      }
    }
  }

  /**
   * Attaches the image element to the viewer in the editor engine.
   * @param {HTMLImageElement} item - The image element to attach.
   * @param {IEditorEngine} engine - The editor engine instance.
   */
  static attachItemToViewer(item: HTMLImageElement, engine: IEditorEngine) {
    if (engine.viewer && engine.renderer) {
      engine.viewer.appendChild(item);
    } else {
      console.warn('no viewer specified when image control loaded meta data', item.src);
    }
  }

  /**
   * Renders the image on the canvas using the editor engine.
   * @param {HTMLImageElement} item - The image element to render.
   * @param {IEditorEngine} engine - The editor engine instance.
   */
  static renderImage(item: HTMLImageElement, engine: IEditorEngine) {
    engine.renderCtx?.drawImage(item, 0, 0, engine.renderWidth, engine.renderHeight);
  }

  /**
   * Updates the image element based on the provided action in the editor engine.
   * @param {EditorControllerParams} params - The parameters for the editor controller.
   */
  update(params: EditorControllerParams) {
    const { action, engine } = params;
    const item = this.cacheMap[action.id];
    if (!item) {
      return;
    }
    if (action.hidden) {
      item.style.display = 'none';
    } else {
      engine.renderCtx?.drawImage(item, 0, 0, engine.renderWidth, engine.renderHeight);
    }
  }

  /**
   * Handles leaving the image control mode.
   * @param {ControllerParams} params - The parameters for the controller.
   */
  leave(params: ControllerParams) {
    const { action, time, engine } = params;
    const item = this.cacheMap[action.id];
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
   * Retrieves the image element based on the provided action ID.
   * @param {string} actionId - The ID of the action to retrieve the image element for.
   * @returns {HTMLImageElement} The image element associated with the action ID.
   */
  getElement(actionId: string) {
    return this.cacheMap[actionId];
  }
}

export { ImageControl };
const ImageController = new ImageControl();
export default ImageController;