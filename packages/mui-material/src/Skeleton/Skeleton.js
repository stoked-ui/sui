'use client';
import * as React from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { keyframes, css } from '@mui/system';
import { unstable_composeClasses as composeClasses } from '@mui/base/composeClasses';
import { alpha } from '../styles';
import styled from '../styles/styled';
import useThemeProps from '../styles/useThemeProps';
import { getSkeletonUtilityClass } from './skeletonClasses';

const useUtilityClasses = (ownerState) => {
  const { classes, shape, size, animation, hasChildren, width, height } = ownerState;

  const slots = {
    root: [
      'root',
      size,
      shape,
      animation,
      hasChildren && 'withChildren',
      hasChildren && !width && 'fitContent',
      hasChildren && !height && 'heightAuto',
    ],
  };

  return composeClasses(slots, getSkeletonUtilityClass, classes);
};

const pulseKeyframe = keyframes`
  0% {
    opacity: 1;
  }

  50% {
    opacity: 0.4;
  }

  100% {
    opacity: 1;
  }
`;

const waveKeyframe = keyframes`
  0% {
    transform: translateX(-100%);
  }

  50% {
    /* +0.5s of delay between each loop */
    transform: translateX(100%);
  }

  100% {
    transform: translateX(100%);
  }
`;

const SkeletonRoot = styled('span', {
  name: 'MuiSkeleton',
  slot: 'Root',
  overridesResolver: (props, styles) => {
    const { ownerState } = props;
    return [
      styles.root,
      ownerState.shape && styles[ownerState.shape],
      ownerState.size && styles[ownerState.size],
      ownerState.animation !== false && styles[ownerState.animation],
      ownerState.hasChildren && styles.withChildren,
      ownerState.hasChildren && !ownerState.width && styles.fitContent,
      ownerState.hasChildren && !ownerState.height && styles.heightAuto,
    ];
  },
})(
  ({ theme, ownerState }) => ({
    display: 'block',
    // Create a "on paper" color with sufficient contrast retaining the color
    backgroundColor: theme.vars
      ? theme.vars.palette.Skeleton.bg
      : alpha(theme.palette.text.primary, theme.palette.mode === 'light' ? 0.11 : 0.13),
    height: '1.2em',
    borderRadius: (theme.vars || theme).shape.borderRadius,
    ...(ownerState.size === 'text' && {
      marginTop: 0,
      marginBottom: 0,
      height: 'auto',
      transformOrigin: '0 55%',
      transform: 'scale(1, 0.60)',
      '&:empty:before': {
        content: '"\\00a0"',
      },
    }),
    ...(ownerState.shape === 'circular' && {
      borderRadius: '50%',
    }),
    ...(ownerState.shape === 'rectangular' && {
      borderRadius: 0,
    }),
    ...(ownerState.hasChildren && {
      '& > *': {
        visibility: 'hidden',
      },
    }),
    ...(ownerState.hasChildren &&
      !ownerState.width && {
        maxWidth: 'fit-content',
      }),
    ...(ownerState.hasChildren &&
      !ownerState.height && {
        height: 'auto',
      }),
  }),
  ({ ownerState }) =>
    ownerState.animation === 'pulse' &&
    css`
      animation: ${pulseKeyframe} 2s ease-in-out 0.5s infinite;
    `,
  ({ ownerState, theme }) =>
    ownerState.animation === 'wave' &&
    css`
      position: relative;
      overflow: hidden;

      /* Fix bug in Safari https://bugs.webkit.org/show_bug.cgi?id=68196 */
      -webkit-mask-image: -webkit-radial-gradient(white, black);

      &::after {
        animation: ${waveKeyframe} 2s linear 0.5s infinite;
        background: linear-gradient(
          90deg,
          transparent,
          ${(theme.vars || theme).palette.action.hover},
          transparent
        );
        content: '';
        position: absolute;
        transform: translateX(-100%); /* Avoid flash during server-side hydration */
        bottom: 0;
        left: 0;
        right: 0;
        top: 0;
      }
    `,
);

const Skeleton = React.forwardRef(function Skeleton(inProps, ref) {
  const props = useThemeProps({ props: inProps, name: 'MuiSkeleton' });
  const {
    animation = 'pulse',
    className,
    component = 'span',
    height,
    // TODO v6: add defaults
    shape,
    size,
    style,
    variant = 'text',
    width,
    ...other
  } = props;

  const sizeValue = size ?? (variant === 'text' ? variant : undefined);
  const shapeValue =
    shape ?? (['circular', 'rectangular', 'rounded'].includes(variant) ? variant : undefined);

  const ownerState = {
    ...props,
    animation,
    component,
    size: sizeValue,
    shape: shapeValue,
    hasChildren: Boolean(other.children),
  };

  const classes = useUtilityClasses(ownerState);

  return (
    <SkeletonRoot
      as={component}
      ref={ref}
      className={clsx(classes.root, className)}
      ownerState={ownerState}
      {...other}
      style={{
        width,
        height,
        ...style,
      }}
    />
  );
});

Skeleton.propTypes /* remove-proptypes */ = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // |     To update them edit the d.ts file and run "yarn proptypes"     |
  // ----------------------------------------------------------------------
  /**
   * The animation.
   * If `false` the animation effect is disabled.
   * @default 'pulse'
   */
  animation: PropTypes.oneOf(['pulse', 'wave', false]),
  /**
   * Optional children to infer width and height from.
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
   * The component used for the root node.
   * Either a string to use a HTML element or a component.
   */
  component: PropTypes.elementType,
  /**
   * Height of the skeleton.
   * Useful when you don't want to adapt the skeleton to a text element but for instance a card.
   */
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  /**
   * The shape of the skeleton.
   */
  shape: PropTypes.oneOf(['circular', 'rectangular', 'rounded']),
  /**
   * Determines whether the skeleton should scale to the element's text or bounding box.
   */
  size: PropTypes.oneOf(['text', 'box']),
  /**
   * @ignore
   */
  style: PropTypes.object,
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])),
    PropTypes.func,
    PropTypes.object,
  ]),
  /**
   * The type of content that will be rendered.
   * @default 'text'
   * @deprecated Use `shape` prop to set the shape of the skeleton and `size` prop to set the scale adaptation.
   */
  variant: PropTypes /* @typescript-to-proptypes-ignore */.oneOfType([
    PropTypes.oneOf(['circular', 'rectangular', 'rounded', 'text']),
    PropTypes.string,
  ]),
  /**
   * Width of the skeleton.
   * Useful when the skeleton is inside an inline element with no width of its own.
   */
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

export default Skeleton;
