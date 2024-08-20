import { IdGenerator } from '@stoked-ui/media-selector';
import { EditorPlugin } from '../../models';

import {
  UseEditorMetadataSignature,
} from './useEditorMetadata.types';

export const useEditorMetadata: EditorPlugin<UseEditorMetadataSignature> = ({
  params,
}) => {

  return {
    contextValue: {
      tracks: params.tracks,
      actions: params.actions,
    },
  };
};

useEditorMetadata.getDefaultizedParams = (params) => {
  if (!params.tracks && params.actions) {
    params.tracks = params.actions.map((action) => {
      const actionId = IdGenerator().id(`action${ action.name ? `-${action.name}` : ''}`, 5)
      action = {
        ...action,
        name: action.name ?? actionId,
        data: {
          src: action.data.src
        },
        id: action.id ?? actionId,
      }

      const trackId = IdGenerator().id(`track`, 5)
      return {
        id: trackId,
        name: action.name ?? trackId,
        actions: [action],
      };
    });

  }
  return {
    ...params,
    actions: params.actions ?? [],
    tracks: params.tracks ?? [],
  };
}

useEditorMetadata.params = {
  tracks: true,
  actions: true,
};
