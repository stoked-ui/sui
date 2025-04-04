/**
 * Import necessary types and interfaces from plugin and plugin.types files.
 */
import type {FileExplorerPlugin} from './plugin';
import type {FileExplorerAnyPluginSignature} from './plugin.types';

/**
 * Type definition for defaultized props, which combines required props with additional props.
 *
 * @template P - The original prop type
 * @template RequiredProps - The key of the required prop type
 * @template AdditionalProps - The additional prop type (optional)
 */
export type DefaultizedProps<
  P extends {},
  RequiredProps extends keyof P,
  AdditionalProps extends {} = {},
> = Omit<P, RequiredProps | keyof AdditionalProps> &
  Required<Pick<P, RequiredProps>> &
  AdditionalProps;

/**
 * Type definition for slot component props from props, which combines partial props with overrides.
 *
 * @template TProps - The original prop type
 * @template TOverrides - The override type (optional)
 * @template TOwnerState - The owner state type (optional)
 */
export type SlotComponentPropsFromProps<
  TProps extends {},
  TOverrides extends {},
  TOwnerState extends {},
> = (Partial<TProps> & TOverrides) | ((ownerState: TOwnerState) => Partial<TProps> & TOverrides);

/**
 * Type function to check if a type is any.
 *
 * @template T - The type to check
 */
type IsAny<T> = 0 extends 1 & T ? true : false;

/**
 * Type alias for optional prop, which is the partial record of the key and value types.
 *
 * @param A - The key type
 * @param B - The value type
 */
export type OptionalIfEmpty<A extends string, B> = keyof B extends never
  ? Partial<Record<A, B>>
  : IsAny<B> extends true
    ? Partial<Record<A, B>>
    : Record<A, B>;

/**
 * Type alias for merge signatures property, which merges the property of one signature with others.
 *
 * @param TSignatures - The array of signatures
 * @param TProperty - The property type to merge
 */
export type MergeSignaturesProperty<
  TSignatures extends readonly any[],
  TProperty extends keyof FileExplorerAnyPluginSignature,
> = TSignatures extends readonly [plugin: infer P, ...otherPlugin: infer R]
  ? P extends FileExplorerAnyPluginSignature
    ? P[TProperty] & MergeSignaturesProperty<R, TProperty>
    : {}
  : {};

/**
 * Type alias for converting plugins into signatures.
 *
 * @param TPlugins - The array of plugin types
 */
export type ConvertPluginsIntoSignatures<
  TPlugins extends readonly FileExplorerPlugin<FileExplorerAnyPluginSignature>[],
> = TPlugins extends readonly [plugin: infer TPlugin, ...otherPlugin: infer R]
  ? R extends readonly FileExplorerPlugin<any>[]
    ? TPlugin extends FileExplorerPlugin<infer TSignature>
      ? readonly [TSignature, ...ConvertPluginsIntoSignatures<R>]
      : never
    : never
  : [];

/**
 * Type alias for converting signatures into plugins.
 *
 * @param TSignatures - The array of signature types
 */
export type ConvertSignaturesIntoPlugins<
  TSignatures extends readonly FileExplorerAnyPluginSignature[],
> = TSignatures extends readonly [signature: infer TSignature, ...otherSignatures: infer R]
  ? R extends readonly FileExplorerAnyPluginSignature[]
    ? TSignature extends FileExplorerAnyPluginSignature
      ? readonly [FileExplorerPlugin<TSignature>, ...ConvertSignaturesIntoPlugins<R>]
      : never
    : never
  : [];