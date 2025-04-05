/**
 * Interface for custom slots in TimelineLabels component.
 * Slots include root, label, and actions elements.
 */
export interface TimelineLabelsSlots {
  /**
   * Element rendered at the root.
   * @default TimelineLabelsRoot
   */
  root?: React.ElementType;
  label?: React.ElementType;
  actions?: React.ElementType;
}

/**
 * Props for custom slot components in TimelineLabels component.
 */
export interface TimelineLabelsSlotProps {
  root?: SlotComponentProps<'div', {}, TimelineLabelsProps>;
  label?: SlotComponentProps<'div', {}, TimelineLabelsProps>;
  actions?: SlotComponentProps<'div', {}, TimelineTrackActionsProps>;
}

/**
 * Base props for TimelineLabels component.
 */
export interface TimelineLabelsPropsBase extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  /**
   * Override or extend the styles applied to the component.
   */
  classes?: Partial<TimelineLabelsClasses>;
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx?: SxProps<Theme>;

  controllers: Record<string, IController>;

  onAddFiles?: () => void;

  hideLock?: boolean;

  width?: number | string;

  /**
   * Click event handler for label.
   * @param event - The React mouse event.
   * @param track - The timeline track associated with the label.
   */
  onClickLabel?: (event: React.MouseEvent<HTMLElement, MouseEvent>, track: ITimelineTrack) => void;
}

/**
 * Props for TimelineLabels component.
 */
export interface TimelineLabelsProps
  extends Omit<TimelineLabelsPropsBase, 'onToggle'> {
  /**
   * Overridable component slots.
   * @default {}
   */
  slots?: TimelineLabelsSlots;
  /**
   * The props used for each component slot.
   * @default {}
   */
  slotProps?: TimelineLabelsSlotProps;

  /**
   * Toggle event handler for specific id and property.
   * @param id - The id of the timeline track.
   * @param property - The property to toggle.
   */
  onToggle?: (id: string, property: string) => void;

  /**
   * Set flags for a specific id.
   * @param id - The id of the timeline track.
   * @returns Array of flags.
   */
  setFlags?: (id: string) => string[];

  trackActions?: React.ElementType;
}
