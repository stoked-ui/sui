import * as ExifReader from 'exifreader';
import {IResolutionFile, ResolutionFileProps} from "./Resolution";
import { ResolutionFile } from './Resolution';
import MediaFile from "./MediaFile";
import {IMediaFile} from "./MediaFile.types";
import {MediaType} from "./MediaType";

type ScreenShotParams = {
  width?: number,
  height?: number;
  maxWidth?: number,
  maxHeight?: number;
}
export type VideoFileProps = ResolutionFileProps;

export default class VideoFile extends ResolutionFile implements IResolutionFile {
  static element: HTMLVideoElement;

  constructor(file: MediaFile) {
    super(file);
    if (!VideoFile.element) {
      VideoFile.element = document.createElement('video') as HTMLVideoElement;
    }
    VideoFile.element.src = URL.createObjectURL(this);
    this.duration = file.duration ?? -1;
    VideoFile.element.addEventListener('loadeddata', () => {
      this.duration = VideoFile.element.duration;
      this._width = VideoFile.element.videoWidth;
      this._height = VideoFile.element.videoHeight;
      this.icon = this.captureScreenshot({width: 24, height: 24});
      this.thumbnail = this.captureScreenshot({maxWidth: 250, maxHeight: 250});
      this.tags = ExifReader.load(file);
    });
  }

  static fromFileUrl(file: VideoFile, url: string, path?: string) {
    const videoFile = MediaFile.fromFile(file as MediaFile, path) as VideoFile;
    if (!VideoFile.element) {
      VideoFile.element = document.createElement('video') as HTMLVideoElement;
    }
    VideoFile.element.src = URL.createObjectURL(videoFile);
    videoFile.duration = file.duration ?? -1;
    videoFile._url = url;
    return new Promise((resolve, reject) =>{
      try {
        VideoFile.element.addEventListener('loadeddata', () => {
          videoFile.duration = VideoFile.element.duration;
          videoFile._width = VideoFile.element.videoWidth;
          videoFile._height = VideoFile.element.videoHeight;
          videoFile.icon = videoFile.captureScreenshot({width: 24, height: 24});
          videoFile.thumbnail = videoFile.captureScreenshot({maxWidth: 250, maxHeight: 250});
          videoFile.tags = ExifReader.load(file);
          resolve(videoFile);
        });
      } catch (ex) {
        console.error('REJECT - VideoFile.fromFileUrl:', ex);
        reject(ex);
      }
    })

  }

  captureScreenshot(params: ScreenShotParams): string | null {
    const { maxHeight, maxWidth  } = params;
    let { width, height  } = params;
    const element = VideoFile.element;
    const renderer = VideoFile.renderer;
    const renderCtx = renderer.getContext('2d');

    if (!renderCtx) {
      return null;
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

/*
  static captureScreenshotInterval(params: ScreenShotParams, interval: number = 1000, start: number = 0, duration?: number) {
    const { videoElement } = params;

    if (takingScreenshot) {
      return;
    }

    const startTime = Date.now()

    // set current time to zero, also triggers 'timeupdate' function
    videoElement.currentTime = start;

    duration = duration || videoElement.duration;

    videoElement.addEventListener("timeupdate", function () {
      VideoFile.captureScreenshot(params);

      // check end condition
      if (this.currentTime >= duration) {
        takingScreenshot = false;
        const timeToComplete = ((Date.now() - startTime) / interval).toFixed(2)
        console.info(`Completed on ${timeToComplete} seconds`);
      } else {
        // after screenshot is taken increment the video by 1 second
        this.currentTime = this.currentTime + 1;
      }
    });
  }

 */
}


