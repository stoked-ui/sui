import {
  ITimelineFileTrack,
  ITimelineTrack,
  ITimelineTrackMetadata,
} from "../TimelineTrack/TimelineTrack.types";
import { IProjectFile, IProjectFileProps } from "./ProjectFile";
import { IMimeType, MimeRegistry } from "./MimeType";

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

export const SUITimeline: IMimeType = MimeRegistry.create('stoked-ui', 'timeline', '.sut', 'Stoked UI - Timeline Project File');
export const SUIAudio: IMimeType = MimeRegistry.create('stoked-ui', 'audio', '.sua', 'Stoked UI - Timeline Audio File');

export interface ITimelineFileProps<FileTrackType = ITimelineFileTrack> extends IProjectFileProps {
  // backgroundColor?: string;
  image?: string;
  tracks?: FileTrackType[];
}

export type ITimelineFileMetadata = Omit<ITimelineFile, 'tracks' | 'video' | '_fileTracks' | 'fileProps' | 'save' | 'initialize' | 'fileMeta' | 'createBlob' | 'state'> & {
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
  NONE = -1,
  CONSTRUCTED,
  INITIALIZING,
  READY
}
