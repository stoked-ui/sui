/**
 * Type for defaultizing props by merging required props and additional props
 * 
 * @template P - Generic type for props
 * @template RequiredProps - Generic type for required props
 * @template AdditionalProps - Generic type for additional props
 * 
 * @typedef {object} DefaultizedProps
 * @property {Omit<P, RequiredProps | keyof AdditionalProps>} - Props without required and additional props
 * @property {Required<Pick<P, RequiredProps>>} - Required props
 * @property {AdditionalProps} - Additional props
 */
export type DefaultizedProps<
  P extends {},
  RequiredProps extends keyof P,
  AdditionalProps extends {} = {},
> = Omit<P, RequiredProps | keyof AdditionalProps> &
  Required<Pick<P, RequiredProps>> &
  AdditionalProps;

/**
 * Type for slot component props derived from props, overrides, and owner state
 * 
 * @template TProps - Generic type for props
 * @template TOverrides - Generic type for overrides
 * @template TOwnerState - Generic type for owner state
 * 
 * @typedef {object} SlotComponentPropsFromProps
 * @property {(Partial<TProps> & TOverrides) | ((ownerState: TOwnerState) => Partial<TProps> & TOverrides)} - Slot component props
 */
export type SlotComponentPropsFromProps<
  TProps extends {},
  TOverrides extends {},
  TOwnerState extends {},
> = (Partial<TProps> & TOverrides) | ((ownerState: TOwnerState) => Partial<TProps> & TOverrides);

/**
 * Type to check if a type is any
 * 
 * @template T - Generic type to check
 * 
 * @typedef {boolean} IsAny
 */
type IsAny<T> = 0 extends 1 & T ? true : false;

/**
 * Type for optional properties based on empty or any condition
 * 
 * @template A - Generic type A
 * @template B - Generic type B
 * 
 * @typedef {object} OptionalIfEmpty
 * @property {keyof B extends never ? Partial<Record<A, B>> : IsAny<B> extends true ? Partial<Record<A, B>> : Record<A, B>} - Optional properties conditionally
 */
export type OptionalIfEmpty<A extends string, B> = keyof B extends never
  ? Partial<Record<A, B>>
  : IsAny<B> extends true
    ? Partial<Record<A, B>>
    : Record<A, B>;

/**
 * Type to merge signatures property from an array of signatures
 * 
 * @template TSignatures - Generic type for signatures
 * @template TProperty - Generic type for property
 * 
 * @typedef {object} MergeSignaturesProperty
 * @property {TSignatures extends readonly [plugin: infer P, ...otherPlugin: infer R] ? P extends FileExplorerAnyPluginSignature ? P[TProperty] & MergeSignaturesProperty<R, TProperty> : {} : {}} - Merged signatures property
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
 * Type to convert plugins into signatures
 * 
 * @template TPlugins - Generic type for plugins
 * 
 * @typedef {object} ConvertPluginsIntoSignatures
 * @property {TPlugins extends readonly [plugin: infer TPlugin, ...otherPlugin: infer R] ? R extends readonly FileExplorerPlugin<any>[] ? TPlugin extends FileExplorerPlugin<infer TSignature> ? readonly [TSignature, ...ConvertPluginsIntoSignatures<R>] : never : never : never} - Converted plugins into signatures
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
 * Type to convert signatures into plugins
 * 
 * @template TSignatures - Generic type for signatures
 * 
 * @typedef {object} ConvertSignaturesIntoPlugins
 * @property {TSignatures extends readonly [signature: infer TSignature, ...otherSignatures: infer R] ? R extends readonly FileExplorerAnyPluginSignature[] ? TSignature extends FileExplorerAnyPluginSignature ? readonly [FileExplorerPlugin<TSignature>, ...ConvertSignaturesIntoPlugins<R>] : never : never : never} - Converted signatures into plugins
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