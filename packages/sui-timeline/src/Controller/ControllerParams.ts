/** 
 * Defines the parameters to get an item from a timeline.
 * 
 * @typedef {Object} GetItemParams
 * @property {ActionType} action - The action associated with the item.
 * @property {TrackType} track - The track where the item is located.
 * 
 * @template ActionType - Type of the timeline action.
 * @template TrackType - Type of the timeline track.
 */

/** 
 * Defines the parameters for preloading an item in a timeline.
 * 
 * @typedef {Object} PreloadParams
 * @property {ActionType} action - The action to preload.
 * @property {TrackType} track - The track to preload the action on.
 * @property {string} editorId - The editor id where the action is preloaded.
 * 
 * @template ActionType - Type of the timeline action.
 * @template TrackType - Type of the timeline track.
 */

/** 
 * Defines the parameters for a controller in a timeline.
 * 
 * @typedef {Object} ControllerParams
 * @property {ActionType} action - The action controlled by the controller.
 * @property {TrackType} track - The track where the action is located.
 * @property {EngineType} engine - The engine controlling the timeline.
 * @property {number} time - The current time in the timeline.
 * 
 * @template ActionType - Type of the timeline action.
 * @template TrackType - Type of the timeline track.
 * @template EngineType - Type of the engine controlling the timeline.
 */ 

import { type IEngine } from "../Engine/Engine.types";
import { type ITimelineAction } from "../TimelineAction/TimelineAction.types";
import { ITimelineTrack } from "../TimelineTrack/TimelineTrack.types";