import { ITimelineAction } from '@stoked-ui/timeline';
import { getFileName } from '@stoked-ui/media-selector';
import {
  UseEditorMetadataDefaultizedParameters, UseEditorMetadataParameters, UseEditorMetadataSignature,
} from './useEditorMetadata.types';
import { EditorPlugin } from '../../models';
import EditorFile from '../../../EditorFile/EditorFile';

/**
 * Function to manage editor metadata.
 * @param {UseEditorMetadataParameters} props - Parameters for editor metadata.
 * @returns {EditorPlugin<UseEditorMetadataSignature>} - Editor plugin with metadata functionality.
 */
export const useEditorMetadata: EditorPlugin<UseEditorMetadataSignature> = ({
  params,
}) => {
  /**
   * Handles key down event.
   * @param {any} event - The event object.
   * @param {ITimelineAction} action - The timeline action.
   */
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

/**
 * Retrieve defaultized parameters for editor metadata.
 * @param {UseEditorMetadataParameters} params - Parameters for editor metadata.
 * @returns {UseEditorMetadataDefaultizedParameters} - Defaultized parameters for editor metadata.
 */
useEditorMetadata.getDefaultizedParams = (params) => {
  return {
    ...params,
  } as UseEditorMetadataDefaultizedParameters;
}

/**
 * Parameters for editor metadata plugin.
 * @property {boolean} file - Indicator for file parameter.
 * @property {boolean} url - Indicator for URL parameter.
 */
useEditorMetadata.params = {
  file: true,
  url: true,
};