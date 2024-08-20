import lottie, { AnimationItem } from 'lottie-web';
import { ITimelineActionType, TimelineAction } from "@stoked-ui/timeline";

class AnimationControl implements ITimelineActionType {
  id = 'animation';

  name = 'Animation';

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

  start(action: TimelineAction, time: number) {
    let item: AnimationItem;
    if (this.cacheMap[action.id]) {
      item = this.cacheMap[action.id];
      item.show();
      this._goToAndStop(item, time);
    } else {
      const ground = document.getElementById('player-ground-1');
      if (!ground) {
        console.error('No player-ground-1');
        return;
      }
      item = lottie.loadAnimation({
        name: action.id,
        container: ground,
        renderer: 'svg',
        loop: true,
        autoplay: false,
        path: action.data.src,
        rendererSettings: {
          className: 'lottie-ani',
        },
      });

      item.addEventListener('loaded_images', () => {
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

      item.hide();
    } else {
      const cur = time - action.start;
      item.show();
      this._goToAndStop(item, cur);
    }
  }

  destroy() {
    lottie.destroy();
    this.cacheMap = {};
  }
}

export default new AnimationControl();
