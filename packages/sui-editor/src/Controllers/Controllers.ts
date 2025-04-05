/**
 * Object mapping controller names to corresponding controller instances.
 */
const Controllers: Record<string, IController> = {
  /**
   * Audio controller instance.
   */
  audio: AudioController,

  /**
   * Video controller instance.
   */
  video: VideoController,

  /**
   * Image controller instance.
   */
  image: ImageController,
};

export default Controllers;
*/