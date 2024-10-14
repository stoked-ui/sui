import { Controller } from '@stoked-ui/timeline';
import AudioController from "./AudioController";
import AnimationController from "./AnimationController";
import VideoController from "./VideoController";
import ImageController from "./ImageController";

const Controllers: Record<string, Controller> = {
  audio: AudioController,
  animation: AnimationController,
  video: VideoController,
  image: ImageController,
};

export default Controllers;
