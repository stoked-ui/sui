/**
 * Exports the `useEditorMetadata` hook from the `./useEditorMetadata` module.
 */
export { useEditorMetadata } from './useEditorMetadata';

/**
 * Type definitions for the `UseEditorMetadataSignature`, 
 * `UseEditorMetadataParameters`, and `UseEditorMetadataDefaultizedParameters`.
 */

/**
 * The signature of the `useEditorMetadata` hook.
 */
export type UseEditorMetadataSignature = {
  /**
   * A function that returns the editor metadata.
   */
  editorMetadata: () => any;
};

/**
 * The parameters for the `useEditorMetadata` hook.
 */
export type UseEditorMetadataParameters = {
  /**
   * An object containing additional metadata.
   */
  extraMetadata?: Object;
};

/**
 * Defaultized parameters for the `useEditorMetadata` hook.
 */
export type UseEditorMetadataDefaultizedParameters = {
  /**
   * A set of default values for the hook's parameters.
   */
  defaults: Object;
};