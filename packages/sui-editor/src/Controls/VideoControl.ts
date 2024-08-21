import {
  ITimelineActionType,
  ITimelineAction,
  TimelineActionParams,
  TimelineEngine
} from "@stoked-ui/timeline";

class VideoControl implements ITimelineActionType {
  id =  'video';

  name = 'Video';

  color = '#0000FF';

  cacheMap: Record<string, HTMLVideoElement> = {};

  _videoItem: HTMLVideoElement | null = null;
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

  enter(params: TimelineActionParams) {
    const { action, time, engine} = params;

    let item: HTMLVideoElement;
    if (this.cacheMap[action.id]) {
      item = this.cacheMap[action.id];
      item.style.display = 'flex';
      this._goToAndStop(item, time);
    } else {
      item = document.createElement('video');
      item.src = action.data.src;
      item.style.position = 'absolute';
      item.style.display = 'flex';
      if (action.data?.style) {
        for (const prop in action.data.style) {
          console.log('item.style[prop]', item.style[prop])
          item.style[prop] = action.data.style[prop];
        }
      }
      item.loop = true;
      item.muted = true;  // Prevent autoplay restrictions
      item.addEventListener('loadedmetadata', () => {
        this._goToAndStop(item, time - action.start);
      });
      this.cacheMap[action.id] = item;

      if (engine.viewer) {
        this.viewerUpdate(engine.viewer, action)
      }
    }
  }

  viewerUpdate(engine: TimelineEngine, action: ITimelineAction) {
    const item = this.cacheMap[action.id]

    if (engine.viewer.tagName === 'canvas') {
      const canvas = engine.viewer as HTMLCanvasElement;
      item.addEventListener('play', () => {
        // eslint-disable-next-line consistent-this
        let ctx = canvas.getContext('2d');
        (function loop() {
          if (!item.paused && !item.ended) {
            if (!ctx) {
              ctx = canvas.getContext('2d');
            }
            if (ctx) {
              ctx.drawImage(item, 0, 0);
            }
            setTimeout(loop, 1000 / 30); // drawing at 30fps
          }
        })();
      }, false);
    } else {
      engine.viewer.appendChild(item);
    }
  }

  update(params: TimelineActionParams) {
    const { action, time } = params;
    const item = this.cacheMap[action.id];
    if (!item) {
      return;
    }
    this._goToAndStop(item, time - action.start);
  }

  leave(params: TimelineActionParams) {
    const { action, time } = params;
    const item = this.cacheMap[action.id];
    if (!item) {
      return;
    }
    if (time > action.end || time < action.start) {
      item.style.display = 'none';
    } else {
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

export default new VideoControl();
