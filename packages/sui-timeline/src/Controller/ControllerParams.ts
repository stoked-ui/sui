/**
 * Parameters for getting an item in the timeline.
 *
 * @template ActionType - The type of action to retrieve.
 * @template TrackType - The type of track to retrieve from.
 */
export type GetItemParams<
  ActionType extends ITimelineAction = ITimelineAction,
  TrackType extends ITimelineTrack = ITimelineTrack,
> = {
  /**
   * The type of action to retrieve.
   */
  action: ActionType;
  /**
   * The type of track to retrieve from.
   */
  track: TrackType;
}

/**
 * Parameters for preloading an item in the timeline.
 *
 * @template ActionType - The type of action to preload.
 * @template TrackType - The type of track to preload from.
 */
export type PreloadParams<
  ActionType extends ITimelineAction = ITimelineAction,
  TrackType extends ITimelineTrack = ITimelineTrack,
> = {
  /**
   * The type of action to preload.
   */
  action: ActionType;
  /**
   * The type of track to preload from.
   */
  track: TrackType;
  /**
   * The ID of the editor to use for preloading.
   */
  editorId: string;
}

/**
 * Parameters for controlling an item in the timeline.
 *
 * @template ActionType - The type of action to control.
 * @template TrackType - The type of track to control from.
 * @template EngineType - The type of engine to use for control.
 */
export type ControllerParams<
  ActionType extends ITimelineAction = ITimelineAction,
  TrackType extends ITimelineTrack = ITimelineTrack,
  EngineType extends IEngine = IEngine
> = {
  /**
   * The type of action to control.
   */
  action: ActionType;
  /**
   * The type of track to control from.
   */
  track: TrackType;
  /**
   * The type of engine to use for control.
   */
  engine: EngineType;
  /**
   * The current time in the timeline.
   */
  time: number;
};