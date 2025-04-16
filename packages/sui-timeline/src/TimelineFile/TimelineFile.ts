/* eslint-disable class-methods-use-this */
/*  eslint-disable @typescript-eslint/naming-convention */
import {
  IMediaFile, MediaFile, AppFile, WebFile
} from "@stoked-ui/media-selector";
import {alpha} from "@mui/material/styles";
import { Blob } from 'formdata-node';
import { Constructor, compositeColors, namedId } from "@stoked-ui/common";
import {
  type ITimelineAction,
  type ITimelineFileAction,
} from "../TimelineAction/TimelineAction.types";
import type {
  ITimelineFileTrack,
  ITimelineTrack,
  ITimelineTrackData
} from "../TimelineTrack/TimelineTrack.types";
import type {
  FileState,
  ITimelineFile,
  ITimelineFileData,
  ITimelineFileProps,
} from "./TimelineFile.types";
import { type IController } from "../Controller";
import Controller from '../Controller';

function nameUrl(name: string) {
  return name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
}

export default class TimelineFile<
  FileTrackType extends ITimelineFileTrack = ITimelineFileTrack,
  TrackType extends ITimelineTrack = ITimelineTrack,
  FileActionType extends ITimelineFileAction = ITimelineFileAction,
  ActionType extends ITimelineAction = ITimelineAction,
  FileDataType extends ITimelineFileData = ITimelineFileData,
