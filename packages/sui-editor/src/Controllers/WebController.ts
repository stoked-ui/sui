import { Controller, ControllerParams, IEngine, ITimelineAction } from "@stoked-ui/timeline";
import { IMediaFile } from "@stoked-ui/media-selector";
import {IEditorEngine} from "../EditorEngine";
import {EditorControllerParams} from "./EditorControllerParams";

/**
 * ImageControl is a controller that manages the display of images in the timeline.
 * It handles actions, media files, and viewer rendering to provide an interactive experience.
 *
 * @extends Controller
 */
class ImageControl extends Controller {
  /**
   * Cache map to store image elements for quick lookup by action ID.
   */
  cacheMap: Record<string, HTMLImageElement> = {};

  /**
   * Flag to enable or disable logging.
   */
  logging: boolean = false;

  /**
   * Constructor.
   */
  constructor() {
    super({
      id: 'image', name: 'Image', color: '#6b3514', colorSecondary: '#d76d2b',
    });
  }

  /**
   * Enter a new action in the timeline, rendering the corresponding image if necessary.
   *
   * @param {EditorControllerParams} params - Parameters for entering a new action.
   */
  enter(params: EditorControllerParams) {
    const {action, engine} = params;
    let item: HTMLImageElement;

    // Check if an action track exists
    const track = engine.getActionTrack(action.id);
    if (!track) {
      return;
    }

    // If an image is already cached for this action, update its display
    if (this.cacheMap[action.id]) {
      item = this.cacheMap[action.id];
      ImageControl.toggleDisplay(action, item);
    } 
    // Otherwise, create a new image and cache it for future use
    else if (!action.hidden) {
      item = ImageControl.createNewImage(action, track.file!);
      this.cacheMap[action.id] = item;
      ImageControl.attachItemToViewer(item, engine);
      ImageControl.renderImage(item, engine);
    }
  }

  /**
   * Toggle the display of an image element based on its action status.
   *
   * @param {ITimelineAction} action - The action controlling the image's visibility.
   * @param {HTMLImageElement} item - The image element to update.
   */
  static toggleDisplay(action: ITimelineAction, item: HTMLImageElement) {
    item.style.display = action.hidden ? 'none' : 'flex';
  }

  /**
   * Create a new image element for an action and render it.
   *
   * @param {ITimelineAction} action - The action controlling the image's visibility.
   * @param {IMediaFile} file - The media file associated with this action.
   * @returns {HTMLImageElement} A new image element to be rendered.
   */
  static createNewImage(action: ITimelineAction, file: IMediaFile): HTMLImageElement {
    const item = document.createElement('img') as HTMLImageElement;
    item.src = file.url;
    item.style.display = 'flex';
    ImageControl.applyStyles(action, item);
    return item;
  }

  /**
   * Apply styles to an image element based on its action configuration.
   *
   * @param {ITimelineAction} action - The action controlling the image's visibility.
   * @param {HTMLImageElement} item - The image element to update.
   */
  static applyStyles(action: ITimelineAction, item: HTMLImageElement) {
    if (action?.style) {
      // Apply styles from the action configuration
      const keys = Object.keys(action.style);
      for (let i = 0; i <  keys.length; i += 1) {
        const prop = keys[i];
        item.style[prop] = action.style[prop];
      }
    }
  }

  /**
   * Attach an image element to the viewer and renderer.
   *
   * @param {HTMLImageElement} item - The image element to attach.
   * @param {IEditorEngine} engine - The editor engine instance.
   */
  static attachItemToViewer(item: HTMLImageElement, engine: IEditorEngine) {
    if (engine.viewer && engine.renderer) {
      engine.viewer.appendChild(item);
    } 
    // Log a warning if no viewer is specified
    else {
      console.warn('no viewer specified when image control loaded meta data', item.src)
    }
  }

  /**
   * Render an image element in the context of the editor.
   *
   * @param {HTMLImageElement} item - The image element to render.
   * @param {IEditorEngine} engine - The editor engine instance.
   */
  static renderImage(item: HTMLImageElement, engine: IEditorEngine) {
    engine.renderCtx?.drawImage(item, 0, 0,  engine.width, item.height);
  }

  /**
   * Update the display of an image element based on its action status.
   *
   * @param {ITimelineAction} action - The action controlling the image's visibility.
   * @param {HTMLImageElement} item - The image element to update.
   */
  static updateDisplay(action: ITimelineAction, item: HTMLImageElement) {
    // Update display logic here
  }

  /**
   * Cache an image element for quick lookup by action ID.
   *
   * @param {string} actionId - The unique identifier of the action.
   * @param {HTMLImageElement} item - The image element to cache.
   */
  static cacheItem(actionId: string, item: HTMLImageElement) {
    // Cache logic here
  }

  /**
   * Render all cached images in the editor.
   *
   * @param {IEditorEngine} engine - The editor engine instance.
   */
  static renderCachedItems(engine: IEditorEngine) {
    // Render logic here
  }
}

const ImageController = new ImageControl();
export default ImageController;