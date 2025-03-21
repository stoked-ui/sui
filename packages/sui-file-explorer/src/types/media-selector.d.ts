declare module '@stoked-ui/media-selector' {
  export enum MediaType {
    Unknown = "unknown",
    Image = "image",
    Video = "video",
    Audio = "audio",
    Document = "document",
    PDF = "pdf",
    Archive = "archive",
    Font = "font",
    Text = "text",
    Folder = "folder"
  }

  export interface IMediaFile {
    id: string;
    name: string;
    size: number;
    type: string;
    mediaType: MediaType;
    url?: string;
    [key: string]: any;
  }

  export class MediaFile implements IMediaFile {
    id: string;
    name: string;
    size: number;
    type: string;
    mediaType: MediaType;
    url?: string;
    constructor(file?: File);
    static from(input: any): Promise<MediaFile | MediaFile[]>;
  }

  export interface IWebFile {
    id: string;
    name: string;
    size: number;
    type: string;
    [key: string]: any;
  }

  export class WebFile implements IWebFile {
    id: string;
    name: string;
    size: number;
    type: string;
    [key: string]: any;
  }

  export interface Screenshot {
    url: string;
    time: number;
  }

  export interface ScreenshotTimestamps {
    [time: number]: string;
  }

  export interface FileSaveRequest {
    file: File;
    path?: string;
    name?: string;
  }

  export interface IAppFileMeta {
    [key: string]: any;
  }

  export interface OpenFilePickerOptions {
    multiple?: boolean;
    types?: {
      description: string;
      accept: Record<string, string[]>;
    }[];
    excludeAcceptAllOption?: boolean;
  }
} 
