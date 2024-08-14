import { TimelineEngine } from "../TimelineEngine/TimelineEngine";
import { TimelineAction } from "./action";

export interface TimelineEffect {
  /** Effect id */
  id: string,
  /** Effect name */
  name?: string,
  /** Effect running code */
  source?: TimeLineEffectSource,
}

export interface EffectSourceParam {
  /** current time */
  time: number,
  /** Is it running */
  isPlaying: boolean,
  /** Action */
  action: TimelineAction,
  /** Action effect */
  effect: TimelineEffect,
  /** Run engine */
  engine: TimelineEngine,
}

/**
 * Effect execution callback
 * @export
 * @interface TimeLineEffectSource
 */
export interface TimeLineEffectSource {
  /** Called back when the current action time area starts playing */
  start?: (param: EffectSourceParam) => void;
  /** Execute callback when time enters action */
  enter?: (param: EffectSourceParam) => void;
  /** Callback when action is updated */
  update?: (param: EffectSourceParam) => void;
  /** Execute callback when time leaves the action */
  leave?: (param: EffectSourceParam) => void;
  /** Callback when the current action time area stops playing */
  stop?: (param: EffectSourceParam) => void;
}
