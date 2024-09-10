import AudioControl from "./Audio/AudioController";
import AnimationControl from "./Animation/AnimationController";
import VideoControl from "./Video/VideoController";
import ImageControl from "./Image/ImageController";
import Controller from "./Controller";

const Controllers: Record<string, Controller> = {
  audio: AudioControl,
  animation: AnimationControl,
  video: VideoControl,
  image: ImageControl,
};

export default Controllers;
