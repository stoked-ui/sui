import lottie, {AnimationItem} from 'lottie-web';
import { AnimationFile } from "@stoked-ui/media-selector";

import Controller from "../Controller";
import {
  MediaControllerParams
} from "../Controller.types";

class AnimationController implements Controller {
  id: string;

  name: string;

  color: string;

  colorSecondary: string;

  cacheMap: Record<string, AnimationItem> = {};

  static primaryColor: '#1a0378';

  static secondaryColor: '#cd6bff';

  constructor({
    id,
    name,
    color = AnimationController.primaryColor,
    colorSecondary = AnimationController.secondaryColor
  }: {
    id: string,
    name: string,
    color: string,
    colorSecondary: string
  }) {
    this.id = id;
    this.name = name;
    this.color = color;
    this.colorSecondary = colorSecondary;
  }


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


  enter(params: MediaControllerParams) {
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
      item = AnimationFile.load({ file: action.file as AnimationFile, container: engine.viewer, renderCtx: engine.renderCtx });

      item.addEventListener('loaded_images', () => {
        this._goToAndStop(item, time - action.start);
      });

      this.cacheMap[action.id] = item;
    }
  }

  update(params: MediaControllerParams) {
    const { action, time } = params;
    const item = this.cacheMap[action.id];
    if (!item) {
      return;
    }
    this._goToAndStop(item, time - action.start);
  }

  leave(params: MediaControllerParams) {
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

  start(params: MediaControllerParams) {
    this.enter(params);
  }

  stop(params: MediaControllerParams) {
    this.leave(params);
  }

  destroy() {
    lottie.destroy();
    this.cacheMap = {};
  }

  /*
   getBackgroundImage?: GetBackgroundImage = async (action: MediaAction) => {
    const screenShotContainer = document.createElement('div');
    // const animation = AnimationFile.load({action, container: screenShotContainer, mode: 'svg'});
    console.log('animation', screenShotContainer, action.file);

    screenShotContainer.childNodes.forEach(child => {
      if (child instanceof HTMLElement) {
        console.log(child.id, child);
      }
    })
    return `url(${action.data.src})`;
  }
  */
}
export { AnimationController };
const AnimationControllerInstance = new AnimationController({
  id: 'animation',
  name: 'Animation',
  color: AnimationController.primaryColor,
  colorSecondary: AnimationController.secondaryColor
});
export default AnimationControllerInstance;
