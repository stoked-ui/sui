import {
  Controller, ControllerParams, IController, IEngine, ITimelineAction, ITimelineTrack
} from "@stoked-ui/timeline";
import { IMediaFile } from "@stoked-ui/media-selector";
import {type IEditorEngine} from "../EditorEngine";
import {EditorControllerParams, EditorPreloadParams} from "./EditorControllerParams";
import {IEditorTrack} from "../EditorTrack";

class ImageControl extends Controller<HTMLImageElement> implements IController {
  cacheMap: Record<string, HTMLImageElement> = {};

  logging: boolean = false;

  constructor() {
    super({
      id: 'image', name: 'Image', color: '#6b3514', colorSecondary: '#d76d2b',
    });
  }

  enter(params: EditorControllerParams) {
    const {action, engine, track} = params;
    const item: HTMLImageElement = this.getItem(params as EditorControllerParams);
    ImageControl.setDisplay(track, item);
    ImageControl.attachItemToViewer(item, engine);
    ImageControl.renderImage(item, engine);
  }

  getItem(params: EditorPreloadParams) {
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

  static setDisplay(track: IEditorTrack, item: HTMLImageElement) {
    item.style.display = track.hidden ? 'none' : 'flex';
  }

  static createNewImage(action: ITimelineAction, file: IMediaFile): HTMLImageElement {
    const item = document.createElement('img') as HTMLImageElement;
    item.src = file.url;
    item.style.display = 'flex';
    ImageControl.applyStyles(action, item);
    return item;
  }

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

  static attachItemToViewer(item: HTMLImageElement, engine: IEditorEngine) {
    if (engine.viewer && engine.renderer) {
      engine.viewer.appendChild(item);
    } else {
      console.warn('no viewer specified when image control loaded meta data', item.src)
    }
  }

  static renderImage(item: HTMLImageElement, engine: IEditorEngine) {
    engine.renderCtx?.drawImage(item, 0, 0,  engine.renderWidth, engine.renderHeight);
  }

  update(params: EditorControllerParams) {
    const { action, engine, track} = params;

    const item = this.cacheMap[track.id];
    if (!item) {
      return;
    }
    if (track.hidden) {
      item.style.display = 'none';
    } else {
      engine.renderCtx?.drawImage(item, 0, 0,  engine.renderWidth, engine.renderHeight);
    }
  }

  leave(params: ControllerParams) {
    const { action, time, engine, track } = params;
    const item = this.cacheMap[track.id];
    if (!item) {
      return;
    }

    if (time > action.end || time < action.start) {
      item.style.display = 'none';
      // engine.renderCtx?.clearRect(0, 0, engine.renderWidth, engine.renderHeight);
    } else {
      item.style.display = 'block';
    }
  }

  getElement(actionId: string) {
    return this.cacheMap[actionId];
  }
}

export { ImageControl };
const ImageController = new ImageControl();
export default ImageController;
