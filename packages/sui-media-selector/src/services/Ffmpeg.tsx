
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { useRef, useState, useEffect } from 'react';
import { VideoFile } from '../models/VideoFile';


const getUrlExtension = (url: string): string | null => {
  const urlParts = url.split('?')[0]?.split('.');
  if (!urlParts || urlParts.length  === 1) {
    return null; // No extension found
  }
  return urlParts.at(-1) ?? null;
};

export class FFmpegTools {
  private ffmpeg: FFmpeg;

  constructor(ffmpeg: FFmpeg) {
    this.ffmpeg = ffmpeg;
  }

  async transcode(videoUrl: string) {
    const extension = getUrlExtension(videoUrl);
    const inputName = `input.${extension}`;
    await this.ffmpeg.writeFile(inputName, await fetchFile(videoUrl));
    await this.ffmpeg.exec(['-i', inputName, 'output.mp4']);
    const fileData = await this.ffmpeg.readFile('output.mp4');
    const data = new Uint8Array(fileData as ArrayBuffer);
    return URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
  }

  async createScreenshot(video: VideoFile, timestamp: string) {
    try {
      if (!video) return;
      const extension = video.name?.split('.').pop()?.toLocaleLowerCase();
      const inputName = `input.${extension}`;
      const array = await fetchFile(video.file);
      await this.ffmpeg.writeFile(inputName, array);
      await this.ffmpeg.exec([
        '-i',
        inputName,
        '-ss',
        `${timestamp}`,
        '-vframes',
        '1',
        'screenshot.jpg',
      ]);
      const fileData = await this.ffmpeg.readFile('screenshot.jpg');
      return URL.createObjectURL(new Blob([fileData], { type: 'image/jpeg' }));
    } catch (error) {
      console.log('createScreenshot', error);
      return;
    }
  }
}

export const FfmpegService = (): { ffmpegTools: FFmpegTools | null, loaded: boolean } => {
  const [loaded, setLoaded] = useState(false);

  const ffmpegRef = useRef(new FFmpeg());
  const ffmpegToolsRef = useRef(new FFmpegTools(ffmpegRef.current));

  const load = async (): Promise<void> => {
    const ffmpeg = ffmpegRef.current;
    console.log('path', `${window.location}${import.meta.env.VITE_FFMPEG_WASM_PATH}`);
    /*
     this.ffmpeg.on("progress", ({ progress }) => {
     this.progress.set(progress);
     });

     this.ffmpeg.on("log", ({ message }) => {
     this.logger.update((logger: string) => `${logger}\n ${message}`);
     }); */
    // toBlobURL is used to bypass CORS issue, urls with the same
    // domain can be used directly.
    await ffmpeg.load({
      // coreURL: await toBlobURL(import.meta.env.VITE_FFMPEG_CORE_PATH, "application/javascript"),
      // wasmURL: await toBlobURL(import.meta.env.VITE_FFMPEG_WASM_PATH, "application/wasm"),
      coreURL: `${window.location}${import.meta.env.VITE_FFMPEG_CORE_PATH}`,
      wasmURL: `${window.location}${import.meta.env.VITE_FFMPEG_WASM_PATH}`,
      workerURL: `${window.location}${import.meta.env.VITE_FFMPEG_WORKER_PATH}`,
    });
    setLoaded(true);
  };

  useEffect(() => {
    if (ffmpegRef.current) {
      load()
      .then(() => {
        console.log('FFmpeg loaded');
        new FFmpegTools(ffmpegRef.current);
      })
        .catch((error) => {
          console.error('Failed to load ffmpeg', error);
        });
    }
  }, [ffmpegRef.current])



  return { ffmpegTools: ffmpegToolsRef.current, loaded };
};

