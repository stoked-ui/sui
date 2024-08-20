// @inheritedComponent ButtonBase
import * as React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import resolveProps from '@mui/utils/resolveProps';
import composeClasses from '@mui/utils/composeClasses';
import {alpha, Theme} from '@mui/material/styles';
import ButtonBase, {ExtendButtonBase, ExtendButtonBaseTypeMap} from '@mui/material/ButtonBase';
import capitalize from '@mui/material/utils/capitalize';
import useThemeProps from '@mui/material/styles/useThemeProps';
import styled from '@mui/material/styles/styled';
import toggleButtonClasses, {
  getToggleButtonUtilityClass,
  ToggleButtonClasses
} from './toggleButtonClasses';
import ToggleButtonGroupContext from '../ToggleButtonGroup/ToggleButtonGroupContext';
import ToggleButtonGroupButtonContext from '../ToggleButtonGroup/ToggleButtonGroupButtonContext';
import isValueSelected from '../ToggleButtonGroup/isValueSelected';
import {SxProps} from "@mui/system";
import {OverrideProps} from "@mui/material/OverridableComponent";
import { OverridableStringUnion } from '@mui/types';

export interface ToggleButtonPropsSizeOverrides {}

export interface ToggleButtonPropsColorOverrides {}

export interface ToggleButtonOwnProps {
  /**
   * The content of the component.
   */
  children?: React.ReactNode;
  /**
   * Override or extend the styles applied to the component.
   */
  classes?: Partial<ToggleButtonClasses>;
  /**
   * The color of the button when it is in an active state.
   * It supports both default and custom theme colors, which can be added as shown in the
   * [palette customization guide](https://mui.com/material-ui/customization/palette/#custom-colors).
   * @default 'standard'
   */
  color?: OverridableStringUnion<
    'standard' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning',
  ToggleButtonPropsColorOverrides
  >;
  /**
   * If `true`, the component is disabled.
   * @default false
   */
  disabled?: boolean;
  /**
   * If `true`, the  keyboard focus ripple is disabled.
   * @default false
   */
  disableFocusRipple?: boolean;
  /**
   * If `true`, the button will take up the full width of its container.
   * @default false
   */
  fullWidth?: boolean;
  /**
   * Callback fired when the state changes.
   *
   * @param {React.MouseEvent<HTMLElement>} event The event source of the callback.
   * @param {any} value of the selected button.
   */
  onChange?: (event: React.MouseEvent<HTMLElement>, value: any) => void;
  /**
   * Callback fired when the button is clicked.
   *
   * @param {React.MouseEvent<HTMLElement>} event The event source of the callback.
   * @param {any} value of the selected button.
   */
  onClick?: (event: React.MouseEvent<HTMLElement>, value: any) => void;
  /**
   * If `true`, the button is rendered in an active state.
   */
  selected?: boolean;
  /**
   * The size of the component.
   * The prop defaults to the value inherited from the parent ToggleButtonGroup component.
   * @default 'medium'
   */
  size?: OverridableStringUnion<'small' | 'medium' | 'large', ToggleButtonPropsSizeOverrides>;
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx?: SxProps<Theme>;
  /**
   * The value to associate with the button when selected in a
   * ToggleButtonGroup.
   */
  value: NonNullable<unknown>;
}

export type ToggleButtonTypeMap<
AdditionalProps = {},
  RootComponent extends React.ElementType = 'button',
> = ExtendButtonBaseTypeMap<{
  props: AdditionalProps & ToggleButtonOwnProps;
  defaultComponent: RootComponent;
}>;

export type ToggleButtonProps<
RootComponent extends React.ElementType = ToggleButtonTypeMap['defaultComponent'],
  AdditionalProps = {},
> = OverrideProps<ToggleButtonTypeMap<AdditionalProps, RootComponent>, RootComponent> & {
  component?: React.ElementType;
};

