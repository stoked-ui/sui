/**
 * Import video editor core plugins and their signatures.
 */
export { VIDEO_EDITOR_CORE_PLUGINS } from './corePlugins';

/**
 * Exported types for Editor Core Plugin Signatures and Parameters.
 *
 * @interface EditorCorePluginSignatures
 * @property {string} [signatures] - Signatures of the plugin.
 * @property {object} [parameters] - Parameters of the plugin.
 */
export type { EditorCorePluginSignatures, EditorCorePluginParameters } from './corePlugins';