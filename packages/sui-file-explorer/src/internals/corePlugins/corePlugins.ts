/**
 * Internal plugins that create the tools used by the other plugins.
 * These plugins are used by the fileExplorer view components.
 */
import {useFileExplorerInstanceEvents} from './useFileExplorerInstanceEvents';
import {useFileExplorerId, UseFileExplorerIdParameters} from './useFileExplorerId';
import {ConvertPluginsIntoSignatures} from '../models';

/**
 * A list of internal plugins that create tools used by other plugins.
 */
export const FILE_EXPLORER_VIEW_CORE_PLUGINS = [useFileExplorerInstanceEvents, useFileExplorerId] as const;

/**
 * Type alias for the signatures of the File Explorer Core Plugin.
 * 
 * @see ConvertPluginsIntoSignatures
 */
export type FileExplorerCorePluginSignatures = ConvertPluginsIntoSignatures<
  typeof FILE_EXPLORER_VIEW_CORE_PLUGINS
>;

/**
 * Interface for parameters used by a File Explorer Core Plugin.
 * Extends UseFileExplorerIdParameters to include additional parameters specific to the File Explorer view components.
 */
export interface FileExplorerCorePluginParameters extends UseFileExplorerIdParameters {}