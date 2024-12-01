/* eslint-disable class-methods-use-this */
/*  eslint-disable @typescript-eslint/naming-convention */
import {
  IMediaFile2,
  MediaFile2,
  namedId
} from "@stoked-ui/media-selector";
import {alpha} from "@mui/material/styles";
import { Constructor } from "@stoked-ui/common";
import {
  type ITimelineAction,
  type ITimelineFileAction
} from "../TimelineAction/TimelineAction.types";
import {
  ITimelineFileTrack,
  ITimelineTrack,
  ITimelineTrackMetadata
} from "../TimelineTrack/TimelineTrack.types";
import WebFile from "./WebFile";
import { IFileParams } from "./WebFile.types";
import {
  FileState,
  ITimelineFile, ITimelineFileMetadata, ITimelineFileProps,
  SUIAudio,
  SUIAudioRefs,
  SUITimeline,
  SUITimelineRefs,
} from "./TimelineFile.types";
import Controller from "../Controller";
import Controllers from "../Controller/Controllers";
import ProjectFile from "./ProjectFile";
import { IMimeType, MimeType } from "./MimeType";

export default class TimelineFile<
  FileTrackType extends ITimelineFileTrack = ITimelineFileTrack,
  TrackType extends ITimelineTrack = ITimelineTrack,
  FileActionType extends ITimelineFileAction = ITimelineFileAction,
  ActionType extends ITimelineAction = ITimelineAction
