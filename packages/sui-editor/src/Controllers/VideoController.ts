import {
  Controller,
  ControllerParams,
  ITimelineAction,
} from "@stoked-ui/timeline";
import {EditorControllerParams, EditorPreloadParams} from "./EditorControllerParams";
import {DrawData, IEditorEngine} from "../EditorEngine/EditorEngine.types";
import {IEditorAction} from "../EditorAction/EditorAction";
import ShadowStage from '../ShadowStage';

interface VideoDrawData extends Omit<DrawData, 'source'> {
  source: HTMLVideoElement
}

class VideoControl extends Controller {
  cacheMap: Record<string, HTMLVideoElement> = {};

  screenshots: Record<string, string> = {};

  cacheFrameSync: Record<string, number> = {};

  _videoItem: HTMLVideoElement | null = null;

  logging: boolean = false;

  constructor() {
    super({
      id: 'video',
      name: 'Video',
      color: '#7299cc',
      colorSecondary: '#7299cc',
    });
  }

  static hasAudio (item: HTMLMediaElement) {
    return item && (("audioTracks" in item && ("mozHasAudio" in item || Boolean((item.audioTracks as any)?.length))) ||
    ("webkitAudioDecodedByteCount" in item && (item.webkitAudioDecodedByteCount as number) > 0))
  }

  static captureScreenshot(video: HTMLVideoElement, time: number): Promise<string> {
    return new Promise((resolve) => {
      video.currentTime = time;
      video.pause();

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      video.addEventListener('seeked', () => {
        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/png')); // Returns a Base64 image URL
      }, { once: true });
    });
  }

  // eslint-disable-next-line class-methods-use-this
  async preload(params: EditorPreloadParams): Promise<ITimelineAction> {
    const { action, file } = params;
    const preloaded = !!file.element;
    const item = document.createElement('video') as HTMLVideoElement;
    item.id = action.id;
    this.cacheMap[action.id] = item;

    ShadowStage.getStage().appendChild(item);

    if (action.loop === false || action.loop === undefined || action.loop === 0) {
      action.loop = 0;
      item.loop = false;
    }

    if (action.loop === true || action.loop === Infinity) {
      action.playCount = Infinity;
    }

    item.preload = 'auto';
    return new Promise((resolve, reject) => {
      try {
        if (!item) {
          reject(new Error(`Video not loaded ${action.name} - ${file._url}`))
          return;
        }
        let loadedMetaData = false;
        item.addEventListener('loadedmetadata', () => {
          action.duration = item.duration;
          action.width = item.videoWidth;
          action.height = item.videoHeight;
          const ratio = action.width / action.height;
          item.style.aspectRatio = `${ratio}`;
          item.style.objectFit = action.fit as string;
          // this.cacheMap[action.id] = item;
          loadedMetaData = true;
        });

        let canPlayThrough = false;
        item.addEventListener('canplaythrough', () => {
          canPlayThrough = true;
          //VideoControl.captureScreenshot(item, ((action.end - action.start) / 2) + action.start).then((screenshot) => {
          //  this.screenshots[action.id] = screenshot;
          //})
        })

        item.autoplay = false;

        item.style.display = 'flex';
        item.src = file.url;
        let intervalId;
        let loadingSeconds = 0;

        const isLoaded = () => {
          return item.readyState === 4 && loadedMetaData && canPlayThrough;
        }
        const waitUntilLoaded = () =>{
          intervalId = setInterval(() => {
            loadingSeconds += 1;
            if (isLoaded()) {
              clearInterval(intervalId);
              resolve(action as ITimelineAction);
            } else if (loadingSeconds > 20) {
              reject(action)
            }
          }, 1000); // Run every 1 second
        }

        if (!isLoaded()) {
          waitUntilLoaded();
        }

      } catch (ex) {
        reject(ex);
      }
    })
  }

