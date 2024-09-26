import { Engine, EngineOptions, ScreenerBlob } from '@stoked-ui/timeline';
import {openDB} from "idb";
import {EditorEvents, EditorEventTypes} from './events';
import {IEditorEngine, EditorState, ScreenVideoBlob} from "./EditorEngine.types";
import {getKeysStartingWithPrefix} from "../db/get";
import {Version} from "../Editor";
import {VideoVersionFromKey} from "../EditorControls";


/**
 * Timeline player
 * Can be run independently of the editor
 * @export
 * @class Engine
 * @extends {Engine<EditorState, EditorEventTypes>}
 */
export default class EditorEngine extends Engine<EditorState, EditorEventTypes> implements IEditorEngine{

  constructor(params: EngineOptions ) {
    super({...params, events: new EditorEvents()});
    this._editorId = params.id;
    if (params?.viewer) {
      this.viewer = params.viewer;
    }
    if (params?.controllers) {
      this._controllers = params.controllers;
    }
    this._playState = params.defaultState as EditorState;
  }

  /** Whether it is playing */
  get isPlaying() {
    return this._playState === 'playing' || this.isRecording;
  }

  /** Whether it is playing */
  get isRecording() {
    return this._playState === 'recording';
  }

  async getVersionKeys() {
    const matchingKeys = await getKeysStartingWithPrefix('editor', 'video', this._editorId)
    return matchingKeys.map((match) => {
      const parts = match.split('|');
      return { id: parts[0], version: Number(parts[1]), key: match} as Version;
    })
  }

  async getVersions(): Promise<ScreenerBlob[]> {
    const versions = await this.getVersionKeys();
    const promises = versions.map((version) => EditorEngine.loadVersion(version.key))
    return Promise.all(promises);
  }

  static async loadVersion(dbKey: string): Promise<ScreenerBlob> {
    const db = await openDB('editor', 1);
    const store = db.transaction('video').objectStore('video');
    return store.get(dbKey);
  };

  displayVersion(screenerBlob: ScreenerBlob) {
    ScreenVideoBlob(screenerBlob.blob, this, VideoVersionFromKey(screenerBlob.key));
  }

  /**
   * Run: The start time is the current time
   * @param param
   * @return {boolean} {boolean}
   */
  record(param: {
    /** By default, it runs from beginning to end, with a priority greater than autoEnd */
    toTime?: number; /** Whether to automatically end after playing */
    autoEnd?: boolean;
  }): boolean {
    const {toTime, autoEnd} = param;

    const currentTime = this.getTime();

    /** The current state is being played or the running end time is less than the start time, return directly */
    if (this.isPlaying || (toTime && toTime <= currentTime)) {
      return false;
    }

    this._playState = 'recording' as EditorState;
    // activeIds run start
    this._startOrStop('start');
    // trigger event
    this.trigger('record', {engine: this});

    // Set running status

    this._timerId = requestAnimationFrame((time: number) => {
      this._prev = time;
      this._tick({now: time, autoEnd, to: toTime});
    });

    return true;
  }
}

