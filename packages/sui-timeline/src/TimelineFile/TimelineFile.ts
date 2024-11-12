/* eslint-disable class-methods-use-this */
/*  eslint-disable @typescript-eslint/naming-convention */
import {
  getFileName,
  getMimeType,
  IMediaFile,
  MediaFile,
  namedId
} from "@stoked-ui/media-selector";
import { openDB } from "@tempfix/idb";
import {
  initTimelineAction,
  type ITimelineAction,
  type ITimelineFileAction
} from "../TimelineAction/TimelineAction.types";
import {
  ITimelineFileTrack,
  ITimelineTrack,
  ITimelineTrackMetadata
} from "../TimelineTrack/TimelineTrack.types";
import Controllers from "../Controller/Controllers";
import { BaseFile } from "./BaseFile";
import {
  DBFileRecord,
  DBOutputRecord,
  FileState, isRepeatingDelimiter,
  ITimelineFile, ITimelineFileMetadata, ITimelineFileProps,
  OutputBlob, SaveDialogProps,
  SaveOptions, StreamData,
  FileDelimiters,
  fileDelimiters,
  delimiterFuncs
} from "./TimelineFile.types";



export class TimelineFile<
  FileActionType extends ITimelineFileAction = ITimelineFileAction,
  ActionType extends ITimelineAction = ITimelineAction,
  FileTrackType extends ITimelineFileTrack = ITimelineFileTrack,
  TrackType extends ITimelineTrack = ITimelineTrack,
