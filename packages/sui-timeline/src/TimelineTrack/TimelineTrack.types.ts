/**
 * Basic parameters of action lines
 * @export
 * @interface ITimelineTrack
 */
export interface ITimelineTrack<
  ActionType extends ITimelineAction = ITimelineAction,
> {
  /** Action track id */
  id: string;
  /** Track name */
  name: string;
  /** Row action list */
  actions: ActionType[];
  /** Extended class name of the track */
  classNames?: string[];
  /** Indicates if the track is movable */
  muted?: boolean;
  /** Indicates if the track is locked */
  locked?: boolean;
  /** File associated with the track */
  file?: any;
  /** File ID */
  fileId?: string;
  /** URL */
  url?: string;
  /** Image URL */
  image?: string;
  /** Name of the controller */
  controllerName?: string;
  /** Indicates if the track is disabled */
  disabled?: boolean;
  /** Controller object */
  controller: IController;
  /** Indicates if the track is dimmed */
  dim?: boolean;
}

/**
 * Handlers for timeline track interactions
 * @template TrackType
 */
export interface ITimelineTrackHandlers<
  TrackType extends ITimelineTrack = ITimelineTrack,
> {
  /**
   * Click track callback
   * @param {React.MouseEvent<HTMLElement, MouseEvent>} e - The MouseEvent object
   * @param {{track: TrackType; time: number;}} param - Object containing track and time information
   */
  onClickTrack?: (
    e: React.MouseEvent<HTMLElement, MouseEvent>,
    param: {
      track: TrackType;
      time: number;
    },
  ) => void;
  /**
   * Double-click track callback
   * @param {React.MouseEvent<HTMLElement, MouseEvent>} e - The MouseEvent object
   * @param {{track: TrackType; time: number;}} param - Object containing track and time information
   */
  onDoubleClickTrack?: (
    e: React.MouseEvent<HTMLElement, MouseEvent>,
    param: {
      track: TrackType;
      time: number;
    },
  ) => void;
  /**
   * Right-click track callback
   * @param {React.MouseEvent<HTMLElement, MouseEvent>} e - The MouseEvent object
   * @param {{track: TrackType; time: number;}} param - Object containing track and time information
   */
  onContextMenuTrack?: (
    e: React.MouseEvent<HTMLElement, MouseEvent>,
    param: {
      track: TrackType;
      time: number;
    },
  ) => void;
}

/**
 * Props for the TimelineTrack component
 * @template TrackType
 * @template ActionType
 */
export type TimelineTrackProps<
  TrackType extends ITimelineTrack = ITimelineTrack,
  ActionType extends ITimelineAction = ITimelineAction,
> =
  ITimelineActionHandlers<TrackType, ActionType> &
  TimelineControlPropsBase<TrackType, ActionType>
  & ITimelineTrackHandlers<TrackType>
  & {
  /** Reference to the track area element */
  areaRef?: React.MutableRefObject<HTMLDivElement>;
  /** Track object */
  track?: TrackType;
  /** CSS styles for the component */
  style?: React.CSSProperties;
  /** Data for drag lines */
  dragLineData: DragLineData;
  /** Scroll distance from the left */
  scrollLeft: number;
  /** Set up scroll left */
  deltaScrollLeft: (scrollLeft: number) => void;
  /** Map of action tracks */
  actionTrackMap?: Record<string, TrackType>;
  /** Reference to the track element */
  trackRef?: React.RefObject<HTMLDivElement>;
  /** Callback for adding files */
  onAddFiles?: () => void;
  /** Component for track actions */
  trackActions?: React.ElementType;
};

/**
 * Object containing alpha values for different track colors
 */
export const TrackColorAlpha = {
  dark: {
    hoverSelect: {
      action: .9,
      row: .42,
      label: .85,
    },
    selected: {
      action: .82,
      row: .36,
      label: .63,
    },
    hover: {
      action: .62,
      row: .30,
      label: .8,
    },
    normal: {
      action: .48,
      row: .24,
      label: .82,
    }
  },
  light: {
    hoverSelect: {
      action: .85,
      row: .53,
      label: .4,
    },
    selected: {
      action: .8,
      row:  .47,
      label: .35,
    },
    hover: {
      action: .62,
      row: .42,
      label: .25,
    },
    normal: {
      action: .52,
      row:  .32,
      label: .12,
    }
  }
}

/**
 * Get the state based on selected and hover status
 * @param {boolean} selected - Indicates if the track is selected
 * @param {boolean} hover - Indicates if the track is hovered over
 * @returns {string} The state of the track
 */
const getState = (selected?: boolean, hover?: boolean) => {
  if (selected && hover) {
    return 'hoverSelect';
  }
  if (selected) {
    return 'selected';
  }
  if (hover) {
    return 'hover';
  }
  return 'normal';
}

/**
 * Get background color details for the track
 * @param {string} color - Color of the track
 * @param {'dark' | 'light'} mode - Mode of the track color
 * @param {boolean} selected - Indicates if the track is selected
 * @param {boolean} hover - Indicates if the track is hovered over
 * @param {boolean} disabled - Indicates if the track is disabled
 * @param {boolean} dim - Indicates if the track is dimmed
 * @returns {Object} Object containing background color details
 */
export const getTrackBackgroundColor = (color: string, mode: 'dark' | 'light', selected?: boolean, hover?: boolean, disabled?: boolean, dim?: boolean) => {
  // Function logic documented within the function
}

/**
 * Get background color details for the track in detail
 * @param {string} color - Color of the track
 * @param {'dark' | 'light'} mode - Mode of the track color
 * @param {boolean} selected - Indicates if the track is selected
 * @param {boolean} hover - Indicates if the track is hovered over
 * @param {boolean} disabled - Indicates if the track is disabled
 * @param {boolean} dim - Indicates if the track is dimmed
 * @returns {Object} Object containing detailed background color details
 */
export const getTrackBackgroundColorDetail = (color: string, mode: 'dark' | 'light', selected?: boolean, hover?: boolean, disabled?: boolean, dim?: boolean) => {
  // Function logic documented within the function
}

/**
 * Object containing basic parameters of a new track
 * @export
 * @interface ITimelineTrackNew
 */
export interface ITimelineTrackNew<
  ActionType extends ITimelineAction = ITimelineAction,
> extends Omit<ITimelineTrack<ActionType>, 'id' | 'file'> {

  id: 'newTrack';

  file: null;
}

/**
 * Data structure for a timeline track
 * @template TrackType
 */
export type ITimelineTrackData<TrackType extends ITimelineTrack = ITimelineTrack> = Omit<TrackType, 'file' | 'controller'> & {}

/**
 * Data structure for a timeline file track
 */
export interface ITimelineFileTrack extends Omit<ITimelineTrack, 'id' | 'controller' | 'actions'> {
  /** Action track id */
  id?: string;
  /** Track name */
  name: string;
  /** Row action list */
  actions: ITimelineFileAction[];
  /** Image URL */
  image?: string;
  /** Name of the controller */
  controllerName?: string;
  /** Controller object */
  controller?: IController;
}