>
  extends ProjectFile
  implements ITimelineFile {

  image?: string;

  protected _fileTracks?: FileTrackType[];

  protected _tracks?: TrackType[];

  protected actionInitializer: (action: FileActionType, index: number) => ActionType;

  constructor(props: ITimelineFileProps<FileTrackType>) {
    super(props);

    this.name = props.name ?? this.getName(props);

    this._fileTracks = props.tracks?.map((track) => {
      if (!track.controller) {
        if (track.controllerName) {
          track.controller = TimelineFile.Controllers[track.controllerName];
        } else {
          throw new Error(`controllerName or a controller is required for each track and none was found for the track: ${track.name || track.id}`);
        }
      }
      return track;
    }) ?? [];

    this.actionInitializer = (fileAction: FileActionType, trackIndex: number) => {
      const setVolumeIndex = (action: ITimelineFileAction) => {
        if (!action.volume) {
          return -2; // -2: no volume parts available => volume 1
        }
        for (let i = 0; i < action.volume!.length; i += 1) {
          const { volume } = Controller.getVol(action.volume![i]);

          if (volume < 0 || volume > 1) {
            console.info(`${action.name} [${action.url}] - specifies a volume of ${volume} which is outside the standard range: 0.0 - 1.0`)
          }
        }
        return -1; // -1: volume part unassigned => volume 1 until assigned
      }

      const newAction = fileAction as unknown as ActionType;
      newAction.volumeIndex = setVolumeIndex(newAction)

      if (!newAction.id) {
        newAction.id = namedId('action');
      }

      return newAction;
    };
  }

  mimeTypes: IMimeType[] = [
    SUITimeline,                 // embedded
    SUITimelineRefs              // w/ url refs
  ];

  outputMimeTypes: IMimeType[] = [
    SUIAudio,                 // embedded
    SUIAudioRefs              // w/ url refs
  ];

  get fileParams(): IFileParams[] {
    return this.trackFiles.map((f) => { return { name: f.name, size: f.size, type: f.type, url: f.url }});
  }

  async initialize(files: File[] = []) {
    if (this.state !== FileState.CONSTRUCTED) {
      return;
    }
    this.state = FileState.INITIALIZING;
    console.info('initialize', this.state);
    try {
      await this.assignFiles(files);
      // const filePromises = this._fileTracks.map((fileTrack) => MediaFile2.fromUrl(fileTrack.url));
      // const mediaFiles: MediaFile2[] = await Promise.all(filePromises);

      this._tracks = this._fileTracks.map((trackInput, index) => {

        const actions = trackInput.actions.map((action: ITimelineFileAction) => {
          return this.actionInitializer(action as FileActionType, index);
        }) as ActionType[];

        return {
          id: trackInput.id ?? namedId('track'),
          name: trackInput.name,
          actions,
          file: trackInput.file,
          controller: trackInput.controller ? trackInput.controller : Controllers[trackInput.controllerName],
          muted: trackInput.muted,
          locked: trackInput.locked,
        } as any;
      });

      const nestedPreloads = this._tracks.map((track) => {
        return track.actions.map((action) => track.controller.preload ? track.controller.preload({
          action,
          track,
        }) : action)
      });
      const preloads = nestedPreloads.flat();
      await Promise.all(preloads);

      this._fileTracks = [];

      this.state = FileState.READY;
      await this.save(true)
    } catch (ex) {
      console.error('TimelineFile: initialize', ex);
    }
  }


  async assignFiles(files: File[] = []) {
    if (files?.length && files.length === this._fileTracks.length) {
      this._fileTracks = this._fileTracks.map((trackInput, index) => {
        this._fileTracks[index].file = MediaFile2.fromFile(files[index]);
        return this._fileTracks[index];
      });
      return;
    }
    const filePromises = this._fileTracks.map((fileTrack) => MediaFile2.fromUrl(fileTrack.url));
    const mediaFiles: MediaFile2[] = await Promise.all(filePromises);
    const finalFileTracks = [];
    this._fileTracks.forEach((trackInput, index) => {
      const file =  mediaFiles.find((mediaFile) => mediaFile.url.endsWith(trackInput.url));

      if (!file) {
        console.error(`Skipping track because file could not be found: ${trackInput.url}`);
      } else {

        this._fileTracks[index].file = file;
        finalFileTracks.push(this._fileTracks[index]);
      }
    });
    this._fileTracks = finalFileTracks;
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
    const metadata = {
      ...this.fileProps,
      tracks ,
      mimeType: this.getMimeType().type as MimeType
    };
    return metadata;
  }

  get trackFiles(): IMediaFile2[] {
    return this.tracks?.map((track) => track.file) || [];
  }

  get trackStreams():  ReadableStream<Uint8Array>[] {
    return this.tracks?.map((track) => track.file.stream()) || [];
  }

  get files(): File[] {
    return this.trackFiles;
  }

  get tracksMetadata(): ITimelineTrackMetadata<TrackType>[] {
    return this.tracks?.map((track) => {
      const { file, controller, ...trackJson } = track;
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


  get tracks(): TrackType[] {
    return this._tracks as TrackType[];
  }

  set tracks(updatedTracks: TrackType[]) {
    this._tracks = updatedTracks?.filter((updatedTrack) => updatedTrack.id !== 'newTrack');
  }
/*
  async save(silent: boolean = false): Promise<void> {
    await this.initialize(this.files);
    await super.save(silent);
  }
  */

  get fileProps(): ITimelineFileMetadata {
    return {
      ...super.fileProps,
      tracks: this.tracks?.map((track) => {
        const { file, controller, ...trackJson } = track;
        return {
          ...trackJson,
          url: file.url,
          controllerName: file.mediaType,
        }
      }),
    } as ITimelineFileMetadata;
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

  static newTrack<TrackType extends ITimelineTrack = ITimelineTrack>(): TrackType[] {
    return [{
      id: 'newTrack',
      name: 'new track',
      actions: [],
      file: null,
      muted: false,
      locked: false
    } as TrackType];
  }

  static getTrackColor<TrackType extends ITimelineTrack = ITimelineTrack>(track: TrackType) {
    const trackController = track.controller;
    return trackController ? alpha(trackController.color ?? '#666', 0.11) : '#00000011';
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
        muted: false,
        locked: false
      } as TrackType
    }
  }
/*
  static createPlaceHolder(author: string): TimelineFile {
    const placeholderId =  namedId('placeholder');
    return new TimelineFile({
      id: placeholderId,
      name: `placeholder [${placeholderId.replace('placeholder-', '')}]`,
      author,
      created: Date.now(),
      version: this.version
    });
  }
  */

  static async fromActions<
    FileActionType extends ITimelineFileAction = ITimelineFileAction,
    ActionType extends ITimelineAction = ITimelineAction,
    FileType extends TimelineFile = TimelineFile
  >(actions: FileActionType[]): Promise<FileType> {
    const filePromises = actions.map((action) => MediaFile2.fromUrl(action.url));
    const allFiles = await Promise.all(filePromises.filter(Boolean));
    const fileActions: ({ file: IMediaFile2, action: FileActionType } | null)[] = allFiles.map((mediaFile)=> {
      const actionIndex = actions.findIndex((fileAction) => fileAction.url === mediaFile.url);
      if(actionIndex !== -1) {
        return { file: mediaFile, action: actions[actionIndex] }
      }
      return null
    });
    const fileActionsClean = fileActions.filter((fileAction) => fileAction !== null) as { file: IMediaFile2, action: FileActionType }[];
    const tracks = fileActionsClean.map((fileAction)=> {
      return {
        id: namedId('timelineFile'),
        name: 'new video',
        tracks,
        file: fileAction.file,
        url: fileAction.file.url,
        controller: TimelineFile.Controllers[fileAction.file.mediaType],
        actions: [{
          id: namedId('action'),
          name: fileAction.action.name,
          start: fileAction.action.start || 0,
          end: (fileAction.action.end || 0) + 2,
          volumeIndex: -2,
        } as ActionType],
      }
    });
    const FileConstructor: Constructor<FileType> = WebFile as unknown as Constructor<FileType>;
    return new FileConstructor({
      tracks,
      name: 'new video',
      version: 1
    }) as FileType;
  }

  async readFileUsingStream(file: File): Promise<void> {
    const fileStream = file.stream(); // Get a ReadableStream from the File
    const reader = fileStream.getReader();

    try {
      while (true) {
        // eslint-disable-next-line no-await-in-loop
        const { done, value } = await reader.read();

        if (done) {
          console.log("File reading completed.");
          break;
        }

        // `value` is a Uint8Array
        console.log(new TextDecoder().decode(value)); // Decode chunk to text
      }
    } catch (err) {
      console.error("Error while reading file:", err);
    } finally {
      reader.releaseLock(); // Always release the reader's lock
    }
  }

  protected async fullRead() {
    for (let i = 0; i < this.files.length; i += 1) {
      const file = this.files[i];
      // Create a ReadableStream for each file
      // eslint-disable-next-line no-await-in-loop
      await this.readFileUsingStream(file);
    }
  }

  protected getDataStreams(): AsyncIterable<ReadableStream<Uint8Array>> {
    // eslint-disable-next-line consistent-this
    const instance = this; // Preserve the `this` context
    return {
      async *[Symbol.asyncIterator]() {
        for (let i = 0; i < instance.files.length; i += 1) {
          const file = instance.files[i];
          // Create a ReadableStream for each file
          yield file.stream() as ReadableStream<Uint8Array>;
        }
      },
    };
  }

  /*

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
  */

  static Controllers: Record<string, Controller> = {};

  static fileState: Record<string, FileState> = {};
}

