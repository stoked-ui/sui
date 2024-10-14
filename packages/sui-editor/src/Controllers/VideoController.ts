import { Controller, ControllerParams, IEngine, ITimelineAction, DrawData } from "@stoked-ui/timeline";

interface VideoDrawData extends Omit<DrawData, 'source'> {
  source: HTMLVideoElement
}

class VideoControl extends Controller {
  cacheMap: Record<string, HTMLVideoElement> = {};

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

  // eslint-disable-next-line class-methods-use-this
  async preload(params: Omit<ControllerParams, 'time'>): Promise<ITimelineAction> {
    const { action, engine } = params;
    const item = document.createElement('video') as HTMLVideoElement;
    item.id = action.id;
    item.preload = 'auto';
    engine.stage?.appendChild(item);
    this.cacheMap[action.id] = item;
    console.log(`preload start: ${action.id}`)
    return new Promise((resolve, reject) => {
      try {
        if (!item) {
          reject(new Error(`Video not loaded ${action.name} - ${action.src}`))
          return;
        }
        let loadedMetaData = false;
        item.addEventListener('loadedmetadata', () => {
          action.duration = item.duration;
          action.width = item.videoWidth;
          action.height = item.videoHeight;
          const ratio = action.width / action.height;
          item.style.aspectRatio = `${ratio}`;
          item.style.objectFit = action.fit;
          // this.cacheMap[action.id] = item;
          loadedMetaData = true;
        });

        let canPlayThrough = false;
        item.addEventListener('canplaythrough', () => {
          canPlayThrough = true;
        })

        item.addEventListener('ended', () => {
          if (action.loop as number || action.loop) {
            if(action.playCount! < (action.loop as number)) {
              action.playCount = 0;
            } else {
              item.play();
              if (action.playCount !== undefined) {
                action.playCount += 1;
              }
            }
          }
        })

        action.playCount = 0;
        item.autoplay = false;
        item.loop = action.loop !== false;
        action.loop = action.loop === false ? 0 : action.loop;
        item.style.display = 'flex';
        item.src = action.src;
        let intervalId;
        let loadingSeconds = 0;

        const isLoaded = () => {
          return item.readyState === 4 && loadedMetaData && canPlayThrough;
        }
        const waitUntilLoaded = () =>{
          intervalId = setInterval(() => {
            console.log(`loadingSeconds ${loadingSeconds}`);
            loadingSeconds += 1;
            if (isLoaded()) {
              clearInterval(intervalId);
              console.log(`action ${action.name} preloaded readyState: ${item.readyState} ${item.id}`);
              resolve(action);
            } else if (loadingSeconds > 20) {
              console.log(`action ${action.name} preload failed readyState: ${item.readyState} ${item.id}`);
              reject(action)
            }
          }, 1000); // Run every 1 second
        }

        if (!isLoaded()) {
          waitUntilLoaded();
        } else {
          console.log('already loaded')
        }

      } catch (ex) {
        reject(ex);
      }
    })
  }

  // eslint-disable-next-line class-methods-use-this
  canvasSync(engine: IEngine, item: HTMLVideoElement, action: ITimelineAction) {
    if (engine.viewMode === 'Screener') {
      return;
    }

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

  draw(params: ControllerParams) {
    const { action, engine } = params;
    const dd = this.getDrawData(params) as VideoDrawData;

    this.log(params, `draw[${action.fit} | ${action.width} x ${action.height} @ { x: ${action.x}, y: ${action.y} } - readyState: ${dd.source.readyState} ${dd.source.id} ${dd.source.playbackRate}`)

    engine.renderCtx?.drawImage(dd.source, dd.sx, dd.sy, dd.sWidth, dd.sHeight, dd.dx, dd.dy, dd.dWidth, dd.dHeight);
  }

  getDrawData(params: ControllerParams): DrawData {
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
    if (action.controller.logging) {
      console.info(`[${time}] ${action.name} => ${msg} `)
    }
  }

  enter(params: ControllerParams) {

    const { action, engine, time } = params;

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
       this.log(params, `cached video readyState: ${cachedItem.readyState}`)
    } /* else if (!action.hidden && engine.renderer){
      console.log('preload on enter')
      this.preload({engine, action})
        .then((loadedAction) => {
          finalizeEnter(this.cacheMap[loadedAction.id]);
        });
    } */
    if (engine.isPlaying) {
      this.start(params);
    }
  }

  start(params: ControllerParams) {
    this.log(params, 'start')
    const { engine, action } = params;
    if (engine.isPlaying) {
      const item = this.cacheMap[action.id];
      if (engine.viewMode === 'Renderer') {
        if (action.freeze === undefined) {
          item.play().catch((err) => console.error(err))
        }
      } else {
        engine.screener?.play().catch((err) => console.error(err))
      }
    }
  }

  stop(params: ControllerParams) {
    this.log(params, 'stop')
    const { action } = params;
    const item = this.cacheMap[action.id];
    item.pause();
  }

  update(params: ControllerParams) {
    const { action, engine, time } = params;
    const item = this.cacheMap[action.id] as HTMLVideoElement;
    // this.log(params, `update - [${item.src  }}${item.currentTime}`);

    if (!engine.renderCtx) {
      console.error('no render context');
      return;
    }

    if (item.currentTime === 0) {
      item.currentTime += 0.0001;
    } else if (action.freeze !== undefined) {
      item.currentTime = action.freeze;
    } else {
      //
    }

    if (engine.isPlaying) {
      if (!action.nextFrame) {
        console.warn('failed to play a frame because no frame data available');
        return;
      }

      const fd = action.nextFrame as DrawData;
      engine.renderCtx!.drawImage(fd.source as HTMLVideoElement, fd.sx, fd.sy, fd.sWidth, fd.sHeight, fd.dx, fd.dy, fd.dWidth, fd.dHeight);
      if (action.freeze === undefined) {
        action.nextFrame = undefined;
      }
    } else {
      item.currentTime = time - action.start;
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

  leave(params: ControllerParams) {
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
      item.cancelVideoFrameCallback(action.frameSyncId);
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
}

export { VideoControl };
const VideoController = new VideoControl();
export default VideoController;
