import type { ITimelineAction, ITimelineTrack } from '@stoked-ui/timeline';
import EditorFile from '../../../Editor/EditorFile';
import type {DefaultizedProps, EditorPluginSignature} from '../../models';
import {
  UseEditorKeyboardSignature
} from '../useEditorKeyboard';

export interface UseEditorMetadataInstance {
  onKeyDown: (event: any, action: ITimelineAction) => void;
}

export interface UseEditorMetadataParameters {
  file?: EditorFile;
  url?: string;
}

export type UseEditorMetadataDefaultizedParameters = DefaultizedProps<
  UseEditorMetadataParameters, 'file' | 'url'
>;

export type UseEditorMetadataSignature = EditorPluginSignature<{
  params: UseEditorMetadataParameters;
  defaultizedParams: UseEditorMetadataDefaultizedParameters;
  instance: UseEditorMetadataInstance;
  contextValue: UseEditorMetadataDefaultizedParameters;
  dependencies: [UseEditorKeyboardSignature];
}>;
