import * as React from 'react';
import {TimelineTrack, ITimelineAction, ITimelineActionInput} from '@stoked-ui/timeline';
import type { DefaultizedProps, EditorPluginSignature } from '../../models';
import { UseEditorKeyboardSignature } from '../useEditorKeyboard/useEditorKeyboard.types';


export interface UseEditorMetadataParameters {
  tracks?: TimelineTrack[];
  actions?: ITimelineAction[];
  actionData?: ITimelineActionInput[];
}

export type UseEditorMetadataDefaultizedParameters = DefaultizedProps<
  UseEditorMetadataParameters, 'tracks' | 'actions' | 'actionData'
>;

export type UseEditorMetadataSignature = EditorPluginSignature<{
  params: UseEditorMetadataParameters;
  defaultizedParams: UseEditorMetadataDefaultizedParameters;
  contextValue: UseEditorMetadataDefaultizedParameters;
  dependencies: [UseEditorKeyboardSignature];
}>;
