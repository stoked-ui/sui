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
import {FileExplorerEventLookupElement} from "./events";
import {FileExplorerModel} from "./fileExplorerView";

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

export type UseMinimalPlus<TSignatures extends FileExplorerAnyPluginSignature> = [...UseMinimalPlugins, TSignatures]
/**
 * Plugins that need to be present in the FileExplorer View in order for `useFile` to work
 * correctly.
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
 * Plugins that `useFile` can use if they are present, but are not required.
 */
export type UseMinimalOptionalPlugins = [];

/**
 * Plugins that need to be present in the FileExplorer View in order for `useFile` to work
 * correctly.
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
 * Plugins that `useFile` can use if they are present, but are not required.
 */
export type UseFileOptionalPlugins = readonly [];

export type UseFileExplorerPluginEvents = {
  [eventName: string]: Record<string, any>;
};


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
  models: T extends { defaultizedParams: {}; modelNames: keyof T['defaultizedParams'] }
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
