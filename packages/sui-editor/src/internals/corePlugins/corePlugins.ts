import { useEditorInstanceEvents } from './useEditorInstanceEvents';
import { ConvertPluginsIntoSignatures } from '../models';

/**
 * Internal plugins that create the tools used by the other plugins.
 * These plugins are used by the editor view components.
 */
export const VIDEO_EDITOR_CORE_PLUGINS = [useEditorInstanceEvents] as const;

/**
 * Type definition for EditorCorePluginSignatures, which is a type of ConvertPluginsIntoSignatures
 * with the VideoEditorCorePlugins array as its argument.
 */
export type EditorCorePluginSignatures = ConvertPluginsIntoSignatures<
  typeof VIDEO_EDITOR_CORE_PLUGINS
>;

/**
 * Interface defining the parameters required by an EditorCorePlugin.
 */
export interface EditorCorePluginParameters {}