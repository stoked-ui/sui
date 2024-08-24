// import { IncGenerator } from '@stoked-ui/media-selector';
import { EditorPlugin } from '../../models';
import {
  UseEditorMetadataSignature,
} from './useEditorMetadata.types';
import {useId} from "react";

//const [actionId] = IncGenerator('action');
//const [trackId] = IncGenerator('track')

export const useEditorMetadata: EditorPlugin<UseEditorMetadataSignature> = ({
  params,
  instance
}) => {
  params.tracks.forEach((track) => {
    track.actions.forEach((action) => {
      action.onKeyDown = (event: any, id: string) => {
        console.log('on key down', action);
        instance.handleItemKeyDown(event, 'action', action)
      }
    })
  })
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
      const actionGenId = useId();
      action = {
        ...action,
        name: action.name ?? actionGenId,
        data: action.data,
        id: action.id ?? actionGenId,
      }

      const trackGenId = useId()
      return {
        id: trackGenId,
        name: action.name ?? trackGenId,
        actions: [action],
        hidden: false,
        lock: false
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
