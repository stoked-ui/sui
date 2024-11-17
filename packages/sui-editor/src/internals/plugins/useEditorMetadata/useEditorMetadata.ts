import { ITimelineAction } from '@stoked-ui/timeline';
import { getFileName } from '@stoked-ui/media-selector';
import {
  UseEditorMetadataDefaultizedParameters, UseEditorMetadataParameters, UseEditorMetadataSignature,
} from './useEditorMetadata.types';
import {EditorPlugin} from '../../models';
import EditorFile from '../../../EditorFile/EditorFile';

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
      file: new EditorFile({ name: 'new video'}),
      url: '',
    };
  }
  let { file, url = '' } = params;

  if (url.length && !file) {
    return {
      file: new EditorFile({ name: getFileName(url, false) ?? 'new video', url }),
      url,
    }
  }

  return { file: file ?? new EditorFile({ name: 'new video'}), url };
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
