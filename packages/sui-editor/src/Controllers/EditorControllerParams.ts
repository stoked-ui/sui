import { ControllerParams, GetItemParams, PreloadParams } from "@stoked-ui/timeline";
import { IEditorEngine } from "../EditorEngine";
import { IEditorAction } from "../EditorAction/EditorAction";
import { IEditorTrack } from "../EditorTrack/EditorTrack";

/**
 * Interface for EditorGetItemParams extending GetItemParams
 * @typedef {Object} EditorGetItemParams
 * @property {IEditorAction} item - The editor action item
 * @property {IEditorTrack} track - The editor track item
 */
export interface EditorGetItemParams extends GetItemParams<IEditorAction, IEditorTrack> {}

/**
 * Interface for EditorPreloadParams extending PreloadParams
 * @typedef {Object} EditorPreloadParams
 * @property {IEditorAction} item - The editor action item
 * @property {IEditorTrack} track - The editor track item
 */
export interface EditorPreloadParams extends PreloadParams<IEditorAction, IEditorTrack> {}

/**
 * Interface for EditorControllerParams extending ControllerParams
 * @typedef {Object} EditorControllerParams
 * @property {IEditorAction} action - The editor action
 * @property {IEditorTrack} track - The editor track
 * @property {IEditorEngine} engine - The editor engine
 */
export interface EditorControllerParams extends ControllerParams<IEditorAction, IEditorTrack, IEditorEngine> {}