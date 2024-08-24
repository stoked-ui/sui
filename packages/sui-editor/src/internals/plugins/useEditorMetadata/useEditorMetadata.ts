import * as React from "react";
import { EditorPlugin } from '../../models';
import {
  UseEditorMetadataSignature,
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
    },
  };
};

useEditorMetadata.getDefaultizedParams = (params) => {
  console.log('tracks', params.tracks, 'actions', params.actions);
  if ((!params.tracks || params.tracks?.length === 0) && params.actions) {
    params.tracks = buildTracks(params.actions);
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
