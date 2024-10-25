import { ITimelineAction, type ITimelineFileAction, ITimelineFile, TimelineFile } from '@stoked-ui/timeline';
import { namedId, getFileName, useIncId,  } from '@stoked-ui/media-selector';
import {
  UseEditorMetadataDefaultizedParameters, UseEditorMetadataParameters, UseEditorMetadataSignature,
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
      file: params.file,
      url: params.url
    },
    instance: {
      onKeyDown
    }
  };
};

function initialize(params?: UseEditorMetadataParameters): UseEditorMetadataDefaultizedParameters {
  if (!params) {
    return {
      file: new TimelineFile({ name: 'new video'}),
      url: '',
      tracks: [],
      actions: []
    };
  }
  let { file, url = '', tracks = [], actions = [] } = params;

  actions.forEach((action) => {
    if (!action.name) {
      action.name = getFileName(action.src, false) ?? action.id!;
    }
  })

  if (file) {
    return { file, url, tracks, actions };
  }

  if (url.length) {
    return {
      file: new TimelineFile({ name: 'new video', src: url}),
      url,
      tracks,
      actions
    }
  }

  return { file: {} as TimelineFile, url, tracks, actions};
}

useEditorMetadata.getDefaultizedParams = (params) => {
  return {
    ...params,
    ...(initialize(params))
  } as UseEditorMetadataDefaultizedParameters;
}

useEditorMetadata.params = {
  tracks: true,
  actions: true,
  file: true,
  url: true,
};
