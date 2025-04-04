/**
 * Editor component props and types.
 *
 * The `EditorProps` interface extends the `EditorPluginParameters` and `EditorPropsBase`
 * interfaces, adding additional properties and types specific to the editor component.
 */

export interface EditorProps<R extends any = any, Multiple extends boolean | undefined = true>
  extends Omit<EditorPluginParameters, 'actions' | 'file'>,
    EditorPropsBase {
  /**
   * The ref object that allows Editor View manipulation. Can be instantiated with
   * `useEditorApiRef()`.
   */
  apiRef?: EditorApiRef;
  /**
   * Unstable features, breaking changes might be introduced.
   * For each feature, if the flag is not explicitly set to `true`,
   * the feature will be fully disabled and any property / method call will not have any effect.
   */
  experimentalFeatures?: EditorExperimentalFeatures<EditorPluginSignatures>;
  /**
   * Override or extend the styles applied to the component.
   */
  mode?: 'project' | 'track' | 'action';

  newTrack?: boolean;

  /**
   * @description Click label callback
   */
  onClickLabel?: (
    e: React.MouseEvent<HTMLElement, MouseEvent>,
    track: ITimelineTrack,
  ) => void;

  /**
   * @description Click track callback
   */
  onClickTrack?: (
    e: React.MouseEvent<HTMLElement, MouseEvent>,
    param: {
      track: ITimelineTrack;
      time: number;
    },
  ) => void;

  /**
   * @description Click action callback
   */
  onClickAction?: (
    e: React.MouseEvent<HTMLElement, MouseEvent>,
    param: {
      action: ITimelineAction;
      track: ITimelineTrack;
      time: number;
    },
  ) => void;

  /**
   * The props used for each component slot.
   * @default {}
   */
  slotProps?: EditorSlotProps<R, Multiple>;
  /**
   * Overridable component slots.
   * @default {}
   */
  slots?: EditorSlots;

  children?: React.ReactNode;

  viewButtons?: React.ReactElement[];
  viewButtonAppear?: number;
  viewButtonEnter?: number;
  viewButtonExit?: number;
  loaded?: boolean;
}

/**
 * Editor slot props and types.
 *
 * The `EditorSlotProps` interface extends the `EditorPluginSlotProps` interface,
 * adding additional properties specific to the editor component slots.
 */

export interface EditorSlotProps<R extends any, Multiple extends boolean | undefined>
  extends EditorPluginSlotProps {
  /**
   * Element that renders the view space for the editor
   * @default React.JSXElementConstructor<HTMLDivElement>;
   */
  controls?: SlotComponentProps<'div', {}, {}>;
}

/**
 * The Editor component's slots.
 *
 * The `EditorSlots` interface defines the different components used in the editor,
 * along with their default values and props.
 */

export interface EditorSlots {
  /**
   * The root slot for the editor view.
   */
  root?: Slot;
  /**
   * The toolbar slot for the editor view.
   */
  toolbar?: Slot;
  /**
   * The view buttons slot for the editor view.
   */
  viewButtons?: Slot[];
}

/**
 * The Editor component's slots types.
 *
 * The `Slot` type represents a single component slot used in the editor,
 * along with its props and children.
 */

type Slot = {
  /**
   * The element type of the slot.
   */
  elementType: React.ReactElementConstructor;
  /**
   * The props of the slot.
   */
  props?: any;
  /**
   * The children of the slot.
   */
  children?: React.ReactNode;
};

/**
 * The Editor component's API reference.
 *
 * The `EditorApiRef` interface represents a reference to the editor component's
 * API, which can be used for manipulation and interaction with the editor view.
 */

export interface EditorApiRef {
  /**
   * The editor view manipulation methods.
   */
  manipulateView: (view: React.ReactElement) => void;
}

/**
 * The Editor component's experimental features.
 *
 * The `EditorExperimentalFeatures` type represents a set of unstable features
 * and breaking changes that might be introduced in the editor component.
 */

type EditorExperimentalFeatures<PluginSignatures> = {
  /**
   * A flag indicating whether the feature is enabled or not.
   */
  feature: boolean;
};

/**
 * The Editor component's parameters.
 *
 * The `EditorPluginParameters` interface defines the additional parameters
 * and types specific to the editor component, including experimental features,
 * slots, and more.
 */

type EditorPluginParameters = {
  /**
   * Unstable features, breaking changes might be introduced.
   * For each feature, if the flag is not explicitly set to `true`,
   * the feature will be fully disabled and any property / method call will not have any effect.
   */
  experimentalFeatures?: EditorExperimentalFeatures<EditorPluginSignatures>;
  /**
   * The slots used in the editor component.
   */
  slots: EditorSlots;
};

/**
 * The EditorPropsBase interface.
 *
 * The `EditorPropsBase` interface defines the base props and types for the
 * editor component, including the root element, children, and more.
 */

export interface EditorPropsBase {
  /**
   * The root element of the editor view.
   */
  root?: React.ReactElement;
  /**
   * The children of the editor view.
   */
  children?: React.ReactNode[];
}

/**
 * The Editor component's parameters and types.
 *
 * This interface defines all the parameters, props, and types used in the
 * editor component, including experimental features, slots, and more.
 */

export type EditorParams = {
  /**
   * The ref object that allows Editor View manipulation. Can be instantiated with
   * `useEditorApiRef()`.
   */
  apiRef?: EditorApiRef;
  /**
   * Unstable features, breaking changes might be introduced.
   * For each feature, if the flag is not explicitly set to `true`,
   * the feature will be fully disabled and any property / method call will not have any effect.
   */
  experimentalFeatures?: EditorExperimentalFeatures<EditorPluginSignatures>;
  /**
   * Override or extend the styles applied to the component.
   */
  mode?: 'project' | 'track' | 'action';

  newTrack?: boolean;

  /**
   * @description Click label callback
   */
  onClickLabel?: (
    e: React.MouseEvent<HTMLElement, MouseEvent>,
    track: ITimelineTrack,
  ) => void;

  /**
   * @description Click track callback
   */
  onClickTrack?: (
    e: React.MouseEvent<HTMLElement, MouseEvent>,
    param: {
      track: ITimelineTrack;
      time: number;
    },
  ) => void;

  /**
   * @description Click action callback
   */
  onClickAction?: (
    e: React.MouseEvent<HTMLElement, MouseEvent>,
    param: {
      action: ITimelineAction;
      track: ITimelineTrack;
      time: number;
    },
  ) => void;

  /**
   * The props used for each component slot.
   * @default {}
   */
  slotProps?: EditorSlotProps<R, Multiple>;
  /**
   * Overridable component slots.
   * @default {}
   */
  slots?: EditorSlots;

  children?: React.ReactNode;

  viewButtons?: React.ReactElement[];
  viewButtonAppear?: number;
  viewButtonEnter?: number;
  viewButtonExit?: number;
  loaded?: boolean;
};