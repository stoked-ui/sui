import {ITimelineAction, ITimelineActionInput, ITimelineTrack} from '@stoked-ui/timeline';
import type {DefaultizedProps, EditorPluginSignature} from '../../models';
import {
  UseEditorKeyboardSignature
} from '../useEditorKeyboard';

export interface UseEditorMetadataInstance {
  onKeyDown: (event: any, action: ITimelineAction) => void;
}

export interface UseEditorMetadataParameters {
  tracks?: ITimelineTrack[];
  actions?: ITimelineAction[];
  actionData?: ITimelineActionInput[];
}

export type UseEditorMetadataDefaultizedParameters = DefaultizedProps<
  UseEditorMetadataParameters, 'tracks' | 'actions' | 'actionData'
>;

export type UseEditorMetadataSignature = EditorPluginSignature<{
  params: UseEditorMetadataParameters;
  defaultizedParams: UseEditorMetadataDefaultizedParameters;
  instance: UseEditorMetadataInstance;
  contextValue: UseEditorMetadataDefaultizedParameters;
  dependencies: [UseEditorKeyboardSignature];
}>;
