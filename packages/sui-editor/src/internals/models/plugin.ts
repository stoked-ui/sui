import * as React from 'react';
import {EventHandlers} from '@mui/base/utils';
import {EditorExperimentalFeatures, EditorModel} from './editor';
import type {MergeSignaturesProperty, OptionalIfEmpty} from './helpers';
import {EditorEventLookupElement} from './events';
import type {EditorCorePluginSignatures} from '../corePlugins';

export interface EditorPluginOptions<TSignature extends EditorAnyPluginSignature> {
  instance: EditorUsedInstance<TSignature>;
  params: EditorUsedDefaultizedParams<TSignature>;
  state: EditorUsedState<TSignature>;
  slots: TSignature['slots'];
  slotProps: TSignature['slotProps'];
  experimentalFeatures: EditorUsedExperimentalFeatures<TSignature>;
  models: EditorUsedModels<TSignature>;
  setState: React.Dispatch<React.SetStateAction<EditorUsedState<TSignature>>>;
  rootRef: React.RefObject<HTMLDivElement>;
  plugins: EditorPlugin<EditorAnyPluginSignature>[];
}

type EditorModelsInitializer<TSignature extends EditorAnyPluginSignature> = {
  [TControlled in keyof TSignature['models']]: {
    getDefaultValue: (
      params: TSignature['defaultizedParams'],
    ) => Exclude<TSignature['defaultizedParams'][TControlled], undefined>;
  };
};

type EditorResponse<TSignature extends EditorAnyPluginSignature> = {
  getRootProps?: <TOther extends EventHandlers = {}>(
    otherHandlers: TOther,
  ) => React.HTMLAttributes<HTMLDivElement>;
} & OptionalIfEmpty<'publicAPI', TSignature['publicAPI']> &
  OptionalIfEmpty<'instance', TSignature['instance']> &
  OptionalIfEmpty<'contextValue', TSignature['contextValue']>;

export type EditorPluginSignature<
  T extends {
    params?: {};
    defaultizedParams?: {};
    instance?: {};
    publicAPI?: {};
    events?: { [key in keyof T['events']]: EditorEventLookupElement };
    state?: {};
    contextValue?: {};
    slots?: { [key in keyof T['slots']]: React.ElementType };
    slotProps?: { [key in keyof T['slotProps']]: {} | (() => {}) };
    modelNames?: keyof T['defaultizedParams'];
    experimentalFeatures?: string;
    dependencies?: readonly EditorAnyPluginSignature[];
    optionalDependencies?: readonly EditorAnyPluginSignature[];
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
      [TControlled in T['modelNames']]-?: EditorModel<
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

export type EditorAnyPluginSignature = {
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

type EditorRequiredPlugins<TSignature extends EditorAnyPluginSignature> = [
  ...EditorCorePluginSignatures,
  ...TSignature['dependencies'],
];

type PluginPropertyWithDependencies<
  TSignature extends EditorAnyPluginSignature,
  TProperty extends keyof EditorAnyPluginSignature,
> = TSignature[TProperty] &
  MergeSignaturesProperty<EditorRequiredPlugins<TSignature>, TProperty> &
  Partial<MergeSignaturesProperty<TSignature['optionalDependencies'], TProperty>>;

export type EditorUsedParams<TSignature extends EditorAnyPluginSignature> =
  PluginPropertyWithDependencies<TSignature, 'params'>;

type EditorUsedDefaultizedParams<TSignature extends EditorAnyPluginSignature> =
  PluginPropertyWithDependencies<TSignature, 'defaultizedParams'>;

export type EditorUsedInstance<TSignature extends EditorAnyPluginSignature> =
  PluginPropertyWithDependencies<TSignature, 'instance'> & {
  /**
   * Private property only defined in TypeScript to be able to access the plugin signature from the
   * instance object.
   */
  $$signature: TSignature;
};

type EditorUsedState<TSignature extends EditorAnyPluginSignature> =
  PluginPropertyWithDependencies<TSignature, 'state'>;

type EditorUsedExperimentalFeatures<TSignature extends EditorAnyPluginSignature> =
  EditorExperimentalFeatures<[TSignature, ...TSignature['dependencies']]>;

type RemoveSetValue<Models extends Record<string, EditorModel<any>>> = {
  [K in keyof Models]: Omit<Models[K], 'setValue'>;
};

export type EditorUsedModels<TSignature extends EditorAnyPluginSignature> =
  TSignature['models'] &
  RemoveSetValue<MergeSignaturesProperty<EditorRequiredPlugins<TSignature>, 'models'>>;

export type EditorUsedEvents<TSignature extends EditorAnyPluginSignature> =
  TSignature['events'] & MergeSignaturesProperty<EditorRequiredPlugins<TSignature>, 'events'>;

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


export type EditorPlugin<TSignature extends EditorAnyPluginSignature> = {
  (options: EditorPluginOptions<TSignature>): EditorResponse<TSignature>;
  getDefaultizedParams?: (
    params: EditorUsedParams<TSignature>,
  ) => TSignature['defaultizedParams'];
  getInitialState?: (params: EditorUsedDefaultizedParams<TSignature>) => TSignature['state'];
  models?: EditorModelsInitializer<TSignature>;
  params: Record<keyof TSignature['params'], true>;
  itemPlugin?: VideoPlugin<any>;
};
