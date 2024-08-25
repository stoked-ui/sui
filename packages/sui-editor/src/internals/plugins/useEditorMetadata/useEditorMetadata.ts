import * as React from "react";
import { EditorPlugin } from '../../models';
import {
  UseEditorMetadataDefaultizedParameters, UseEditorMetadataSignature,
} from './useEditorMetadata.types';
import {buildTracks} from "../../utils/TrackBuilder";


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
      actionData: params.actionData
    },
  };
};

useEditorMetadata.getDefaultizedParams = (params) => {
  return {
    ...params,
    actionData: params.actionData ?? [],
    actions: params.actions ?? [],
    tracks: buildTracks(params),
  } as UseEditorMetadataDefaultizedParameters;
}

useEditorMetadata.params = {
  tracks: true,
  actions: true,
  actionData: true,
};
