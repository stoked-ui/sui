import {Howl} from 'howler';
import Controller from './Controller'
import { IController } from './Controller.types'
import {ITimelineAction} from "../TimelineAction";
import {ControllerParams, PreloadParams} from "./ControllerParams";
import {ITimelineTrack} from "../TimelineTrack";

class AudioControl extends Controller<Howl> implements IController {
  cacheMap: Record<string, Howl> = {};

  logging: boolean = false;

  listenerMap: Record<
    string,
    {
      time?: (data: { time: number }) => void;
      rate?: (data: { rate: number }) => void;
    }
  > = {};

  constructor() {
    super( {
      name: 'Audio',
      id: 'audio',
      color: '#146b4e',
      colorSecondary: '#2bd797',
    });
  }

  async preload(params: PreloadParams ): Promise<ITimelineAction> {
    this.log({ action: params.action, time: Date.now() }, 'audio preload');
    const { action, track } = params;
    const { file } = track;
    if (!file) {
      return action;
    }

    return new Promise((resolve, reject) => {
      try {
        const item = new Howl({
          src: file.url as string,
          loop: false,
          autoplay: false,
          onload: () => {
            action.duration = item.duration();
          }
        });
        this.cacheMap[track.id] = item;
      } catch (ex) {
        let msg = `Error loading audio file: ${file.url}`;
        if (ex as Error) {
          msg += (ex as Error).message;
        }
        reject(new Error(msg));
      }
    })
  }

  enter(params: ControllerParams) {
    const { action, time } = params;
    this.log({ action, time }, 'audio enter');
    this.start(params);
  }

  start(params: ControllerParams) {
    const { action, time , engine, track} = params;
    this.log({ action, time }, 'audio start')
    const item: Howl = this.getItem(params as PreloadParams);
    if (item) {
      item.rate(engine.getPlayRate());
      item.seek(Controller.getActionTime(params));
      if (engine.isPlaying) {
        item.play();
      }
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

  // eslint-disable-next-line class-methods-use-this
  update(params: ControllerParams) {
    const { action, time, track } = params;
    this.log({ action, time }, 'audio ');
    const item: Howl = this.cacheMap[track.id]
    const volumeUpdate = Controller.getVolumeUpdate(params, item.seek() as number)
    if (volumeUpdate) {
      item.volume(volumeUpdate.volume);
      action.volumeIndex = volumeUpdate.volumeIndex;
    }
  }

  stop(params: ControllerParams) {
    const { action, time, engine, track } = params;
    // this.log({ action, time }, 'audio stop');
    if (this.cacheMap[track.id]) {
      const item = this.cacheMap[track.id];
      item.stop();
      item.mute();
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

  leave(params: ControllerParams) {
    const { action, time } = params;
    this.log({ action, time }, 'audio stop');
    this.stop(params);
  }

  // eslint-disable-next-line class-methods-use-this
  getActionStyle(action: ITimelineAction, track: ITimelineTrack, scaleWidth: number, scale: number, trackHeight: number) {
    const adjustedScale = scaleWidth / scale;
    if (!action.backgroundImage) {
      return null;
    }
    return {
      backgroundImage: action.backgroundImage,
      backgroundPosition: `${-adjustedScale * (action.trimStart || 0)}px 0px`,
      backgroundSize: `${adjustedScale * (action.duration || 0)}px 100%`
    }
  }

  getItem(params: PreloadParams) {
    const { track,} = params;
    let item = this.cacheMap[track.id];
    if (item) {
      return item;
    }
    item = new Howl({ src: track.file?.url as string, loop: false, autoplay: false });
    this.cacheMap[track.id] = item;
    return item;
  }

}

const AudioController = new AudioControl();
export { AudioControl };
export default AudioController