const useUtilityClasses = (ownerState) => {
  const { classes, fullWidth, selected, disabled, size, color } = ownerState;

  const slots = {
    root: [
      'root',
      selected && 'selected',
      disabled && 'disabled',
      fullWidth && 'fullWidth',
      `size${capitalize(size)}`,
      color,
    ],
  };

  return composeClasses(slots, getToggleButtonUtilityClass, classes);
};

const ToggleButtonRoot = styled(ButtonBase, {
  name: 'SuiToggleButton',
  slot: 'Root',
  overridesResolver: (props, styles) => {
    const { ownerState } = props;

    return [styles.root, styles[`size${capitalize(ownerState.size)}`]];
  },
})(({ theme, ownerState }: { theme: Theme, ownerState: any }) => {
  let selectedColor =
    ownerState.color === 'standard'
      ? theme.palette.text.primary
      : theme.palette[ownerState.color].main;
  let selectedColorChannel;
  if (theme.vars) {
    selectedColor =
      ownerState.color === 'standard'
        ? theme.vars.palette.text.primary
        : theme.vars.palette[ownerState.color].main;
    selectedColorChannel =
      ownerState.color === 'standard'
        ? theme.vars.palette.text.primaryChannel
        : theme.vars.palette[ownerState.color].mainChannel;
  }

  const outlineColor = theme.vars ? theme.vars.palette.text.primary : theme.palette.text.primary;
  return {
    ...theme.typography.button,
    borderRadius: (theme.vars || theme).shape.borderRadius,
    padding: 11,
    border: `1px solid ${(theme.vars || theme).palette.divider}`,
    backgroundColor: theme.palette.mode === 'light' ? theme.palette.grey[50] : theme.palette.grey[1000],
    color: (theme.vars || theme).palette.action.active,
    ...(ownerState.fullWidth && {
      width: '100%',
    }),
    [`&.${toggleButtonClasses.disabled}`]: {
      color: (theme.vars || theme).palette.action.disabled,
      border: `1px solid ${(theme.vars || theme).palette.action.disabledBackground}`,
    },
    '&:hover': {
      textDecoration: 'none',
      // Reset on mouse devices
      color: theme.vars ? theme.vars.palette.primary.main : theme.palette.primary.main,
      border: `1px solid ${outlineColor}`,
      backgroundColor: theme.vars ? theme.vars.palette.background.default : theme.palette.background.default,
      '@media (hover: none)': {
        backgroundColor: 'transparent',
      },
    },
    [`&.${toggleButtonClasses.selected}`]: {
      color: selectedColor,
      backgroundColor: theme.vars
        ? `rgba(${selectedColorChannel} / ${theme.vars.palette.action.selectedOpacity})`
        : alpha(selectedColor, theme.palette.action.selectedOpacity),
      '&:hover': {
        backgroundColor: theme.vars
          ? `rgba(${selectedColorChannel} / calc(${theme.vars.palette.action.selectedOpacity} + ${theme.vars.palette.action.hoverOpacity}))`
          : alpha(
              selectedColor,
              theme.palette.action.selectedOpacity + theme.palette.action.hoverOpacity,
            ),
        // Reset on touch devices, it doesn't add specificity
        '@media (hover: none)': {
          backgroundColor: theme.vars
            ? `rgba(${selectedColorChannel} / ${theme.vars.palette.action.selectedOpacity})`
            : alpha(selectedColor, theme.palette.action.selectedOpacity),
        },
      },
    },
    ...(ownerState.size === 'small' && {
      padding: 7,
      fontSize: theme.typography.pxToRem(13),
    }),
    ...(ownerState.size === 'large' && {
      padding: 15,
      fontSize: theme.typography.pxToRem(15),
    }),
  };
});

