import * as ExifReader from "exifreader";
import lottie, {AnimationItem} from "lottie-web";
import MediaFile, {MediaFileParams} from "../MediaFile";
import {IDuration, IResolution, ResolutionFile} from "../Resolution";
import namedId from "../../namedId";

/*
type ScreenShotParams = {
  width?: number,
  height?: number;
  maxWidth?: number,
  maxHeight?: number;
}
*/

export type AnimationFileParams = IResolution & MediaFileParams & IDuration;

export default class AnimationFile extends ResolutionFile implements IResolution, IDuration {
  static element: HTMLDivElement;

  duration: number;

  lottie: AnimationItem;

  id: string;

  data: {
    src: string
  } & any;

  constructor(params: AnimationFileParams) {
    super(params);
    if (!AnimationFile.element) {
      AnimationFile.element = document.createElement('div') as HTMLDivElement;
    }
    this.id = namedId('lottie');
    this.data = {
      src: URL.createObjectURL(this),
      className: `${this.id}-class`
    }
    this.lottie = AnimationFile.load({
      file: this,
      container: AnimationFile.element,
      mode: 'canvas',
      renderCtx: MediaFile.renderer.getContext('2d'),
    })
    this.duration = this.lottie.getDuration();
    // console.log('lottie', this.lottie);
  }

  static async getMetadata(file: MediaFile) {
    if (!AnimationFile.element) {
      AnimationFile.element = document.createElement('div') as HTMLDivElement;
    }

    if (!file.metadata) {
      file.metadata = {}
    }
    const tags = ExifReader.load(file);
    if (tags) {
      if (!file.metadata.tags) {
        file.metadata.tags = tags;
      } else {
        file.metadata.tags = {...file.metadata.tags, ...tags};
      }
    }
    // this.metadata.icon = this.captureScreenshot({width: 24, height: 24});
    // this.metadata.thumbnail = this.captureScreenshot({maxWidth: 250, maxHeight: 250});
  }

  static globalCache: Record<string, AnimationItem> = {};

  static globalCacheEnabled = false;

  static load (params: { file: AnimationFile, container: HTMLElement, mode?: 'canvas' | 'svg', renderCtx: CanvasRenderingContext2D | null }) {
    const { container, renderCtx, file, mode = 'canvas' } = params;
    const cacheKey = `${mode}-${file.id || namedId('lottie')}`;
    const animLoader = () => {
      const rendererSettings = mode === 'canvas' ? {
        context: renderCtx,
        clearCanvas: true,
        preserveAspectRatio: 'xMinYMin slice', // Supports the same options as the svg element's preserveAspectRatio property
        progressiveLoad: false, // Boolean, only svg renderer, loads dom elements when needed. Might speed up initialization for large number of elements.
        className: file.data.className ? file.data.className : `${file.id}-class`,
      } : {};
      const options = {
        name: file.id,
        container,
        renderer: mode,
        loop: true,
        autoplay: false,
        path: file.data!.src,
        rendererSettings,
      }
      return lottie.loadAnimation(options);
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

  /*
  captureScreenshot(params: ScreenShotParams) {
    const { maxHeight, maxWidth  } = params;
    let { width, height  } = params;
    const element = VideoFile.element;
    const renderer = VideoFile.renderer;
    const renderCtx = renderer.getContext('2d');

    if (!renderCtx) {
      return;
    }
    const url = URL.createObjectURL(this);
    element.src = url;

    // set image source
    width = Math.max(maxWidth ?? width ?? element.videoWidth, width ?? 0);
    height = Math.max(maxHeight ?? height ?? element.videoHeight, height ?? 0);
    if (!width || !height) {
      throw new Error("Width and height must be provided");
    }
    renderer.width = width;
    renderer.height = height;

    // draw current video frame on canvas
    renderCtx.drawImage(element, 0, 0, width, height);

    // export canvas data
    return renderer.toDataURL();
  }
  */
}


