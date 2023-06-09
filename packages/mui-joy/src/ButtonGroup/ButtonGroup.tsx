import * as React from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { unstable_composeClasses as composeClasses } from '@mui/base';
import { OverridableComponent } from '@mui/types';
import {
  unstable_capitalize as capitalize,
  unstable_isMuiElement as isMuiElement,
} from '@mui/utils';
import { useThemeProps } from '../styles';
import styled from '../styles/styled';
import buttonGroupClasses, { getButtonGroupUtilityClass } from './buttonGroupClasses';
import { ButtonGroupProps, ButtonGroupOwnerState, ButtonGroupTypeMap } from './ButtonGroupProps';
import ButtonGroupContext from './ButtonGroupContext';
import useSlot from '../utils/useSlot';
import buttonClasses from '../Button/buttonClasses';
import iconButtonClasses from '../IconButton/iconButtonClasses';

const useUtilityClasses = (ownerState: ButtonGroupOwnerState) => {
  const { size, variant, color, detached, orientation } = ownerState;

  const slots = {
    root: [
      'root',
      orientation,
      detached && 'detached',
      variant && `variant${capitalize(variant)}`,
      color && `color${capitalize(color)}`,
      size && `size${capitalize(size)}`,
    ],
  };

  return composeClasses(slots, getButtonGroupUtilityClass, {});
};

const ButtonGroupRoot = styled('div', {
  name: 'JoyButtonGroup',
  slot: 'Root',
  overridesResolver: (props, styles) => styles.root,
})<{ ownerState: ButtonGroupOwnerState }>(({ theme, ownerState }) => {
  const variantStyle = theme.variants[ownerState.variant!]?.[ownerState.color!];
  const shouldHaveBorder = !variantStyle?.border;
  const firstChildRadius =
    ownerState.orientation === 'vertical'
      ? 'var(--ButtonGroup-radius) var(--ButtonGroup-radius) 0 0'
      : 'var(--ButtonGroup-radius) 0 0 var(--ButtonGroup-radius)';
  const lastChildRadius =
    ownerState.orientation === 'vertical'
      ? '0 0 var(--ButtonGroup-radius) var(--ButtonGroup-radius)'
      : '0 var(--ButtonGroup-radius) var(--ButtonGroup-radius) 0';
  const margin =
    ownerState.orientation === 'vertical'
      ? 'var(--ButtonGroup-separatorSize) 0 0 0'
      : '0 0 0 var(--ButtonGroup-separatorSize)';
  return [
    {
      '--ButtonGroup-separatorSize': '-1px',
      ...(ownerState.color !== 'context' && {
        '--ButtonGroup-separatorColor': theme.vars.palette[ownerState.color!]?.outlinedBorder,
        ...(ownerState.variant === 'solid' && {
          '--ButtonGroup-separatorColor': theme.vars.palette[ownerState.color!]?.[400],
        }),
      }),
      '--ButtonGroup-radius': theme.vars.radius.sm,
      '--Divider-inset': '0.5rem',
      display: 'flex',
      flexDirection: ownerState.orientation === 'vertical' ? 'column' : 'row',
      [`&:not(.${buttonGroupClasses.detached})`]: {
        // first Button or IconButton
        [`& > [data-first-child]`]: {
          '--Button-radius': firstChildRadius,
          '--IconButton-radius': firstChildRadius,
          ...(shouldHaveBorder &&
            ownerState.orientation === 'horizontal' && {
              borderRight: '1px solid var(--ButtonGroup-separatorColor)',
            }),
          ...(shouldHaveBorder &&
            ownerState.orientation === 'vertical' && {
              borderBottom: '1px solid var(--ButtonGroup-separatorColor)',
            }),
        },
        // middle Buttons or IconButtons
        [`& > :not([data-first-child]):not([data-last-child])`]: {
          '--Button-radius': '0px',
          '--IconButton-radius': '0px',
          borderRadius: 0,
          ...(shouldHaveBorder &&
            ownerState.orientation === 'horizontal' && {
              borderLeft: '1px solid var(--ButtonGroup-separatorColor)',
              borderRight: '1px solid var(--ButtonGroup-separatorColor)',
            }),
          ...(shouldHaveBorder &&
            ownerState.orientation === 'vertical' && {
              borderTop: '1px solid var(--ButtonGroup-separatorColor)',
              borderBottom: '1px solid var(--ButtonGroup-separatorColor)',
            }),
        },
        // last Button or IconButton
        [`& > [data-last-child]`]: {
          '--Button-radius': lastChildRadius,
          '--IconButton-radius': lastChildRadius,
          ...(shouldHaveBorder &&
            ownerState.orientation === 'horizontal' && {
              borderLeft: '1px solid var(--ButtonGroup-separatorColor)',
            }),
          ...(shouldHaveBorder &&
            ownerState.orientation === 'vertical' && {
              borderTop: '1px solid var(--ButtonGroup-separatorColor)',
            }),
        },
        [`& > :not([data-first-child])`]: {
          '--Button-margin': margin,
          '--IconButton-margin': margin,
        },
        [`& .${buttonClasses.root}, & .${iconButtonClasses.root}`]: {
          [`&:hover, ${theme.focus.selector}`]: {
            zIndex: 1, // to make borders appear above sibling.
          },
        },
        ...(ownerState.buttonFlex && {
          [`& > *:not(.${iconButtonClasses.root})`]: {
            flex: ownerState.buttonFlex,
          },
          [`& > :not(button) > .${buttonClasses.root}`]: {
            width: '100%', // for button to fill its wrapper.
          },
        }),
      },
    },
    {
      [theme.getColorSchemeSelector('dark')]: {
        ...(ownerState.color !== 'context' && {
          ...(ownerState.variant !== 'outlined' && {
            '--ButtonGroup-separatorColor': theme.vars.palette[ownerState.color!]?.[700],
          }),
        }),
      },
    },
  ];
});

