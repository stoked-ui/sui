import {
  Controller,
  PreloadParams,
  ControllerParams,
  ITimelineAction,
  IController,
  ITimelineTrack,
  GetItemParams
} from "@stoked-ui/timeline";

/**
 * The AudioControl class is responsible for controlling audio playback in the timeline.
 * It provides methods for preload, enter, start, update, stop, and leave actions.
 */
class AudioControl extends Controller<Howl> implements IController {
  /**
   * A cache map to store loaded Howl instances for each track ID.
   */
  cacheMap: Record<string, Howl>;

  /**
   * A flag indicating whether logging is enabled.
   */
  logging: boolean;

  /**
   * A map of listener IDs to their corresponding time and rate listeners.
   */
  listenerMap: Record<
    string,
    {
      time?: (data: { time: number }) => void;
      rate?: (data: { rate: number }) => void;
    }
  > = {};

  constructor() {
    /**
     * Initializes the AudioControl instance with default configuration.
     */
    super({
      name: 'Audio',
      id: 'audio',
      color: '#146b4e',
      colorSecondary: '#2bd797',
    });
  }

  /**
   * Preloads an audio action by loading the corresponding track's file and playing it.
   * @param params The preload parameters containing the action, track, and engine.
   * @returns A promise resolving with the loaded Howl instance or rejecting with an error.
   */
  async preload(params: PreloadParams): Promise<ITimelineAction> {
    this.log({ action: params.action, time: Date.now() }, 'audio preload');
    const { action, track } = params;
    const { file } = track;

    if (!file) {
      return action;
    }

    /**
     * Creates a new Howl instance for the loaded audio file and caches it.
     */
    const item = new Howl({
      src: (file.url || track.url) as string,
      loop: false,
      autoplay: false,
      onload: () => {
        action.duration = item.duration();
      }
    });
    this.cacheMap[track.id] = item;
    return action as ITimelineAction;
  }

  /**
   * Enters a new controller instance and checks if the engine and track are valid.
   * If they are, it calls the start method to initialize the audio playback.
   * @param params The controller parameters containing the action, engine, track, and time.
   */
  enter(params: ControllerParams) {
    const { action, engine, track, time } = params;

    if (!this.isValid(engine, track)) {
      return;
    }

    this.log({ action, time }, 'audio enter');
    this.start(params);
  }

  /**
   * Starts the audio playback for a given controller instance.
   * @param params The controller parameters containing the action, engine, track, and time.
   */
  start(params: ControllerParams) {
    const { action, engine, track } = params;
    // implement start logic here
  }

  /**
   * Updates the audio playback state for a given controller instance.
   * @param params The controller parameters containing the action, engine, track, and time.
   */
  update(params: ControllerParams) {
    const { action, engine, track } = params;
    // implement update logic here
  }

  /**
   * Stops the audio playback for a given controller instance.
   * @param params The controller parameters containing the action, engine, track, and time.
   */
  stop(params: ControllerParams) {
    const { action, engine, track } = params;

    if (this.cacheMap[track.id]) {
      const item = this.cacheMap[track.id];
      item.stop();
      item.mute();

      if (this.listenerMap[action.id]) {
        if (this.listenerMap[action.id].time) {
          engine.off('afterSetTime', this.listenerMap[action.id].time);
        }
        if (this listenerMap[action.id].rate) {
          engine.off('afterSetPlayRate', this listenerMap[action.id].rate);
        }
        delete this.listenerMap[action.id];
      }
    }
  }

  /**
   * Leaves a controller instance and stops the audio playback.
   * @param params The controller parameters containing the action, engine, track, and time.
   */
  leave(params: ControllerParams) {
    const { action, time } = params;
    this.log({ action, time }, 'audio stop');
    this.stop(params);
  }

  /**
   * Returns the style for a given action in the timeline.
   * @param action The ITimelineAction instance to calculate the style for.
   * @param track The ITimelineTrack instance associated with the action.
   * @param scaleWidth The current width of the screen.
   * @param scale The scaling factor for the background image.
   * @returns The calculated style object.
   */
  getActionStyle(action: ITimelineAction, track: ITimelineTrack, scaleWidth: number, scale: number, trackHeight: number) {
    const adjustedScale = scaleWidth / scale;
    if (!action.backgroundImage) {
      return null;
    }
    return {
      backgroundImage: `url(${action.backgroundImage})`,
      backgroundPosition: `${-adjustedScale * (action.trimStart || 0)}px 0px`,
      backgroundSize: `${adjustedScale * (action.duration || 0)}px 100%`
    };
  }

  /**
   * Retrieves a loaded Howl instance for a given track ID.
   * @param params The GetItemParams containing the track and file URL.
   * @returns The loaded Howl instance or a new one if it doesn't exist in the cache.
   */
  getItem(params: GetItemParams) {
    const { track } = params;

    let item = this.cacheMap[track.id];
    if (item) {
      return item;
    }

    /**
     * Creates a new Howl instance for the loaded audio file and caches it.
     */
    item = new Howl({ src: track.file?.url as string, loop: false, autoplay: false });
    this.cacheMap[track.id] = item;
    return item;
  };
}

const AudioController = new AudioControl();
export { AudioControl };
export default AudioController;