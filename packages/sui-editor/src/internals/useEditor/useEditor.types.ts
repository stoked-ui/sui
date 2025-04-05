/**
 * Interface for defining parameters used in the UseEditor function.
 * @template TSignatures - The type of editor plugin signatures.
 * @template TProps - The type of additional properties to be passed.
 */
export interface UseEditorParameters<
  TSignatures extends readonly EditorAnyPluginSignature[],
  TProps extends Partial<UseEditorBaseProps<TSignatures>>,
> {
  plugins: ConvertSignaturesIntoPlugins<TSignatures>;
  rootRef?: React.Ref<HTMLDivElement> | undefined;
  props: TProps; // Omit<MergeSignaturesProperty<TSignatures, 'params'>, keyof UseEditorBaseParameters<any>>
}

/**
 * Interface defining the base properties used in the UseEditor function.
 * @template TSignatures - The type of editor plugin signatures.
 */
export interface UseEditorBaseProps<TSignatures extends readonly EditorAnyPluginSignature[]> {
  apiRef: React.MutableRefObject<EditorPublicAPI<TSignatures> | undefined> | undefined;
  slots: MergeSignaturesProperty<TSignatures, 'slots'>;
  slotProps: MergeSignaturesProperty<TSignatures, 'slotProps'>;
  experimentalFeatures: EditorExperimentalFeatures<TSignatures>;
}

/**
 * Interface for defining the properties of the root slot in the editor.
 */
export interface UseEditorRootSlotProps
  extends Pick<
    React.HTMLAttributes<HTMLDivElement>,
    'onFocus' | 'onBlur' | 'onKeyDown' | 'id' | 'aria-multiselectable' | 'role' | 'tabIndex'
  > {
  ref: React.Ref<HTMLDivElement>;
}

/**
 * Interface for defining the properties of the editor view slot.
 */
export interface UseEditorViewSlotProps
  extends Pick<
    React.HTMLAttributes<HTMLDivElement>,
    'onFocus' | 'onBlur' | 'onKeyDown' | 'id' | 'aria-multiselectable' | 'role' | 'tabIndex'
  > {
  ref?: React.RefObject<HTMLDivElement>;
}

/**
 * Interface for defining the properties of the editor controls slot.
 */
export interface UseEditorControlsSlotProps
  extends Pick<
    React.HTMLAttributes<HTMLDivElement>,
    'onFocus' | 'onBlur' | 'onKeyDown' | 'id' | 'aria-multiselectable' | 'role' | 'tabIndex'
  > {
  ref?: React.Ref<HTMLDivElement>;
}

/**
 * Interface for defining the properties of the timeline slot.
 */
export interface UseTimelineSlotProps
  extends Pick<
    React.HTMLAttributes<HTMLDivElement>,
    'onFocus' | 'onBlur' | 'onKeyDown' | 'id' | 'aria-multiselectable' | 'role' | 'tabIndex'
  > {
  tracks: ITimelineTrack[];
}

/**
 * Interface for defining the properties of the file explorer tabs slot.
 */
export interface UseFileExplorerTabsSlotProps
  extends Pick<
    React.HTMLAttributes<HTMLDivElement>,
    'onFocus' | 'onBlur' | 'onKeyDown' | 'id' | 'aria-multiselectable' | 'role' | 'tabIndex'
  > {
  ref?: React.Ref<HTMLDivElement>;
  tabs: Record<string, IMediaFile[]>
  sx?: SxProps
}

/**
 * Interface for defining the properties of the bottom right slot.
 */
export interface UseBottomRightSlotProps
  extends Pick<
    React.HTMLAttributes<HTMLDivElement>,
    'onFocus' | 'onBlur' | 'onKeyDown' | 'id' | 'aria-multiselectable' | 'role' | 'tabIndex'
  > {
  ref?: React.Ref<HTMLDivElement>;
}

/**
 * Interface for defining the return value of the UseEditor function.
 * @template TSignatures - The type of editor plugin signatures.
 */
export interface UseEditorReturnValue<TSignatures extends readonly EditorAnyPluginSignature[]> {
  getRootProps: <TOther extends EventHandlers = {}>(
    otherHandlers?: TOther,
  ) => UseEditorRootSlotProps;
  getEditorViewProps: <TOther extends EventHandlers = {}>(
    otherHandlers?: TOther,
  ) => UseEditorViewSlotProps;
  getControlsProps: <TOther extends EventHandlers = {}>(
    otherHandlers?: TOther,
  ) => UseEditorControlsSlotProps;
  getTimelineProps: <TOther extends EventHandlers = {}>(
    otherHandlers?: TOther,
  ) => TimelineSlotProps & { className?: string | undefined; style?: React.CSSProperties | undefined; ref?: React.Ref<any> | undefined; };
  getFileExplorerTabsProps: <TOther extends EventHandlers = {}>(
    otherHandlers?: TOther,
  ) => UseFileExplorerTabsSlotProps;
  rootRef: React.RefCallback<HTMLDivElement> | null;
  contextValue: EditorContextValue<TSignatures>;
  instance: EditorInstance<TSignatures>;
  id: string;
}
**/