import * as React from 'react';
import PropTypes from 'prop-types';
import { namedId } from '@stoked-ui/common';
import { styled } from '@mui/material/styles';
import {
  ToggleButtonGroup as ToggleGroup,
  ToggleButtonGroupPropsSizeOverrides,
} from '@mui/material';
import { OverridableStringUnion } from '@mui/types';

/**
 * ToggleButtonGroupStyled
 *
 * A custom styled ToggleButtonGroup component.
 *
 * @typedef {Object} ToggleButtonGroupStyledProps
 * @property {('horizontal' | 'vertical')} orientation - The orientation of the toggle group.
 * @property {number} minWidth - The minimum width of the toggle group.
 * @property {number} minHeight - The minimum height of the toggle group.
 * @property {number} maxWidth - The maximum width of the toggle group.
 * @property {number} maxHeight - The maximum height of the toggle group.
 * @property {number} buttonCount - The number of buttons in the toggle group.
 * @property {number} width - The total width of the toggle group.
 * @property {number} height - The total height of the toggle group.
 */
const ToggleButtonGroupStyled = styled(ToggleGroup, {
  shouldForwardProp: (prop) =>
    prop !== 'orientation' && prop !== 'minWidth' && prop !== 'minHeight' &&
      prop !== 'maxWidth' && prop !== 'maxHeight' && prop !== 'buttonCount' &&
      prop !== 'width' && prop !== 'height',
})(({ props }) => ({
  // Add your custom styles here
}));

/**
 * ToggleButtonGroupEx
 *
 * A custom toggle button group component.
 *
 * @param {Object} props - The component props.
 * @param {string | number} props.id - The ID of the toggle group.
 * @param {any} props.sx - The system prop that allows defining system overrides as well as additional CSS styles.
 * @param {function} props.onChange - The callback function for the toggle group change event.
 * @param {array} props.value - The value of the toggle group.
 * @param {array} props.children - The children elements to be rendered inside the toggle group.
 * @param {string | number} props.size - The size of the toggle group (small, medium, large).
 * @param {number} props.minWidth - The minimum width of the toggle group.
 * @param {number} props.minHeight - The minimum height of the toggle group.
 * @param {number} props.maxWidth - The maximum width of the toggle group.
 * @param {number} props.maxHeight - The maximum height of the toggle group.
 * @param {number} props.disabled - Whether the toggle group is disabled or not.
 * @param {number} props.buttonCount - The number of buttons in the toggle group.
 */
function ToggleButtonGroupEx(props: {
  /**
   * The content of the component.
   */
  children: React.ReactNode;

  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx?: React.CSSProperties | (({ props }: any) => React.CSSProperties);

  /**
   * The callback function for the toggle group change event.
   */
  onChange?: (event: any, value: string | number) => void;

  /**
   * The value of the toggle group.
   */
  value?: string | number;

  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx?: React.CSSProperties | (({ props }: any) => React.CSSProperties);

  /**
   * The width of the toggle group.
   */
  width?: number;

  /**
   * The height of the toggle group.
   */
  height?: number;

  /**
   * Whether the toggle group is disabled or not.
   */
  disabled?: boolean;

  /**
   * The size of the toggle group (small, medium, large).
   */
  size?: 'small' | 'medium' | 'large';

  /**
   * The minimum width of the toggle group.
   */
  minWidth?: number;

  /**
   * The minimum height of the toggle group.
   */
  minHeight?: number;

  /**
   * The maximum width of the toggle group.
   */
  maxWidth?: number;

  /**
   * The maximum height of the toggle group.
   */
  maxHeight?: number;
}) => {
  // Add your custom logic here
  return (
    <ToggleButtonGroupStyled
      id={props.id}
      onChange={props.onChange}
      value={props.value}
      size={props.size}
      disabled={props.disabled}
      buttonCount={React.Children.count(props.children)}
      minWidth={props.minWidth}
      minHeight={props.minHeight}
      maxWidth={props.maxWidth}
      maxHeight={props.maxHeight}
      width={100}
      height={30}
      sx={props.sx}
    >
      {props.children}
    </ToggleButtonGroupStyled>
  );
};

/**
 * PropTypes for ToggleButtonGroupEx
 */
ToggleButtonGroupEx.propTypes = {
  /**
   * The content of the component.
   */
  children: React.PropTypes.arrayOf(React.PropTypes.node),

  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: React.PropTypes.oneOfType([
    React.PropTypes.arrayOf(
      React.PropTypes.oneOfType([React.PropTypes.func, React.PropTypes.object, React.PropTypes.bool]),
    ),
    React.PropTypes.func,
    React.PropTypes.object,
  ]),

  /**
   * The width of the toggle group.
   */
  width: React.PropTypes.number,

  /**
   * The height of the toggle group.
   */
  height: React.PropTypes.number,

  /**
   * Whether the toggle group is disabled or not.
   */
  disabled: React.PropTypes.bool,

  /**
   * The size of the toggle group (small, medium, large).
   */
  size: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.number,
  ]),
};

export default ToggleButtonGroupEx;