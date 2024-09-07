import lottie, { AnimationItem } from 'lottie-web';
import { ITimelineActionType, TimelineAction, TimelineActionParams, TimelineEngine } from "@stoked-ui/timeline";

class AnimationControl implements ITimelineActionType {
  id = 'animation';

  name = 'Animation';

  color = '#4169E1';

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

  // eslint-disable-next-line class-methods-use-this
  private _setRenderListener = (params: TimelineActionParams, item: AnimationItem) => {
    const { action, engine, time } = params;
    let animationHandle: any;
    item.addEventListener('loadeddata', videoLoadCallback);



    function step() { // update the canvas when a video proceeds to next frame
      this._goToAndStop(item, time - action.start);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  private _setRenderListener = (engine: TimelineEngine, item: HTMLVideoElement) => {
    let animationHandle: any;
    item.addEventListener('loadeddata', videoLoadCallback, false);

    function videoLoadCallback() {
      item.cancelVideoFrameCallback(animationHandle);
      step()
    }
    function step() { // update the canvas when a video proceeds to next frame
      engine.renderCtx.drawImage(item, 0, 0, engine.renderer.width, engine.renderer.height);
      animationHandle = item.requestVideoFrameCallback(step);
    }
  }

  enter(params: TimelineActionParams) {
    const { action, engine, time } = params;
    if (!engine.isPlaying || !action.data) {
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
        renderer: "canvas",
        loop: true,
        autoplay: false,
        path: action.data.src,
        rendererSettings: {
          context: engine.renderCtx,
          clearCanvas: false,
          preserveAspectRatio: 'xMidYMid meet'
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
