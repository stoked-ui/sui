import { useVideoEditorInstanceEvents } from './useVideoEditorInstanceEvents';
import { ConvertPluginsIntoSignatures } from '../models';

/**
 * Internal plugins that create the tools used by the other plugins.
 * These plugins are used by the fileExplorer view components.
 */
export const VIDEO_EDITOR_CORE_PLUGINS = [useVideoEditorInstanceEvents] as const;

export type VideoEditorCorePluginSignatures = ConvertPluginsIntoSignatures<
  typeof VIDEO_EDITOR_CORE_PLUGINS
>;

export interface VideoEditorCorePluginParameters {}
