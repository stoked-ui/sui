import * as ExifReader from 'exifreader';
import {IResolution, ResolutionFile} from "../Resolution";
import MediaFile, { MediaFileParams } from "../MediaFile";

type ScreenShotParams = {
  width?: number,
  height?: number;
  maxWidth?: number,
  maxHeight?: number;
}

export type ImageFileParams = IResolution & MediaFileParams;

export default class ImageFile extends ResolutionFile implements IResolution {
  static element: HTMLImageElement;

  constructor(params: ImageFileParams) {
    super(params);
    if (!ImageFile.element) {
      ImageFile.element = document.createElement('img') as HTMLImageElement;
    }
    ImageFile.element.src = URL.createObjectURL(this);
    this._height = ImageFile.element.naturalHeight;
    this._width = ImageFile.element.naturalWidth;
  }

  static async getMetadata(file: MediaFile) {
    if (!ImageFile.element) {
      ImageFile.element = document.createElement('img') as HTMLImageElement;
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
    file.metadata.icon = ImageFile.captureScreenshot(file, {width: 24, height: 24});
    file.metadata.thumbnail = ImageFile.captureScreenshot(file, {maxWidth: 250, maxHeight: 250});
  }

  static captureScreenshot(file: MediaFile, params: ScreenShotParams): string | null {
    const { maxHeight, maxWidth  } = params;
    let { width, height  } = params;
    const element = ImageFile.element;
    const renderer = MediaFile.renderer;
    const renderCtx = renderer.getContext('2d');

    if (!renderCtx) {
      return null;
    }
    const url = URL.createObjectURL(file);
    element.src = url;

    // set image source
    width = Math.max(maxWidth ?? width ?? element.naturalWidth, width ?? 0);
    height = Math.max(maxHeight ?? height ?? element.naturalHeight, height ?? 0);
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
}


