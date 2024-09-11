import * as ExifReader from 'exifreader';
import {IResolutionFile, ResolutionFile, ResolutionFileProps} from "./Resolution";
import MediaFile from "./MediaFile";
import {IMediaFile} from "./MediaFile.types";

type ScreenShotParams = {
  width?: number,
  height?: number;
  maxWidth?: number,
  maxHeight?: number;
}

export type ImageFileProps = ResolutionFileProps;

export default class ImageFile extends ResolutionFile implements IResolutionFile {
  static element: HTMLImageElement;

  constructor(file: MediaFile) {
    super(file);
    if (!ImageFile.element) {
      ImageFile.element = document.createElement('img') as HTMLImageElement;
    }
    ImageFile.element.src = URL.createObjectURL(this);
    this.tags = ExifReader.load(file);
    this._height = ImageFile.element.naturalHeight;
    this._width = ImageFile.element.naturalWidth;
    this.icon = ImageFile.captureScreenshot(file, {width: 24, height: 24});
    this.thumbnail = ImageFile.captureScreenshot(file, {maxWidth: 250, maxHeight: 250});
  }

  static fromFile(file: ImageFile, url: string, path?: string) {
    const imageFile = MediaFile.fromFile(file as MediaFile, path) as ImageFile;
    if (!ImageFile.element) {
      ImageFile.element = document.createElement('img') as HTMLImageElement;
    }
    ImageFile.element.src = URL.createObjectURL(imageFile);
    imageFile.tags = ExifReader.load(file);
    imageFile._url = url;
    imageFile._height = ImageFile.element.naturalHeight;
    imageFile._width = ImageFile.element.naturalWidth;
    imageFile.icon = ImageFile.captureScreenshot(file, {width: 24, height: 24});
    imageFile.thumbnail = ImageFile.captureScreenshot(file, {maxWidth: 250, maxHeight: 250});
    return imageFile;
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


