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
    console.info('on key down', action);
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

useEditorMetadata.getDefaultizedParams = (params) => {
  return {
    ...params,
  } as UseEditorMetadataDefaultizedParameters;
}

useEditorMetadata.params = {
  file: true,
  url: true,
};

