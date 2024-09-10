import { ITimelineAction } from '@stoked-ui/timeline/TimelineAction';
import {
  UseEditorMetadataDefaultizedParameters, UseEditorMetadataSignature,
} from './useEditorMetadata.types';
import {EditorPlugin} from '../../models';

export const useEditorMetadata: EditorPlugin<UseEditorMetadataSignature> = ({
  params,

}) => {
  const onKeyDown = (event: any, action: ITimelineAction) => {
    console.log('on key down', action);
  };

  return {
    contextValue: {
      tracks: params.tracks,
      actions: params.actions,
      actionData: params.actionData
    },
    instance: {
      onKeyDown
    }
  };
};

useEditorMetadata.getDefaultizedParams = (params) => {
  return {
    ...params,
    actionData: params.actionData ?? [],
    actions: params.actions ?? [],
    tracks: params.tracks ?? [],
  } as UseEditorMetadataDefaultizedParameters;
}

useEditorMetadata.params = {
  tracks: true,
  actions: true,
  actionData: true,
};
