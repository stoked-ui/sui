import {ControllerParams} from "../Controller.types";
import Controller from "../Controller";

class VideoController extends Controller {
  cacheMap: Record<string, HTMLVideoElement> = {};

  _videoItem: HTMLVideoElement | null = null;

  constructor() {
    super({
      id: 'video',
      name: 'Video',
      color: '#7299cc',
      colorSecondary: '#7299cc',
    });
  }

  // eslint-disable-next-line class-methods-use-this
  private _goToAndStop(item: HTMLVideoElement, time: number) {
    const duration = item.duration * 1000;
    time *= 1000;
    if (time > duration) {
      time %= duration;
    }
    item.currentTime = time / 1000;
    item.pause();
  }

  // eslint-disable-next-line class-methods-use-this
  private _setRenderListener = (renderCtx: CanvasRenderingContext2D, renderer: HTMLCanvasElement, item: HTMLVideoElement) => {
    let animationHandle: any;
    item.addEventListener('loadeddata', videoLoadCallback, false);

    function videoLoadCallback() {
      item.cancelVideoFrameCallback(animationHandle);
      renderCtx.canvas.width  = window.innerWidth;
      renderCtx.canvas.height = window.innerHeight;
      step()
    }

    function step() { // update the canvas when a video proceeds to next frame
      renderCtx.drawImage(item, 0, 0, renderer.width, renderer.height);
      animationHandle = item.requestVideoFrameCallback(step);
    }
  }

  enter(params: ControllerParams) {
    const { action, time, engine} = params;

    if (!action.data) {
      return;
    }

    let item: HTMLVideoElement;
    if (this.cacheMap[action.id]) {
      item = this.cacheMap[action.id];
      if (action.hidden) {
        item.style.display = 'none';
      } else {
        item.style.display = 'flex';
        this._goToAndStop(item, time);
      }
    } else if (!action.hidden){
      item = document.createElement('video');
      item.src = action.data.src;
      item.style.display = 'flex';
      item.style.opacity = '0.3';
      if (action.data?.style) {
        const styleKeys =  Object.keys(action.data.style);
        for (let i = 0; i < styleKeys.length; i += 1) {
          const prop = styleKeys[i];
          item.style[prop] = action.data.style[prop];
        }
      }

      item.loop = true;
      item.muted = true;  // Prevent autoplay restrictions
      item.addEventListener('loadedmetadata', () => {
        this._goToAndStop(item, time - action.start);
      });
      this.cacheMap[action.id] = item;

      if (engine.viewer && engine.renderer) {
        engine.viewer.appendChild(item);
        this._setRenderListener(engine.renderCtx, engine.renderer, item);
      } else {
        console.warn('no viewer specified when video control loaded meta data', item.src)
      }
    }
  }

  update(params: ControllerParams) {
    const { action, time } = params;

    const item = this.cacheMap[action.id];
    if (!item) {
      return;
    }
    if (action.hidden) {
      item.style.display = 'none';
    } else {
      this._goToAndStop(item, time - action.start);
    }
  }

  leave(params: ControllerParams) {
    const { action, time, engine } = params;
    engine.renderCtx.clearRect(0, 0, engine.renderer.width, engine.renderer.height);
    const item = this.cacheMap[action.id];
    if (!item) {
      return;
    }
    if (time > action.end || time < action.start) {
      item.style.display = 'none';
      // console.log('vid none')
    } else {
      // console.log('vid block')
      const cur = time - action.start;
      item.style.display = 'block';
      this._goToAndStop(item, cur);
    }
  }

  destroy() {
    Object.values(this.cacheMap).forEach(video => {
      video.remove();
    });
    this.cacheMap = {};
  }
}

export { VideoController };
const VideoControllerInstance = new VideoController();
export default VideoControllerInstance;
