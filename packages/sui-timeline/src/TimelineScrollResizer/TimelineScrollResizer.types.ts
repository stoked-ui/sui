/**
 * Props for the TimelineScrollResizer component.
 *
 * @interface TimelineScrollResizerProps
 */
export interface TimelineScrollResizerProps {
  /**
   * The type of timeline resizer. Can be either 'horizontal' or 'vertical'.
   * Defaults to undefined, which means it will use a default type.
   */
  type?: 'horizontal' | 'vertical';

  /**
   * A reference to the DOM element that this resizer is attached to.
   * This prop must be provided by the parent component.
   */
  elementRef: React.RefObject<HTMLDivElement>;

  /**
   * An optional function to adjust the scale of the timeline resizer.
   * This function takes a number value as an argument and returns a boolean indicating whether to apply the adjustment.
   * If this prop is not provided, the default behavior will be applied.
   */
  adjustScale?: (value: number) => boolean;
}