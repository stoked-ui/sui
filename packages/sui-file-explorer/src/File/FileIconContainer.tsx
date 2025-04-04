/**
 * FileIconContainer component.
 *
 * The FileIconContainer is a styled div that serves as the container for the file icon.
 * It provides a consistent layout and styling for the file icon, allowing it to be used
 * across different platforms and applications.
 *
 * @component
 */

import {shouldForwardProp} from "@mui/system/createStyled";
import {styled} from "../internals/zero-styled";

/**
 * FileIconContainer component props.
 *
 * @param {object} props - The component props.
 * @param {string} [props.name] - The name of the component.
 * @param {string} [props.slot] - The slot of the component.
 * @param {function} [props.overridesResolver] - The overrides resolver function.
 * @param {boolean} [props.shouldForwardProp] - Whether to forward props.
 */

export const FileIconContainer = styled('div', {
  /**
   * The name of the component.
   *
   * @type {string}
   */
  name: 'MuiFile',
  
  /**
   * The slot of the component.
   *
   * @type {string}
   */
  slot: 'IconContainer',
  
  /**
   * The overrides resolver function.
   *
   * @param {object} props - The component props.
   * @param {object} styles - The component styles.
   * @returns {object} The overridden styles.
   */
  overridesResolver: (props, styles) => styles.iconContainer,
  
  /**
   * Whether to forward props.
   *
   * @param {string} prop - The prop name.
   * @returns {boolean} Whether the prop should be forwarded.
   */
  shouldForwardProp: (prop) =>
    shouldForwardProp(prop) &&
    prop !== 'iconName'
})({
  /**
   * The width of the component.
   *
   * @type {number}
   */
  width: 16,
  
  /**
   * The display property of the component.
   *
   * @type {string}
   */
  display: 'flex',
  
  /**
   * Whether the component should shrink.
   *
   * @type {boolean}
   */
  flexShrink: 0,
  
  /**
   * How to justify the content of the component.
   *
   * @type {string}
   */
  justifyContent: 'center',
  
  /**
   * Styles for the SVG element within the component.
   *
   * @type {object}
   */
  '& svg': {
    /**
     * The font size of the SVG element.
     *
     * @type {number}
     */
    fontSize: 18,
  },
});