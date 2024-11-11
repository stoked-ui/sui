import { IMediaFile } from "@stoked-ui/media-selector";
import { ITimelineTrack } from "../TimelineTrack/TimelineTrack.types";

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
  image?: string;
  backgroundColor?: string;
  width: number;
  height: number;
  video?: IMediaFile;
}

export interface ITimelineFile<
  TrackType extends ITimelineTrack = ITimelineTrack,
> extends ITimelineFileBase {
  tracks: TrackType[];
  readonly initialized: boolean;
  version: number;
  primaryType: FilePickerAcceptType;
  primaryExt: string;
  OBJECT_STORE_NAME: string;
  OBJECT_OUTPUT_STORE_NAME: string;

  saveOutput(blob: OutputBlob): Promise<IDBValidKey>;
  save(silent?: boolean): Promise<void>;
  initialize(initAction: (actionFile: any, index: number) => any): Promise<void>;
  loadOutput(): Promise<IMediaFile[] | undefined>;
  saveDb(blob: Blob): Promise<IDBValidKey>;
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
