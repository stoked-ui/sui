import { ShadowStage, ScreenshotQueue } from '@stoked-ui/media-selector';
import {
  Controller, ControllerParams, ITimelineAction, ITimelineTrack, getActionFileTimespan
} from "@stoked-ui/timeline";
import {EditorControllerParams, EditorPreloadParams} from "./EditorControllerParams";
import {DrawData, IEditorEngine} from "../EditorEngine/EditorEngine.types";
import {IEditorAction} from "../EditorAction/EditorAction";
import {IEditorTrack} from "../EditorTrack";

interface VideoDrawData extends Omit<DrawData, 'source'> {
  source: HTMLVideoElement
}

class VideoControl extends Controller<HTMLVideoElement> {
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

  getItem: (params: EditorPreloadParams) => HTMLVideoElement = (params: EditorPreloadParams) => {
    const { track  } = params;
    let item = this.cacheMap[track.id];
    if (item) {
      return item;
    }
    item = document.createElement('video') as HTMLVideoElement;
    const { file } = track;
    if (!file) {
      throw new Error('no file found for video controlled item');
    }
    file.media.element = item;
    item.id = track.id;
    this.cacheMap[track.id] = item;

    ShadowStage.getStage().appendChild(item);
    return item;
  }

  static hasAudio (item: HTMLMediaElement) {
    return item && (("audioTracks" in item && ("mozHasAudio" in item || Boolean((item.audioTracks as any)?.length))) ||
    ("webkitAudioDecodedByteCount" in item && (item.webkitAudioDecodedByteCount as number) > 0))
  }

  // eslint-disable-next-line class-methods-use-this
  async preload(params: EditorPreloadParams): Promise<ITimelineAction> {
    const { action, track } = params;
    const { file } = track;
    if (!file) {
      return action;
    }
    const item = this.getItem(params);
    const fileTimespan = getActionFileTimespan<IEditorAction>(action);
    // this.screenshotQueue.enqueue?.(file, fileTimespan, 'track');

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
          reject(new Error(`Video not loaded ${action.name} - ${file.url}`))
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
          // console.info('action preload: video loadedmetadata', action.name)
        });

        let canPlayThrough = false;
        item.addEventListener('canplaythrough', () => {
          canPlayThrough = true;
          // console.info('action preload: video canplaythrough', action.name)
          // VideoControl.captureScreenshot(item, ((action.end - action.start) / 2) + action.start).then((screenshot) => {
          //  this.screenshots[action.id] = screenshot;
          // })
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
              clearInterval(intervalId);
              resolve(action)
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
  canvasSync(engine: IEditorEngine, item: HTMLVideoElement, action: IEditorAction, track: IEditorTrack) {
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

      // this.log({ time: item.currentTime, action, engine, track }, 'drawImage');
      action.nextFrame = this.getDrawData({ action, engine, time: item.currentTime, track });

      if ('requestVideoFrameCallback' in item) {
        action.frameSyncId = item.requestVideoFrameCallback(updateCanvas);
      } else {
        action.frameSyncId = requestAnimationFrame(updateCanvas);
      }
    };

    if (action.freeze !== undefined) {
      item.currentTime = action.freeze;
      action.nextFrame = this.getDrawData({ action, track, engine, time: item.currentTime });
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
    const { engine, action, track } = params;
    const item = this.cacheMap[track.id];
    // this.log(params, `getDrawData[${action.fit} | ${action.width} x ${action.height} @ { x:
    // ${action.x}, y: ${action.y} }`)
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

    const { action, engine, track } = params;

    const finalizeEnter = (item: HTMLVideoElement) => {

      this.canvasSync(engine, item, action, track);
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
       const cachedItem = this.cacheMap[track.id];
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
    const { engine, action, time, track } = params;
    if (engine.isPlaying) {
      const item = this.getItem(params);
      item.currentTime = Controller.getActionTime(params);
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
    const { action, track } = params;
    const item = this.cacheMap[track.id];
    item.pause();
  }

  update(params: EditorControllerParams) {

    const { action, track, engine, time } = params;
    const item = this.getItem(params);
    const volumeUpdate = Controller.getVolumeUpdate(params, time)

    if (volumeUpdate) {
      item.volume = volumeUpdate.volume;
      action.volumeIndex = volumeUpdate.volumeIndex;
      this.log(params, `${action.name} - editorTime: ${params.time}, actionTime: ${Controller.getActionTime(params)}, volume: ${volumeUpdate.volume}`)
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
        this.log(params,'failed to play a frame because no frame data available');
        action.nextFrame = this.getDrawData({ track, action, engine, time: item.currentTime });
      }

      const fd = action.nextFrame as VideoDrawData;
      this.draw(params, fd);
    } else {
      const derp = Controller.getActionTime(params);
      this.draw(params);
      item.currentTime = derp;
    }
  }

  leave(params: EditorControllerParams) {
    this.log(params, 'leave')
    const { action, time, track } = params;
    const item = this.cacheMap[track.id];

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

  // eslint-disable-next-line class-methods-use-this
  getActionStyle(action: ITimelineAction, track: ITimelineTrack, scaleWidth: number, scale: number, trackHeight: number) {
    const { file } = track;
    if (!file?.media) {
      return null;
    }
    const { screenshotStore } = file.media;
    if (!action.backgroundImage && screenshotStore.trackScreenshots && screenshotStore.length > 0) {
      let index = 0;
      if (screenshotStore.length >= 1) {
        index = 1;
      }
      action.backgroundImage = file.media.screenshots[index];
    }
    if (!action.backgroundImage) {
      return null;
    }
    const adjustedScale = scaleWidth / scale;
    // const images = file.media.screenshotStore.trackScreenshots;
    return {
      backgroundImage: `url(${file?.media.screenshots[0]}), url(${file?.media.screenshots[1]}), url(${file?.media.screenshots[2]})`,
      backgroundSize: 'auto 100%, auto 100%, auto 100%', /* Maintain aspect ratios */
      backgroundRepeat: 'no-repeat', /* Prevent tiling */
      backgroundPosition: 'left center, center center, right center',
    }
  }

  destroy() {
    Object.values(this.cacheMap).forEach(video => {
      video.remove();
    });
    this.cacheMap = {};
    process.exit(333);
  }
}

export { VideoControl };
const VideoController = new VideoControl();
export default VideoController;
