import { namedId, base64Encode, getFileName, MediaFile } from "@stoked-ui/media-selector";
import {type ITimelineAction, ITimelineFileAction} from "../TimelineAction";
import {ITimelineTrack} from "../TimelineTrack";
import path from "path";
import * as fs from "node:fs";
import Engine, {IController, IEngine} from "../Engine";
import Controller from "../Engine/Controller";

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
  // actionData?: ITimelineFileAction[]
  // tracks?: ITimelineTrack[];
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
  actionData?: ITimelineFileAction[];
  tracks?: ITimelineTrack[];
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

  actionData?: ITimelineFileAction[]

  protected _tracks?: ITimelineTrack[];

  protected _displayTracks?: ITimelineTrack[];

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
    this.actionData = props.actionData ?? [];
    this._tracks = props.tracks ?? [];
  }

  get tracks() {
    return this._tracks;
  }

  get displayTracks() {
    return this._displayTracks;
  }

  async generateTracks(controllers: Record<string, IController>, engine: IEngine) {
    if (!this.actionData?.length || this.tracks.length) {
      return;
    }

    try {
      const actions = this.actionData.map((actionInput, index) => {
        const action = actionInput as ITimelineAction;
        action.src = action.src.indexOf('http') !== -1 ? action!.src : `${window.location.origin}${action!.src}`;
        action.src = action.src.replace(/([^:]\/)\/+/g, "$1");
        if (!action.name) {
          const fullName = getFileName(action.src, true);
          const name = getFileName(action.src, false);
          if (!name || !fullName) {
            throw new Error('no action name available');
          }
          action.name = name;
          action.fullName = fullName;
        } else {
          action.fullName = getFileName(action.src, true)!;
        }

        if (!action.volume) {
          action.volumeIndex = -2; // -2: no volume parts available => volume 1
        } else {
          action.volumeIndex = -1; // -1: volume part unassigned => volume 1 until assigned

          for (let i = 0; i < action.volume!.length; i += 1) {
            const { volume } = Controller.getVol(action.volume![i]);

            if (volume < 0 || volume > 1) {
              console.info(`${action.name} specifies a volume of ${volume} which is outside the standard range: 0.0 - 1.0`)
            }
          }
        }

        action.controller = controllers[action.controllerName];

        if (!action.id) {
          action.id = namedId('mediaFile');
        }

        if (!action.z) {
          action.z = index;
        }

        if (!action.layer) {
          action.layer = 'foreground';
        }
        return action;
      })
      const preload = actions.map((action) => action.controller.preload ? action.controller.preload({action, engine }) : action)
      const loadedActions = await Promise.all(preload);

      const filePromises = loadedActions.map((action) => MediaFile.fromAction(action as any));
      const mediaFiles: MediaFile[] = await Promise.all(filePromises);
      this._tracks = mediaFiles.map((file) => {
        const loadedAction = loadedActions.find((a) => a!.fullName === file.path);
        if (!loadedAction) {
          throw new Error(`Action input not found for file ${JSON.stringify(file, null, 2)} - ${file.path} - ${loadedActions.map((act) => act.fullName)}`);
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
        const action = {
          fit: 'none',
          loop: true,
          ...loadedAction,
          src: loadedAction.src,
          id: loadedAction.id,
        } as ITimelineAction
        const trackGenId = namedId('track')
        return {
          id: trackGenId,
          name: action.name ?? trackGenId,
          actions: [action],
          file: action.file,
          hidden: false,
          lock: false
        } as ITimelineTrack;
      })
      this._displayTracks = [];
      if (this._tracks.length) {
        this._displayTracks = this._tracks;
      }
      this._displayTracks.push({
        id: 'newTrack',
        name: 'new track',
        actions: [],
        file: null,
        hidden: false,
        lock: false
      } as ITimelineTrack);

      this.actionData = undefined;
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
        actionRef: track.actionRef
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
