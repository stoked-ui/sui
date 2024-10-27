import {Emitter, Engine,  ITimelineTrack, ScreenerBlob, EngineOptions, EventTypes, EngineState } from '@stoked-ui/timeline';
import {EditorEvents, EditorEventTypes} from './events';
import {
  IEditorEngine, EditorEngineState, ScreenVideoBlob,

} from "./EditorEngine.types";


/**
 * Timeline player
 * Can be run independently of the editor
 * @export
 * @class Engine
 * @extends {Engine<EditorState, EditorEventTypes>}
 */
export default class EditorEngine<
  State extends string = EditorEngineState,
  EmitterEvents extends EditorEventTypes = EditorEventTypes
> extends Engine<State, EmitterEvents> implements IEditorEngine<State, EmitterEvents> {

  _recorder?: MediaRecorder;

  _recordedChunks: Blob[] = [];

  override _state: State;

  constructor(params: EngineOptions ) {
    if (!params.events) {
      params.events = new EditorEvents()
    }
    super({...params});
    if (params?.viewer) {
      this.viewer = params.viewer;
    }
    if (params?.controllers) {
      this._controllers = params.controllers;
    }
    this._state = 'loading' as State;
  }

  set tracks(tracks: ITimelineTrack[]) {
    this._dealData(tracks);
    this._dealClear();
    this._dealEnter(this._currentTime);
  }

  /** Whether it is playing */
  get isPlaying() {
    return this._state === 'playing' as State || this.isRecording;
  }

  /** Whether it is playing */
  get isRecording() {
    return this._state === 'recording' as State;
  }

  displayVersion(screenerBlob: ScreenerBlob) {
    ScreenVideoBlob(screenerBlob, this as any);
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

    this._state = 'recording' as State;
    // activeIds run start
    this._startOrStop('start');
    // trigger event
    this.trigger('record', { engine: this as any });

    // Set running status

    this._timerId = requestAnimationFrame((time: number) => {
      this._prev = time;
      this._tick({now: time, autoEnd, to: toTime});
    });
/*
    // Get the video stream from the canvas renderer
    const videoStream = this.renderer?.captureStream();

    // Get the Howler audio stream
    const audioContext = Howler.ctx;
    const destination = audioContext.createMediaStreamDestination();
    Howler.masterGain.connect(destination);
    const audioStream = destination.stream;

    // Get audio tracks from video elements
    const videoElements = document.querySelectorAll('video');
    const videoAudioStreams: MediaStreamTrack[] = [];
    videoElements.forEach((video) => {
      const videoElement = video as HTMLVideoElement & { captureStream?: () => MediaStream };

      if (videoElement.captureStream) {
        const videoStream = videoElement.captureStream();
        videoStream.getAudioTracks().forEach((track) => {
          videoAudioStreams.push(track);
        });
      }
    });

    // Combine Howler and video audio streams
    const combinedAudioStream = new MediaStream([
      ...audioStream.getAudioTracks(),
      ...videoAudioStreams,
    ]);

    // Combine the video and audio streams
    const combinedStream = new MediaStream([
      ...videoStream.getVideoTracks(),
      ...combinedAudioStream.getAudioTracks(),
    ]);

    // Create the MediaRecorder with the combined stream
    this._recorder = new MediaRecorder(combinedStream, {
      mimeType: 'video/mp4',
    });
    // setMediaRecorder(recorder);
    // setRecordedChunks([]);
    this._recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        this._recordedChunks.push(e.data);
        // setRecordedChunks([...recordedChunks]);
      }
    };

    this._recorder.onstop = () => {
      if (!this.screener || !this.renderer || !this.stage) {
        console.warn("recording couldn't stop");
        return;
      }
      this.pause();
      this.finalizeRecording();
    };

    this._recorder.start(100); // Start recording

     */
    return true;
  }
}

