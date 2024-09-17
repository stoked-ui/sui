import { Controller } from '@stoked-ui/timeline';
import AudioControl from "./AudioController";
import AnimationControl from "./AnimationController";
import VideoControl from "./VideoController";
import ImageControl from "./ImageController";

const Controllers: Record<string, Controller> = {
  audio: AudioControl,
  animation: AnimationControl,
  video: VideoControl,
  image: ImageControl,
};

export default Controllers;
