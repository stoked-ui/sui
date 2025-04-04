/**
 * @interface TimelineTrackAreaProps
 * @description Props for the TimelineTrackArea component.
 *
 * This type represents a set of properties that are shared by all TimelineTrackArea components.
 * It includes handlers, props, and other relevant data.
 */
export type TimelineTrackAreaProps<
  TrackType extends ITimelineTrack = ITimelineTrack,
  ActionType extends ITimelineAction = ITimelineAction
> =  ITimelineTrackHandlers & ITimelineActionHandlers & TimelineTimeProps & TimelineCursorProps &{
  /**
   * @description Returns an array of action IDs for the assist drag line.
   * @param params - Parameters containing the action and track information.
   * @returns An array of string action IDs.
   */
  getAssistDragLineActionIds?: (params: { action: ActionType; tracks: TrackType[]; track: TrackType }) => string[];

  /**
   * @description Scroll callback for synchronous scrolling.
   * @param params - Parameters containing the scroll information.
   */
  onScroll: (params: OnScrollParams) => void;

  /**
   * @description Sets the editor data.
   * @param scrollLeft - The new scroll left value.
   */
  deltaScrollLeft: (scrollLeft: number) => void;

  /**
   * @description Callback for adding files.
   */
  onAddFiles?: () => void;

  /**
   * @description Optional prop to render track actions.
   */
  trackActions?: React.ElementType;
};

/**
 * @interface TimelineTrackAreaState
 * @description State data for the TimelineTrackArea component.
 *
 * This interface represents the state properties of a TimelineTrackArea component.
 * It includes a reference to the DOM element.
 */
export interface TimelineTrackAreaState {
  /**
   * @description Reference to the DOM element.
   */
  domRef: React.MutableRefObject<HTMLDivElement>;
};