  // eslint-disable-next-line class-methods-use-this
  canvasSync(engine: IEditorEngine, item: HTMLVideoElement, action: IEditorAction) {
    const { renderCtx, renderer } = engine;
    if (!renderer || !renderCtx) {
      return;
    }

    let startTime = 0.0;

    const updateCanvas = (now: number) => {
      if (startTime === 0.0) {
        startTime = now;
      }
      if (engine.renderWidth && engine.renderHeight) {
        // renderCtx.canvas.width = engine.renderWidth;
        // renderCtx.canvas.height = engine.renderHeight;
      }

      this.log({ time: item.currentTime, action, engine }, 'drawImage');
      action.nextFrame = this.getDrawData({ action, engine, time: item.currentTime });

      if ('requestVideoFrameCallback' in item) {
        action.frameSyncId = item.requestVideoFrameCallback(updateCanvas);
      } else {
        action.frameSyncId = requestAnimationFrame(updateCanvas);
      }
    };

    if (action.freeze !== undefined) {
      item.currentTime = action.freeze;
      action.nextFrame = this.getDrawData({ action, engine, time: item.currentTime });
    } else if ('requestVideoFrameCallback' in item) {
      action.frameSyncId = item.requestVideoFrameCallback(updateCanvas);
    } else {
      action.frameSyncId = requestAnimationFrame(updateCanvas);
    }
  }

  draw(params: EditorControllerParams, videoData?: VideoDrawData) {
    const { action, engine } = params;
    const dd = videoData || this.getDrawData(params) as VideoDrawData;

    this.log(params, `draw[${action.fit} | ${action.width} x ${action.height} @ { x: ${action.x}, y: ${action.y} } - readyState: ${dd.source.readyState} ${dd.source.id} ${dd.source.playbackRate}`)
    engine.renderCtx?.drawImage(dd.source, dd.sx, dd.sy, dd.sWidth, dd.sHeight, dd.dx ?? 0, dd.dy ?? 0, dd.dWidth ?? 1920, dd.dHeight ?? 1080);
  }

  getDrawData(params: EditorControllerParams): DrawData {
    const { engine, action } = params;
    const item = this.cacheMap[action.id];
    this.log({time: item.currentTime, action, engine}, `getDrawData[${action.fit} | ${action.width} x ${action.height} @ { x: ${action.x}, y: ${action.y} }`)
    const data = {
      source: item,
      sx: 0,
      sy: 0,
      sWidth: action.width,
      sHeight: action.height,
      dx: action.x,
      dy: action.y,
      dWidth: action.width,
      dHeight: action.height
    };
    const ratio = action.width / action.height;
    const rRatio = action.height / action.width;
    switch (action.fit) {
      case 'fill':
        data.dWidth = engine.renderWidth;
        data.dHeight = engine.renderHeight;
        break;
      case 'contain':
        if (ratio > 1) {
          data.dWidth = engine.renderHeight * ratio;
          data.dHeight = engine.renderHeight;
        } else {
          data.dWidth = engine.renderWidth;
          data.dHeight = engine.renderWidth * rRatio;
        }
        break;
      case 'cover':
        if (ratio > 1) {
          data.dWidth = engine.renderWidth;
          data.dHeight = engine.renderWidth * rRatio;
        } else {
          data.dWidth = engine.renderHeight * ratio;
          data.dHeight = engine.renderHeight;
        }
        break;
      case 'none':
      default:
        data.dWidth = action.width;
        data.dHeight = action.height;
        break;
    }

    return data;
  }

  // eslint-disable-next-line class-methods-use-this
  isVideoPlaying(video: HTMLVideoElement) {
    return (video.currentTime > 0 && !video.paused && !video.ended && video.readyState > 2);
  }

  // eslint-disable-next-line class-methods-use-this
  log(params: ControllerParams, msg: string) {
    const { action, time } = params;
    if (this.logging) {
      console.info(`[${time}] ${action.name} => ${msg} `)
    }
  }

