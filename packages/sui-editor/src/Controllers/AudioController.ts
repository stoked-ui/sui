import {Howl} from 'howler';
import { AudioFile, IMediaFile2 } from "@stoked-ui/media-selector";
import {generateWaveformImage, getAudioWaveImage, IAudioPreloadResult} from "@stoked-ui/common";
import { Controller, GetBackgroundImage, PreloadParams, ControllerParams, ITimelineTrack, ITimelineAction} from "@stoked-ui/timeline";


class AudioControl extends Controller{
  cacheMap: Record<string, Howl> = {};

  logging: boolean = true;

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

            const imageOptions = {
              width: item.duration() * 100,
              height: 300,
              objectUrl: file.getUrl(),
              duration: item.duration(),
              backgroundColor: '#0000',
              waveformColor: this.colorSecondary
            }

            getAudioWaveImage(imageOptions).then((img) => {
              action.backgroundImage = img;
            })
          }
        });
        this.cacheMap[action.id] = item;
        resolve(action as ITimelineAction);
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
    const { action, time , engine} = params;
    this.log({ action, time }, 'audio start')
    let item: Howl
    if (this.cacheMap[action.id]) {
      item = this.cacheMap[action.id];
      item.rate(engine.getPlayRate());

      item.seek(Controller.getActionTime(params));
      if (engine.isPlaying) {
        item.play();
      }
    } else {
      this.log(params, 'audio start not cached');
      const track = engine.getActionTrack(action.id) as ITimelineTrack;
      item = new Howl({ src: track.file?.url as string, loop: false, autoplay: false });
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
    const { action, time } = params;
    this.log({ action, time }, 'audio ');
    const item: Howl = this.cacheMap[action.id]
    const volumeUpdate = Controller.getVolumeUpdate(params, item.seek() as number)
    if (volumeUpdate) {
      item.volume(volumeUpdate.volume);
      action.volumeIndex = volumeUpdate.volumeIndex;
    }
  }

  stop(params: ControllerParams) {
    const { action, time, engine } = params;
    // this.log({ action, time }, 'audio stop');
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
    const { action, time } = params;
    this.log({ action, time }, 'audio stop');
    this.stop(params);
  }

  getElement(actionId: string) {
    return this.cacheMap[actionId];
  }

  // eslint-disable-next-line class-methods-use-this
  getActionStyle(action: ITimelineAction, scaleWidth: number, scale: number, trackHeight: number) {
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
}

const AudioController = new AudioControl();
export { AudioControl };
export default AudioController
