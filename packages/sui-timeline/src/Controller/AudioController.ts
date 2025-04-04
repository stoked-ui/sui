/**
 * Class representing an audio controller.
 * 
 * This class extends the base Controller class and implements the IController interface.
 * It provides methods for controlling audio playback, including preload, start, stop, enter, leave,
 * and update. The controller also manages a cache of Howl objects to improve performance.
 */

class AudioControl extends Controller<Howl> implements IController {
  /**
   * A map of cached Howl objects by track ID.
   */
  cacheMap: Record<string, Howl>;

  /**
   * A flag indicating whether logging is enabled.
   */
  logging: boolean;

  /**
   * A map of listener functions for each action ID.
   */
  listenerMap: Record<
    string,
    {
      time?: (data: { time: number }) => void;
      rate?: (data: { rate: number }) => void;
    }
  > = {};

  /**
   * Constructor.
   */
  constructor() {
    super({
      name: 'Audio',
      id: 'audio',
      color: '#146b4e',
      colorSecondary: '#2bd797',
    });
  }

  /**
   * Preloads an audio file and returns a promise that resolves with the loaded item.
   * 
   * @param params - The preload parameters, including the action and track IDs.
   * @returns A promise that resolves with the loaded Howl object.
   */
  async preload(params: PreloadParams): Promise<ITimelineAction> {
    this.log({ action: params.action, time: Date.now() }, 'audio preload');
    const { action, track } = params;
    const { file } = track;
    if (!file) {
      return action;
    }

    return new Promise((resolve, reject) => {
      try {
        const item = new Howl({
          src: file.url as string,
          loop: false,
          autoplay: false,
          onload: () => {
            action.duration = item.duration();
          }
        });
        this.cacheMap[track.id] = item;
      } catch (ex) {
        let msg = `Error loading audio file: ${file.url}`;
        if (ex as Error) {
          msg += (ex as Error).message;
        }
        reject(new Error(msg));
      }
    })
  }

  /**
   * Enters the controller and starts playback.
   * 
   * @param params - The controller parameters, including the action and time IDs.
   */
  enter(params: ControllerParams) {
    const { action, time } = params;
    this.log({ action, time }, 'audio enter');
    this.start(params);
  }

  /**
   * Starts playback for an action.
   * 
   * @param params - The controller parameters, including the action and track IDs.
   */
  start(params: ControllerParams) {
    const { action, time, engine, track } = params;
    this.log({ action, time }, 'audio start')
    const item: Howl = this.getItem({ action, track } as GetItemParams);
    if (item) {
      item.rate(engine.getPlaybackRate());
      item.play();
    }
  }

  /**
   * Stops playback for an action.
   * 
   * @param params - The controller parameters, including the action and track IDs.
   */
  stop(params: ControllerParams) {
    this.stop(params);
  }

  /**
   * Leaves the controller and stops playback.
   * 
   * @param params - The controller parameters, including the action and time IDs.
   */
  leave(params: ControllerParams) {
    const { action, time } = params;
    this.log({ action, time }, 'audio stop');
    this.stop(params);
  }

  /**
   * Updates the playback state for an action.
   * 
   * @param params - The controller parameters, including the action and track IDs.
   */
  update(params: ControllerParams) {
    // No-op
  }
}

/**
 * Exports the AudioControl class.
 */
const AudioController = new AudioControl();
export { AudioControl };
export default AudioController;