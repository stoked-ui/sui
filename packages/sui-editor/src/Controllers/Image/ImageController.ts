import { MediaControllerParams } from "../Controller.types";
import Controller from "../Controller";

class ImageController extends Controller {
  cacheMap: Record<string, HTMLImageElement> = {};

  constructor() {
    super({
      id: 'image',
      name: 'Image',
      color: '#6b3514',
      colorSecondary: '#d76d2b',
    });
  }

  enter(params: MediaControllerParams) {
    const { action, time, engine} = params;

    if (!action.data) {
      return;
    }

    let item: HTMLImageElement;
    if (this.cacheMap[action.id]) {
      item = this.cacheMap[action.id];
      if (action.hidden) {
        item.style.display = 'none';
      } else {
        item.style.display = 'flex';
      }
    } else if (!action.hidden){
      item = document.createElement('image') as HTMLImageElement;
      item.src = action.data.src;
      item.style.display = 'flex';
      if (action.data?.style) {
        for (const prop in action.data.style) {
          item.style[prop] = action.data.style[prop];
        }
      }

      this.cacheMap[action.id] = item;

      if (engine.viewer && engine.renderer) {
        engine.viewer.appendChild(item);
      } else {
        console.warn('no viewer specified when image control loaded meta data', item.src)
      }
      engine.renderCtx.drawImage(item, 0, 0, engine.renderer.width, engine.renderer.height);
    }
  }

  update(params: MediaControllerParams) {
    const { action, time, engine } = params;

    const item = this.cacheMap[action.id];
    if (!item) {
      return;
    }
    if (action.hidden) {
      item.style.display = 'none';
    } else {
      engine.renderCtx.drawImage(item, 0, 0, engine.renderer.width, engine.renderer.height);
    }
  }

  leave(params: MediaControllerParams) {
    const { action, time, engine } = params;
    const item = this.cacheMap[action.id];
    if (!item) {
      return;
    }

    if (time > action.end || time < action.start) {
      item.style.display = 'none';
      engine.renderCtx.clearRect(0, 0, engine.renderer.width, engine.renderer.height);
    } else {
      item.style.display = 'block';
    }
  }
}

export { ImageController };
const ImageControllerInstance = new ImageController();
export default ImageControllerInstance;