  enter(params: EditorControllerParams) {

    const { action, engine } = params;

    const finalizeEnter = (item: HTMLVideoElement) => {

      this.canvasSync(engine, item, action);
    }
    const vidItem = document.getElementById(action.id) as HTMLVideoElement;
    if (vidItem) {
      this.log(params, `enter readyState: ${vidItem.readyState}`)

      if (engine.isPlaying && vidItem.currentTime === 0) {
        vidItem.currentTime += 0.0001;
      }
      finalizeEnter(vidItem);
      // this.canvasSync(engine, vidItem, action);


    } else {
       const cachedItem = this.cacheMap[action.id];
       this.log(params, `cached video readyState: ${cachedItem?.readyState}`)
    }

    if (engine.isPlaying) {
      this.start(params);
    } else {
      this.update(params);
    }
    if (action.loop === true || action.loop === Infinity) {
      action.playCount = Infinity;
    } else if (action.loop) {
      action.playCount = action.loop as number;
    }
  }

  start(params: EditorControllerParams) {
    this.log(params, 'start')
    const { engine, action, time } = params;
    if (engine.isPlaying) {
      const item = this.cacheMap[action.id];
      item.currentTime = (time - action.start + (action?.trimStart || 0)) % (action?.duration ?? 0);
      if (action?.playbackRate ?? 1 < 0) {
        (item as HTMLVideoElement).playbackRate = action.playbackRate as number;
      }
      if (action.freeze === undefined) {
        item.play().catch((err) => console.error(err))
      }
    }
  }

  stop(params: EditorControllerParams) {
    this.log(params, 'stop')
    const { action } = params;
    const item = this.cacheMap[action.id];
    item.pause();
  }

  update(params: EditorControllerParams) {

    const { action, engine, time } = params;
    const item = this.cacheMap[action.id] as HTMLVideoElement;
    const volumeUpdate = Controller.getVolumeUpdate(params, item.currentTime)

    if (volumeUpdate) {
      item.volume = volumeUpdate.volume;
      action.volumeIndex = volumeUpdate.volumeIndex;
      console.info(`${action.name} - editorTime: ${params.time}, actionTime: ${Controller.getActionTime(params)}, volume: ${volumeUpdate.volume}`)
    }

    if (!engine.renderCtx) {
      console.error('no render context');
      return;
    }

    if (item.currentTime === 0) {
      item.currentTime += 0.0001;
    } else if (action.freeze !== undefined) {
      item.currentTime = action.freeze;
    }

    if (engine.isPlaying) {
      if (!action.nextFrame) {
        console.warn('failed to play a frame because no frame data available');
        action.nextFrame = this.getDrawData({ action, engine, time: item.currentTime });
      }

      const fd = action.nextFrame as VideoDrawData;
      this.draw(params, fd);
    } else {
      item.currentTime = Controller.getActionTime(params);
      this.draw(params);
    }

    /*
    // Default velocity and acceleration if not provided
    let velocity = action.velocity ?? 0;

    // clamp at 16 for chrome
    try {
      // TODO: figure out clamps for other browsers
      if (item.playbackRate + velocity + (action?.acceleration ?? 0) < 16) {
        const acceleration = action.acceleration ?? 0;

        // Update the velocity based on the acceleration
        velocity += acceleration;

        // Adjust the playback rate by adding velocity
        item.playbackRate += velocity;

        // Ensure playbackRate remains positive
        item.playbackRate = Math.max(0.1, item.playbackRate);

        // Store the updated velocity back into the action object
        action.velocity = velocity;
      }
    } catch(ex) {
      console.warn(ex);
    } */
  }

  leave(params: EditorControllerParams) {
    this.log(params, 'leave')
    const { action, time } = params;
    const item = this.cacheMap[action.id];

    if (!item) {
      return;
    }
    if (time > action.end || time < action.start) {
      item.style.display = 'none';
    } else {
      item.style.display = 'flex';
    }
    if (action.frameSyncId) {
      if ('cancelVideoFrameCallback' in item) {
        item.cancelVideoFrameCallback(action.frameSyncId);
      } else {
        cancelAnimationFrame(action.frameSyncId);
      }
    }
    this.stop(params);
  }

  destroy() {
    process.exit(333);
    Object.values(this.cacheMap).forEach(video => {
      video.remove();
    });
    this.cacheMap = {};
    process.exit(333);
  }

  getElement(actionId: string) {
    return this.cacheMap[actionId];
  }
}

export { VideoControl };
const VideoController = new VideoControl();
export default VideoController;
