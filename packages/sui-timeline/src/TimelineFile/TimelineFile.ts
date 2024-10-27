import { namedId, base64Encode, getFileName, MediaFile } from "@stoked-ui/media-selector";
import {type ITimelineAction, ITimelineFileAction} from "../TimelineAction";
import {ITimelineFileTrack, ITimelineTrack} from "../TimelineTrack";
import path from "path";
import * as fs from "node:fs";
import Engine, {IController, IEngine} from "../Engine";
import Controller from "../Controller/Controller";

export interface ITimelineFile {
  id: string;
  name: string;
  description?: string;
  author?: string
  created: number;
  lastModified?: number;
  backgroundColor?: string;
  width: number;
  height: number;
  src?: string;
  tracks?: ITimelineTrack[];
}

export interface ITimelineFileProps {
  id?: string;
  name?: string;
  description?: string;
  author?: string
  created?: number;
  lastModified?: number;
  backgroundColor?: string;
  width?: number;
  height?: number;
  src?: string;
  tracks?: ITimelineFileTrack[];
}

function getName(props: ITimelineFileProps): string {
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

export default class TimelineFile implements ITimelineFile {

  id: string;

  name: string;

  description?: string;

  author?: string;

  created: number;

  lastModified?: number;

  backgroundColor?: string = '#000';

  width: number = 1920;

  height: number = 1080;

  src?: string;

  protected _fileTracks?: ITimelineFileTrack[];

  protected _tracks?: ITimelineTrack[];

  constructor(props: ITimelineFileProps) {
    this.id = props.id ?? namedId('timelineFile');
    this.name = getName(props);
    this.description = props.description;
    this.author = props.author;
    this.created = props.created ?? props.lastModified ?? Date.now();
    this.lastModified = props.lastModified;
    this.backgroundColor = props.backgroundColor ?? '#000';
    this.width = props.width ?? 1920;
    this.height = props.height ?? 1080;
    this._fileTracks = props.tracks ?? [];
  }

  get tracks() {
    return this._tracks;
  }

  set tracks(updatedTracks: ITimelineTrack[]) {
    this._tracks = updatedTracks.filter((updatedTrack) => updatedTrack.id !== 'newTrack');
  }

  get displayTracks() {
    const base = this._tracks?.length ? this._tracks : [];
    return base.concat([{
      id: 'newTrack',
      name: 'new track',
      actions: [],
      file: null,
      hidden: false,
      lock: false
    } as ITimelineTrack]);
  }

  static setVolumeIndex(action: ITimelineFileAction) {
    if (!action.volume) {
      return -2; // -2: no volume parts available => volume 1
    } else {
      for (let i = 0; i < action.volume!.length; i += 1) {
        const { volume } = Controller.getVol(action.volume![i]);

        if (volume < 0 || volume > 1) {
          console.info(`${action.name} specifies a volume of ${volume} which is outside the standard range: 0.0 - 1.0`)
        }
      }
      return -1; // -1: volume part unassigned => volume 1 until assigned
    }
  }

  static initializeAction(engine: IEngine, fileAction: ITimelineFileAction, trackIndex: number) {
    const newAction = fileAction as ITimelineAction;
    newAction.volumeIndex = TimelineFile.setVolumeIndex(newAction)

    if (!newAction.z) {
      newAction.z = trackIndex;
    }

    if (!newAction.layer) {
      newAction.layer = 'foreground';
    }

    if (!newAction.id) {
      newAction.id = namedId('action');
    }

    if (!newAction.width) {
      newAction.width = engine.renderWidth;
    }

    if (!newAction.height) {
      newAction.height = engine.renderHeight;
    }

    if (!newAction.fit) {
      newAction.fit = 'none';
    }

    return newAction;
  }

  async generateTracks(controllers: Record<string, IController>, engine: IEngine) {
    if (!this._fileTracks?.length || this._tracks?.length) {
      return;
    }

    try {
      const filePromises = this._fileTracks.map((fileTrack) => MediaFile.fromUrl(fileTrack.src));
      const mediaFiles: MediaFile[] = await Promise.all(filePromises);

      this._tracks = this._fileTracks.map((trackInput, index) => {
        trackInput.src = trackInput.src.indexOf('http') !== -1 ? trackInput!.src : `${window.location.origin}${trackInput!.src}`;
        trackInput.src = trackInput.src.replace(/([^:]\/)\/+/g, "$1");

        const file =  mediaFiles.find((file) => file._url === trackInput.src);

        if (!file) {
          throw new Error('couldn\'t find media file source');
        }


        const actions = trackInput.actions.map((action: ITimelineFileAction) => {
          return TimelineFile.initializeAction(engine, action, index);
        }) as ITimelineAction[];

        const track: ITimelineTrack = {
          id: trackInput.id ?? namedId('track'),
          name: trackInput.name,
          actions,
          file: file,
          controller: trackInput.controller ? trackInput.controller : controllers[trackInput.controllerName],
          hidden: trackInput.hidden,
          lock: trackInput.lock,
          selected: trackInput.selected
        };

        return track;
      });
      const nestedPreloads = this._tracks.map((track) => {
        return track.actions.map((action) => track.controller.preload ? track.controller.preload({
          action,
          engine,
          file: track.file
        }) : action)
      });
      const preloads = nestedPreloads.flat();
      const loadedActions = await Promise.all(preloads);

      loadedActions.forEach((loadedAction) => {
        if (!loadedAction) {
          throw new Error(`Action not preloaded`);
        }
        if (loadedAction.x) {
          loadedAction.x = Engine.parseCoord(loadedAction.x, loadedAction.width, engine.renderWidth);
        } else {
          loadedAction.x = 0;
        }
        if (loadedAction.y) {
          loadedAction.y = Engine.parseCoord(loadedAction.y, loadedAction.height, engine.renderHeight);
        } else {
          loadedAction.y = 0;
        }
      })

    } catch (ex) {
      console.error('buildTracks:', ex);
    }
  }

  async serialize() {
    const file = {
      id: this.id,
      name: this.name,
      description: this.description,
      author: this.author,
      created: this.created,
      lastModified: this.lastModified,
      backgroundColor: this.backgroundColor,
      width: this.width,
      height: this.height,
      src: this.src,
      tracks: []
    }
    for (let i = 0; i < this.tracks.length; i += 1) {
      const track = this.tracks[i];
      const serializedTrack = {
        id: track.id,
        name: track.name,
        actions: track.actions,
        classNames: track.classNames,
        hidden: track.hidden,
        lock: track.lock,
        // actionRef: track.actionRef
      }
    }
  }
  /*
  static async Save(file: TimelineFile) {
    const trackFileBase64 = await blobToBase64(instance.trackFile);
    const videoFileBase64 = await blobToBase64(instance.videoFile);

    const serializedData = JSON.stringify({
      id: instance.id,
      trackFile: trackFileBase64,
      videoFile: videoFileBase64,
    });

    const blob = new Blob([serializedData], { type: 'application/json' });

    // Trigger download using the Blob method as a fallback (or File System API if available)
    const fileName = `${instance.id}.json`;

    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();

    // Clean up
    URL.revokeObjectURL(url);
    link.remove();
  } */
}
