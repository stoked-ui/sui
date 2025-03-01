import { IController } from '@stoked-ui/timeline';
/*
import AnimationController from "./AnimationController";
*/
import AudioController from "./AudioController";
import VideoController from "./VideoController";
import ImageController from "./ImageController";

const Controllers: Record<string, IController> = {
  audio: AudioController,
/*
  animation: AnimationController,
*/
  video: VideoController,
  image: ImageController,
};

export default Controllers;
