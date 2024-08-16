import { Howl } from 'howler';
import { TimelineEngine } from '../TimelineEngine/TimelineEngine';
import { TimelineActionType } from "./TimelineActionType";

class TimelineAudio extends TimelineActionType {
  cacheMap: Record<string, Howl> = {};

  listenerMap: Record<
    string,
    {
      time?: (data: { time: number }) => void;
      rate?: (data: { rate: number }) => void;
    }
  > = {};

  start(data: { id: string; engine: TimelineEngine; src: string; startTime: number; time: number }) {
    const { id, src, startTime, time, engine } = data;
    let item: Howl;
    if (this.cacheMap[id]) {
      item = this.cacheMap[id];
      item.rate(engine.getPlayRate());
      item.seek((time - startTime) % item.duration());
      item.play();
    } else {
      item = new Howl({ src, loop: true, autoplay: true });
      this.cacheMap[id] = item;
      item.on('load', () => {
        item.rate(engine.getPlayRate());
        item.seek((time - startTime) % item.duration());
      });
    }

    const timeListener = (timeData: { time: number }) => {
      const { time: listenTime } = timeData;
      item.seek(listenTime);
    };

    const rateListener = (rateData: { rate: number }) => {
      const { rate } = rateData;
      item.rate(rate);
    };

    if (!this.listenerMap[id]) {
      this.listenerMap[id] = {};
    }

    engine.on('afterSetTime', timeListener);
    engine.on('afterSetPlayRate', rateListener);
    this.listenerMap[id].time = timeListener;
    this.listenerMap[id].rate = rateListener;
  }

  stop(data: { id: string; engine: TimelineEngine }) {
    const { id, engine } = data;
    if (this.cacheMap[id]) {
      const item = this.cacheMap[id];
      item.stop();
      if (this.listenerMap[id]) {
        if (this.listenerMap[id].time) {
          engine.off('afterSetTime', this.listenerMap[id].time);
        }
        if (this.listenerMap[id].rate) {
          engine.off('afterSetPlayRate', this.listenerMap[id].rate);
        }
        delete this.listenerMap[id];
      }
    }
  }

  get actionType() {
    return {
      id: 'audio',
      name: 'Audio',
      source: {
        start: ({ action, engine, isPlaying, time }) => {
          if (isPlaying) {
            const src = action.data.src;
            this.start({ id: src, src, startTime: action.start, engine, time });
          }
        },
        enter: ({ action, engine, isPlaying, time }) => {
          if (isPlaying) {
            const src = action.data.src;
            this.start({ id: src, src, startTime: action.start, engine, time });
          }
        },
        leave: ({ action, engine }) => {
          const src = action.data.src;
          this.stop({ id: src, engine });
        },
        stop: ({ action, engine }) => {
          const src = action.data.src;
          this.stop({ id: src, engine });
        },
      },
    }
  }
}

export default new TimelineAudio();
