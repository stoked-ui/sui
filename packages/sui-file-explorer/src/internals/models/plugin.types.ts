/**
 * Typescript/JavaScript file for defining various plugin signatures for File Explorer.
 * Contains types for plugin signatures, minimal plugins, optional plugins, and events.
 */

import * as React from "react";

/**
 * Signature for a plugin in File Explorer with any properties.
 */
export type FileExplorerAnyPluginSignature = {
  state: any;
  instance: any;
  params: any;
  defaultizedParams: any;
  dependencies: any;
  optionalDependencies: any;
  events: any;
  contextValue: any;
  slots: any;
  slotProps: any;
  models: any;
  experimentalFeatures: any;
  publicAPI: any;
};

/**
 * Type for a minimal plugin that `useFile` requires in File Explorer view.
 */
export type UseMinimalPlus<TSignatures extends FileExplorerAnyPluginSignature> = [...UseMinimalPlugins, TSignatures]

/**
 * Array type for minimal plugins required by `useFile` in File Explorer view.
 */
export type UseMinimalPlugins = [
  UseFileExplorerSelectionSignature,
  UseFileExplorerExpansionSignature,
  UseFileExplorerFilesSignature,
  UseFileExplorerFocusSignature,
  UseFileExplorerKeyboardNavigationSignature,
  UseFileExplorerGridSignature,
  UseFileExplorerDndSignature
];

/**
 * Array type for optional plugins that `useFile` can use if present but not required.
 */
export type UseMinimalOptionalPlugins = [];

/**
 * Array type for minimal plugins required by `useFile` in File Explorer view.
 */
export type UseFileMinimalPlugins = readonly [
  UseFileExplorerSelectionSignature,
  UseFileExplorerExpansionSignature,
  UseFileExplorerFilesSignature,
  UseFileExplorerFocusSignature,
  UseFileExplorerKeyboardNavigationSignature,
  UseFileExplorerGridSignature,
  UseFileExplorerDndSignature,
];

/**
 * Array type for optional plugins that `useFile` can use if present but not required.
 */
export type UseFileOptionalPlugins = readonly [];

/**
 * Signature for events that plugins in File Explorer can emit.
 */
export type UseFileExplorerPluginEvents = {
  [eventName: string]: Record<string, any>;
};

/**
 * Signature for a specific type of plugin in File Explorer with customizable properties.
 */
export type FileExplorerPluginSignature<
  T extends {
    params?: {};
    defaultizedParams?: {};
    instance?: {};
    publicAPI?: {};
    events?: { [key in keyof T['events']]: FileExplorerEventLookupElement };
    state?: {};
    contextValue?: {};
    slots?: { [key in keyof T['slots']]: React.ElementType };
    slotProps?: { [key in keyof T['slotProps']]: {} | (() => {}) };
    modelNames?: keyof T['defaultizedParams'];
    experimentalFeatures?: string;
    dependencies?: readonly FileExplorerAnyPluginSignature[];
    optionalDependencies?: readonly FileExplorerAnyPluginSignature[];
  },
> = {
  params: T extends { params: {} } ? T['params'] : {};
  defaultizedParams: T extends { defaultizedParams: {} } ? T['defaultizedParams'] : {};
  instance: T extends { instance: {} } ? T['instance'] : {};
  publicAPI: T extends { publicAPI: {} } ? T['publicAPI'] : {};
  events: T extends { events: {} } ? T['events'] : {};
  state: T extends { state: {} } ? T['state'] : {};
  contextValue: T extends { contextValue: {} } ? T['contextValue'] : {};
  slots: T extends { slots: {} } ? T['slots'] : {};
  slotProps: T extends { slotProps: {} } ? T['slotProps'] : {};
  models: T extends {
    defaultizedParams: {};
    modelNames: keyof T['defaultizedParams'];
  }
    ? {
        [TControlled in T['modelNames']]-?: FileExplorerModel<
          Exclude<T['defaultizedParams'][TControlled], undefined>
        >;
      }
    : {};
  experimentalFeatures: T extends { experimentalFeatures: string }
    ? { [key in T['experimentalFeatures']]?: boolean }
    : {};
  dependencies: T extends { dependencies: Array<any> } ? T['dependencies'] : [];
  optionalDependencies: T extends { optionalDependencies: Array<any> }
    ? T['optionalDependencies']
    : [];
};