import { Howl } from 'howler';
import { ITimelineActionType, TimelineAction, TimelineEngine } from '@stoked-ui/timeline';

class AudioControl implements ITimelineActionType {
  id =  'audio';

  name = 'Audio';

  cacheMap: Record<string, Howl> = {};

  listenerMap: Record<
    string,
    {
      time?: (data: { time: number }) => void;
      rate?: (data: { rate: number }) => void;
    }
  > = {};

  start(action: TimelineAction, time: number, engine?: TimelineEngine) {
    if (!engine) {
      throw new Error('engine is required to play audio');
    }

    let item: Howl;
    if (this.cacheMap[action.id]) {
      item = this.cacheMap[action.id];
      item.rate(engine.getPlayRate());
      item.seek((time - action.start) % item.duration());
      item.play();
    } else {
      item = new Howl({ src: action.data.src, loop: true, autoplay: true });
      this.cacheMap[action.id] = item;
      item.on('load', () => {
        item.rate(engine.getPlayRate());
        item.seek((time - action.start) % item.duration());
      });
    }

    const timeListener = (listenTime: { time: number }) => {
      item.seek(listenTime.time,time);
    };

    const rateListener = (listenRate: { rate: number}) => {
      item.rate(listenRate.rate);
    };

    if (!this.listenerMap[action.id]) {
      this.listenerMap[action.id] = {};
    }

    engine.on('afterSetTime', timeListener);
    engine.on('afterSetPlayRate', rateListener);
    this.listenerMap[action.id].time = timeListener;
    this.listenerMap[action.id].rate = rateListener;
  }

  stop(action: TimelineAction, time: number, engine?: any) {
    if (this.cacheMap[action.id]) {
      const item = this.cacheMap[action.id];
      item.stop();
      if (this.listenerMap[action.id]) {
        if (this.listenerMap[action.id].time) {
          engine.off('afterSetTime', this.listenerMap[action.id].time);
        }
        if (this.listenerMap[action.id].rate) {
          engine.off('afterSetPlayRate', this.listenerMap[action.id].rate);
        }
        delete this.listenerMap[action.id];
      }
    }
  }
}

export default new AudioControl();
