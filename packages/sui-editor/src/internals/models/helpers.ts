/** 
 * Defines the type for defaultizing props.
 * @template P - The props type.
 * @template RequiredProps - The required props keys.
 * @template AdditionalProps - Additional props type.
 * @typedef {Object} DefaultizedProps
 * @property {P} P - The props type.
 * @property {RequiredProps} RequiredProps - The required props keys.
 * @property {AdditionalProps} AdditionalProps - Additional props type.
 */
export type DefaultizedProps<
  P extends {},
  RequiredProps extends keyof P,
  AdditionalProps extends {} = {},
> = Omit<P, RequiredProps | keyof AdditionalProps> &
  Required<Pick<P, RequiredProps>> &
  AdditionalProps;

/** 
 * Defines the type for slot component props derived from props, overrides, and owner state.
 * @template TProps - The props type.
 * @template TOverrides - The overrides type.
 * @template TOwnerState - The owner state type.
 * @typedef {Object} SlotComponentPropsFromProps
 * @property {TProps} TProps - The props type.
 * @property {TOverrides} TOverrides - The overrides type.
 * @property {TOwnerState} TOwnerState - The owner state type.
 */
export type SlotComponentPropsFromProps<
  TProps extends {},
  TOverrides extends {},
  TOwnerState extends {},
> = (Partial<TProps> & TOverrides) | ((ownerState: TOwnerState) => Partial<TProps> & TOverrides);

/** 
 * Defines a type to check if a type is any.
 * @template T - The type to check.
 * @typedef {boolean} IsAny
 */
type IsAny<T> = 0 extends 1 & T ? true : false;

/** 
 * Defines a type to make a property optional if the type passed is empty.
 * @template A - The key of the property.
 * @template B - The type of the property.
 * @typedef {Object} OptionalIfEmpty
 * @property {A} A - The key of the property.
 * @property {B} B - The type of the property.
 */
export type OptionalIfEmpty<A extends string, B> = keyof B extends never
  ? Partial<Record<A, B>>
  : IsAny<B> extends true
    ? Partial<Record<A, B>>
    : Record<A, B>;

/** 
 * Merges properties of editor plugin signatures.
 * @template TSignatures - The array of plugin signatures.
 * @template TProperty - The property to merge.
 * @typedef {Object} MergeSignaturesProperty
 * @property {TSignatures} TSignatures - The array of plugin signatures.
 * @property {TProperty} TProperty - The property to merge.
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
 * Converts plugins into signatures.
 * @template TPlugins - The array of editor plugins.
 * @typedef {Object} ConvertPluginsIntoSignatures
 * @property {TPlugins} TPlugins - The array of editor plugins.
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
 * Converts signatures into plugins.
 * @template TSignatures - The array of editor plugin signatures.
 * @typedef {Object} ConvertSignaturesIntoPlugins
 * @property {TSignatures} TSignatures - The array of editor plugin signatures.
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