/* eslint-disable class-methods-use-this */
/*  eslint-disable @typescript-eslint/naming-convention */

import { namedId, MediaFile, getMimeType, IMediaFile } from "@stoked-ui/media-selector";
import {openDB} from "@tempfix/idb";
import {
  type ITimelineAction,
  type ITimelineFileAction
} from "../TimelineAction/TimelineAction.types";
import {ITimelineFileTrack, ITimelineTrack} from "../TimelineTrack/TimelineTrack.types";
import { IController, IEngine } from "../Engine";
import {Controllers} from "../Controller/AudioController";

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
  ControllerType = IController,
  FileActionType extends ITimelineFileAction = ITimelineFileAction,
  ActionType extends ITimelineAction = ITimelineAction,
  TrackType extends ITimelineTrack = ITimelineTrack,
  EngineType extends IEngine = IEngine
> extends ITimelineFileBase {
  tracks: TrackType[];
  needsGeneration(): boolean;
  version: number;
  saveOutput(blob: OutputBlob): Promise<IDBValidKey>;
  save(silent?: boolean): void;
  generateTracks(controllers: Record<string, ControllerType>, engine: EngineType, initAction: (engine: any, actionFile: any, index: number) => any): Promise<void>;
  loadOutput(): Promise<IMediaFile[] | undefined>;
}

export interface ITimelineFileProps<FileTrackType> {
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

export type SaveOptions = {
  id?: string,
  types?: FilePickerAcceptType[],
  suggestedName?: string,
  suggestedExt?: FileExtension,
};

export type SaveDialogProps = SaveFilePickerOptions & { fileBlob: Blob }

export abstract class BaseFile {

  protected lastChecksum: null | string = null;

  protected _version: number = 0;

  id?: string;

  get version() {
    return this._version;
  };

  protected primaryType: FilePickerAcceptType = {
    description: 'Timeline Project Files',
    accept: {
      'application/stoked-ui-timeline': ['.sut'],
    },
  };

  protected primaryExt: string = '.sut';

  protected types: FilePickerAcceptType[] = [];

  private get fileApiAvailable() {
    return 'showSaveFilePicker' in window;
  }

  protected getSaveApiOptions(optionProps: SaveOptions): SaveFilePickerOptions {
    const { id, types, suggestedName } = optionProps;
    return {
      id: id ?? this.id,
      suggestedName,
      excludeAcceptAllOption: false,
      types: types || [this.primaryType, ...this.types],
      startIn: id ? undefined : 'documents'
    }
  }

  protected async saveAs(options: SaveDialogProps) {
    if (this.fileApiAvailable) {
      return this.saveFileApi(options);
    }
    return this.saveFileHack(options);
  }

  private async saveFileHack(options: SaveDialogProps) {
    const { fileBlob } = options;
    const mainDiv = document.querySelector('main') as HTMLDivElement
    const link = document.createElement('a');
    link.href = URL.createObjectURL(fileBlob);
    link.download = options.suggestedName;
    link.style.width = '200px';
    link.style.height = '200px';
    link.style.color = 'black';
    link.innerText = 'hello';
    link.style.display = 'flex';
    mainDiv.appendChild(link);
    link.click();
    URL.revokeObjectURL(link.href)
    link.remove();
  }

  private async saveFileApi(options: SaveDialogProps) {
    if (!this.fileApiAvailable) {
      return;
    }

    try {
      // Show the save file picker
      const fileHandle = await window.showSaveFilePicker(options);

      // Create a writable stream to the selected file
      const writableStream = await fileHandle.createWritable();

      // Write the Blob to the file
      await writableStream.write(options.fileBlob);

      // Close the writable stream
      await writableStream.close();

      console.info('File saved successfully!');
    } catch (error) {
      console.error('Error saving file:', error);
    }
  }

