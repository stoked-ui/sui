import { IController } from '@stoked-ui/timeline';
/*
import AnimationController from "./AnimationController";
*/
import AudioController from "./AudioController";
import VideoController from "./VideoController";
import ImageController from "./ImageController";
import CompositorController from "./CompositorController";

const Controllers: Record<string, IController> = {
  audio: AudioController,
/*
  animation: AnimationController,
*/
  video: VideoController,
  image: ImageController,
  compositor: CompositorController,
};

export default Controllers;
