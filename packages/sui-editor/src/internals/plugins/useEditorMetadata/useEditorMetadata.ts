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
      file: params.file,
      url: params.url
    },
    instance: {
      onKeyDown
    }
  };
};

function initialize(params?: UseEditorMetadataParameters): UseEditorMetadataDefaultizedParameters {
  if (!params || (!params.file && !params.url)) {
    return {
      file: new TimelineFile({ name: 'new video'}),
      url: '',
    };
  }
  let { file, url = '' } = params;

  if (url.length && !file) {
    return {
      file: new TimelineFile({ name: getFileName(url, false) ?? 'new video', src: url}),
      url,
    }
  }

  return { file: file ?? new TimelineFile({ name: 'new video'}), url };
}

useEditorMetadata.getDefaultizedParams = (params) => {
  return {
    ...params,
    ...(initialize(params))
  } as UseEditorMetadataDefaultizedParameters;
}

useEditorMetadata.params = {
  file: true,
  url: true,
};
