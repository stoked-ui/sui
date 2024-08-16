import { TimelineActionType } from "./TimelineActionType";

class TimelineVideo extends TimelineActionType {
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

  enter(data: { id: string; src: string; startTime: number; endTime: number; time: number }) {
    const { id, src, startTime, time } = data;
    let item: HTMLVideoElement;
    if (this.cacheMap[id]) {
      item = this.cacheMap[id];
      item.style.display = 'block';
      this._goToAndStop(item, time);
    } else {
      const ground = document.getElementById('player-ground-1');
      item = document.createElement('video');
      item.src = src;
      item.style.display = 'flex';
      item.style.width = '100%';
      item.loop = true;
      item.muted = true;  // Prevent autoplay restrictions
      ground?.appendChild(item);

      item.addEventListener('loadedmetadata', () => {
        this._goToAndStop(item, time - startTime);
      });
      this.cacheMap[id] = item;
    }
  }

  update(data: { id: string; src: string; startTime: number; endTime: number; time: number }) {
    const { id, startTime, time } = data;
    const item = this.cacheMap[id];
    if (!item) {
      return;
    }
    this._goToAndStop(item, time - startTime);
  }

  leave(data: { id: string; startTime: number; endTime: number; time: number }) {
    const { id, startTime, endTime, time } = data;
    const item = this.cacheMap[id];
    if (!item) {
      return;
    }
    if (time > endTime || time < startTime) {
      item.style.display = 'none';
    } else {
      const cur = time - startTime;
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

  get actionType() {
    return {  // New video effect
      id: 'video',
      name: 'Video',
      source: {
        enter: ({ action, time }) => {
          this.enter({ id: action.data.src, src: action.data.src, startTime: action.start, endTime: action.end, time });
        },
        update: ({ action, time }) => {
          this.update({ id: action.data.src, src: action.data.src, startTime: action.start, endTime: action.end, time });
        },
        leave: ({ action, time }) => {
          this.leave({ id: action.data.src, startTime: action.start, endTime: action.end, time });
        },
      },
    }
  }
}

export default new TimelineVideo();
