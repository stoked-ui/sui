/*
import ScreenshotStore, {getActionScreenshotCount, Screenshot} from "./ScreenshotStore";


export async function generateScreenshots(count: number, video: HTMLVideoElement, height: number, width: number, onCapture?: (screen: Screenshot) => void): Promise<Screenshot[]> {
  return new Promise((resolve, reject) => {
    // Generate screenshots
    const screens: Screenshot[] = [];
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) {
      reject(new Error('Failed to create canvas context.'));
      return;
    }

    const interval = video.duration / (count + 1);
    const resolution = `${width}x${height}`;
    const captureScreenshot = (time: number): Promise<void> => new Promise((resolveCapture) => {
      video.currentTime = time;

      video.onseeked = () => {
        canvas.width = width;
        canvas.height = height;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const data = canvas.toDataURL('image/jpeg');
        const screen = {timestamp: time, data, resolution };
        onCapture?.(screen);
        screens.push(screen);
        resolveCapture();
      };
    });

    (async () => {
      for (let i = 1; i <= count; i += 1) {
        const time = Math.min(video.duration, interval * i);
        // eslint-disable-next-line no-await-in-loop
        await captureScreenshot(time);
      }
      resolve(screens);
    })();
  });
}


interface ScreenshotOptionsBase {
  height: number;
  onCapture?: (screen: Screenshot) => void
  start: number;
  end: number;
}

interface ExtractFileScreenshotOptions extends ScreenshotOptionsBase {
  file: File;
}

interface ExtractElementScreenshotOptions extends ScreenshotOptionsBase {
  video: HTMLVideoElement;
}

export type ExtractScreenshotOptions = ExtractFileScreenshotOptions | ExtractElementScreenshotOptions;

export async function extractTrackScreenShots(params: ExtractScreenshotOptions): Promise<Screenshot[]> {
  const { height, onCapture }  = params;
  const videoData = 'file' in params ? await createVideoElement(params.file) : null;
  const video = 'video' in params ? params.video : videoData!.video;
  const aspectRatio = video.videoHeight / video.videoWidth;
  const count = getActionScreenshotCount(height, aspectRatio, video.duration, video.videoWidth);
  const maxHeight = height * 1.6;
  const maxWidth = maxHeight * aspectRatio;
  return generateScreenshots(count, video, maxHeight, maxWidth, onCapture);
}

*/
