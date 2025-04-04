/**
 * Import necessary types and interfaces from @stoked-ui/timeline.
 */
import {ControllerParams, GetItemParams, PreloadParams} from "@stoked-ui/timeline";

/**
 * Import type definitions for the EditorEngine, EditorAction, and EditorTrack.
 */
import { type IEditorEngine } from "../EditorEngine";
import { type IEditorAction } from "../EditorAction/EditorAction";
import { IEditorTrack } from "../EditorTrack/EditorTrack";

/**
 * Define an interface for params used in the EditorGetItem function.
 * This extends GetItemParams, adding specific properties relevant to the editor context.
 */
export interface EditorGetItemParams extends GetItemParams<IEditorAction, IEditorTrack> {}

/**
 * Define an interface for preloading data in the editor.
 * This extends PreloadParams, adding specific properties relevant to the editor context.
 */
export interface EditorPreloadParams extends PreloadParams<IEditorAction, IEditorTrack> {}

/**
 * Define an interface for params used in the EditorController function.
 * This extends ControllerParams, adding specific properties relevant to the editor context and the engine.
 */
export interface EditorControllerParams extends ControllerParams<IEditorAction, IEditorTrack, IEditorEngine> {}