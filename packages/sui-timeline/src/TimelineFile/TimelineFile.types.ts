import {IAppFile, IAppFileProps, IAppFileData,  IMimeType, MimeRegistry} from "@stoked-ui/media-selector";
import {
  ITimelineFileTrack, ITimelineTrack, ITimelineTrackData,
} from "../TimelineTrack/TimelineTrack.types";

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
  FileDataType extends ITimelineFileData = ITimelineFileData
> extends IAppFile {
  tracks: TrackType[];
  preload(): Promise<void>;
  get data(): FileDataType;
}
export const SUITimelineRefs: IMimeType = MimeRegistry.create('stoked-ui', 'timeline', '.sutr', 'Stoked UI - Timeline Project File w/ Url Refs', false);
export const SUITimeline: IMimeType = MimeRegistry.create('stoked-ui', 'timeline', '.sut', 'Stoked UI - Timeline Project File', true);
export const SUIAudioRefs: IMimeType = MimeRegistry.create('stoked-ui', 'audio', '.sua', 'Stoked UI - Timeline Audio File w/ Url Refs', false);
export const SUIAudio: IMimeType = MimeRegistry.create('stoked-ui', 'audio', '.sua', 'Stoked UI - Timeline Audio File', true);

export interface ITimelineFileProps<FileTrackType = ITimelineFileTrack> extends Omit<IAppFileProps, 'mediaFiles'> {
  image?: string;
  tracks?: FileTrackType[];
}

export interface ITimelineFileData<TrackDataType extends ITimelineTrackData = ITimelineTrackData> extends IAppFileData {
  tracks: TrackDataType[]
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


