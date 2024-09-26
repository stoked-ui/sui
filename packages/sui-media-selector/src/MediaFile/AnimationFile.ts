import lottie, {AnimationItem, AnimationConfigWithPath} from "lottie-web";
import MediaFile from "./MediaFile";
import {IResolutionFile, ResolutionFile} from "./Resolution";
import namedId from "../namedId";
import {MediaType} from "./MediaType";

type ScreenShotParams = {
  width?: number,
  height?: number;
  maxWidth?: number,
  maxHeight?: number;
}

export default class AnimationFile extends ResolutionFile implements IResolutionFile {
  static element: HTMLDivElement;

  lottie: AnimationItem;

  data: {
    src: string
  } & any;

  static primaryColor = '#146b4e';

  static secondaryColor = '#2bd797';

  constructor(file: MediaFile) {
    super(file);
    if (!AnimationFile.element) {
      AnimationFile.element = document.createElement('div') as HTMLDivElement;
    }
    // this.id = namedId('lottie');
    this.data = {
      src: URL.createObjectURL(this),
      className: `${this.id}-class`
    }
    this.lottie = AnimationFile.load({
      id: this.id,
      src: file.url,
      container: AnimationFile.element,
      mode: 'canvas',
      renderCtx: MediaFile.renderer.getContext('2d'),
    })
    this.duration = -1;
    this.lottie.addEventListener('loaded_images', () => {
      this.lottie.show();
      this.icon = this.captureScreenshot({width: 24, height: 24}) || null;
      this.thumbnail = this.captureScreenshot({maxWidth: 250, maxHeight: 250}) || null;
      this.duration = this.lottie.getDuration();
    });
    // console.log('lottie', this.lottie);
  }

  /* static fromFileUrl(file: AnimationFile, url: string, path?: string) { */

  static fromFileUrl() {
    throw new Error('do not use yet');

    /*
    const animationFile = MediaFile.fromFile(file as MediaFile, path) as AnimationFile;
    if (!AnimationFile.element) {
      AnimationFile.element = document.createElement('div') as HTMLDivElement;
    }
    animationFile._url = url;
    // animationFile.id = namedId('lottie');
    animationFile.data = {
      src: URL.createObjectURL(animationFile),
      className: `${animationFile.id}-class`
    }
    animationFile.lottie = AnimationFile.load({
      id: animationFile.id,
      src: url,
      container: AnimationFile.element,
      mode: 'canvas',
      renderCtx: MediaFile.renderer.getContext('2d'),
    })
    animationFile.duration = -1;
    return new Promise((resolve, reject) =>{
      try {
        animationFile.lottie.addEventListener('loaded_images', () => {
          animationFile.lottie.show();
          animationFile.icon = animationFile.captureScreenshot({width: 24, height: 24}) || null;
          animationFile.thumbnail = animationFile.captureScreenshot({maxWidth: 250, maxHeight: 250}) || null;
          animationFile.duration = animationFile.lottie.getDuration();
          resolve(animationFile);
        });
      } catch (ex) {
        console.error('REJECT - AnimationFile.fromFileUrl:', ex);
        reject(ex);
      }
    }) */
  }

  static globalCache: Record<string, AnimationItem> = {};

  static globalCacheEnabled = false;

  static load (params: { id?: string, src: string, container?: HTMLElement, mode?: 'canvas' | 'svg', renderCtx: CanvasRenderingContext2D | null, className?: string }) {
    const { container, renderCtx, src, mode = 'canvas', className } = params;
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
          context: renderCtx,
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
      if (renderCtx && "canvasContext" in anim.renderer && anim.renderer.canvasContext !== renderCtx) {
        anim.renderer.canvasContext = renderCtx;
      }
      return this.globalCache[cacheKey];
    }

    const anim = animLoader();
    if (this.globalCacheEnabled) {
      this.globalCache[cacheKey] = anim;
    }
    return anim;
  }

  // eslint-disable-next-line class-methods-use-this
  captureScreenshot(params: ScreenShotParams) {
    const { maxHeight, maxWidth  } = params;
    let { width, height  } = params;
    const renderer = AnimationFile.renderer;
    const renderCtx = renderer.getContext('2d');

    if (!renderCtx) {
      throw new Error("render context is not valid");
    }

    // set image source
    width = Math.max(maxWidth ?? width ?? AnimationFile.renderer.width, width ?? 0);
    height = Math.max(maxHeight ?? height ?? AnimationFile.renderer.height, height ?? 0);
    if (!width || !height) {
      throw new Error("Width and height must be provided");
    }
    renderer.width = width;
    renderer.height = height;

    // draw current video frame on canvas
    // renderCtx.drawImage(AnimationFile.element, 0, 0, width, height);

    // export canvas data
    return renderer.toDataURL();
  }
}


