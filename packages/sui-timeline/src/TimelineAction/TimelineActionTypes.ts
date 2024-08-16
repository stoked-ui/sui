import { TimelineActionType } from "../interface/actionType";
import TimelineAudio from "./TimelineAudio";
import TimelineAnimation from "./TimelineAnimation";
import TimelineVideo from "./TimelineVideo";

export const actionTypes: Record<string, TimelineActionType> = {
  audio: TimelineAudio.actionType,
  animation: TimelineAnimation.actionType,
  video: TimelineVideo.actionType,
};

const ActionTypes = actionTypes;
export { ActionTypes };
