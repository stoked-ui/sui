import {
  ITimelineActionType,
  ITimelineAction,
  TimelineActionParams,
  TimelineEngine
} from "@stoked-ui/timeline";

type renderFunc = () => void

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
      item.style.display = 'flex';
      item.style.opacity = '0.3';
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
        console.log('appent the child to the viewer', engine.viewer);
        engine.preview.appendChild(item);
        this._setRenderListener(engine, item);
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
    const { action, time, engine } = params;
    engine.renderCtx.clearRect(0, 0, engine.renderer.width, engine.renderer.height);
    const item = this.cacheMap[action.id];
    if (!item) {
      return;
    }
    if (time > action.end || time < action.start) {
      item.style.display = 'none';
      console.log('vid none')
    } else {
      console.log('vid block')
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
