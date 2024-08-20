import * as React from 'react';
import { TimelineTrack, ITimelineAction } from '@stoked-ui/timeline';
import type { DefaultizedProps, EditorPluginSignature } from '../../models';


export interface UseEditorMetadataParameters {
  tracks?: TimelineTrack[];
  actions?: ITimelineAction[];
}

export type UseEditorMetadataDefaultizedParameters = DefaultizedProps<
  UseEditorMetadataParameters, 'tracks' | 'actions'
>;

export type UseEditorMetadataSignature = EditorPluginSignature<{
  params: UseEditorMetadataParameters;
  defaultizedParams: UseEditorMetadataDefaultizedParameters;
  contextValue: UseEditorMetadataDefaultizedParameters;
  dependencies: [];
}>;
