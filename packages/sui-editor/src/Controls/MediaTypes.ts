import { ITimelineActionType } from "@stoked-ui/timeline";
import AudioControl from "./AudioControl";
import AnimationControl from "./AnimationControl";
import VideoControl from "./VideoControl";

export const ControlTypes: Record<string, ITimelineActionType> = {
  audio: AudioControl,
  animation: AnimationControl,
  video: VideoControl,
};