const ToggleButton = React.forwardRef(function ToggleButton(inProps: any, ref) {
  // props priority: `inProps` > `contextProps` > `themeDefaultProps`
  const { value: contextValue, ...contextProps } = React.useContext(ToggleButtonGroupContext);
  const toggleButtonGroupButtonContextPositionClassName = React.useContext(
    ToggleButtonGroupButtonContext,
  );
  const resolvedProps = resolveProps(
    { ...contextProps, selected: isValueSelected(inProps.value, contextValue) },
    inProps,
  );
  const props = useThemeProps({ props: resolvedProps, name: 'SuiToggleButton' });
  const {
    children,
    className,
    color = 'standard',
    disabled = false,
    disableFocusRipple = false,
    fullWidth = false,
    onChange,
    onClick,
    selected,
    size = 'medium',
    value,
    ...other
  } = props;

  const ownerState = {
    ...props,
    color,
    disabled,
    disableFocusRipple,
    fullWidth,
    size,
  };

  const classes = useUtilityClasses(ownerState);

  const handleChange = (event) => {
    if (onClick) {
      onClick(event, value);
      if (event.defaultPrevented) {
        return;
      }
    }

    if (onChange) {
      onChange(event, value);
    }
  };

  const positionClassName = toggleButtonGroupButtonContextPositionClassName || '';

  return (
    <ToggleButtonRoot
      className={clsx(contextProps.className, classes.root, className, positionClassName)}
      disabled={disabled}
      focusRipple={!disableFocusRipple}
      ref={ref}
      onClick={handleChange}
      onChange={onChange}
      value={value}
      ownerState={ownerState}
      aria-pressed={selected}
      {...other}
    >
      {children}
    </ToggleButtonRoot>
  );
});

ToggleButton.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │    To update them, edit the d.ts file and run `pnpm proptypes`.     │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * The content of the component.
   */
  children: PropTypes.node,
  /**
   * Override or extend the styles applied to the component.
   */
  classes: PropTypes.object,
  /**
   * @ignore
   */
  className: PropTypes.string,
  /**
   * The color of the button when it is in an active state.
   * It supports both default and custom theme colors, which can be added as shown in the
   * [palette customization guide](https://mui.com/material-ui/customization/palette/#custom-colors).
   * @default 'standard'
   */
  color: PropTypes /* @typescript-to-proptypes-ignore */.oneOfType([
    PropTypes.oneOf(['standard', 'primary', 'secondary', 'error', 'info', 'success', 'warning']),
    PropTypes.string,
  ]),
  /**
   * If `true`, the component is disabled.
   * @default false
   */
  disabled: PropTypes.bool,
  /**
   * If `true`, the  keyboard focus ripple is disabled.
   * @default false
   */
  disableFocusRipple: PropTypes.bool,
  /**
   * If `true`, the ripple effect is disabled.
   *
   * ⚠️ Without a ripple there is no styling for :focus-visible by default. Be sure
   * to highlight the element by applying separate styles with the `.Sui-focusVisible` class.
   * @default false
   */
  disableRipple: PropTypes.bool,
  /**
   * If `true`, the button will take up the full width of its container.
   * @default false
   */
  fullWidth: PropTypes.bool,
  /**
   * Callback fired when the state changes.
   *
   * @param {React.MouseEvent<HTMLElement>} event The event source of the callback.
   * @param {any} value of the selected button.
   */
  onChange: PropTypes.func,
  /**
   * Callback fired when the button is clicked.
   *
   * @param {React.MouseEvent<HTMLElement>} event The event source of the callback.
   * @param {any} value of the selected button.
   */
  onClick: PropTypes.func,
  /**
   * If `true`, the button is rendered in an active state.
   */
  selected: PropTypes.bool,
  /**
   * The size of the component.
   * The prop defaults to the value inherited from the parent ToggleButtonGroup component.
   * @default 'medium'
   */
  size: PropTypes /* @typescript-to-proptypes-ignore */.oneOfType([
    PropTypes.oneOf(['small', 'medium', 'large']),
    PropTypes.string,
  ]),
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])),
    PropTypes.func,
    PropTypes.object,
  ]),
  /**
   * The value to associate with the button when selected in a
   * ToggleButtonGroup.
   */
  value: PropTypes /* @typescript-to-proptypes-ignore */.any.isRequired,
};

export default ToggleButton;
