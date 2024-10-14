import lottie, {AnimationItem} from 'lottie-web';
import { AnimationFile } from "@stoked-ui/media-selector";
import { Controller, ControllerParams, IEngine, ITimelineAction } from "@stoked-ui/timeline";

class AnimationControl implements Controller {
  id: string;

  name: string;

  color: string;

  colorSecondary: string;

  cacheMap: Record<string, AnimationItem> = {};

  static primaryColor: '#1a0378';

  static secondaryColor: '#cd6bff';

  logging: boolean = false;

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

  async preload(params: Omit<ControllerParams, 'time'>) {
    const { action, engine } = params;
    const item = AnimationFile.load({ id: action.id, src: action.src, renderCtx: engine.renderCtx, mode: 'canvas', className: 'lottie-canvas' });
    this.cacheMap[action.id] = item;
    action.duration = item.getDuration();
    return action;
  }


  // eslint-disable-next-line class-methods-use-this
  private _goToAndStop(engine: IEngine, action: ITimelineAction, item: AnimationItem, time: number) {
    if(!item.getDuration()) {
      return;
    }
    const duration = item.getDuration() * 1000;
    time *= 1000;
    if (time > duration) {
      time %= duration;
    }
    /* if (engine.renderCtx && (action.x || action.y)) {
      engine.renderCtx.translate(action.x, action.y);
    } */
    item.goToAndStop(time);

    /* if (engine.renderCtx) {
      engine.renderCtx.reset();
    } */
  }

  enter(params: ControllerParams) {
    const { action, engine, time } = params;
    let item: AnimationItem;
    if (this.cacheMap[action.id]) {
      item = this.cacheMap[action.id];
      this._goToAndStop(engine, action, item, time - action.start);
    } else if (engine.viewer && engine.renderCtx && engine.renderer) {
      item = AnimationFile.load({ id: action.id, src: action.src, renderCtx: engine.renderCtx, mode: 'canvas', className: 'lottie-canvas' });

      item.addEventListener('data_ready', (event) => {
        if (time === 0) {
          item.goToAndStop(Controller.getActionTime(0.1, action));
        }
      });

      this.cacheMap[action.id] = item;
    }
  }

  update(params: ControllerParams) {
    const { action, time, engine } = params;
    const item = this.cacheMap[action.id];
    if (!item) {
      return;
    }
    if (time > action.end || time < action.start) {
      return;
    }
    this._goToAndStop(engine, action, item, time - action.start);
  }

  leave(params: ControllerParams) {
    const { action, time, engine } = params;
    const item = this.cacheMap[action.id];
    if (!item) {
      return;
    }
    if (time > action.end || time < action.start) {
      return;
    }
    const cur = time - action.start;
    this._goToAndStop(engine, action, item, cur);
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
    return `url(${action.src})`;
  }
  */
}
export { AnimationControl };
const AnimationController = new AnimationControl({
  color: AnimationControl.primaryColor,
  colorSecondary: AnimationControl.secondaryColor
});
export default AnimationController;
