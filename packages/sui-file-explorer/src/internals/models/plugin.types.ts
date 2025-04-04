/**
 * Import required libraries and types.
 */
import * as React from "react";
import type {
  UseFileExplorerExpansionSignature
} from "../plugins/useFileExplorerExpansion/useFileExplorerExpansion.types";
import type {
  UseFileExplorerFocusSignature
} from "../plugins/useFileExplorerFocus/useFileExplorerFocus.types";
import type {
  UseFileExplorerFilesSignature
} from "../plugins/useFileExplorerFiles/useFileExplorerFiles.types";
import type {
  UseFileExplorerKeyboardNavigationSignature
} from "../plugins/useFileExplorerKeyboardNavigation/useFileExplorerKeyboardNavigation.types";
import type {
  UseFileExplorerSelectionSignature
} from "../plugins/useFileExplorerSelection/useFileExplorerSelection.types";
import type {
  UseFileExplorerGridSignature
} from "../plugins/useFileExplorerGrid/useFileExplorerGrid.types";
import type {
  UseFileExplorerDndSignature
} from "../plugins/useFileExplorerDnd/useFileExplorerDnd.types";
import { FileExplorerEventLookupElement } from "./events";
import { FileExplorerModel } from "./fileExplorerView";

/**
 * Define the interface for a plugin signature.
 *
 * @interface FileExplorerPluginSignature
 */
export type FileExplorerPluginSignature<
  T extends {
    /**
     * Parameters passed to the plugin.
     */
    params?: {};

    /**
     * Defaultized parameters passed to the plugin.
     */
    defaultizedParams?: {};

    /**
     * Instance of the plugin.
     */
    instance?: {};

    /**
     * Public API of the plugin.
     */
    publicAPI?: {};

    /**
     * Events emitted by the plugin.
     */
    events?: { [key in keyof T['events']]: FileExplorerEventLookupElement };

    /**
     * State of the plugin.
     */
    state?: {};

    /**
     * Context value of the plugin.
     */
    contextValue?: {};

    /**
     * Slots used by the plugin.
     */
    slots?: { [key in keyof T['slots']]: React.ElementType };

    /**
     * Slot props used by the plugin.
     */
    slotProps?: { [key in keyof T['slotProps']]: {} | (() => {}) };

    /**
     * Model names used by the plugin.
     */
    modelNames?: keyof T['defaultizedParams'];

    /**
     * Experimental features of the plugin.
     */
    experimentalFeatures?: string;

    /**
     * Dependencies of the plugin.
     */
    dependencies?: readonly FileExplorerAnyPluginSignature[];

    /**
     * Optional dependencies of the plugin.
     */
    optionalDependencies?: readonly FileExplorerAnyPluginSignature[];
  },
> = {
  /**
   * Get parameters from the plugin signature.
   *
   * @param T The type of the plugin signature.
   * @returns The parameters of the plugin.
   */
  params: T extends { params: {} } ? T['params'] : {};

  /**
   * Get defaultized parameters from the plugin signature.
   *
   * @param T The type of the plugin signature.
   * @returns The defaultized parameters of the plugin.
   */
  defaultizedParams: T extends { defaultizedParams: {} } ? T['defaultizedParams'] : {};

  /**
   * Get instance from the plugin signature.
   *
   * @param T The type of the plugin signature.
   * @returns The instance of the plugin.
   */
  instance: T extends { instance: {} } ? T['instance'] : {};

  /**
   * Get public API from the plugin signature.
   *
   * @param T The type of the plugin signature.
   * @returns The public API of the plugin.
   */
  publicAPI: T extends { publicAPI: {} } ? T['publicAPI'] : {};

  /**
   * Get events from the plugin signature.
   *
   * @param T The type of the plugin signature.
   * @returns The events emitted by the plugin.
   */
  events: T extends { events: {} } ? T['events'] : {};

  /**
   * Get state from the plugin signature.
   *
   * @param T The type of the plugin signature.
   * @returns The state of the plugin.
   */
  state: T extends { state: {} } ? T['state'] : {};

  /**
   * Get context value from the plugin signature.
   *
   * @param T The type of the plugin signature.
   * @returns The context value of the plugin.
   */
  contextValue: T extends { contextValue: {} } ? T['contextValue'] : {};

  /**
   * Get slots from the plugin signature.
   *
   * @param T The type of the plugin signature.
   * @returns The slots used by the plugin.
   */
  slots: T extends { slots: {} } ? T['slots'] : {};

  /**
   * Get slot props from the plugin signature.
   *
   * @param T The type of the plugin signature.
   * @returns The slot props used by the plugin.
   */
  slotProps: T extends { slotProps: {} } ? T['slotProps'] : {};

  /**
   * Get models from the plugin signature.
   *
   * @param T The type of the plugin signature.
   * @returns The models used by the plugin.
   */
  models: T extends { defaultizedParams: {}; modelNames: keyof T['defaultizedParams']}
    ? {
        [TControlled in T['modelNames']]-?: FileExplorerModel<
          Exclude<T['defaultizedParams'][TControlled], undefined>
        >;
      }
    : {};

  /**
   * Get experimental features from the plugin signature.
   *
   * @param T The type of the plugin signature.
   * @returns The experimental features of the plugin.
   */
  experimentalFeatures: T extends { experimentalFeatures: string }
    ? { [key in T['experimentalFeatures']]?: boolean }
    : {};

  /**
   * Get dependencies from the plugin signature.
   *
   * @param T The type of the plugin signature.
   * @returns The dependencies of the plugin.
   */
  dependencies: T extends { dependencies: Array<any> } ? T['dependencies'] : [];

  /**
   * Get optional dependencies from the plugin signature.
   *
   * @param T The type of the plugin signature.
   * @returns The optional dependencies of the plugin.
   */
  optionalDependencies: T extends { optionalDependencies: Array<any> }
    ? T['optionalDependencies']
    : [];
};