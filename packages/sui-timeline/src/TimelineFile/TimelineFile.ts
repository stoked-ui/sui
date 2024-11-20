/* eslint-disable class-methods-use-this */
/*  eslint-disable @typescript-eslint/naming-convention */
import {
  IMediaFile,
  MediaFile,
  namedId
} from "@stoked-ui/media-selector";
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
import { Constructor, IBaseDecodedFile } from "./WebFile.types";
import {
  FileState,
  ITimelineFile, ITimelineFileMetadata, ITimelineFileProps,
  SUIAudio,
  SUIAudioRefs,
  SUITimeline,
  SUITimelineRefs,
} from "./TimelineFile.types";
import Controllers from "../Controller/Controllers";
import Controller from "../Controller";
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
          track.controller = Controllers[track.controllerName];
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

  get fileParams(): IBaseDecodedFile[] {

    return this.trackFiles.map((f) => { return { name: f.name, size: f.size, type: f.type }});
  }

  async initialize(files?: File[], ...args: any[]) {
    if (this.state !== FileState.CONSTRUCTED) {
      return;
    }
    this.state = FileState.INITIALIZING;

    try {
      await this.assignFiles(files);
      // const filePromises = this._fileTracks.map((fileTrack) => MediaFile.fromUrl(fileTrack.url));
      // const mediaFiles: MediaFile[] = await Promise.all(filePromises);

      this._tracks = this._fileTracks.map((trackInput, index) => {
        trackInput.url = trackInput.url.indexOf('http') !== -1 ? trackInput!.url : `${window.location.origin}${trackInput!.url}`;
        trackInput.url = trackInput.url.replace(/([^:]\/)\/+/g, "$1");

        const actions = trackInput.actions.map((action: ITimelineFileAction) => {
          return this.actionInitializer(action as FileActionType, index);
        }) as ActionType[];

        return {
          id: trackInput.id ?? namedId('track'),
          name: trackInput.name,
          actions,
          file: trackInput.file,
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


      this.state = FileState.READY
    } catch (ex) {
      console.error('buildTracks:', ex);
    }
  }


  async assignFiles(files: File[] = []) {
    if (files.length && files.length === this._fileTracks.length) {
      this._fileTracks = this._fileTracks.map((trackInput, index) => {
        this._fileTracks[index].file = new MediaFile(files[index]);
        return this._fileTracks[index];
      });
      return;
    }
    const filePromises = this._fileTracks.map((fileTrack) => MediaFile.fromUrl(fileTrack.url));
    const mediaFiles: MediaFile[] = await Promise.all(filePromises);
    this._fileTracks = this._fileTracks.map((trackInput, index) => {
      const file =  mediaFiles.find((mediaFile) => mediaFile._url.endsWith(trackInput.url));

      if (!file) {
        throw new Error('couldn\'t find media file source');
      }

      this._fileTracks[index].file = file;
      return this._fileTracks[index];
    });
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
    metadata.tracks.reduce((curr, offset, index) => {
      metadata.tracks[index].fileIndex = curr;
      return curr + this.tracks[index].file.mediaFileSize;
    }, 0 as number)
    return metadata;
  }

  get trackFiles(): IMediaFile[] {
    return this.tracks.map((track) => track.file);
  }

  get files(): File[] {
    return this.trackFiles;
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
      tracks: this.tracks.map((track) => {
        const { file, controller, ...trackJson } = track;
        return {
          ...trackJson,
          url: file._url,
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
    const filePromises = actions.map((action) => MediaFile.fromUrl(action.url));
    const allFiles = await Promise.all(filePromises);
    const fileActions: ({ file: IMediaFile, action: FileActionType } | null)[] = allFiles.map((mediaFile)=> {
      const actionIndex = actions.findIndex((fileAction) => fileAction.url === mediaFile._url);
      if(actionIndex !== -1) {
        return { file: mediaFile, action: actions[actionIndex] }
      }
      return null
    });
    const fileActionsClean = fileActions.filter((fileAction) => fileAction !== null) as { file: IMediaFile, action: FileActionType }[];
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
    const FileConstructor: Constructor<FileType> = WebFile as unknown as Constructor<FileType>;
    return new FileConstructor({
      tracks,
      name: 'new video',
      version: 1
    }) as FileType;
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


  static fileState: Record<string, FileState> = {};
}

