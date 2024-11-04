import {Howl} from 'howler';
import { AudioFile, IMediaFile } from "@stoked-ui/media-selector";
import generateWaveformImage from "./AudioImage";
import Controller from './Controller';
import {PreloadParams, GetBackgroundImage, IController} from "./Controller.types";
import {ControllerParams} from "./ControllerParams";
import {ITimelineAction} from "../TimelineAction";

class AudioControl extends Controller {
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

  async preload(params: PreloadParams): Promise<ITimelineAction> {
    const { action, file } = params;
    const imageOptions = {
      width: file.element.duration() * 100,
      height: 300
    }
    if (file.element) {
      this.cacheMap[action.id] = file.element;
      action.duration = (file.element as Howl).duration();
      action.backgroundImage = await this.getBackgroundImage?.(file, imageOptions);
      console.info('action.backgroundImage', action.backgroundImage)
      return action;
    }
    return new Promise((resolve, reject) => {
      try {
        const item = new Howl({
          src: file.url as string,
          loop: false,
          autoplay: false,
          onload: () => {
            this.cacheMap[action.id] = item;
            action.duration = item.duration();
            this.getBackgroundImage?.(file, imageOptions).then((img) => {
              action.backgroundImage = img;
            })
            resolve(action);
          }
        });
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
    this.start(params);
  }

  start(params: ControllerParams) {
    const { action, time, engine } = params;
    let item: Howl;
    if (this.cacheMap[action.id]) {
      item = this.cacheMap[action.id];
      item.rate(engine.getPlayRate());

      item.seek(Controller.getActionTime(params));
      if (engine.isPlaying) {
        item.play();
      }
    } else {
      const track = engine.getActionTrack(action.id);
      item = new Howl({ src: track.file.url as string, loop: false, autoplay: false });
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
    this.stop(params);
  }

  getBackgroundImage?: GetBackgroundImage = async (file: IMediaFile, options: { width: number, height: number }) => {
    if (!file || !file.element?.duration()) {
      throw new Error('attempting to generate a wave image for an audio action and the action was not supplied')
    }
    const width = file.element.duration() * 100;
    const blobUrl = await generateWaveformImage(file.url as string, {
      width, height: 300, backgroundColor: '#0000', // Black
      waveformColor: this.colorSecondary,   // Green waveform
      outputType: 'blob'          // Output a Blob URL
    })
    return `url(${blobUrl})`;
  }

  getElement(actionId: string) {
    return this.cacheMap[actionId];
  }

  // eslint-disable-next-line class-methods-use-this
  getActionStyle(action: ITimelineAction, scaleWidth: number, scale: number, rowHeight: number) {
    const adjustedScale = scaleWidth / scale;
    if (!action.backgroundImage) {
      return null;
    }
    return {
      backgroundImage: action.backgroundImage,
      backgroundPosition: `${-adjustedScale * (action.trimStart || 0)}px 0px`,
      backgroundSize: `${adjustedScale * action.duration}px ${rowHeight - 1}px`
    }
  }
}

const AudioController = new AudioControl();
const Controllers:  Record<string, IController> = { audio: AudioController };
export { AudioControl, Controllers };
export default AudioController
