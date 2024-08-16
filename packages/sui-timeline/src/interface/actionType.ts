import { TimelineEngine } from "../TimelineEngine/TimelineEngine";
import { TimelineAction } from "./action";

export interface TimelineActionType {
  /** Effect id */
  id: string,
  /** Effect name */
  name?: string,
  /** Effect running code */
  source?: TimelineActionSource,
}

export interface ActionSourceParam {
  /** current time */
  time: number,
  /** Is it running */
  isPlaying: boolean,
  /** Action */
  action: TimelineAction,
  /** Action effect */
  effect: TimelineActionType,
  /** Run engine */
  engine: TimelineEngine,
}

/**
 * Effect execution callback
 * @export
 * @interface TimelineActionSource
 */
export interface TimelineActionSource {
  /** Called back when the current action time area starts playing */
  start?: (param: ActionSourceParam) => void;
  /** Execute callback when time enters action */
  enter?: (param: ActionSourceParam) => void;
  /** Callback when action is updated */
  update?: (param: ActionSourceParam) => void;
  /** Execute callback when time leaves the action */
  leave?: (param: ActionSourceParam) => void;
  /** Callback when the current action time area stops playing */
  stop?: (param: ActionSourceParam) => void;
}
