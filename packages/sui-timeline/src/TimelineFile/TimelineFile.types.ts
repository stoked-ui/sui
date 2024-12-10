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


