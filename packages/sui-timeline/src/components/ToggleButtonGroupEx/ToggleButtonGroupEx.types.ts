/**
 * @interface ToggleButtonGroupExProps
 * @extends {ToggleButtonGroupProps}
 *
 * Props for the ToggleButtonGroup component.
 *
 * @description Custom props that can be used to extend or override the default props of the ToggleButtonGroup component.
 */

export interface ToggleButtonGroupExProps extends ToggleButtonGroupProps {
  /**
   * The minimum width of the group in pixels.
   */
  minWidth?: number;

  /**
   * The minimum height of the group in pixels.
   */
  minHeight?: number;

  /**
   * The maximum width of the group in pixels.
   */
  maxWidth?: number;

  /**
   * The maximum height of the group in pixels.
   */
  maxHeight?: number;

  /**
   * The width of the group in pixels.
   */
  width?: number;

  /**
   * The height of the group in pixels.
   */
  height?: number;

  /**
   * An array of child elements to be rendered inside the ToggleButtonGroup component.
   */
  children?: React.ReactNode[];

  /**
   * Custom styles for the ToggleButtonGroup component using the `sx` prop from Material-UI.
   */
  sx?: SxProps<Theme>;
}