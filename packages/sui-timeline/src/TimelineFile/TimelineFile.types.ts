import {
  ITimelineFileTrack,
  ITimelineTrack,
  ITimelineTrackMetadata,
} from "../TimelineTrack/TimelineTrack.types";
import { IWebFileProps } from "./WebFile.types";
import { IProjectFile, IProjectFileProps } from "./ProjectFile";
import FileTypeMeta from "./FileTypeMeta";

export type OutputBlob = {
  id: string,
  sourceId: string,
  version: number,
  name: string,
  created: number,
  blob: Blob,
  size: number
};

export interface ITimelineFile<
  TrackType extends ITimelineTrack = ITimelineTrack,
> extends IProjectFile {
  tracks: TrackType[];

  get fileProps(): ITimelineFileProps;
}

export class TimelineFileMeta extends FileTypeMeta {

  description: string = 'Stoked UI - Timeline Project File';

  ext: `.${string}` = '.sut'

  name: string = 'timeline'
}

export class TimelineOutputFileMeta extends FileTypeMeta {

  description: string = 'Stoked UI - Timeline Audio File';

  ext: `.${string}` = '.suta'

  name: string = 'timeline-audio'
}

export interface ITimelineFileProps<FileTrackType = ITimelineFileTrack> extends IProjectFileProps {
  // backgroundColor?: string;
  image?: string;
  tracks?: FileTrackType[];
}

export type ITimelineFileMetadata = Omit<ITimelineFile, 'tracks' | 'video' | '_fileTracks' | 'fileProps' | 'save' | 'initialize' | 'fileMeta' | 'createBlob'> & {
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
