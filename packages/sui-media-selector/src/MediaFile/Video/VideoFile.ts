import * as ExifReader from 'exifreader';
import {IDuration, IResolution, ResolutionFile} from "../Resolution";
import MediaFile, {MediaFileParams} from "../MediaFile";

// let takingScreenshot: boolean = false;

type ScreenShotParams = {
  width?: number,
  height?: number;
  maxWidth?: number,
  maxHeight?: number;
}
export type VideoFileParams = IResolution & MediaFileParams & IDuration;

export default class VideoFile extends ResolutionFile implements IResolution, IDuration {
  static element: HTMLVideoElement;

  duration: number;

  constructor(params: VideoFileParams) {
    super(params);
    if (!VideoFile.element) {
      VideoFile.element = document.createElement('video') as HTMLVideoElement;
    }
    VideoFile.element.src = URL.createObjectURL(this);
    // VideoFile.element.addEventListener('loadedmetadata', () => VideoFile.getMetadata(this));
    this.duration = params.duration ?? -1;
  }

  static async getMetadata(file: MediaFile) {
    if (!VideoFile.element) {
      VideoFile.element = document.createElement('video') as HTMLVideoElement;
    }
    VideoFile.element.src = URL.createObjectURL(file);
    const fileStub = {
      width: VideoFile.element.videoWidth,
      height: VideoFile.element.videoHeight,
      duration: VideoFile.element.duration,
      file
    }
    const videoFile = new VideoFile(fileStub);

    if (!videoFile.metadata) {
      videoFile.metadata = {}
    }
    const tags = ExifReader.load(file);
    if (tags) {
      if (!videoFile.metadata.tags) {
        videoFile.metadata.tags = tags;
      } else {
        videoFile.metadata.tags = {...file.metadata.tags, ...tags};
      }
    }
    videoFile.metadata.icon = videoFile.captureScreenshot({width: 24, height: 24});
    videoFile.metadata.thumbnail = videoFile.captureScreenshot({maxWidth: 250, maxHeight: 250});
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


