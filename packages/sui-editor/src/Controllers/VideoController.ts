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
  async preload(params: Omit<ControllerParams, 'time'>) {
    const { action, engine } = params;
    const item = document.createElement('video') as HTMLVideoElement;
    return new Promise((resolve, reject) => {
      try {
        if (!item) {
          reject(new Error(`Video not loaded ${action.name} - ${action.src}`))
          return;
        }
        item.addEventListener('canplaythrough', () => {
          action.duration = item.duration;
          action.element = item;
          this.cacheMap[action.id] = item;
          engine.stage?.appendChild(item);
          resolve(action);
        });
        item.autoplay = false;
        item.loop = true;
        item.muted = true;
        item.src = action.src;
      } catch (ex) {
        reject(ex);
      }
    })
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
    const { renderCtx } = engine;


    const draw = () => {
      if (!renderCtx) {
        return;
      }
      renderCtx.drawImage(video, 0, 0, engine.renderWidth, engine.renderHeight);
    }
    video.addEventListener('canplaythrough', draw, false);
    video.addEventListener('canplay', draw, false);

/*
 let animationHandle: any;
    const renderFrame = (time: number) => { // update the canvas when a
      if (!renderCtx || !renderer) {
        return;
      }
      if (!action.hidden) {
        video.currentTime = time / 1000;
        draw();
      }
    }

    function videoLoadCallback() {
      video.cancelVideoFrameCallback(animationHandle);
      video.requestVideoFrameCallback(renderFrame);
    } */
  }

  enter(params: ControllerParams) {
    const { action, time, engine} = params;

    let item: HTMLVideoElement;
    if (this.cacheMap[action.id]) {
      item = this.cacheMap[action.id];
      if (action.hidden) {
        item.style.display = 'none';
      } else {
        item.style.display = 'none';
        // this._goToAndStop(item, time);
      }
    } else if (!action.hidden && engine.renderer){
      item = document.createElement('video');
      item.src = action.src;
      // item.style.display = 'none';
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

      item.autoplay = false;
      item.loop = true;
      item.muted = true;  // Prevent autoplay restrictions
      this.cacheMap[action.id] = item;

      if (engine.stage && engine.renderer && engine.renderCtx) {
        engine.stage.appendChild(item);
        this._setRenderListener(engine, item, action);
      } else {
        console.warn('no viewer specified when video control loaded meta data', item.src)
      }
    }
  }

  getActionTime(time: number, action: ITimelineAction) {
    const startDelta = time - action.start;
    const durationAdjusted = action.duration ? startDelta % action.duration : startDelta;;
    console.log('durationAdjusted', durationAdjusted);
    return durationAdjusted;
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

    item.currentTime = this.getActionTime(time, action);
    renderCtx.drawImage(item, 0, 0, engine.renderWidth, engine.renderHeight);
    this._goToAndStop(item, item.currentTime );
  }

  leave(params: ControllerParams) {
    const { action, time, engine } = params;
    engine.renderCtx?.clearRect(0, 0, engine.renderWidth, engine.renderHeight);
    const item = this.cacheMap[action.id];
    if (!item) {
      return;
    }
    if (time > action.end || time < action.start) {
      // item.style.display = 'none';
      // console.log('vid none')
    } else {
      // console.log('vid block')
      const cur = time - action.start;
      item.style.display = 'none';
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
