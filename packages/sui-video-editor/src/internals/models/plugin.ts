import * as React from 'react';
import { EventHandlers } from '@mui/base/utils';
import { VideoEditorExperimentalFeatures, VideoEditorModel } from './videoEditor';
import type { MergeSignaturesProperty, OptionalIfEmpty } from './helpers';
import { VideoEditorEventLookupElement } from './events';
import type { VideoEditorCorePluginSignatures } from '../corePlugins';

export interface VideoEditorPluginOptions<TSignature extends VideoEditorAnyPluginSignature> {
  instance: VideoEditorUsedInstance<TSignature>;
  params: VideoEditorUsedDefaultizedParams<TSignature>;
  state: VideoEditorUsedState<TSignature>;
  slots: TSignature['slots'];
  slotProps: TSignature['slotProps'];
  experimentalFeatures: VideoEditorUsedExperimentalFeatures<TSignature>;
  models: VideoEditorUsedModels<TSignature>;
  setState: React.Dispatch<React.SetStateAction<VideoEditorUsedState<TSignature>>>;
  rootRef: React.RefObject<HTMLDivElement>;
  plugins: VideoEditorPlugin<VideoEditorAnyPluginSignature>[];
}

type VideoEditorModelsInitializer<TSignature extends VideoEditorAnyPluginSignature> = {
  [TControlled in keyof TSignature['models']]: {
    getDefaultValue: (
      params: TSignature['defaultizedParams'],
    ) => Exclude<TSignature['defaultizedParams'][TControlled], undefined>;
  };
};

type VideoEditorResponse<TSignature extends VideoEditorAnyPluginSignature> = {
  getRootProps?: <TOther extends EventHandlers = {}>(
    otherHandlers: TOther,
  ) => React.HTMLAttributes<HTMLDivElement>;
} & OptionalIfEmpty<'publicAPI', TSignature['publicAPI']> &
  OptionalIfEmpty<'instance', TSignature['instance']> &
  OptionalIfEmpty<'contextValue', TSignature['contextValue']>;

export type VideoEditorPluginSignature<
  T extends {
    params?: {};
    defaultizedParams?: {};
    instance?: {};
    publicAPI?: {};
    events?: { [key in keyof T['events']]: VideoEditorEventLookupElement };
    state?: {};
    contextValue?: {};
    slots?: { [key in keyof T['slots']]: React.ElementType };
    slotProps?: { [key in keyof T['slotProps']]: {} | (() => {}) };
    modelNames?: keyof T['defaultizedParams'];
    experimentalFeatures?: string;
    dependencies?: readonly VideoEditorAnyPluginSignature[];
    optionalDependencies?: readonly VideoEditorAnyPluginSignature[];
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
      [TControlled in T['modelNames']]-?: VideoEditorModel<
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

export type VideoEditorAnyPluginSignature = {
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

type VideoEditorRequiredPlugins<TSignature extends VideoEditorAnyPluginSignature> = [
  ...VideoEditorCorePluginSignatures,
  ...TSignature['dependencies'],
];

type PluginPropertyWithDependencies<
  TSignature extends VideoEditorAnyPluginSignature,
  TProperty extends keyof VideoEditorAnyPluginSignature,
> = TSignature[TProperty] &
  MergeSignaturesProperty<VideoEditorRequiredPlugins<TSignature>, TProperty> &
  Partial<MergeSignaturesProperty<TSignature['optionalDependencies'], TProperty>>;

export type VideoEditorUsedParams<TSignature extends VideoEditorAnyPluginSignature> =
  PluginPropertyWithDependencies<TSignature, 'params'>;

type VideoEditorUsedDefaultizedParams<TSignature extends VideoEditorAnyPluginSignature> =
  PluginPropertyWithDependencies<TSignature, 'defaultizedParams'>;

export type VideoEditorUsedInstance<TSignature extends VideoEditorAnyPluginSignature> =
  PluginPropertyWithDependencies<TSignature, 'instance'> & {
  /**
   * Private property only defined in TypeScript to be able to access the plugin signature from the instance object.
   */
  $$signature: TSignature;
};

type VideoEditorUsedState<TSignature extends VideoEditorAnyPluginSignature> =
  PluginPropertyWithDependencies<TSignature, 'state'>;

type VideoEditorUsedExperimentalFeatures<TSignature extends VideoEditorAnyPluginSignature> =
  VideoEditorExperimentalFeatures<[TSignature, ...TSignature['dependencies']]>;

type RemoveSetValue<Models extends Record<string, VideoEditorModel<any>>> = {
  [K in keyof Models]: Omit<Models[K], 'setValue'>;
};

export type VideoEditorUsedModels<TSignature extends VideoEditorAnyPluginSignature> =
  TSignature['models'] &
  RemoveSetValue<MergeSignaturesProperty<VideoEditorRequiredPlugins<TSignature>, 'models'>>;

export type VideoEditorUsedEvents<TSignature extends VideoEditorAnyPluginSignature> =
  TSignature['events'] & MergeSignaturesProperty<VideoEditorRequiredPlugins<TSignature>, 'events'>;

export interface VideoPluginOptions<TProps extends {}> extends VideoPluginResponse {
  props: TProps;
}

export interface VideoPluginResponse {
  /**
   * Root of the `content` slot enriched by the plugin.
   */
  contentRef?: React.RefCallback<HTMLElement> | null;
  /**
   * Ref of the `root` slot enriched by the plugin
   */
  rootRef?: React.RefCallback<HTMLDivElement> | null;
}

export type VideoPlugin<TProps extends {}> = (
  options: VideoPluginOptions<TProps>,
) => VideoPluginResponse;


export type VideoEditorPlugin<TSignature extends VideoEditorAnyPluginSignature> = {
  (options: VideoEditorPluginOptions<TSignature>): VideoEditorResponse<TSignature>;
  getDefaultizedParams?: (
    params: VideoEditorUsedParams<TSignature>,
  ) => TSignature['defaultizedParams'];
  getInitialState?: (params: VideoEditorUsedDefaultizedParams<TSignature>) => TSignature['state'];
  models?: VideoEditorModelsInitializer<TSignature>;
  params: Record<keyof TSignature['params'], true>;
  itemPlugin?: VideoPlugin<any>;
};
