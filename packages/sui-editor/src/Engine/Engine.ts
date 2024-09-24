import * as React from 'react';
import { Engine, type PlayState, type IController, EngineOptions } from '@stoked-ui/timeline';
import {EditorEvents, EditorEventTypes} from './events';

const RECORDING = 'recording';
type EditorState = PlayState & typeof RECORDING;


/**
 * Timeline player
 * Can be run independently of the editor
 * @export
 * @class Engine
 * @extends {Engine<EditorState, EditorEventTypes>}
 */
export default class EditorEngine extends Engine<EditorState, EditorEventTypes> {

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
  get isRecording() {
    return this._playState === 'recording';
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
    if (this.isPlaying || this.isRecording || (toTime && toTime <= currentTime)) {
      return false;
    }

    // Set running status
    this._playState = RECORDING as EditorState;

    // activeIds run start
    this._startOrStop('start');
    this.trigger('play', {engine: this});
    // trigger event
    this.trigger('record', {engine: this});

    this._timerId = requestAnimationFrame((time: number) => {
      this._prev = time;
      this._tick({now: time, autoEnd, to: toTime});
    });

    return true;
  }
}

