import * as React from 'react';
import { EventHandlers } from '@mui/base/utils';
import {
  FileExplorerExperimentalFeatures,
  FileExplorerInstance,
  FileExplorerModel,
  FileMeta
} from './fileExplorerView';
import type { MergeSignaturesProperty, OptionalIfEmpty } from './helpers';
import type { FileExplorerCorePluginSignatures } from '../corePlugins';
import { FileId } from '../../models';
import type { UseFileStatus } from "./UseFileStatus";
import type { FileProps } from "../../File/File.types";
import { FileExplorerAnyPluginSignature, UseMinimalPlugins } from "./plugin.types";

export interface FileExplorerPluginOptions<TSignature extends FileExplorerAnyPluginSignature> {
  instance: FileExplorerUsedInstance<TSignature>;
  params: FileExplorerUsedDefaultizedParams<TSignature>;
  state: FileExplorerUsedState<TSignature>;
  slots: TSignature['slots'];
  slotProps: TSignature['slotProps'];
  experimentalFeatures: FileExplorerUsedExperimentalFeatures<TSignature>;
  models: FileExplorerUsedModels<TSignature>;
  setState: React.Dispatch<React.SetStateAction<FileExplorerUsedState<TSignature>>>;
  rootRef: React.RefObject<HTMLUListElement>;
}

type FileExplorerModelsInitializer<TSignature extends FileExplorerAnyPluginSignature> = {
  [TControlled in keyof TSignature['models']]: {
    getDefaultValue: (
      params: TSignature['defaultizedParams'],
    ) => Exclude<TSignature['defaultizedParams'][TControlled], undefined>;
  };
};

type FileExplorerResponse<TSignature extends FileExplorerAnyPluginSignature> = {
  getRootProps?: <TOther extends EventHandlers = {}>(
    otherHandlers: TOther,
  ) => React.HTMLAttributes<HTMLUListElement>;
} & OptionalIfEmpty<'publicAPI', TSignature['publicAPI']> &
  OptionalIfEmpty<'instance', TSignature['instance']> &
  OptionalIfEmpty<'contextValue', TSignature['contextValue']>;


type FileExplorerRequiredPlugins<TSignature extends FileExplorerAnyPluginSignature> = [
  ...FileExplorerCorePluginSignatures,
  ...TSignature['dependencies'],
];

type PluginPropertyWithDependencies<
  TSignature extends FileExplorerAnyPluginSignature,
  TProperty extends keyof FileExplorerAnyPluginSignature,
> = TSignature[TProperty] &
  MergeSignaturesProperty<FileExplorerRequiredPlugins<TSignature>, TProperty> &
  Partial<MergeSignaturesProperty<TSignature['optionalDependencies'], TProperty>>;

export type FileExplorerUsedParams<TSignature extends FileExplorerAnyPluginSignature> =
  PluginPropertyWithDependencies<TSignature, 'params'>;

type FileExplorerUsedDefaultizedParams<TSignature extends FileExplorerAnyPluginSignature> =
  PluginPropertyWithDependencies<TSignature, 'defaultizedParams'>;

export type FileExplorerUsedInstance<TSignature extends FileExplorerAnyPluginSignature> =
  PluginPropertyWithDependencies<TSignature, 'instance'> & {
    /**
     * Private property only defined in TypeScript to be able to access the plugin signature from the instance object.
     */
    $$signature: TSignature;
  };

type FileExplorerUsedState<TSignature extends FileExplorerAnyPluginSignature> =
  PluginPropertyWithDependencies<TSignature, 'state'>;

type FileExplorerUsedExperimentalFeatures<TSignature extends FileExplorerAnyPluginSignature> =
  FileExplorerExperimentalFeatures<[TSignature, ...TSignature['dependencies']]>;

type RemoveSetValue<Models extends Record<string, FileExplorerModel<any>>> = {
  [K in keyof Models]: Omit<Models[K], 'setValue'>;
};

export type FileExplorerUsedModels<TSignature extends FileExplorerAnyPluginSignature> =
  TSignature['models'] &
    RemoveSetValue<MergeSignaturesProperty<FileExplorerRequiredPlugins<TSignature>, 'models'>>;

export type FileExplorerUsedEvents<TSignature extends FileExplorerAnyPluginSignature> =
  TSignature['events'] & MergeSignaturesProperty<FileExplorerRequiredPlugins<TSignature>, 'events'>;

export interface FilePluginOptions<TSignatures extends FileExplorerAnyPluginSignature[] = UseMinimalPlugins, TProps extends {} = FileMeta & FileProps> extends FilePluginResponse {
  props: TProps;
  instance: FileExplorerInstance<TSignatures>;
}

export interface FilePluginResponse {
  /**
   * Root of the `content` slot enriched by the plugin.
   */
  contentRef?: React.RefCallback<HTMLElement> | null;
  /**
   * Ref of the `root` slot enriched by the plugin
   */
  rootRef?: React.RefCallback<HTMLLIElement> | null;

  status?: UseFileStatus | null;
}

export type FilePlugin<TSignatures extends FileExplorerAnyPluginSignature[] = UseMinimalPlugins, TProps extends {} = FileMeta & FileProps> = (
  options: FilePluginOptions<TSignatures, TProps>,
) => void | FilePluginResponse;

export type FileWrapper<TSignatures extends readonly FileExplorerAnyPluginSignature[]> = (params: {
  itemId: FileId;
  children: React.ReactNode;
  instance: FileExplorerInstance<TSignatures>;
}) => React.ReactNode;

export type FileExplorerRootWrapper<TSignatures extends readonly FileExplorerAnyPluginSignature[]> = (params: {
  children: React.ReactNode;
  instance: FileExplorerInstance<TSignatures>;
}) => React.ReactNode;

export type FileExplorerPlugin<TSignature extends FileExplorerAnyPluginSignature> = {
  (options: FileExplorerPluginOptions<TSignature>): FileExplorerResponse<TSignature>;
  getDefaultizedParams?: (
    params: FileExplorerUsedParams<TSignature>,
  ) => TSignature['defaultizedParams'];
  getInitialState?: (params: FileExplorerUsedDefaultizedParams<TSignature>) => TSignature['state'];
  models?: FileExplorerModelsInitializer<TSignature>;
  params: Record<keyof TSignature['params'], true>;
  itemPlugin?: FilePlugin<any[], any>;
  /**
   * Render function used to add React wrappers around the File.
   * @param {{ nodeId: FileId; children: React.ReactNode; }} params The params of the item.
   * @returns {React.ReactNode} The wrapped item.
   */
  wrapItem?: FileWrapper<[TSignature, ...TSignature['dependencies']]>;
  /**
   * Render function used to add React wrappers around the FileExplorer.
   * @param {{ children: React.ReactNode; }} params The params of the root.
   * @returns {React.ReactNode} The wrapped root.
   */
  wrapRoot?: FileExplorerRootWrapper<[TSignature, ...TSignature['dependencies']]>;
};
