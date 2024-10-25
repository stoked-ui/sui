import MediaFile from "./MediaFile";
import {IMediaFile} from "./MediaFile.types";

export interface IText {
  text: string;
}

export type ResolutionProps = { width: number, height: number };
export type ResolutionFileProps = { file: ResolutionFile, options?: { metadata?: true } & ResolutionProps }

export enum Res {
  Standard = 'Standard',
  High = 'High',
  Full = 'Full',
  Quad = 'Quad',
  Ultra = 'Ultra',
  UHD = 'UHD',
  EightK = 'EightK',
}

export type StandardDefinition = Res.Standard;
export type StandardDef = Res.Standard;
export type Standard = Res.Standard;

export type HighDefinition = Res.High;
export type HighDef = Res.High;

export type FullHighDefinition = Res.Full;
export type FullDef = Res.Full;

export type QuadHighDefinition = Res.Quad;
export type QuadDef = Res.Quad;

export type UltraHighDefinition = Res.UHD;
export type UltraDef = Res.UHD;
export type UltraHighDef = Res.UHD;

export type EightKDefinition = Res.EightK;

const ResLookup = new Map<Res, { width: number, height: number }>();
const WidthLookup = new Map<number, { resolution: Res, height: number }>();
const HeightLookup = new Map<number, { width: number, resolution: Res }>();
const BuildLookup = (resolution: Res, width: number, height: number) => {
  ResLookup.set(resolution, { width, height });
  WidthLookup.set(width, { resolution, height });
  HeightLookup.set(height, { width, resolution });
}
BuildLookup(Res.Standard, 640, 480);
BuildLookup(Res.High, 1280, 720);
BuildLookup(Res.Full, 1920, 1080);
BuildLookup(Res.Quad, 2560, 1440);
BuildLookup(Res.Ultra, 3840, 2160);
BuildLookup(Res.UHD, 3840, 2160);

export const resDisplay = (display: 'none' | 'landscape' | 'portrait', res: Res) => {
  if (display === 'none') {
    return '';
  }
  const {width, height} = ResLookup[res];
  if (display === 'landscape') {
    return ` (${width} x ${height}})`;
  }
  if (display === 'portrait') {
    return ` (${height} x ${width}})`;
  }
  throw new Error("Unsupported resolution display chosen")
}

export enum Orientation {
  Portrait = 'Portrait',
  Landscape = 'Landscape',
  Square = 'Square'
}

export interface IResolutionFile extends File, IMediaFile {
  readonly _width?: number;
  readonly _height?: number;
  readonly _resolution?: Res;
  readonly aspectRatio?: number;
}

export class ResolutionFile extends MediaFile implements IResolutionFile {
  _width?: number;

  _height?: number;

  _resolution?: Res;

  aspectRatio: number = 16/9;

  set width(width: number) {
    this._width = width;
    const { resolution, height} = WidthLookup[width];
    this._height = height;
    this._resolution = resolution;
  }

  get width(): number | undefined { return this._width }

  set height(height: number) {
    this._height = height;
    const { width, resolution} = HeightLookup[height];
    this._width = width;
    this._resolution = resolution;
  }

  get height(): number | undefined { return this._height; }

  set resolution(res: Res) {
    this._resolution = res;
    const { width, height} = ResLookup[res];
    this.width = width;
    this.height = height;
  }

  get resolution(): Res | undefined { return this._resolution; }
}
