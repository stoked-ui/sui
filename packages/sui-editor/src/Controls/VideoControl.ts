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

    if (!action.data) {
      return;
    }

    const track = engine.getActionTrack(action.id);

    let item: HTMLVideoElement;
    if (this.cacheMap[action.id]) {
      item = this.cacheMap[action.id];
      if (track.hidden) {
        item.style.display = 'none';
      } else {
        item.style.display = 'flex';
        this._goToAndStop(item, time);
      }
    } else if (!track.hidden){
      item = document.createElement('video');
      item.src = action.data.src;
      item.style.position = 'absolute';
      item.style.display = 'flex';
      if (action.data?.style) {
        for (const prop in action.data.style) {
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
        engine.viewer.appendChild(item);
      } else {
        console.warn('no viewer specified when video control loaded meta data', item.src)
      }
    }
  }

  viewerUpdate(engine: TimelineEngine) {
    //engine.viewer.append(Object.values(this.cacheMap));
  }

  update(params: TimelineActionParams) {
    const { action, engine, time } = params;

    const item = this.cacheMap[action.id];
    if (!item) {
      return;
    }
    const track = engine.getActionTrack(action.id);
    if (track.hidden) {
      item.style.display = 'none';
    } else {
      this._goToAndStop(item, time - action.start);
    }
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
