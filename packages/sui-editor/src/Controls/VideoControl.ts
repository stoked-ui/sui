import { ITimelineActionType, TimelineAction } from "@stoked-ui/timeline";

class VideoControl implements ITimelineActionType {
  id =  'video';

  name = 'Video';

  cacheMap: Record<string, HTMLVideoElement> = {};

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

  start(action: TimelineAction, time: number) {
    let item: HTMLVideoElement;
    if (this.cacheMap[action.id]) {
      item = this.cacheMap[action.id];
      item.style.display = 'block';
      this._goToAndStop(item, time);
    } else {
      const ground = document.getElementById('player-ground-1');
      item = document.createElement('video');
      item.src = action.data.src;
      item.style.display = 'flex';
      item.style.width = '100%';
      item.loop = true;
      item.muted = true;  // Prevent autoplay restrictions
      ground?.appendChild(item);

      item.addEventListener('loadedmetadata', () => {
        this._goToAndStop(item, time - action.start);
      });
      this.cacheMap[action.id] = item;
    }
  }

  update(action: TimelineAction, time: number) {
    const item = this.cacheMap[action.id];
    if (!item) {
      return;
    }
    this._goToAndStop(item, time - action.start);
  }

  stop(action: TimelineAction, time: number) {
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
