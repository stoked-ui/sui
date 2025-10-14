/**
 * Represents the parameters required for the UseFileExplorer hook.
 * - plugins: ConvertSignaturesIntoPlugins<TSignatures>;
 * - rootRef: React.Ref<HTMLUListElement> | undefined;
 * - props: TProps;
 * 
 * @template TSignatures - The type of plugin signatures.
 * @template TProps - The type of properties.
 */
export interface UseFileExplorerParameters<
  TSignatures extends readonly FileExplorerAnyPluginSignature[],
  TProps extends Partial<UseFileExplorerBaseProps<TSignatures>>,
> {
  plugins: ConvertSignaturesIntoPlugins<TSignatures>;
  rootRef?: React.Ref<HTMLUListElement> | undefined;
  props: TProps; // Omit<MergeSignaturesProperty<TSignatures, 'params'>, keyof UseFileExplorerBaseParameters<any>>
}

/**
 * Represents the base properties for the UseFileExplorer hook.
 * - apiRef: React.MutableRefObject<FileExplorerPublicAPI<TSignatures> | undefined> | undefined;
 * - slots: MergeSignaturesProperty<TSignatures, 'slots'>;
 * - slotProps: MergeSignaturesProperty<TSignatures, 'slotProps'>;
 * - experimentalFeatures: FileExplorerExperimentalFeatures<TSignatures>;
 * 
 * @template TSignatures - The type of plugin signatures.
 */
export interface UseFileExplorerBaseProps<TSignatures extends readonly FileExplorerAnyPluginSignature[]> {
  apiRef: React.MutableRefObject<FileExplorerPublicAPI<TSignatures> | undefined> | undefined;
  slots: MergeSignaturesProperty<TSignatures, 'slots'>;
  slotProps: MergeSignaturesProperty<TSignatures, 'slotProps'>;
  experimentalFeatures: FileExplorerExperimentalFeatures<TSignatures>;
}

/**
 * Represents the properties for the root slot in the UseFileExplorer hook.
 * - onFocus
 * - onBlur
 * - onKeyDown
 * - id
 * - aria-multiselectable
 * - role
 * - tabIndex
 * - ref
 */
export interface UseFileExplorerRootSlotProps
  extends Pick<
    React.HTMLAttributes<HTMLUListElement>,
    'onFocus' | 'onBlur' | 'onKeyDown' | 'id' | 'aria-multiselectable' | 'role' | 'tabIndex'
  > {
  ref: React.Ref<HTMLUListElement>;
}

/**
 * Represents the return value of the UseFileExplorer hook.
 * - getRootProps: <TOther extends EventHandlers = {}>(otherHandlers?: TOther) => UseFileExplorerRootSlotProps;
 * - rootRef: React.RefCallback<HTMLUListElement> | null;
 * - contextValue: FileExplorerContextValue<TSignatures>;
 * - instance: FileExplorerInstance<TSignatures>;
 * 
 * @template TSignatures - The type of plugin signatures.
 */
export interface UseFileExplorerReturnValue<TSignatures extends readonly FileExplorerAnyPluginSignature[]> {
  getRootProps: <TOther extends EventHandlers = {}>(
    otherHandlers?: TOther,
  ) => UseFileExplorerRootSlotProps;
  rootRef: React.RefCallback<HTMLUListElement> | null;
  contextValue: FileExplorerContextValue<TSignatures>;
  instance: FileExplorerInstance<TSignatures>;
}