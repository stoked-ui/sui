import {OnScrollParams} from "react-virtualized";
import * as React from "react";
import {type TimelineControlPropsBase} from "./TimelineControl.types";
import {type TimelineState} from "../Timeline/TimelineState";

/**
 * Animation editor parameters
 * @export
 * @interface TimelineControlProps
 */
export interface TimelineControlProps extends TimelineControlPropsBase {
  /**
   * @description The scroll distance from the top of the editing area (please use ref.setScrollTop
   *   instead)
   * @deprecated
   */
  scrollTop?: number;
  /**
   * @description Edit area scrolling callback (used to control synchronization with editing track
   *   scrolling)
   */
  onScroll?: (params: OnScrollParams) => void;
  /**
   * @description Whether to start automatic scrolling when dragging
   * @default false
   */
  autoScroll?: boolean;
  /**
   * @description Custom timelineControl style
   */
  style?: React.CSSProperties;
  /**
   * @description Whether to automatically re-render (update tick when data changes or cursor time
   *   changes)
   * @default true
   */
  autoReRender?: boolean;

  disabled?: boolean;

  setScaleWidth?: (scaleWidth: number) => void;
  setScale?: (scale: number) => void;

  ref?: React.RefObject<TimelineState>;
}

export type TimelineControlComponent = ((
  props: TimelineControlProps & TimelineState,
) => React.JSX.Element) & { propTypes?: any };
