import * as React from "react";
import {type TimelineControlPropsBase} from "./TimelineControl.types";

/**
 * Animation editor parameters
 * @export
 * @interface TimelineControlProps
 */
export interface TimelineControlProps extends TimelineControlPropsBase {
 /*  /!**
   * @description The scroll distance from the top of the editing area (please use ref.setScrollTop
   *   instead)
   * @deprecated
   *!/
  scrollTop?: number;
  /!**
   * @description Edit area scrolling callback (used to control synchronization with editing track
   *   scrolling)
   *!/ */
  onScroll?: (params: any) => void;
/*   /!**
   * @description Whether to start automatic scrolling when dragging
   * @default false
   *!/
  autoScroll?: boolean; */
  /**
   * @description Custom timelineControl style
   */
  style?: React.CSSProperties;

  trackControls?: React.ComponentType;
  /*
  autoReRender?: boolean;
  disabled?: boolean;
  setScaleWidth?: (scaleWidth: number) => void;
  setScale?: (scale: number) => void;
  collapsed?: boolean;
  */

  // ref?: React.RefObject<TimelineState>;
}

export type TimelineControlComponent = ((props: TimelineControlProps) => React.JSX.Element) & { propTypes?: any };