>
  extends AppFile
  implements ITimelineFile<TrackType, FileDataType> {

  image?: string;

  protected _tracks?: TrackType[];

  protected _initialized = false;

  protected actionInitializer: (action: FileActionType, index: number) => ActionType;

  constructor(props: ITimelineFileProps<FileTrackType>) {
    super({...props });

    this._name = props.name ?? this.getName(props);

    this.actionInitializer = (fileAction: FileActionType, trackIndex: number) => {
      const setVolumeIndex = (action: ITimelineFileAction) => {
        if (!action.volume) {
          return -2; // -2: no volume parts available => volume 1
        }
        for (let i = 0; i < action.volume!.length; i += 1) {
          const { volume } = Controller.getVol(action.volume![i]);

          if (volume < 0 || volume > 1) {
            console.info(`${action.name} - specifies a volume of ${volume} which is outside the standard range: 0.0 - 1.0`)
          }
        }
        return -1; // -1: volume part unassigned => volume 1 until assigned
      }

      const newAction = { ...fileAction } as unknown as ActionType;
      newAction.volumeIndex = setVolumeIndex(newAction)

      if (!newAction.id) {
        newAction.id = namedId('action');
      }

      return newAction;
    };

    // const filePromises = this._fileTracks.map((fileTrack) => MediaFile.fromUrl(fileTrack.url));
    // const mediaFiles: MediaFile[] = await Promise.all(filePromises);
    this._tracks = [];
    for (let i = 0; i < props.tracks?.length; i += 1) {
      const track = props.tracks[i];

      if (!track.controller) {
        if (track.controllerName) {
          track.controller = TimelineFile.Controllers[track.controllerName];
        } else if (track.file.mediaType) {
          track.controller = TimelineFile.Controllers[track.file.mediaType]
        }
      }
      const file = props.files?.[i];
      if (!track.file && file) {
        track.file = new MediaFile([file], file.name, { type: file.type });
      }
      if (track.file) {
        this.addFile(file);
      }
      const actions = track.actions.map((action: ITimelineFileAction, index) => {
        return this.actionInitializer(action as FileActionType, index);
      }) as ActionType[];
      // eslint-disable-next-line no-await-in-loop

      this._tracks.push({
        id: track.id ?? namedId('track'),
        ...track,
        actions,
      } as any);
    }
  }

  get mediaFiles(): MediaFile[] {
    return this.tracks.map((track) => track.file);
  }

  async loadUrls() {
    this._tracks = await TimelineFile.loadUrls<TrackType>(this._tracks);
  }

  static async loadUrls<TrackType extends ITimelineTrack = ITimelineTrack>(tracks: TrackType[]): Promise<TrackType[]> {
    for (let i = 0; i < tracks.length; i += 1) {
      const trackInput = tracks[i];
      if (!trackInput.file && trackInput.url) {
        // eslint-disable-next-line no-await-in-loop
        trackInput.file = await MediaFile.fromUrl(trackInput.url);
      }
      if (!trackInput.controller) {
        let controllerType = trackInput.controllerName;
        if (!controllerType && trackInput.file.mediaType) {
          controllerType = trackInput.file.mediaType;
        }
        if (controllerType) {
          trackInput.controller = TimelineFile.Controllers[controllerType];
        }
      }
    }
    return tracks;
  }

  async preload(editorId: string) {
    console.info(new Error().stack);
    if (this._initialized) {
      return;
    }
    await this.loadUrls();

    const nestedPreloads = this._tracks.map((track) => {
      return track.actions?.map(async (action) => {
        // await track.file?.extractMediaMetadata();
        return track.controller?.preload({ action, editorId, track })
      })
    });
    await Promise.all(nestedPreloads.flat());
    this._initialized = true;
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

  get trackFiles(): IMediaFile[] {
    return this.tracks?.map((track) => track.file) || [];
  }

  get trackStreams():  ReadableStream<Uint8Array>[] {
    return this.tracks?.map((track) => track.file.stream()) || [];
  }

  get files(): IMediaFile[] {
    return this.trackFiles;
  }

  get tracksMetadata(): ITimelineTrackData<TrackType>[] {
    return this.tracks?.map((track) => {
      const { file, controller, ...trackJson } = track;
      return trackJson;
    }) as ITimelineTrackData<TrackType>[]
  }

  get tracks(): TrackType[] {
    return this._tracks as TrackType[] || [];
  }

  set tracks(updatedTracks: TrackType[]) {
    this._tracks = updatedTracks?.filter((updatedTrack) => updatedTrack.id !== 'newTrack');
  }

  get data(): FileDataType {
    const baseData = super.data;
    const tracks = this.tracks?.filter((track) => track.file).map((track) => {
        const { file, controller,...trackJson } = track;
        return {
          controllerName: controller?.id,
          fileId: file.id,
          ...trackJson,
        }
      }) as  Omit<TrackType, "controller" | "file">[];
    return {
      ...baseData,
      tracks
    } as any
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
    if (track.muted) {
      return compositeColors(trackController?.color, '#FF0000CC');
    }
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

  static async fromActions<
    FileActionType extends ITimelineFileAction = ITimelineFileAction,
    ActionType extends ITimelineAction = ITimelineAction,
    FileType extends TimelineFile = TimelineFile
  >(actions: FileActionType[]): Promise<FileType> {
    const filePromises = actions.map((action) => MediaFile.fromUrl(action.url));
    const allFiles = await Promise.all(filePromises.filter(Boolean));
    const fileActions: ({ file: IMediaFile, action: FileActionType } | null)[] = allFiles.map((mediaFile)=> {
      const actionIndex = actions.findIndex((fileAction) => fileAction.url === mediaFile.url);
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
    const FileConstructor: Constructor<FileType> = TimelineFile as unknown as Constructor<FileType>;
    return new FileConstructor({
      tracks,
      name: 'NewTimelineProject.sut',
      version: 1
    }) as FileType;
  }

  static async fromUrl<AppFileType = TimelineFile>(url: string, FileConstructor: Constructor<AppFileType> = TimelineFile as unknown as Constructor<AppFileType>): Promise<AppFileType | null> {
    const file= await WebFile.fromUrl<AppFileType>(url, FileConstructor) as TimelineFile;
    if (!file) {
      return null;
    }
    if ("tracks" in file) {
      const timelineFile = file as unknown as TimelineFile;
      await timelineFile.loadUrls();
      return timelineFile as unknown as AppFileType;
    }
    throw new Error('cant instantiate AppFile as TimelineFile');
  }

  /**
   * Loads a AppFile instance from the local file system.
   * @param file A File object from an attached drive.
   * @param FileConstructor
   */
  static async fromLocalFile<AppFileType = TimelineFile>(file: Blob, FileConstructor: Constructor<AppFileType>): Promise<AppFileType> {
    const timelineFile = await AppFile.fromLocalFile<AppFileType>(file, FileConstructor) as TimelineFile;

    for (let index = 0; index < timelineFile.tracks.length; index += 1) {
      const mediaFile = timelineFile.tracks[index].file
      // eslint-disable-next-line no-await-in-loop
      await mediaFile.extractMetadata();
    }

    await timelineFile.loadUrls();

    return timelineFile as unknown as AppFileType;
  }

  static Controllers: Record<string, IController> = {};

  static fileState: Record<string, FileState> = {};
}

