import {ControllerParams, IEngine, ITimelineAction} from "@stoked-ui/timeline";
import Controller from "./Controller";

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
    if (Number.isNaN(time)) {
      return;
    }
    const duration = item.duration * 1000;
    time *= 1000;
    if (time > duration) {
      time %= duration;
    }
    item.currentTime = time / 1000;
    item.pause();
  }

  // eslint-disable-next-line class-methods-use-this
  private _setRenderListener = (engine: IEngine, video: HTMLVideoElement, action: ITimelineAction) => {
    const { renderer, renderCtx } = engine;
    let animationHandle: any;
    video.addEventListener('loadedmetadata', videoLoadCallback, false);

    const renderFrame = () => { // update the canvas when a
      if (!renderCtx || !renderer) {
        return;
      }
      if (!action.hidden) {
        renderCtx.drawImage(video, 0, 0, engine.renderWidth, engine.renderHeight);
        video.requestVideoFrameCallback(renderFrame);
      }
    }

    function videoLoadCallback() {
      video.cancelVideoFrameCallback(animationHandle);
      renderFrame()
    }
    renderFrame();
  }

  enter(params: ControllerParams) {
    const { action, time, engine} = params;

    let item: HTMLVideoElement;
    if (this.cacheMap[action.id]) {
      item = this.cacheMap[action.id];
      if (action.hidden) {
        item.style.display = 'none';
      } else {
        item.style.display = 'flex';
        this._goToAndStop(item, time);
      }
    } else if (!action.hidden && engine.renderer){
      item = document.createElement('video');
      item.src = action.src;
      item.style.display = 'none';
      item.width = engine.renderWidth;
      item.height = engine.renderHeight;
      item.style.opacity = '1';

      if (action?.style) {
        const styleKeys =  Object.keys(action.style);
        for (let i = 0; i < styleKeys.length; i += 1) {
          const prop = styleKeys[i];
          item.style[prop] = action.style[prop];
        }
      }

      item.loop = false;
      item.muted = false;  // Prevent autoplay restrictions
      item.addEventListener('loadedmetadata', () => {
        this._goToAndStop(item, time - action.start);
      });
      this.cacheMap[action.id] = item;

      if (engine.stage && engine.renderer && engine.renderCtx) {
        engine.stage.appendChild(item);
        this._setRenderListener(engine, item, action);
      } else {
        console.warn('no viewer specified when video control loaded meta data', item.src)
      }
    }
  }

  update(params: ControllerParams) {
    const { action, time, engine } = params;

    const item = this.cacheMap[action.id];
    if (!item) {
      return;
    }
    if (action.hidden) {
      item.style.display = 'none';
      return;
    }
    const { renderCtx, renderer } = engine;
    if (!renderCtx || !renderer) {
      return;
    }
    item.currentTime = time - action.start;
    renderCtx.drawImage(item, 0, 0, engine.renderWidth, engine.renderHeight);
    // this._goToAndStop(item, time - action.start);
  }

  leave(params: ControllerParams) {
    const { action, time, engine } = params;
    engine.renderCtx?.clearRect(0, 0, engine.renderWidth, engine.renderHeight);
    const item = this.cacheMap[action.id];
    if (!item) {
      return;
    }
    if (time > action.end || time < action.start) {
      //item.style.display = 'none';
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
