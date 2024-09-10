import AudioControl from "../MediaFile/Audio/AudioController";
import AnimationControl from "../MediaFile/Animation/AnimationController";
import VideoControl from "../MediaFile/Video/VideoController";
import MediaController from "./MediaController";

const MediaControllers: Record<string, MediaController> = {
  audio: AudioControl,
  animation: AnimationControl,
  video: VideoControl,
};

export default MediaControllers;
