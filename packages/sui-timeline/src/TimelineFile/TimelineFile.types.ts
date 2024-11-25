import {
  ITimelineFileTrack,
  ITimelineTrack,
  ITimelineTrackMetadata,
} from "../TimelineTrack/TimelineTrack.types";
import { IProjectFile, IProjectFileProps } from "./ProjectFile";
import { IMimeType, MimeType, MimeRegistry } from "./MimeType";

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

export const SUITimelineRefs: IMimeType = MimeRegistry.create('stoked-ui', 'timeline', '.sutr', 'Stoked UI - Timeline Project File w/ Url Refs', false);
export const SUITimeline: IMimeType = MimeRegistry.create('stoked-ui', 'timeline', '.sut', 'Stoked UI - Timeline Project File', true);
export const SUIAudioRefs: IMimeType = MimeRegistry.create('stoked-ui', 'audio', '.sua', 'Stoked UI - Timeline Audio File w/ Url Refs', false);
export const SUIAudio: IMimeType = MimeRegistry.create('stoked-ui', 'audio', '.sua', 'Stoked UI - Timeline Audio File', true);

export interface ITimelineFileProps<FileTrackType = ITimelineFileTrack> extends IProjectFileProps {
  // backgroundColor?: string;
  image?: string;
  tracks?: FileTrackType[];
}

export type ITimelineFileMetadata = Omit<ITimelineFile, 'tracks' | 'video' | '_fileTracks' | 'fileProps' | 'save' | 'initialize' | 'fileMeta' | 'createBlob' | 'state' | 'trackFiles'> & {
  tracks: ITimelineTrackMetadata[]
  mimeType: MimeType
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
