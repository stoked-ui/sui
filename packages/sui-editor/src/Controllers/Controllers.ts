/**
 * Mapping of controller types to their corresponding controllers.
 *
 * This object serves as a lookup table for the available controllers, allowing
 * for easy access and management of different types of media controllers.
 */
import { IController } from '@stoked-ui/timeline';

const Controllers: Record<string, IController> = {
  /**
   * Mapping of controller type to its corresponding controller implementation.
   *
   * @property audio - The AudioController instance.
   * @property video - The VideoController instance.
   * @property image - The ImageController instance.
   */
  audio: AudioController,
  video: VideoController,
  image: ImageController,
};

export default Controllers;