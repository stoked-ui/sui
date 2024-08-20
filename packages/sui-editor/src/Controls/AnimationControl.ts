import lottie, { AnimationItem } from 'lottie-web';
import { ITimelineActionType, TimelineAction, TimelineActionParams } from "@stoked-ui/timeline";

class AnimationControl implements ITimelineActionType {
  id = 'animation';

  name = 'Animation';

  color = 'green';

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

  enter(params: TimelineActionParams) {
    const { action, engine, time } = params;
    if (!engine.isPlaying) {
      return;
    }
    let item: AnimationItem;
    if (this.cacheMap[action.id]) {
      item = this.cacheMap[action.id];
      item.show();
      this._goToAndStop(item, time);
    } else {
      item = lottie.loadAnimation({
        name: action.id,
        container: engine.viewer,
        renderer: 'canvas',
        loop: true,
        autoplay: false,
        path: action.data.src,
        rendererSettings: {
          preserveAspectRatio: "xMidYMid slice",
          className: 'MuiEditorView-content animation',
        },
      });

      item.addEventListener('loaded_images', () => {
        this._goToAndStop(item, time - action.start);
      });
      this.cacheMap[action.id] = item;
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

      item.hide();
    } else {
      const cur = time - action.start;
      item.show();
      this._goToAndStop(item, cur);
    }
  }

  start(params: TimelineActionParams) {
    this.enter(params);
  }

  stop(params: TimelineActionParams) {
    this.leave(params);
  }

  destroy() {
    lottie.destroy();
    this.cacheMap = {};
  }
}

export default new AnimationControl();
