import type {EditorAnyPluginSignature, EditorPlugin} from './plugin';

/**
 * Defaultized props for a component.
 *
 * @template P The original prop types
 * @template RequiredProps The required prop keys
 * @template AdditionalProps The additional prop types
 * @param P The original prop types
 * @param RequiredProps The required prop keys
 * @param AdditionalProps The additional prop types
 * @returns The defaultized props for a component
 */
export type DefaultizedProps<
  P extends {},
  RequiredProps extends keyof P,
  AdditionalProps extends {} = {},
> = Omit<P, RequiredProps | keyof AdditionalProps> &
  Required<Pick<P, RequiredProps>> &
  AdditionalProps;

/**
 * Slot component props from props.
 *
 * @template TProps The original prop types
 * @template TOverrides The override properties
 * @template TOwnerState The owner state type
 * @param TProps The original prop types
 * @param TOverrides The override properties
 * @param TOwnerState The owner state type
 * @returns The slot component props from props
 */
export type SlotComponentPropsFromProps<
  TProps extends {},
  TOverrides extends {},
  TOwnerState extends {},
> = (Partial<TProps> & TOverrides) | ((ownerState: TOwnerState) => Partial<TProps> & TOverrides);

/**
 * Is any type.
 *
 * @template T The type to check
 * @returns True if the type is any, false otherwise
 */
type IsAny<T> = 0 extends 1 & T ? true : false;

/**
 * Optional type if empty.
 *
 * @template A The property key
 * @template B The value type
 * @param A The property key
 * @returns The optional type if the property key is empty, or the value type otherwise
 */
export type OptionalIfEmpty<A extends string, B> = keyof B extends never
  ? Partial<Record<A, B>>
  : IsAny<B> extends true
    ? Partial<Record<A, B>>
    : Record<A, B>;

/**
 * Merge signatures property.
 *
 * @template TSignatures The signature types
 * @template TProperty The property type to merge
 * @param TSignatures The signature types
 * @returns The merged property type
 */
export type MergeSignaturesProperty<
  TSignatures extends readonly any[],
  TProperty extends keyof EditorAnyPluginSignature,
> = TSignatures extends readonly [plugin: infer P, ...otherPlugin: infer R]
  ? P extends EditorAnyPluginSignature
    ? P[TProperty] & MergeSignaturesProperty<R, TProperty>
    : {}
  : {};

/**
 * Convert plugins into signatures.
 *
 * @template TPlugins The plugin types
 * @param TPlugins The plugin types
 * @returns The converted signature types
 */
export type ConvertPluginsIntoSignatures<
  TPlugins extends readonly EditorPlugin<EditorAnyPluginSignature>[],
> = TPlugins extends readonly [plugin: infer TPlugin, ...otherPlugin: infer R]
  ? R extends readonly EditorPlugin<any>[]
    ? TPlugin extends EditorPlugin<infer TSignature>
      ? readonly [TSignature, ...ConvertPluginsIntoSignatures<R>]
      : never
    : never
  : [];

/**
 * Convert signatures into plugins.
 *
 * @template TSignatures The signature types
 * @param TSignatures The signature types
 * @returns The converted plugin types
 */
export type ConvertSignaturesIntoPlugins<
  TSignatures extends readonly EditorAnyPluginSignature[],
> = TSignatures extends readonly [signature: infer TSignature, ...otherSignatures: infer R]
  ? R extends readonly EditorAnyPluginSignature[]
    ? TSignature extends EditorAnyPluginSignature
      ? readonly [EditorPlugin<TSignature>, ...ConvertSignaturesIntoPlugins<R>]
      : never
    : never
  : [];