import {Howl} from 'howler';
import { AudioFile } from "@stoked-ui/media-selector";
import { Controller, GetBackgroundImage, ControllerParams, ITimelineAction} from "@stoked-ui/timeline";
import generateWaveformImage from "./AudioImage";

class AudioControl extends Controller{
  cacheMap: Record<string, Howl> = {};

  logging: boolean = false;

  listenerMap: Record<
    string,
    {
      time?: (data: { time: number }) => void;
      rate?: (data: { rate: number }) => void;
    }
  > = {};

  constructor(props?: {primaryColor?: string , secondaryColor?: string}) {
    super({
      color: props?.primaryColor ?? AudioFile.primaryColor,
      colorSecondary: props?.secondaryColor  ?? AudioFile.secondaryColor,
      name: 'Audio',
      id: 'audio',
    });
  }

  async preload(params: Omit<ControllerParams, 'time'>) {
    const { action } = params;
    return new Promise((resolve, reject) => {
      try {
        const item = new Howl({
          src: action.src as string, loop: false, autoplay: false, onload: () => {
            this.cacheMap[action.id] = item;
            action.duration = item.duration();
            resolve(action);
          }
        });
      } catch(ex) {
        let msg = `Error loading audio file: ${action.src}`;
        if (ex as Error) {
          msg += (ex as Error).message;
        }
        reject(new Error(msg));
      }
    })
  }

  enter(params: ControllerParams) {
    this.start(params);
  }

  start(params: ControllerParams) {
    const { action, time, engine } = params;
    let item: Howl;
    if (this.cacheMap[action.id]) {
      item = this.cacheMap[action.id];
      item.rate(engine.getPlayRate());
      if (item.playing()) {
        this.stop(params);
      }
      item.seek(Controller.getActionTime(params));
      if (engine.isPlaying) {
        item.play();
      }
    } else {
      item = new Howl({ src: action.src as string, loop: false, autoplay: false });
      this.cacheMap[action.id] = item;
      item.on('load', () => {
        item.rate(engine.getPlayRate());
        item.seek((time - (action.start ?? 0)) % item.duration());
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

  // eslint-disable-next-line class-methods-use-this
  update(params: ControllerParams) {
    const { action } = params;
    const item: Howl = this.cacheMap[action.id]
    const volumeUpdate = Controller.getVolumeUpdate(params, item.seek() as number)
    if (volumeUpdate) {
      item.volume(volumeUpdate.volume);
      action.volumeIndex = volumeUpdate.volumeIndex;
    }
  }

  stop(params: ControllerParams) {
    const { action, engine } = params;
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

  leave(params: ControllerParams) {
    this.stop(params);
  }

  getBackgroundImage?: GetBackgroundImage = async (action: ITimelineAction) => {
    if (!action) {
      throw new Error('attempting to generate a wave image for an audio action and the action was not supplied')
    }
    const blobUrl = await generateWaveformImage(action!.src as string, {
      width: action.duration! * 100, height: 300, backgroundColor: '#0000', // Black
      waveformColor: this.colorSecondary,   // Green waveform
      outputType: 'blob'          // Output a Blob URL
    })
    return `url(${blobUrl})`;
  }

  getElement(actionId: string) {
    return this.cacheMap[actionId];
  }
}

const AudioController = new AudioControl();
export { AudioControl };
export default AudioController
