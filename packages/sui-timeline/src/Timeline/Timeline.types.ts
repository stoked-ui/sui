/**
 * Element rendered at the root.
 * @default TimelineRoot
 */
export interface TimelineSlots {
  root?: React.ElementType;
  labels?: React.ElementType;
  time?: React.ElementType;
  trackArea?: React.ElementType;
  resizer?: React.ElementType;
}

/**
 * Props for each component slot.
 */
export interface TimelineSlotProps {
  root?: SlotComponentProps<'div', {}, TimelineProps>;
  labels?: SlotComponentProps<'div', {}, TimelineLabelsProps>;
  time?: SlotComponentProps<'div', {}, TimelineControlProps>;
  trackArea?: SlotComponentProps<'div', {}, TimelineControlProps>;
  resizer?: SlotComponentProps<'div', {}, TimelineControlProps>;
}

/**
 * Props for the Timeline component.
 */
export interface TimelineProps extends React.HTMLAttributes<HTMLDivElement> {
  actions?: ITimelineFileAction[];
  children?: React.ReactNode;
  className?: string;
  onScrollVertical?: React.UIEventHandler<HTMLDivElement>;
  classes?: Partial<TimelineClasses>;
  collapsed?: boolean;
  controllers?: Record<string, IController>;
  detailRenderer?: boolean;
  disabled?: boolean;
  file?: ITimelineFile;
  fileUrl?: string;
  labelSx?: SxProps<Theme>;
  labels?: boolean;
  labelsSx?: SxProps<Theme>;
  locked?: boolean;
  onAddFiles?: () => void;

  /**
   * Right-click action callback.
   */
  onContextMenuAction?: (
    e: React.MouseEvent<HTMLElement, MouseEvent>,
    param: {
      action: ITimelineAction;
      track: ITimelineTrack;
      time: number;
    },
  ) => void;

  /**
   * Right-click track callback.
   */
  onContextMenuTrack?: (
    e: React.MouseEvent<HTMLElement, MouseEvent>,
    param: {
      track: ITimelineTrack;
      time: number;
    },
  ) => void;

  /**
   * Click label callback.
   */
  onClickLabel?: (
    e: React.MouseEvent<HTMLElement, MouseEvent>,
    track: ITimelineTrack,
  ) => void;

  /**
   * Click track callback.
   */
  onClickTrack?: (
    e: React.MouseEvent<HTMLElement, MouseEvent>,
    param: {
      track: ITimelineTrack;
      time: number;
    },
  ) => void;

  /**
   * Click action callback.
   */
  onClickAction?: (
    e: React.MouseEvent<HTMLElement, MouseEvent>,
    param: {
      action: ITimelineAction;
      track: ITimelineTrack;
      time: number;
    },
  ) => void;

  scaleWidth?: number;
  setScaleWidth?: (scaleWidth: number) => void;

  /**
   * The props used for each component slot.
   * @default {}
   */
  slotProps?: TimelineSlotProps;

  /**
   * Overridable component slots.
   * @default {}
   */
  slots?: TimelineSlots;

  /**
   * System prop for defining system overrides and additional CSS styles.
   */
  sx?: SxProps<Theme>;
  trackSx?: SxProps<Theme>;
  viewSelector?: string;
  internalComponent?: boolean;
}