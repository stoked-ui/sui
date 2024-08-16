import lottie, { AnimationItem } from 'lottie-web';
import { TimelineActionType } from "./TimelineActionType";

class TimelineAnimation extends TimelineActionType {
  cacheMap: Record<string, AnimationItem> = {};

  // eslint-disable-next-line class-methods-use-this
  private _goToAndStop(item: AnimationItem, time: number) {
    if(!item.getDuration()) {
      return;
    }
    const duration = item.getDuration() * 1000;
    time *= 1000;
    if (time > duration) {
      time %= duration;
    }
    item.goToAndStop(time);
  }

  enter(data: { id: string; src: string; startTime: number; endTime: number; time: number }) {
    const { id, src, startTime, time } = data;
    let item: AnimationItem;
    if (this.cacheMap[id]) {
      item = this.cacheMap[id];
      item.show();
      this._goToAndStop(item, time);
    } else {
      const ground = document.getElementById('player-ground-1');
      item = lottie.loadAnimation({
        name: id,
        container: ground,
        renderer: 'svg',
        loop: true,
        autoplay: false,
        path: src,
        rendererSettings: {
          className: 'lottie-ani',
        },
      });

      item.addEventListener('loaded_images', () => {
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

      item.hide();
    } else {
      const cur = time - startTime;
      item.show();
      this._goToAndStop(item, cur);
    }
  }

  destroy() {
    lottie.destroy();
    this.cacheMap = {};
  }

  get actionType() {
    return {
      id: 'animation',
      name: 'Animation',
      source: {
        enter: ({ action, time }) => {
          const src = action.data.src;
          this.enter({ id: src, src, startTime: action.start, endTime: action.end, time });
        },
        update: ({ action, time }) => {
          const src = action.data.src;
          this.update({ id: src, src, startTime: action.start, endTime: action.end, time });
        },
        leave: ({ action, time }) => {
          const src = action.data.src;
          this.leave({ id: src, startTime: action.start, endTime: action.end, time });
        },
      },
    }
  }
}

export default new TimelineAnimation();
