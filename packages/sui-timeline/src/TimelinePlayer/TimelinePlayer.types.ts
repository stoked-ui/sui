import * as React from 'react';
import {SxProps, Theme} from "@mui/material/styles";
import {SlotComponentProps} from "@mui/base";
import {TimelinePlayerClasses} from "./timelinePlayerClasses";

export interface TimelinePlayerSlots {
  root?: React.ElementType;
  skipPrevious?: React.ElementType;
  pausePlaying?: React.ElementType;
  skipNext?: React.ElementType;
  time?: React.ElementType;
  rate?: React.ElementType;
}

export interface TimelinePlayerSlotProps {
  root?: SlotComponentProps<'div', {}, {}>;
  skipPrevious?: SlotComponentProps<'div', {}, {}>;
  pausePlaying?: SlotComponentProps<'div', {}, {}>;
  skipNext?: SlotComponentProps<'div', {}, {}>;
  time?: SlotComponentProps<'div', {}, {}>;
  rate?: SlotComponentProps<'div', {}, {}>;
}

export interface TimelinePlayerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'id' | 'onScroll'> {
  /**
   * The content of the component.
   */
  children?: React.ReactNode;
  /**
   * Overridable component slots.
   */
  slots?: TimelinePlayerSlots;
  /**
   * The props used for each component slot.
   */
  slotProps?: TimelinePlayerSlotProps;
  className?: string;

  classes?: Partial<TimelinePlayerClasses>;
  /**
   * Override or extend the styles applied to the component.
   */
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx?: SxProps<Theme>;
}

export interface TimelinePlayerOwnerState extends Omit<TimelinePlayerProps, 'onKeyDown'>  {}
