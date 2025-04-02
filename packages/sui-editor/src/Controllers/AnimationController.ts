/*
import lottie, {AnimationConfigWithPath, AnimationItem} from 'lottie-web';
import { namedId} from '@stoked-ui/common';
import {
  Controller,
  IController,
} from "@stoked-ui/timeline";
import { type IEditorEngine } from "../EditorEngine";
import {
  EditorControllerParams, EditorGetItemParams,
  EditorPreloadParams
} from "./EditorControllerParams";
import { IEditorAction } from '../EditorAction/EditorAction';

class AnimationControl extends Controller<AnimationItem> implements IController {

  cacheMap: Record<string, AnimationItem> = {};

  logging: boolean = false;

  constructor({color = '#1a0378', colorSecondary = '#cd6bff'}: { color?: string, colorSecondary?: string }) {
    super({
      id: 'animation',
      name: 'Animation',
      color,
      colorSecondary
    });
  }

  async preload(params: EditorPreloadParams) {
    const { action, track } = params;
    const { file } = track;
    if (!file) {
      return action;
    }
    const item = this.getItem(params);
    action.duration = item.getDuration();
    return action;
  }


  // eslint-disable-next-line class-methods-use-this
  private _goToAndStop(engine: IEditorEngine, action: IEditorAction, item: AnimationItem, time: number) {
    if(!item.getDuration()) {
      return;
    }
    const duration = item.getDuration() * 1000;
    time *= 1000;
    if (time > duration) {
      time %= duration;
    }
    /!* if (engine.renderCtx && (action.x || action.y)) {
      engine.renderCtx.translate(action.x, action.y);
    } *!/
    item.goToAndStop(time);

    /!* if (engine.renderCtx) {
      engine.renderCtx.reset();
    } *!/
  }

  enter(params: EditorControllerParams) {
    const { action, engine, time, track } = params;
    let item: AnimationItem;
    if (this.cacheMap[track.id]) {
      item = this.cacheMap[track.id];
      this._goToAndStop(engine, action, item, Controller.getActionTime(params));
    } else if (engine.viewer && engine.renderCtx && engine.renderer) {
      if (!track.file?.url) {
        return;
      }
      item = AnimationControl.load({
        id: action.id,
        src: track.file.url,
        // TODO: FIX THIS TO FIX LOTTIE
        // engine,
        mode: 'canvas',
        className: 'lottie-canvas'
      });

      item.addEventListener('data_ready', () => {
        if (time === 0) {
          item.goToAndStop(Controller.getActionTime({ ...params, time: 0.1 }));
        }
      });

      this.cacheMap[track.id] = item;
    }
  }

  update(params: EditorControllerParams) {
    const { action, time, engine, track } = params;
    const item = this.cacheMap[track.id];
    if (!item) {
      return;
    }
    if (time > action.end || time < action.start) {
      return;
    }
    this._goToAndStop(engine, action, item, Controller.getActionTime(params));
  }

  leave(params: EditorControllerParams) {
    const { action, time, engine, track } = params;
    const item = this.cacheMap[track.id];
    if (!item) {
      return;
    }
    if (time > action.end || time < action.start) {
      return;
    }
    this._goToAndStop(engine, action, item, Controller.getActionTime(params));
  }

  destroy() {
    lottie.destroy();
    this.cacheMap = {};
  }

  /!*
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
  *!/

  getItem(params: EditorGetItemParams) {
    const { action, track } = params;
    let item = this.cacheMap[track.id];
    if (item) {
      return item;
    }
    const { file } = track;
    if (!file) {
      throw new Error('No file found for animation controlled item');
    }
    item = AnimationControl.load({ id: action.id, src: file.url,  mode: 'canvas', className: 'lottie-canvas' });
    this.cacheMap[track.id] = item;
    return item;
  }

  static globalCache: Record<string, AnimationItem> = {};

  static globalCacheEnabled = false;

  static load (params: { id?: string, src: string, container?: HTMLElement, mode?: 'canvas' | 'svg',  className?: string }) {
    const { container, src, mode = 'canvas', className } = params;
    // TODO: FIX THIS FOR LOTTIE TO WORK AGAIN

    // const { renderCtx } = engine;
    if (!params.id) {
      params.id = namedId('lottie');
    }
    const { id } = params;
    const cacheKey = `${mode}-${id || namedId('lottie')}`;
    const animLoader = () => {
      const options = {
        name: id,
        renderer: mode,
        container,
        loop: false,
        autoplay: false,
        path: src,
        rendererSettings: {
          // TODO: FIX THIS FOR LOTTIE TO WORK AGAIN
          // context: renderCtx,
          clearCanvas: false,
          preserveAspectRatio: 'xMidYMid meet',
          progressiveLoad: false, // Boolean, only svg renderer, loads dom elements when needed. Might speed up initialization for large number of elements.
          className: className ?? `${id}-class`,
          id: id.replace('id', 'lottie').replace('mediaFile', 'lottie')
        },
      }
      return lottie.loadAnimation(options as AnimationConfigWithPath<typeof mode>);
    }
    if (this.globalCacheEnabled && this.globalCache[cacheKey]) {
      const anim = this.globalCache[cacheKey]
      if ("container" in anim && anim.container !== container) {
        anim.container = container;
      }
      // TODO: FIX THIS FOR LOTTIE TO WORK AGAIN
      // if (renderCtx && "canvasContext" in anim.renderer && anim.renderer.canvasContext !== renderCtx) {
      //  anim.renderer.canvasContext = renderCtx;
      // }
      return this.globalCache[cacheKey];
    }

    const anim = animLoader();
    if (this.globalCacheEnabled) {
      this.globalCache[cacheKey] = anim;
    }
    return anim;
  }
}
export { AnimationControl };
const AnimationController = new AnimationControl({});
export default AnimationController;
*/

