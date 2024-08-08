import MediaFile, { IMediaFile } from './MediaFile';
import { ReactElement } from 'react';
import mime from 'mime';
import { IdGenerator } from '../services/IdGenerator';

const { fileId } = IdGenerator();
export interface IVideoFile extends IMediaFile {
  duration: number;
  width?: number;
  height?: number;
  format?: string;
  codec?: string;
  poster?: string;
  player: ReactElement | null;
  element: HTMLVideoElement | null;
  playing: boolean;
  update: (file: IVideoFile) => void;
}

export class VideoFile extends MediaFile implements IVideoFile {
  duration: number = -1;
  width?: number;
  height?: number;
  format?: string;
  codec?: string;
  poster?: string;
  player: ReactElement | null = null;
  element: HTMLVideoElement | null = null;
  playing = false;
  update: (file: IVideoFile) => void;

  constructor(params: IVideoFile) {
    super(params);
    this.duration = -1;
    this.width = params.width;
    this.height = params.height;
    this.format = params.format;
    this.codec = params.codec;
    this.poster = params.poster;
    this.blob = params.blob;
    this.player = params.player;
    this.element = params.element;
    this.playing = params.playing;
    this.update = params.update;
  }

  static async fromFile(
    file: File,
    update: (file: IVideoFile) => void
  ): Promise<VideoFile> {
    let type: string | null = file.type;
    if (file.type === '') {
      type = mime.getType(file.name);
    }
    const src: string = URL.createObjectURL(file);
    console.log('video src', src);
    return new VideoFile({
      id: fileId(),
      duration: -1,
      file: file,
      src: src,
      name: file.name,
      path: file.name,
      size: file.size,
      type: type ?? undefined,
      modified: file.lastModified,
      player: null,
      element: null,
      visible: false,
      playing: false,
      update,
    });
  }
}
