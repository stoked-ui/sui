import { Howl } from 'howler';
import { AudioFile } from '@stoked-ui/media-selector';

import Controller from './Controller';

class AudioController extends Controller {
  cacheMap = {};

  listenerMap = {};

  constructor(props) {
    super({
      color: props?.primaryColor ?? AudioFile.primaryColor,
      colorSecondary: props?.secondaryColor ?? AudioFile.secondaryColor,
      name: 'Audio',
      id: 'audio',
    });
  }

  enter(params) {
    this.start(params);
  }

  start(params) {
    const { action, time, engine } = params;

    let item;
    if (this.cacheMap[action.id]) {
      item = this.cacheMap[action.id];
      item.rate(engine.getPlayRate());
      item.seek((time - action.start) % item.duration());
      item.play();
    } else {
      item = new Howl({ src: action.src, loop: false, autoplay: false });
      this.cacheMap[action.id] = item;
      item.on('load', () => {
        item.rate(engine.getPlayRate());
        item.seek((time - action.start) % item.duration());
      });
    }

    const timeListener = (listenTime) => {
      item.seek(listenTime.time, time);
    };

    const rateListener = (listenRate) => {
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

  stop(params) {
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

  leave(params) {
    this.stop(params);
  }

  getBackgroundImage = async (action) => {
    const blobUrl = await generateWaveformImage(action.src, {
      width: 5000,
      height: 300,
      backgroundColor: '#0000', // Black
      waveformColor: this.colorSecondary, // Green waveform
      outputType: 'blob', // Output a Blob URL
    });
    return `url(${blobUrl})`;
  };
}

const AudioControllerInstance = new AudioController();
export { AudioController };
export default AudioControllerInstance;
