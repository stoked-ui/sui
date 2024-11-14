import { IMediaFile } from "@stoked-ui/media-selector";
import {
  ITimelineFileTrack,
  ITimelineTrack,
  ITimelineTrackMetadata
} from "../TimelineTrack/TimelineTrack.types";

export type DBFileRecord = {
  id: string,
  data: Record<string, Blob>
};

export type DBOutputRecord = {
  id: string,
  data: OutputBlob[]
}

export type OutputBlob = {
  id: string,
  sourceId: string,
  version: number,
  name: string,
  created: number,
  blob: Blob,
  size: number
};

export interface ITimelineFileBase {
  id: string,
  name: string,
  description?: string,
  created: number,
  lastModified?: number,
  author?: string,
  size?: number,
  url?: string;
}

export interface ITimelineFile<
  TrackType extends ITimelineTrack = ITimelineTrack,
> extends ITimelineFileBase {
  tracks: TrackType[];
  readonly initialized: boolean;
  version: number;
  saveOutput(blob: OutputBlob): Promise<IDBValidKey>;
  save(silent?: boolean): Promise<void>;
  initialize(initAction: (actionFile: any, index: number) => any): Promise<void>;
  loadOutput(): Promise<IMediaFile[] | undefined>;
  saveDb(blob: Blob): Promise<IDBValidKey>;
  get fileProps(): ITimelineFileProps;
}


export interface ITimelineFileProps<FileTrackType = ITimelineFileTrack> {
  id?: string;
  name?: string;
  description?: string;
  author?: string
  created?: number;
  lastModified?: number;
  backgroundColor?: string;
  width?: number;
  height?: number;
  url?: string;
  image?: string;
  tracks?: FileTrackType[];
}

export type ITimelineFileMetadata = Omit<ITimelineFile, 'tracks' | 'video' | '_fileTracks' | 'initialized'> & {
  tracks: ITimelineTrackMetadata[]
}

export type SaveOptions = {
  id?: string,
  types?: FilePickerAcceptType[],
  suggestedName?: string,
  suggestedExt?: FileExtension,
};

export type SaveDialogProps = SaveFilePickerOptions & { fileBlob: Blob }

export enum FileState {
  CONSTRUCTED,
  INITIALIZING,
  READY
}

export const getDelimiter = (suffix: string) => `--STOKED-UI-EDITOR-DELIMITER-${suffix}--`;

export enum FileDelimiters {
  METADATA = 'METADATA',
  TRACK_METADATA = 'TRACK_METADATA',
  TRACK_METADATA_END = 'TRACK_METADATA_END',
  MEDIA_FILE_INDEX = 'MEDIA_FILE_INDEX',
}

function parseMetadata(json: ITimelineFileMetadata): ParseDelimiterResponse {
  return { sectionName: 'metadata', section: json as ITimelineFileMetadata };
}

function parseTrackMetadata(json: ITimelineTrackMetadata): ParseDelimiterResponse {
  return { sectionName: 'track', section: json as ITimelineTrackMetadata };
}

function parseTracksMetadata(json: ITimelineTrackMetadata[]): ParseDelimiterResponse {
  return { sectionName: 'trackMetadata', section: json as ITimelineTrackMetadata[] };
}

function parseMediaFileIndex(): ParseDelimiterResponse {
  return { sectionName: '', section: {} };
}

export const delimiterFuncs = [
  parseMetadata,
  parseTrackMetadata,
  parseMediaFileIndex
];

export const fileDelimiters: string[] = Object.values(FileDelimiters).map(delimiter => getDelimiter(delimiter));
export const repeatingDelimiters: FileDelimiters[] = [FileDelimiters.TRACK_METADATA];

export function isRepeatingDelimiter(delimiter: FileDelimiters): boolean {
  return repeatingDelimiters.includes(delimiter);
}
export type ParseDelimiterResponse = { sectionName: string, section: any }
export type StreamData = {
  decoder:  TextDecoder,
  chunkSize: number,
  startPosition: number,
  currentPosition: number,
  decoded: string,
  file: File,
  currentDelimiterIndex: number,
  parsed: object,
  delimiterPosition: number,
  endSection: boolean,
}
