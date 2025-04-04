/**
 * @module AnimationControl
 *
 * The AnimationControl class extends Controller to provide animation functionality.
 */

import lottie, { AnimationConfigWithPath, AnimationItem } from 'lottie-web';
import { namedId } from '@stoked-ui/common';
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

/**
 * @class AnimationControl
 * @extends Controller<AnimationItem>
 */
class AnimationControl extends Controller<AnimationItem> implements IController {

  /**
   * A cache map to store loaded animations.
   *
   * @type {Record<string, AnimationItem>}
   */
  cacheMap: Record<string, AnimationItem> = {};

  /**
   * Flag to enable or disable logging.
   *
   * @type {boolean}
   */
  logging: boolean = false;

  /**
   * Constructor for the AnimationControl class.
   *
   * @param {Object} params - Parameters for the constructor.
   * @param {string} [params.color='#1a0378'] - Color for the animation controller.
   * @param {string} [params.className='animation-control-class'] - Class name for the animation container.
   */
  constructor(params: Object = {}) {
    super();
    this.params = params;
  }

  /**
   * Destroys the animation control and resets the cache map.
   *
   * @returns {void}
   */
  destroy() {
    lottie.destroy();
    this.cacheMap = {};
  }

  /**
   * Returns a background image URL for the animation.
   *
   * @param {MediaAction} action - The media action object.
   * @returns {string} Background image URL.
   * @example
   * getBackgroundImage: async (action) => {
   *   // ...
   * }
   */
  getBackgroundImage?: GetBackgroundImage = async (action: MediaAction) => {
    const screenShotContainer = document.createElement('div');
    console.log('animation', screenShotContainer, action.file);

    screenShotContainer.childNodes.forEach(child => {
      if (child instanceof HTMLElement) {
        console.log(child.id, child);
      }
    })
    return `url(${action.src})`;
  }

  /**
   * Returns an item for the animation.
   *
   * @param {EditorGetItemParams} params - Parameters for getting the animation item.
   * @returns {AnimationItem} Animation item object.
   */
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

  /**
   * Loads an animation.
   *
   * @param {Object} params - Parameters for loading the animation.
   * @returns {AnimationItem} Loaded animation object.
   */
  static load(params: { id?: string, src: string, container?: HTMLElement, mode?: 'canvas' | 'svg',  className?: string }) {
    const { container, src, mode = 'canvas', className } = params;
    // TODO: FIX THIS FOR LOTTIE TO WORK AGAIN

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
          context: undefined, // renderCtx, 
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
      //   anim.renderer.canvasContext = renderCtx;
      // }
      return this.globalCache[cacheKey];
    }

    const anim = animLoader();
    if (this.globalCacheEnabled) {
      this.globalCache[cacheKey] = anim;
    }
    return anim;
  }

  /**
   * Global cache for loaded animations.
   *
   * @type {Record<string, AnimationItem>}
   */
  static globalCache: Record<string, AnimationItem> = {};

  /**
   * Flag to enable or disable global caching.
   *
   * @type {boolean}
   */
  static globalCacheEnabled = false;
}

/**
 * Exports the AnimationControl class.
 */
export { AnimationControl };

// Example usage:
const animationController = new AnimationControl({});