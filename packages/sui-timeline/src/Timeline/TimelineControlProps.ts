/**
 * Animation editor parameters
 * @export
 * @interface TimelineControlProps
 */
export interface TimelineControlProps extends TimelineControlPropsBase {
  /**
   * The scroll distance from the top of the editing area (please use ref.setScrollTop instead)
   * @deprecated
   * @type {number}
   */
  scrollTop?: number;

  /**
   * Edit area scrolling callback (used to control synchronization with editing track scrolling)
   * @param {any} params - Parameters for the scroll event
   * @returns {void}
   */
  onScroll?: (params: any) => void;

  /**
   * Whether to start automatic scrolling when dragging
   * @default false
   * @type {boolean}
   */
  autoScroll?: boolean;

  /**
   * Custom timelineControl style
   * @type {React.CSSProperties}
   */
  style?: React.CSSProperties;

  /**
   * Track actions component type
   * @type {React.ComponentType}
   */
  trackActions?: React.ComponentType;

  /**
   * Custom component for rendering track actions
   * @example
   * const MyTrackAction = () => <div>My Track Action</div>;
   * 
   * const MyTimelineControl: TimelineControlComponent = (props) => {
   *   return (
   *     <TimelineControl>
   *       <MyTrackAction />
   *     </TimelineControl>
   *   );
   * };
   */
}

export type TimelineControlComponent = ((props: TimelineControlProps) => React.JSX.Element) & { propTypes?: any };