/**
 *
 * Demos:
 *
 * - [Button Group](https://mui.com/joy-ui/react-button-group/)
 *
 * API:
 *
 * - [ButtonGroup API](https://mui.com/joy-ui/api/button-group/)
 */
const ButtonGroup = React.forwardRef(function ButtonGroup(inProps, ref) {
  const props = useThemeProps<typeof inProps & ButtonGroupProps>({
    props: inProps,
    name: 'JoyButtonGroup',
  });

  const {
    buttonFlex,
    className,
    component = 'div',
    disabled = false,
    detached = false,
    size = 'md',
    color = 'neutral',
    variant = 'outlined',
    children,
    orientation = 'horizontal',
    slots = {},
    slotProps = {},
    ...other
  } = props;

  const ownerState = {
    ...props,
    buttonFlex,
    color,
    component,
    detached,
    orientation,
    size,
    variant,
  };

  const classes = useUtilityClasses(ownerState);
  const externalForwardedProps = { ...other, component, slots, slotProps };

  const [SlotRoot, rootProps] = useSlot('root', {
    ref,
    className: clsx(classes.root, className),
    elementType: ButtonGroupRoot,
    externalForwardedProps,
    additionalProps: {
      role: 'group',
    },
    ownerState,
  });

  const buttonGroupContext = React.useMemo(
    () => ({ variant, color, size, disabled }),
    [variant, color, size, disabled],
  );

  return (
    <SlotRoot {...rootProps}>
      <ButtonGroupContext.Provider value={buttonGroupContext}>
        {React.Children.map(children, (child, index) => {
          if (!React.isValidElement(child)) {
            return child;
          }
          const extraProps: Record<string, any> = {};
          if (isMuiElement(child, ['Divider'])) {
            extraProps.inset = 'inset' in child.props ? child.props.inset : 'context';

            const dividerOrientation = orientation === 'vertical' ? 'horizontal' : 'vertical';
            extraProps.orientation =
              'orientation' in child.props ? child.props.orientation : dividerOrientation;
            extraProps.role = 'presentation';
            extraProps.component = 'span';
          }
          if (index === 0) {
            extraProps['data-first-child'] = '';
          }
          if (index === React.Children.count(children) - 1) {
            extraProps['data-last-child'] = '';
          }
          return React.cloneElement(child, extraProps);
        })}
      </ButtonGroupContext.Provider>
    </SlotRoot>
  );
}) as OverridableComponent<ButtonGroupTypeMap>;

ButtonGroup.propTypes /* remove-proptypes */ = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // |     To update them edit TypeScript types and run "yarn proptypes"  |
  // ----------------------------------------------------------------------
  /**
   * The flex value of the button.
   * @example buttonFlex={1} will set flex: '1 1 auto' on each button (stretch the button to equally fill the available space).
   */
  buttonFlex: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  /**
   * Used to render icon or text elements inside the ButtonGroup if `src` is not set.
   * This can be an element, or just a string.
   */
  children: PropTypes.node,
  /**
   * @ignore
   */
  className: PropTypes.string,
  /**
   * The color of the component. It supports those theme colors that make sense for this component.
   * @default 'neutral'
   */
  color: PropTypes /* @typescript-to-proptypes-ignore */.oneOfType([
    PropTypes.oneOf(['danger', 'info', 'neutral', 'primary', 'success', 'warning']),
    PropTypes.string,
  ]),
  /**
   * The component used for the root node.
   * Either a string to use a HTML element or a component.
   */
  component: PropTypes.elementType,
  /**
   * If `true`, the border radius of the buttons are not removed.
   * @default false
   */
  detached: PropTypes.bool,
  /**
   * If `true`, all the buttons will be disabled.
   * @default false
   */
  disabled: PropTypes.bool,
  /**
   * The component orientation.
   * @default 'horizontal'
   */
  orientation: PropTypes.oneOf(['horizontal', 'vertical']),
  /**
   * The size of the component.
   * It accepts theme values between 'sm' and 'lg'.
   * @default 'md'
   */
  size: PropTypes /* @typescript-to-proptypes-ignore */.oneOfType([
    PropTypes.oneOf(['lg', 'md', 'sm']),
    PropTypes.string,
  ]),
  /**
   * The props used for each slot inside.
   * @default {}
   */
  slotProps: PropTypes.shape({
    root: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
  }),
  /**
   * The components used for each slot inside.
   * @default {}
   */
  slots: PropTypes.shape({
    root: PropTypes.elementType,
  }),
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])),
    PropTypes.func,
    PropTypes.object,
  ]),
  /**
   * The [global variant](https://mui.com/joy-ui/main-features/global-variants/) to use.
   * @default 'outlined'
   */
  variant: PropTypes /* @typescript-to-proptypes-ignore */.oneOfType([
    PropTypes.oneOf(['outlined', 'plain', 'soft', 'solid']),
    PropTypes.string,
  ]),
} as any;

export default ButtonGroup;
