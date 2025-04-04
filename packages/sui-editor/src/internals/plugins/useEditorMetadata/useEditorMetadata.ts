/**
 * @interface UseEditorMetadataParameters
 * @description Parameters for the useEditorMetadata function.
 */
export interface UseEditorMetadataParameters {
  /**
   * The file to be used for the editor metadata.
   * @type {boolean}
   */
  file?: boolean;
  
  /**
   * The URL of the file to be used for the editor metadata.
   * @type {boolean}
   */
  url?: boolean;
}

/**
 * @interface UseEditorMetadataDefaultizedParameters
 * @description Defaultized parameters for the useEditorMetadata function.
 */
export interface UseEditorMetadataDefaultizedParameters extends UseEditorMetadataParameters {
  /**
   * The default file and URL values to be used if no other value is provided.
   * @type {boolean}
   */
  [key: string]: boolean;
}

/**
 * @interface UseEditorMetadataSignature
 * @description Signature for the useEditorMetadata function.
 */
export interface UseEditorMetadataSignature {
  /**
   * The parameters for the useEditorMetadata function.
   * @type {UseEditorMetadataParameters}
   */
  params: UseEditorMetadataParameters;

  /**
   * The context value for the useEditorMetadata function.
   * @type {object}
   */
  contextValue: object;
}

/**
 * @class EditorPlugin
 * @description A plugin that provides metadata for an editor.
 * @implements {UseEditorMetadataSignature}
 */
export class EditorPlugin<UseEditorMetadataSignature> {
  /**
   * The defaultized parameters for the useEditorMetadata function.
   * @type {UseEditorMetadataDefaultizedParameters}
   */
  static getDefaultizedParams = (params: UseEditorMetadataParameters): UseEditorMetadataDefaultizedParameters => {
    return {
      ...params,
    } as UseEditorMetadataDefaultizedParameters;
  }

  /**
   * The context value for the useEditorMetadata function.
   * @type {object}
   */
  static params: UseEditorMetadataParameters = {
    file: true,
    url: true,
  };

  constructor(params: UseEditorMetadataSignature) {}

  /**
   * An event handler for key down events.
   * @param {any} event - The key down event.
   * @param {ITimelineAction} action - The timeline action.
   */
  onKeyDown = (event: any, action: ITimelineAction): void => {
    console.info('on key down', action);
  }
}

/**
 * @function useEditorMetadata
 * @description A function that provides metadata for an editor.
 * @param {UseEditorMetadataSignature} params - The parameters for the useEditorMetadata function.
 */
export const useEditorMetadata: EditorPlugin<UseEditorMetadataSignature> = ({
  params,

}) => {
  return {
    /**
     * The context value for the useEditorMetadata function.
     * @type {object}
     */
    contextValue: {
      file: params.file,
      url: params.url
    },
    /**
     * An event handler for key down events.
     * @param {any} event - The key down event.
     * @param {ITimelineAction} action - The timeline action.
     */
    instance: {
      onKeyDown
    }
  };
};