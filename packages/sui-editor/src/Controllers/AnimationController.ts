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

  static draw(engine: IEngine, action: ITimelineAction) {
    if (engine.renderCtx && engine.stage && engine.renderer) {
      const stagedElements = Array.from(engine.stage.getElementsByTagName(action.id));
      const svg = stagedElements.find((el) => el.id === action.id) as SVGElement | undefined;
      if (svg) {
        const image = new Image();
        image.src = `data:image/svg+xml;base64,${window.btoa(svg.innerHTML)}`;
        engine.renderCtx.drawImage(image, 0, 0, image.clientWidth, image.clientHeight )
      }
    }
  }

  enter(params: ControllerParams) {
    const { action, engine, time } = params;
    let item: AnimationItem;
    if (this.cacheMap[action.id]) {
      item = this.cacheMap[action.id];
      // item.show();
      this._goToAndStop(item, time - action.start);
    } else if (engine.viewer && engine.renderCtx && engine.renderer) {
      item = AnimationFile.load({ id: action.id, src: action.src, renderCtx: engine.renderCtx, mode: 'canvas', className: 'lottie-canvas' });

      item.addEventListener('loaded_images', (event) => {
        item.goToAndStop( time - action.start);
      });
      this.cacheMap[action.id] = item;
    }
  }

  update(params: ControllerParams) {
    const { action, time } = params;
    const item = this.cacheMap[action.id];
    if (!item) {
      return;
    }
    if (time > action.end || time < action.start) {

    } else {
//      console.log(action.name, time);
      this._goToAndStop(item, time - action.start);
    }
  }

  leave(params: ControllerParams) {
    const { action, time } = params;
    const item = this.cacheMap[action.id];
    if (!item) {
      return;
    }
    if (time > action.end || time < action.start) {

    } else {
      const cur = time - action.start;
      this._goToAndStop(item, cur);
    }
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
