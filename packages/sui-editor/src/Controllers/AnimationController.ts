import lottie, {AnimationItem} from 'lottie-web';
import { AnimationFile } from "@stoked-ui/media-selector";
import { ControllerParams } from "@stoked-ui/timeline";
import Controller from "./Controller";

class AnimationController implements Controller {
  id: string;

  name: string;

  color: string;

  colorSecondary: string;

  cacheMap: Record<string, AnimationItem> = {};

  static primaryColor: '#1a0378';

  static secondaryColor: '#cd6bff';

  constructor({
    color,
    colorSecondary
  }: {
    color: string,
    colorSecondary: string
  }) {
    this.id = 'animation';
    this.name = 'Animation';
    this.color = color ?? '#1a0378';
    this.colorSecondary = colorSecondary ?? '#cd6bff';
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


  enter(params: ControllerParams) {
    const { action, engine, time } = params;
    if (!engine.isPlaying || !action.data) {
      return;
    }
    let item: AnimationItem;
    if (this.cacheMap[action.id]) {
      item = this.cacheMap[action.id];
      item.show();
      this._goToAndStop(item, time);
    } else if (engine.viewer && engine.renderCtx) {
      item = AnimationFile.load({ id: action.id, src: action.data.src, container: engine.viewer, renderCtx: engine.renderCtx, mode: 'canvas' });

      item.addEventListener('loaded_images', () => {
        this._goToAndStop(item, time - action.start);
      });

      this.cacheMap[action.id] = item;
      console.log('added to animation cache', item);

    }
  }

  update(params: ControllerParams) {
    const { action, time } = params;
    const item = this.cacheMap[action.id];
    if (!item) {
      return;
    }
    this._goToAndStop(item, time - action.start);
  }

  leave(params: ControllerParams) {
    const { action, time, engine } = params;
    const item = this.cacheMap[action.id];
    if (!item) {
      return;
    }
    console.log('engine', engine.viewer, engine.viewer?.style, engine );
    if (time > action.end || time < action.start) {

      item.hide();
    } else {
      const cur = time - action.start;
      console.log('item', item);
      item.show();
      this._goToAndStop(item, cur);
    }
  }

  start(params: ControllerParams) {
    this.enter(params);
  }

  stop(params: ControllerParams) {
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
  color: AnimationController.primaryColor,
  colorSecondary: AnimationController.secondaryColor
});
export default AnimationControllerInstance;
