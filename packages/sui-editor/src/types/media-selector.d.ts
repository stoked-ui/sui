declare module '@stoked-ui/media-selector' {
  export enum MediaType {
    Image = 'image',
    Video = 'video',
    Audio = 'audio',
    Text = 'text',
    Unknown = 'unknown',
  }

  export enum BlendMode {
    Normal = 'normal',
    Multiply = 'multiply',
    Screen = 'screen',
    Overlay = 'overlay',
    Darken = 'darken',
    Lighten = 'lighten',
    ColorDodge = 'color-dodge',
    ColorBurn = 'color-burn',
    HardLight = 'hard-light',
    SoftLight = 'soft-light',
    Difference = 'difference',
    Exclusion = 'exclusion',
    Hue = 'hue',
    Saturation = 'saturation',
    Color = 'color',
    Luminosity = 'luminosity',
  }

  export enum Fit {
    Contain = 'contain',
    Cover = 'cover',
    Fill = 'fill',
    None = 'none',
    ScaleDown = 'scale-down',
  }

  export interface IMediaFile {
    id: string;
    name: string;
    size: number;
    type: string;
    mediaType: MediaType;
    thumbnail?: string;
    url?: string;
    data?: any;
    media?: any;
    version?: any;
    extractMetadata?: () => Promise<any>;
    save?: () => Promise<any>;
  }

  export interface IAppFile extends IMediaFile {
    path?: string;
    lastModified?: number;
    blendMode?: BlendMode;
    fit?: Fit;
    x?: number;
    y?: number;
    z?: number;
    width?: number;
    height?: number;
    metadata?: Record<string, any>;
  }

  export class MediaFile implements IMediaFile {
    id: string;
    name: string;
    size: number;
    type: string;
    mediaType: MediaType;
    thumbnail?: string;
    url?: string;
    media?: any;
    version?: any;
    
    constructor(file: IMediaFile);
    constructor(blob: Blob[], name: string, options: any);
    
    static from(file: File): MediaFile;
    static openDialog(): Promise<MediaFile[]>;
    static toFileBaseArray(files: MediaFile[]): any[];
    
    extractMetadata(): Promise<any>;
    save(): Promise<any>;
  }

  export class AppFile implements IAppFile {
    id: string;
    name: string;
    size: number;
    type: string;
    mediaType: MediaType;
    path?: string;
    lastModified?: number;
    blendMode?: BlendMode;
    fit?: Fit;
    x?: number;
    y?: number;
    z?: number;
    width?: number;
    height?: number;
    metadata?: Record<string, any>;
    thumbnail?: string;
    url?: string;
    media?: any;
    version?: any;

    constructor(file: IAppFile);
    static from(file: File): AppFile;
    static fromMediaFile(file: MediaFile, props?: Partial<IAppFile>): AppFile;
    static fromOpenDialog<T>(options?: any): Promise<T[]>;
    
    extractMetadata(): Promise<any>;
    save(): Promise<any>;
  }

  export class App {
    constructor(options?: any);
  }

  export interface IApp {
    id: string;
    name: string;
  }

  export class AppFileFactory {
    static create(file: File): Promise<AppFile>;
  }

  export class AppOutputFile {
    constructor(options?: any);
  }

  export class AppOutputFileFactory {
    static create(file: File): Promise<AppOutputFile>;
  }
} 