>
  extends BaseFile
  implements ITimelineFile<TrackType> {

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

  static primaryType: FilePickerAcceptType = {
    description: 'Timeline Project Files',
    accept: {
      'application/stoked-ui-timeline': ['.sut'],
    },
  };

  static primaryExt: string = '.sut';

  static primaryMimeSubtypeSuffix: string = 'timeline';

  static primaryOutputMimeSubtypeSuffix: string = `${this.primaryMimeSubtypeSuffix}-output`;

  static primaryMimeSubtype: string = 'stoked-ui';

  static get mimeSubtype() {
    return `${this.primaryMimeSubtype}-${this.primaryMimeSubtypeSuffix}`;
  }

  static get outputMimeSubtype() {
    return `${this.primaryMimeSubtype}-${this.primaryOutputMimeSubtypeSuffix}`;
  }

  static get mimeType() {
    return `application/${this.mimeSubtype}`;
  }

  static get outputMimeType() {
    return `application/${this.outputMimeSubtype}`;
  }

  static get MimeType() {
    return getMimeType({
      type: 'application',
      subType: this.primaryMimeSubtype,
      subTypePrefix: this.primaryMimeSubtypeSuffix
    });
  }

  static get OutputMimeType() {
    return getMimeType({
      type: 'application',
      subType: this.primaryMimeSubtype,
      subTypePrefix: this.primaryOutputMimeSubtypeSuffix
    });
  }

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
    TimelineFile.fileState[this.id] = FileState.CONSTRUCTED;
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

  get metadata(): ITimelineFileMetadata {
    const tracks = this.tracks as ITimelineTrackMetadata<TrackType>[];
    const metadata = { ...this as ITimelineFileMetadata, tracks };
    metadata.tracks.reduce((curr, offset, index) => {
      metadata.tracks[index].fileIndex = curr;
      return curr + this.tracks[index].file.mediaFileSize;
    }, 0 as number)
    return metadata;
  }

  get trackFiles(): IMediaFile[] {
    return this.tracks.map((track) => track.file);
  }

  get tracksMetadata(): ITimelineTrackMetadata<TrackType>[] {
    return this.tracks?.map((track) => {
      const { file, ...trackJson } = track;
      const metadata = trackJson as ITimelineTrackMetadata<TrackType>;
      metadata.fileIndex = 0;
      return trackJson;
    }) as ITimelineTrackMetadata<TrackType>[]
  }

  async checksum(): Promise<string> {
    const canonicalRoot = JSON.stringify(this.metadata, Object.keys(this.metadata).sort());
    const canonicalTracks = this.tracksMetadata?.map((track) => {
      const { actions, ...limitedTrack } = track;
      const canonicalActions = actions?.map((action) => {
        return JSON.stringify(action, Object.keys(action).sort());
      }).join();
      return JSON.stringify(limitedTrack, Object.keys(limitedTrack).sort()) + canonicalActions;
    }).join();
    return this.hashString(`${canonicalRoot}${canonicalTracks}`);
  }

  static getSaveApiOptions(file: TimelineFile, optionProps: SaveOptions): SaveFilePickerOptions {
    if (!optionProps.suggestedName) {
      if (!optionProps.suggestedExt) {
        const exts = Object.values(TimelineFile.primaryType.accept);
        optionProps.suggestedExt = (exts.length ? exts[0] : TimelineFile.primaryExt) as FileExtension;
      }
      optionProps.suggestedName = `${file.name}${Object.values(TimelineFile.primaryType.accept)}`
    }
    const { id, types, suggestedName } = optionProps;
    return {
      id: id ?? file.id,
      suggestedName,
      excludeAcceptAllOption: false,
      types: types || [TimelineFile.primaryType, ...TimelineFile.types],
      startIn: id ? undefined : 'documents'
    }
  }

  get tracks(): TrackType[] {
    return this._tracks as TrackType[];
  }

  set tracks(updatedTracks: TrackType[]) {
    this._tracks = updatedTracks?.filter((updatedTrack) => updatedTrack.id !== 'newTrack');
  }


  get initialized() {
    return !this._fileTracks?.length;
  }

  async initialize(initAction: any): Promise<void> {

      if (this.initialized) {
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
            return initAction(action, index);
          }) as ActionType[];

          return {
            id: trackInput.id ?? namedId('track'),
            name: trackInput.name,
            actions,
            file,
            controller: trackInput.controller ? trackInput.controller : Controllers[trackInput.controllerName],
            hidden: trackInput.hidden,
            lock: trackInput.lock,
          } as any;
        });

        const nestedPreloads = this._tracks.map((track) => {
          return track.actions.map((action) => track.controller.preload ? track.controller.preload({
            action,
            file: track.file
          }) : action)
        });
        const preloads = nestedPreloads.flat();
        await Promise.all(preloads);

        this._fileTracks = [];
        this.lastChecksum = await this.checksum();
      } catch (ex) {
        console.error('buildTracks:', ex);
      }
  }

  async getTransaction(store: string) {
    const { primaryMimeSubtype } = TimelineFile;
    console.info(`IDB Open: ${primaryMimeSubtype}`);
    const db = await openDB(primaryMimeSubtype, 1);
    return db.transaction(store, 'readwrite');
  }

  async save(silent: boolean = false): Promise<void> {
    if (!this.initialized) {
      await this.initialize( initTimelineAction);
    }
    const isDirty = await this.isDirty()
    if (!isDirty) {
      return;
    }
    this._version += 1;
    const fileBlob = await this.createBlob();
    await this.saveDb(fileBlob);

    if (!silent) {
      const saveOptions = TimelineFile.getSaveApiOptions(this,{ });
      const options = { ...saveOptions, fileBlob };
      if (TimelineFile._fileApiAvailable) {
        await TimelineFile._saveFileApi(options);
      }
      await TimelineFile._saveFileHack(options);
    }
  }

  static async SaveAs(file: TimelineFile) {
    const fileBlob = await file.createBlob();
    const saveOptions = this.getSaveApiOptions(file,{ });
    if (this._fileApiAvailable) {
      return this._saveFileApi({ ...saveOptions, fileBlob });
    }
    return this._saveFileHack({ ...saveOptions, fileBlob });
  }

  async saveDb(blob: Blob): Promise<IDBValidKey> {
    let res: IDBValidKey;
    try {
      console.info(`IDB Save: [${this.id}] ${this.name} - ${TimelineFile.primaryMimeSubtype}::${TimelineFile.primaryMimeSubtypeSuffix}`);
      const { primaryMimeSubtypeSuffix } = TimelineFile;
      const tx = await this.getTransaction(primaryMimeSubtypeSuffix);
      const versionId = `${this.version}`;

      const dbFile: DBFileRecord = {
        id: this.id,
        data: { versionId: blob }
      }

      if (this.version === 1) {
        // Create initial record for file
        res = await tx.objectStore(primaryMimeSubtypeSuffix).put(dbFile);
      } else {
        // Get the record.
        let record: DBFileRecord = await tx.objectStore(primaryMimeSubtypeSuffix).get(this.id);
        if (!record) {
          record = dbFile;
        } else {
          record.data[versionId] = blob;
        }

        // Put the modified record back.
        res = await tx.objectStore(primaryMimeSubtypeSuffix).put(record);
      }
      console.info(`IDB Save: [${this.id}] ${this.name} - ${TimelineFile.primaryMimeSubtype}::${TimelineFile.primaryMimeSubtypeSuffix} => Complete`);

    } catch (e) {
      console.info(`IDB Save Error: [${this.id}] ${this.name} - ${TimelineFile.primaryMimeSubtype}::${TimelineFile.primaryMimeSubtypeSuffix}`);
      throw new Error(e as string);
    }
    return res;
  };

  async saveOutput(blob: OutputBlob): Promise<IDBValidKey> {
    let res: IDBValidKey;
    try {
      const { primaryOutputMimeSubtypeSuffix } = TimelineFile;

      const dbFile: DBOutputRecord = {
        id: this.id,
        data: [blob]
      }

      const tx = await this.getTransaction(primaryOutputMimeSubtypeSuffix);

      if (this.version === 1) {
        // Create initial record for file
        res = await tx.objectStore(primaryOutputMimeSubtypeSuffix).put(dbFile);
      } else {
        // Get the record.
        let record: DBOutputRecord = await tx.objectStore(primaryOutputMimeSubtypeSuffix).get(this.id);
        if (!record) {
          record = dbFile;
        } else {
          record.data.push(blob);
        }

        // Put the modified record back.
        res = await tx.objectStore(primaryOutputMimeSubtypeSuffix).put(record);
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
    return this.loadStoreData(TimelineFile.mimeSubtype);
  }

  async loadOutput(): Promise<IMediaFile[] | undefined> {
    const outputBlobs: OutputBlob[] | undefined = await this.loadStoreData(TimelineFile.outputMimeSubtype);
    return outputBlobs?.map((output) => {
      return MediaFileFromOutputBlob(output);
    })
  }

  // Function to create a combined file with JSON data and attached files
  async createBlob(): Promise<File> {
    try {

      const meta = this.metadata;
      const projectMetaData = JSON.stringify(this.metadata);
      const trackFiles = this.trackFiles;

      const projectParts: any[] = [projectMetaData, fileDelimiters[FileDelimiters.METADATA]];

      const stream = new ReadableStream({
        async start(controller) {
          controller.enqueue(projectParts.join(''));
          // This is where we pass the stream to other functions to write data into it
          await MediaFile.writeFiles(trackFiles, controller);
          controller.close();
        }
      });

      const response = new Response(stream);
      // Convert Blob to a File for easier handling or saving
      // const blob = new Blob(blobParts, { type: 'blob' });
      return new File([await response.blob()], this.name, TimelineFile.MimeType);
    } catch (ex) {
      console.error(ex);
      throw new Error(ex as string);
    }
  }

  async readObjectFromStream<T>(stream: ReadableStream<Uint8Array>): Promise<T> {
    const reader = stream.getReader();
    let result = '';
    let done = false;

    // Read the stream in chunks and concatenate the data
    while (!done) {
      // eslint-disable-next-line no-await-in-loop
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      if (value) {
        result += new TextDecoder().decode(value); // Decode the chunk to string
      }
    }

    return JSON.parse(result) as T; // Parse the final JSON string into the object of type T
  }

  private static parseDelimiter(
    sd: StreamData
  ): StreamData {

    const jsonPart = sd.decoded.slice(0, sd.delimiterPosition);
    const json = JSON.parse(jsonPart);
    const sectionName = FileDelimiters[sd.currentDelimiterIndex];

    const delimiterData = delimiterFuncs[sd.currentDelimiterIndex](json);
    if (isRepeatingDelimiter(FileDelimiters[sd.currentDelimiterIndex])) {
      if (!sd.parsed[sectionName]) {
        sd.parsed[sectionName] = [delimiterData];
      } else {
        sd.parsed[sectionName].push(delimiterData);
      }
    } else {
      sd.parsed[sectionName] = delimiterData;
    }
    return sd;
  }

  private static async parseChunk(
    sd: StreamData
  ): Promise<StreamData> {

    const chunk = await sd.file.slice(sd.currentPosition, sd.currentPosition + sd.chunkSize).arrayBuffer();
    const chunkText = sd.decoder.decode(chunk, { stream: true });
    sd.decoded += chunkText;
    sd.delimiterPosition = sd.decoded.indexOf(fileDelimiters[sd.currentDelimiterIndex]);
    const repeatingDelimiter = isRepeatingDelimiter(FileDelimiters[sd.currentDelimiterIndex]);
    if (repeatingDelimiter) {
      const nextDelimiterIndex = sd.currentDelimiterIndex + 1;
      if (sd.delimiterPosition === -1) {
        sd.delimiterPosition = sd.decoded.indexOf(fileDelimiters[nextDelimiterIndex]);
        if (sd.delimiterPosition !== -1) {
          sd.currentDelimiterIndex += 1;
          sd.endSection = true;
        }
      }
    }
    if (sd.delimiterPosition !== -1) {
      sd.currentPosition += sd.delimiterPosition;
      sd = await this.parseDelimiter(sd);
      if (!repeatingDelimiter) {
        sd.currentDelimiterIndex += 1;
      } else if (repeatingDelimiter && sd.endSection) {
        sd.currentDelimiterIndex += 2;
        sd.endSection = false;
      }
    } else {
      sd.currentPosition += sd.chunkSize;
    }

    return sd;
  }

  static async fromFile<FileType>(file: File): Promise<FileType> {

    let streamData = {
      decoder: new TextDecoder("utf-8"),
      chunkSize: 64 * 1024,
      startPosition: 0,
      currentPosition: 0,
      decoded: "",
      file,
      currentDelimiterIndex: 0,
      parsed: {},
      delimiterPosition: -1,
      endSection: false,
    }

    try {
      while (streamData.currentPosition < streamData.file.size) {
        // eslint-disable-next-line no-await-in-loop
        streamData = await this.parseChunk(streamData);
      }

      // TODO: test to make sure the entire file matches the expected structure
      // if ( does it match ?) {
      //  throw new Error("Delimiter not found in the file.");
      // }

    } catch (error) {
      console.error("Failed to parse large file:", error);
      throw error;
    }

    const newFile = new TimelineFile(streamData.parsed);
    await newFile.initialize(initTimelineAction);
    return newFile as FileType;
  }

  static async splitBlob(blob: Blob): Promise<[Blob, Blob]> {
    // Assume the JSON part is small; we could use a fixed offset for simplicity
    const jsonSize = 1000; // Adjust based on estimated JSON size
    return [blob.slice(0, jsonSize), blob.slice(jsonSize)];
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static splitTracksBlob(buffer: ArrayBuffer): Blob[] {
    // Implement logic to split the tracks data
    // Placeholder logic
    return [];
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

  static collapsedTrack<TrackType extends ITimelineTrack = ITimelineTrack>(tracks?: TrackType[]) {
    const actionTrackMap = {};
    tracks.forEach((track) => track.actions.forEach((action) => {
      actionTrackMap[action.id] = track;
    }));
    return {
      actionTrackMap,
      track: {
        id: 'collapsedTrack',
        name: 'collapsed track',
        actions: tracks.map((track) => track.actions.map((action) => action)).flat(2),
        file: null,
        hidden: false,
        lock: false
      } as TrackType
    }
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

  static async fromUrl<FileType = TimelineFile>(url: string): Promise<FileType> {
    const response = await fetch(url, {cache: "no-store"});
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const contentType = response.headers.get("content-type");
    const blob = await response.blob()
    const file = new File([blob], getFileName(url, true) ?? 'url-file', contentType ? {type: contentType } : this.MimeType );
    return this.fromFile(file);
  }

  static async fromActions<
    FileActionType extends ITimelineFileAction = ITimelineFileAction,
    ActionType extends ITimelineAction = ITimelineAction,
    FileType extends TimelineFile = TimelineFile
  >(actions: ITimelineFileAction[]): Promise<FileType> {
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
    }) as FileType;
  }

  static async createInstance(fileData: ITimelineFileProps<ITimelineFileTrack>): Promise<TimelineFile> {
    try {
      const file: TimelineFile = new TimelineFile(fileData);
      return new Promise((resolve, reject) => {
        file.initialize(initTimelineAction)
          .then(() => {
            resolve(file);
          })
          .catch((ex) => {
            reject(ex);
          });
      })
    } catch (ex) {
      return Promise.reject(ex);
    }
  }

  private static _fileApiAvailable() {
    return 'showSaveFilePicker' in window;
  }


  private static async _saveFileHack(options: SaveDialogProps) {
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

  private static async _saveFileApi(options: SaveDialogProps) {
    if (!this._fileApiAvailable) {
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

  static fileState: Record<string, FileState> = {};
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
    mediaFileSize: blob.size,
  };
  return MediaFile.fromFile(mediaFile);
}