  async hashString(canonicalString: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(canonicalString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async checksum(): Promise<string> {
    return 'default';
  }

  async isDirty(): Promise<boolean> {
    const checksum = await this.checksum();
    if (this.lastChecksum === checksum || checksum === 'default') {
      return true;
    }
    this.lastChecksum = checksum;
    return false;
  }
}

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

export type FileMimeType = { type?: string, subTypePrefix?: string };

export class TimelineFile<
  ControllerType extends IController = IController,
  FileActionType extends ITimelineFileAction = ITimelineFileAction,
  ActionType extends ITimelineAction = ITimelineAction,
  FileTrackType extends ITimelineFileTrack = ITimelineFileTrack,
  EngineType extends IEngine = IEngine,
  TrackType extends ITimelineTrack = ITimelineTrack,
>
  extends BaseFile
  implements ITimelineFile<ControllerType, FileActionType, ActionType, TrackType, EngineType> {

  id: string;

  name: string;

  description?: string;

  author?: string;

  created: number;

  lastModified?: number;

  backgroundColor?: string = '#000';

  width: number = 1920;

  height: number = 1080;

  url?: string;

  image?: string;

  protected _fileTracks?: FileTrackType[];

  protected _tracks?: TrackType[];

  protected OBJECT_STORE_NAME: string = 'timeline';

  protected OBJECT_OUTPUT_STORE_NAME: string = 'timeline-output';

  protected DB_NAME: string = 'stoked-ui';

  constructor(props: ITimelineFileProps<FileTrackType>) {
    super();
    this.id = props.id ?? namedId('timelineFile');
    this.name = this.getName(props);
    this.description = props.description;
    this.author = props.author;
    this.created = props.created ?? props.lastModified ?? Date.now();
    this.lastModified = props.lastModified;
    this.backgroundColor = props.backgroundColor ?? '#000';
    this.width = props.width ?? 1920;
    this.height = props.height ?? 1080;
    this.url = props.url;
    this._fileTracks = props.tracks ?? [];
  }

  getName(props: ITimelineFileProps<FileTrackType>): string {
    if (props.name) {
      return props.name;
    }

    if (props.tracks?.length) {
      for (let i = 0; i < props.tracks.length; i += 1) {
        if (props.tracks[i].name) {
          return props.tracks[i].name as string;
        }
      }
    }
    return 'new video';
  }

  get rootJson(): Partial<ITimelineFile> {
    const {_tracks, _fileTracks, lastChecksum, ...jsonFileData} = this as TimelineFile;
    return jsonFileData;
  }

  get tracksJson(): TrackType[] {
    return this.tracks.map((track) => {
      const { file, ...trackJson } = track;
      return trackJson;
    }) as TrackType[]
  }

  async checksum(): Promise<string> {
    const canonicalRoot = JSON.stringify(this.rootJson, Object.keys(this.rootJson).sort());
    const canonicalTracks = this.tracksJson.map((track) => {
      const { actions, ...limitedTrack } = track;
      const canonicalActions = actions.map((action) => {
        return JSON.stringify(action, Object.keys(action).sort());
      }).join();
      return JSON.stringify(limitedTrack, Object.keys(limitedTrack).sort()) + canonicalActions;
    }).join();
    return this.hashString(`${canonicalRoot}${canonicalTracks}`);
  }

  protected getSaveApiOptions(optionProps: SaveOptions): SaveFilePickerOptions {
    if (!optionProps.suggestedName) {
      if (!optionProps.suggestedExt) {
        const exts = Object.values(this.primaryType.accept);
        optionProps.suggestedExt = (exts.length ? exts[0] : this.primaryExt) as FileExtension;
      }
      optionProps.suggestedName = `${this.name}${Object.values(this.primaryType.accept)}`
    }
    return super.getSaveApiOptions(optionProps);
  }

  get tracks(): TrackType[] {
    return this._tracks as TrackType[];
  }

  set tracks(updatedTracks: TrackType[]) {
    this._tracks = updatedTracks.filter((updatedTrack) => updatedTrack.id !== 'newTrack');
  }

  static newTrack<TrackType extends ITimelineTrack = ITimelineTrack>(): TrackType[] {
    return [{
      id: 'newTrack',
      name: 'new track',
      actions: [],
      file: null,
      hidden: false,
      lock: false
    } as TrackType];
  }

  static displayTracks<TrackType extends ITimelineTrack = ITimelineTrack>(tracks?: TrackType[]) {
    if (tracks?.length) {
      return tracks.concat(TimelineFile.newTrack());
    }
    return TimelineFile.newTrack();
  }

  needsGeneration() {
    return !(!this._fileTracks?.length || this._tracks?.length);
  }

  async generateTracks(
    controllers: Record<string, ControllerType>,
    engine: EngineType,
    initAction: any): Promise<void> {

      if (!this._fileTracks?.length || this._tracks?.length) {
        return;
      }

      try {
        const filePromises = this._fileTracks.map((fileTrack) => MediaFile.fromUrl(fileTrack.url));
        const mediaFiles: MediaFile[] = await Promise.all(filePromises);

        this._tracks = this._fileTracks.map((trackInput, index) => {
          trackInput.url = trackInput.url.indexOf('http') !== -1 ? trackInput!.url : `${window.location.origin}${trackInput!.url}`;
          trackInput.url = trackInput.url.replace(/([^:]\/)\/+/g, "$1");

          const file =  mediaFiles.find((mediaFile) => mediaFile._url === trackInput.url);

          if (!file) {
            throw new Error('couldn\'t find media file source');
          }

          const actions = trackInput.actions.map((action: FileActionType) => {
            return initAction(engine, action, index);
          }) as ActionType[];

          return {
            id: trackInput.id ?? namedId('track'),
            name: trackInput.name,
            actions,
            file,
            controller: trackInput.controller ? trackInput.controller : controllers[trackInput.controllerName],
            hidden: trackInput.hidden,
            lock: trackInput.lock,
          } as any;
        });

        const nestedPreloads = this._tracks.map((track) => {
          return track.actions.map((action) => track.controller.preload ? track.controller.preload({
            action,
            engine,
            file: track.file
          }) : action)
        });
        const preloads = nestedPreloads.flat();
        await Promise.all(preloads);

        this.lastChecksum = await this.checksum();
      } catch (ex) {
        console.error('buildTracks:', ex);
      }
  }

  toTracksBlob({subTypePrefix = 'stoked-ui-timeline', type = 'application'}: { type?: string, subTypePrefix?: string } = {}): Blob {
    const blobs =  this.tracks.map((track) => {
      const { actions, file, controller, ...trackJson } = track;
      return new Blob([JSON.stringify(trackJson), file.blob], getMimeType({type, subTypePrefix, subType: 'track'}));
    })
    return new Blob(blobs,  getMimeType({type, subTypePrefix, subType: 'tracks'}))
  }

  // Function to create a combined file with JSON data and attached files
  async createBlob(): Promise<File> {
    try {
      // create json blob for non-binary root data
      const jsonBlob = new Blob([JSON.stringify(this.rootJson)], { type: 'text/json' });

      // Convert Blob to a File for easier handling or saving
      const blob = new Blob([jsonBlob, this.toTracksBlob()], { type: 'blob' });
      return new File([blob], this.name, { type: 'application/stoked-ui-timeline' });
    } catch (ex) {
      console.error(ex);
      throw new Error(ex as string);
    }
  }

  async save(silent: boolean = false) {
    const isDirty = await this.isDirty()
    if (!isDirty) {
      return;
    }
    this._version += 1;
    const fileBlob = await this.createBlob();
    await this.saveDb(fileBlob);

    if (!silent) {
      const saveOptions = this.getSaveApiOptions({ })
      await this.saveAs({ ...saveOptions, fileBlob });
    }
  }

  async getTransaction(store: string) {
    const { DB_NAME } = this;
    const db = await openDB(DB_NAME, 1);
    return db.transaction(store, 'readwrite');
  }

  async saveDb(blob: Blob): Promise<IDBValidKey> {
    let res: IDBValidKey;
    try {
      const { OBJECT_STORE_NAME } = this;
      const tx = await this.getTransaction(OBJECT_STORE_NAME);
      const versionId = `${this.version}`;

      const dbFile: DBFileRecord = {
        id: this.id,
        data: { versionId: blob }
      }

      if (this.version === 1) {
        // Create initial record for file
        res = await tx.objectStore(OBJECT_STORE_NAME).put(dbFile);
      } else {
        // Get the record.
        let record: DBFileRecord = await tx.objectStore(OBJECT_STORE_NAME).get(this.id);
        if (!record) {
          record = dbFile;
        } else {
          record.data[versionId] = blob;
        }

        // Put the modified record back.
        res = await tx.objectStore(OBJECT_STORE_NAME).put(record);
      }

    } catch (e) {
      console.error(e);
      throw new Error(e as string);
    }
    return res;
  };

  async saveOutput(blob: OutputBlob): Promise<IDBValidKey> {
    let res: IDBValidKey;
    try {
      const { OBJECT_OUTPUT_STORE_NAME } = this;

      const dbFile: DBOutputRecord = {
        id: this.id,
        data: [blob]
      }

      const tx = await this.getTransaction(OBJECT_OUTPUT_STORE_NAME);

      if (this.version === 1) {
        // Create initial record for file
        res = await tx.objectStore(OBJECT_OUTPUT_STORE_NAME).put(dbFile);
      } else {
        // Get the record.
        let record: DBOutputRecord = await tx.objectStore(OBJECT_OUTPUT_STORE_NAME).get(this.id);
        if (!record) {
          record = dbFile;
        } else {
          record.data.push(blob);
        }

        // Put the modified record back.
        res = await tx.objectStore(OBJECT_OUTPUT_STORE_NAME).put(record);
      }

    } catch (e) {
      console.error(e);
      throw new Error(e as string);
    }
    return res;
  };

  protected async loadStoreData(store: string) {
    const tx = await this.getTransaction(store);
    const outputRecord = await tx.objectStore(store).get(this.id);
    return outputRecord?.data;
  }

  async load() {
    return this.loadStoreData(this.OBJECT_STORE_NAME);
  }

  async loadOutput(): Promise<IMediaFile[] | undefined> {
    const outputBlobs: OutputBlob[] | undefined = await this.loadStoreData(this.OBJECT_OUTPUT_STORE_NAME);
    return outputBlobs?.map((output) => {
      return MediaFileFromOutputBlob(output);
    })
  }

  static createPlaceHolder(author: string): TimelineFile {
    const placeholderId =  namedId('placeholder');
    return new TimelineFile({
      id: placeholderId,
      name: `placeholder [${placeholderId.replace('placeholder-', '')}]`,
      author,
      created: Date.now(),
      backgroundColor: '#000',
      width: 1920,
      height: 1080,
    });
  }

  static fromUrl(url: string): TimelineFile {
    return new TimelineFile({ url });
  }


  async fromFile(file: File): Promise<TimelineFile> {
    // Read the file as a single Blob and parse it
    const data = await file.arrayBuffer();
    const blob = new Blob([data]);

    // Split the blob into the root JSON part and the track blobs
    const [jsonBlob, tracksBlob] = await this.splitBlob(blob);

    // Parse the root JSON
    const jsonText = await jsonBlob.text();

    const parsedMeta = JSON.parse(jsonText);
    this.id = parsedMeta.id;
    this.name = parsedMeta.name;
    this.description = parsedMeta.description;
    this.author = parsedMeta.author;
    this.created = parsedMeta.created
    this.lastModified = parsedMeta.lastModified
    this.backgroundColor = parsedMeta.backgroundColor;
    this.width = parsedMeta.width;
    this.height = parsedMeta.height;
    this.url = parsedMeta.url;

    // Parse each track blob back to track objects
    const tracksArrayBuffer = await tracksBlob.arrayBuffer();
    const tracksBlobParts = this.splitTracksBlob(tracksArrayBuffer);

    // Loop through track blobs and parse each one
    for (let i = 0; i < tracksBlobParts.length; i += 1){
      const trackBlobPart = tracksBlobParts[i];
      // eslint-disable-next-line no-await-in-loop
      const trackData = await trackBlobPart.arrayBuffer();
      const trackBlob = new Blob([trackData]);
      // eslint-disable-next-line no-await-in-loop
      const trackText = await trackBlob.text();
      const track = JSON.parse(trackText);
      this.tracks.push(track);
    }

    return this;
  }

  private async splitBlob(blob: Blob): Promise<[Blob, Blob]> {
    // Assume the JSON part is small; we could use a fixed offset for simplicity
    const jsonSize = 1000; // Adjust based on estimated JSON size
    return [blob.slice(0, jsonSize), blob.slice(jsonSize)];
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private splitTracksBlob(buffer: ArrayBuffer): Blob[] {
    // Implement logic to split the tracks data
    // Placeholder logic
    return [];
  }

  static async fromFileActions<
    ActionType extends ITimelineAction = ITimelineAction,
  >(actions: ITimelineFileAction[]) {
    const filePromises = actions.map((action) => MediaFile.fromUrl(action.url));
    const allFiles = await Promise.all(filePromises);
    const fileActions: ({ file: IMediaFile, action: ITimelineFileAction } | null)[] = allFiles.map((mediaFile)=> {
      const actionIndex = actions.findIndex((fileAction) => fileAction.url === mediaFile._url);
      if(actionIndex !== -1) {
        return { file: mediaFile, action: actions[actionIndex] }
      }
      return null
    });
    const fileActionsClean = fileActions.filter((fileAction) => fileAction !== null) as { file: IMediaFile, action: ITimelineFileAction }[];
    const tracks = fileActionsClean.map((fileAction)=> {
      return {
        id: namedId('timelineFile'),
        name: 'new video',
        tracks,
        file: fileAction.file,
        url: fileAction.file._url,
        controller: Controllers[fileAction.file.mediaType],
        actions: [{
          id: namedId('action'),
          name: fileAction.action.name,
          start: fileAction.action.start || 0,
          end: (fileAction.action.end || 0) + 2,
          volumeIndex: -2,
        } as ActionType],
      }
    });

    return new TimelineFile({
      tracks
    });
  }
}

export function MediaFileFromOutputBlob(outputBlob: OutputBlob): IMediaFile {
  const { blob } = outputBlob;
  const mediaFile: IMediaFile = {
    ...outputBlob,
    mediaType: 'video',
    icon: null,
    thumbnail: null,
    lastModified: undefined,
    url: URL.createObjectURL(outputBlob.blob),
    type: 'video/webm',
    arrayBuffer: blob.arrayBuffer,
    stream: blob.stream,
    text: blob.text,
    slice: blob.slice,
    webkitRelativePath: outputBlob.name,
    itemId: outputBlob.id,
  };
  return MediaFile.fromFile(mediaFile);
}
