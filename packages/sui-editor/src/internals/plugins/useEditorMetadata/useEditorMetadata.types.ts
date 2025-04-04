import type { ITimelineAction, ITimelineTrack } from '@stoked-ui/timeline';
import EditorFile from '../../../EditorFile/EditorFile';
import type { DefaultizedProps, EditorPluginSignature } from '../../models';
import {
  UseEditorKeyboardSignature
} from '../useEditorKeyboard';

/**
 * Provides metadata for the editor.
 *
 * This hook provides an instance of `UseEditorMetadataInstance` which can be used to
 * track keyboard interactions and update the timeline accordingly.
 */

export interface UseEditorMetadataInstance {
  /**
   * Handles key down events in the editor.
   *
   * @param event The key down event object.
   * @param action The current action being performed on the timeline.
   */
  onKeyDown: (event: any, action: ITimelineAction) => void;
}

export interface UseEditorMetadataParameters {
  /**
   * The editor file object.
   */
  file?: EditorFile;
  /**
   * The URL of the editor file.
   */
  url?: string;
}

/**
 * Defaultized parameters for `UseEditorMetadata`.
 *
 * @see UseEditorMetadataParameters
 */
export type UseEditorMetadataDefaultizedParameters = DefaultizedProps<
  UseEditorMetadataParameters, 'file' | 'url'
>;

/**
 * Signature for `UseEditorMetadata`.
 *
 * @param params The metadata parameters.
 * @param defaultizedParams The defaultized metadata parameters.
 * @param instance The metadata instance.
 * @param contextValue The context value of the metadata.
 * @param dependencies The dependencies required by the hook.
 */
export type UseEditorMetadataSignature = EditorPluginSignature<{
  params: UseEditorMetadataParameters;
  defaultizedParams: UseEditorMetadataDefaultizedParameters;
  instance: UseEditorMetadataInstance;
  contextValue: UseEditorMetadataDefaultizedParameters;
  dependencies: [UseEditorKeyboardSignature];
}>;