import { useFileExplorerInstanceEvents } from './useFileExplorerInstanceEvents';
import { useFileExplorerId, UseFileExplorerIdParameters } from './useFileExplorerId';
import { ConvertPluginsIntoSignatures } from '../models';

/**
 * Internal plugins that create the tools used by the other plugins.
 * These plugins are used by the fileExplorer view components.
 */
export const FILE_EXPLORER_VIEW_CORE_PLUGINS = [useFileExplorerInstanceEvents, useFileExplorerId] as const;

/**
 * Type representing the signatures of core plugins used in the file explorer.
 */
export type FileExplorerCorePluginSignatures = ConvertPluginsIntoSignatures<typeof FILE_EXPLORER_VIEW_CORE_PLUGINS>;

/**
 * Interface defining the parameters for file explorer core plugins.
 */
export interface FileExplorerCorePluginParameters extends UseFileExplorerIdParameters {}