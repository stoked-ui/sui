/**
 * Internal plugins that create the tools used by the other plugins.
 * These plugins are used by the editor view components.
 */
export const VIDEO_EDITOR_CORE_PLUGINS = [useEditorInstanceEvents] as const;

/**
 * Type definition for EditorCorePluginSignatures.
 * Represents the converted plugins into signatures for the video editor core.
 * @typedef {Object} EditorCorePluginSignatures
 * @property {ConvertPluginsIntoSignatures<typeof VIDEO_EDITOR_CORE_PLUGINS>} EditorCorePluginSignatures - Signatures for the video editor core plugins.
 */

/**
 * Interface for EditorCorePluginParameters.
 * Represents the parameters for the editor core plugins.
 */
export interface EditorCorePluginParameters {} 
