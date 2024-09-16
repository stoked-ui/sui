import { ITimelineAction, type ITimelineActionInput } from '@stoked-ui/timeline/TimelineAction';
import { namedId, getFileName } from '@stoked-ui/media-selector';
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

function initializeActionData(actionData: ITimelineActionInput[] | undefined) {
  if (!actionData) {
    return undefined;
  }
  actionData.forEach((action) => {
    action.id = namedId('action')
    action.name = getFileName(action.src, true) ?? action.id;
  })
  return actionData;
}
useEditorMetadata.getDefaultizedParams = (params) => {
  return {
    ...params,
    actionData: initializeActionData(params.actionData) ?? [],
    actions: params.actions ?? [],
    tracks: params.tracks ?? [],
  } as UseEditorMetadataDefaultizedParameters;
}

useEditorMetadata.params = {
  tracks: true,
  actions: true,
  actionData: true,
};
