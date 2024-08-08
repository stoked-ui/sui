import { useFileExplorerInstanceEvents } from './useFileExplorerInstanceEvents';
import { useFileExplorerId, UseFileExplorerIdParameters } from './useFileExplorerId';
import { ConvertPluginsIntoSignatures } from '../models';

/**
 * Internal plugins that create the tools used by the other plugins.
 * These plugins are used by the fileExplorer view components.
 */
export const FILE_EXPLORER_VIEW_CORE_PLUGINS = [useFileExplorerInstanceEvents, useFileExplorerId] as const;

export type FileExplorerCorePluginSignatures = ConvertPluginsIntoSignatures<
  typeof FILE_EXPLORER_VIEW_CORE_PLUGINS
>;

export interface FileExplorerCorePluginParameters extends UseFileExplorerIdParameters {}
