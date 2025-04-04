import * as React from 'react';
import {SxProps, Theme} from "@mui/material/styles";
import {SlotComponentProps} from "@mui/base";
import {TimelinePlayerClasses} from "./timelinePlayerClasses";

/**
 * Interface representing the slots for a TimelinePlayer component.
 *
 * @description The slots are overridable components used within the TimelinePlayer
 *             to provide additional functionality or styling. Each slot is represented by
 *             its corresponding React element type.
 */
export interface TimelinePlayerSlots {
  /**
   * The root slot of the TimelinePlayer.
   *
   * @description This slot contains the main content of the TimelinePlayer component.
   */
  root?: React.ElementType;
  /**
   * The previous slot of the TimelinePlayer.
   *
   * @description This slot is used to navigate back in the timeline.
   */
  skipPrevious?: React.ElementType;
  /**
   * The pause playing slot of the TimelinePlayer.
   *
   * @description This slot provides a way to pause or un-pause playback of the timeline.
   */
  pausePlaying?: React.ElementType;
  /**
   * The next slot of the TimelinePlayer.
   *
   * @description This slot is used to navigate forward in the timeline.
   */
  skipNext?: React.ElementType;
  /**
   * The time slot of the TimelinePlayer.
   *
   * @description This slot displays the current time within the timeline.
   */
  time?: React.ElementType;
  /**
   * The rate slot of the TimelinePlayer.
   *
   * @description This slot provides a way to adjust the playback speed of the timeline.
   */
  rate?: React.ElementType;
}

/**
 * Interface representing the props for each component slot within a TimelinePlayer.
 *
 * @description Each slot prop is an object that extends SlotComponentProps,
 *             providing additional properties specific to that slot.
 */
export interface TimelinePlayerSlotProps {
  /**
   * The root slot prop of the TimelinePlayer.
   *
   * @description This prop contains the React element for the root slot.
   */
  root?: SlotComponentProps<'div', {}, {}>;
  /**
   * The previous slot prop of the TimelinePlayer.
   *
   * @description This prop contains the React element for the previous slot.
   */
  skipPrevious?: SlotComponentProps<'div', {}, {}>;
  /**
   * The pause playing slot prop of the TimelinePlayer.
   *
   * @description This prop contains the React element for the pause playing slot.
   */
  pausePlaying?: SlotComponentProps<'div', {}, {}>;
  /**
   * The next slot prop of the TimelinePlayer.
   *
   * @description This prop contains the React element for the next slot.
   */
  skipNext?: SlotComponentProps<'div', {}, {}>;
  /**
   * The time slot prop of the TimelinePlayer.
   *
   * @description This prop contains the React element for the time slot.
   */
  time?: SlotComponentProps<'div', {}, {}>;
  /**
   * The rate slot prop of the TimelinePlayer.
   *
   * @description This prop contains the React element for the rate slot.
   */
  rate?: SlotComponentProps<'div', {}, {}>;
}

/**
 * Interface representing the props for a TimelinePlayer component.
 *
 * @description This interface extends Omit<React.HTMLAttributes<HTMLDivElement>,
 *             'id' | 'onScroll'>, providing additional properties specific to the TimelinePlayer
 *             component. The children prop represents the content of the component,
 *             while the slots and slotProps props provide overridable component slots.
 */
export interface TimelinePlayerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'id' | 'onScroll'> {
  /**
   * The content of the component.
   *
   * @description This prop represents the main content displayed within the TimelinePlayer.
   */
  children?: React.ReactNode;
  /**
   * Overridable component slots.
   *
   * @description These props contain the overridable component slots for the TimelinePlayer.
   */
  slots?: TimelinePlayerSlots;
  /**
   * The props used for each component slot.
   *
   * @description This prop provides the additional properties specific to each slot.
   */
  slotProps?: TimelinePlayerSlotProps;
  /**
   * The class names applied to the component.
   *
   * @description These props contain the CSS classes applied to the TimelinePlayer component.
   */
  className?: string;

  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   *
   * @description This prop provides the CSS styles for the TimelinePlayer component.
   */
  classes?: Partial<TimelinePlayerClasses>;
  /**
   * Override or extend the styles applied to the component.
   *
   * @description This prop provides the additional CSS styles that override or extend the default styles.
   */
  sx?: SxProps<Theme>;
}

/**
 * Interface representing the state of a TimelinePlayer component owner.
 *
 * @description This interface extends Omit<TimelinePlayerProps, 'onKeyDown'>,
 *             providing properties that are not part of the keyboard event handling functionality.
 */