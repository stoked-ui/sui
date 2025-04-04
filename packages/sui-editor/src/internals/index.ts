/**
 * Editor module exports.
 *
 * This module provides the core functionality for an editor, including plugins and utilities.
 */
export { useEditor } from './useEditor';
export { EditorProvider } from './EditorProvider';

/**
 * Editor plugin types and interfaces.
 *
 * These define the shapes of the editor plugins and their usage.
 */
export type {
  /**
   * A plugin that can be used in the editor.
   */
  EditorPlugin,
  /**
   * The signature of an editor plugin.
   */
  EditorPluginSignature,
  /**
   * Function to convert existing plugins into signatures.
   *
   * @param {Array<EditorPlugin>} plugins
   * @returns {Object} The converted signatures.
   */
  ConvertPluginsIntoSignatures,
  /**
   * Property merger for the editor public API.
   *
   * @param {Object} properties
   * @returns {Object} The merged properties.
   */
  MergeSignaturesProperty,
  /**
   * Editor public API.
   */
  EditorPublicAPI,
  /**
   * Experimental features for the editor.
   */
  EditorExperimentalFeatures,
} from './models';

/**
 * Core plugin parameters.
 *
 * These define the settings and options for core plugins.
 */
export type { EditorCorePluginParameters } from './corePlugins';

/**
 * Plugin to get metadata for an editor.
 *
 * This plugin provides a way to retrieve metadata about an editor.
 */
export { useEditorMetadata } from './plugins/useEditorMetadata';
/**
 * Signature of the editor metadata plugin.
 *
 * @param {Object} parameters
 * @returns {Object} The signature.
 */
export type {
  /**
   * Parameters for the editor metadata plugin.
   */
  UseEditorMetadataSignature,
  /**
   * Options and settings for the editor metadata plugin.
   */
  UseEditorMetadataParameters,
};

/**
 * Function to build a warning message.
 *
 * This function generates a warning message based on the provided options.
 *
 * @param {Object} options
 * @returns {string} The generated warning message.
 */
export { buildWarning } from './utils/warning';