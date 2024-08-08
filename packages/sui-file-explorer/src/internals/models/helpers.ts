import type { FileExplorerPlugin } from './plugin';
import type { FileExplorerAnyPluginSignature } from './plugin.types';

export type DefaultizedProps<
  P extends {},
  RequiredProps extends keyof P,
  AdditionalProps extends {} = {},
> = Omit<P, RequiredProps | keyof AdditionalProps> &
  Required<Pick<P, RequiredProps>> &
  AdditionalProps;

export type SlotComponentPropsFromProps<
  TProps extends {},
  TOverrides extends {},
  TOwnerState extends {},
> = (Partial<TProps> & TOverrides) | ((ownerState: TOwnerState) => Partial<TProps> & TOverrides);

type IsAny<T> = 0 extends 1 & T ? true : false;

export type OptionalIfEmpty<A extends string, B> = keyof B extends never
  ? Partial<Record<A, B>>
  : IsAny<B> extends true
    ? Partial<Record<A, B>>
    : Record<A, B>;

export type MergeSignaturesProperty<
  TSignatures extends readonly any[],
  TProperty extends keyof FileExplorerAnyPluginSignature,
> = TSignatures extends readonly [plugin: infer P, ...otherPlugin: infer R]
  ? P extends FileExplorerAnyPluginSignature
    ? P[TProperty] & MergeSignaturesProperty<R, TProperty>
    : {}
  : {};

export type ConvertPluginsIntoSignatures<
  TPlugins extends readonly FileExplorerPlugin<FileExplorerAnyPluginSignature>[],
> = TPlugins extends readonly [plugin: infer TPlugin, ...otherPlugin: infer R]
  ? R extends readonly FileExplorerPlugin<any>[]
    ? TPlugin extends FileExplorerPlugin<infer TSignature>
      ? readonly [TSignature, ...ConvertPluginsIntoSignatures<R>]
      : never
    : never
  : [];

export type ConvertSignaturesIntoPlugins<
  TSignatures extends readonly FileExplorerAnyPluginSignature[],
> = TSignatures extends readonly [signature: infer TSignature, ...otherSignatures: infer R]
  ? R extends readonly FileExplorerAnyPluginSignature[]
    ? TSignature extends FileExplorerAnyPluginSignature
      ? readonly [FileExplorerPlugin<TSignature>, ...ConvertSignaturesIntoPlugins<R>]
      : never
    : never
  : [];
