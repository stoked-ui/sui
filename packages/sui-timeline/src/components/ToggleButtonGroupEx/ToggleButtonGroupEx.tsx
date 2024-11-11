import * as React from 'react';
import { namedId } from "@stoked-ui/media-selector";
import { styled } from "@mui/material/styles";
import {
  ToggleButtonGroup as ToggleGroup,
  ToggleButtonGroupPropsSizeOverrides
} from "@mui/material";
import { OverridableStringUnion } from '@mui/types';
import { ToggleButtonGroupExProps } from "./ToggleButtonGroupEx.types";

const ToggleButtonGroupStyled = styled(ToggleGroup, {
  shouldForwardProp: (prop) =>
    prop !== 'sx' &&
    prop !== 'buttonCount' &&
    prop !== 'minWidth' &&
    prop !== 'minHeight' &&
    prop !== 'maxHeight' &&
    prop !== 'maxWidth' &&
    prop !== 'height' &&
    prop !== 'width'

}) <{
  orientation?: 'horizontal' | 'vertical',
  minWidth: number,
  minHeight: number,
  maxWidth: number,
  maxHeight: number,
  buttonCount: number,
  width: number,
  height: number
}>(({ orientation, theme, minWidth, minHeight,
                                               maxWidth, maxHeight, buttonCount,
  width, height
}) => {

  let groupHeight = height;
  let groupWidth = width;
  if (orientation === 'vertical') {
    groupHeight = (buttonCount * height) + 1;
  } else {
    groupWidth =(buttonCount * width) + 1;
  }
  return {
    height: `${groupHeight}px`,
    width: `${groupWidth}px`,
    backgroundColor: 'transparent!important',
    '& .MuiButtonBase-root': {
      backgroundColor: theme.palette.background.paper,
      color: theme.palette.text.primary,
      border: `1px solid ${theme.palette.text.primary}`,
      width: `${width}px`,
      height: `${height}px`,
      minHeight: `${minHeight}px`,
      maxHeight: `${maxWidth}px`,
      minWidth: `${minWidth}px`,
      maxWidth: `${maxHeight}px`,
      '&:hover': {
        minHeight: `${minHeight}px`,
        maxHeight: `${maxWidth}px`,
        minWidth: `${minWidth}px`,
        maxWidth: `${maxHeight}px`,
        color: theme.palette.primary[theme.palette.mode === 'light' ? '900' : '100'],
        backgroundColor: theme.palette.background.default,
        border: `2px solid ${theme.palette.primary[theme.palette.mode]}`,
        outline: `1px solid ${theme.palette.text.primary}`,
        zIndex: 30,
      }
    },
    '& .MuiButtonBase-root.Mui-selected': {
      backgroundColor: theme.palette.primary[100],
      color: `${theme.palette.primary.main}!important`,
      border: `2px solid ${theme.palette.primary[theme.palette.mode === 'dark' ? 'light' : 'dark']}!important`,
      zIndex: 20,
      '&:hover': {
        minHeight: `${minHeight}px`,
        maxHeight: `${maxWidth}px`,
        minWidth: `${minWidth}px`,
        maxWidth: `${maxHeight}px`,
        backgroundColor: theme.palette.background.default,
        border: `2px solid ${theme.palette.primary.main}!important`,
        zIndex: 20,
      }
    },
    '& .MuiButtonBase-root.Mui-focusVisible': {
      minHeight: `${minHeight}px`,
      maxHeight: `${maxWidth}px`,
      minWidth: `${minWidth}px`,
      maxWidth: `${maxHeight}px`,
      color: `${theme.palette.primary[theme.palette.mode]}!important`,
      backgroundColor: theme.palette.background.default,
      border: `2px solid ${theme.palette.primary[theme.palette.mode]}!important`,
      zIndex: 30,
      outline: 'none',
      outlineOffset: 'none',
    },
    '& .MuiButtonBase-root:not(.first-element)': {
      marginLeft: '-1px!important',
    },
  };
});

function ToggleButtonGroupEx(props: ToggleButtonGroupExProps) {
  const {
    id, onChange, value, children, size,
    minWidth, minHeight, maxWidth, maxHeight
  } = props;

  const getSizeBounds = (groupSize: OverridableStringUnion<'small' | 'medium' | 'large',  ToggleButtonGroupPropsSizeOverrides>): [number, number] => {
    switch (groupSize) {
      case 'small':
        return [10, 30];
      case 'medium':
        return [20, 50];
      case 'large':
        return [30, 70];
      default:
        return [10, 70];
    }
  }

  const [minSize, maxSize] = getSizeBounds(size);
  const childCount = React.Children.count(children);
  const minWidthFinal = Math.max(Math.min(maxWidth ?? minWidth ?? minSize, minWidth ?? maxWidth ?? minSize), minSize);
  const maxWidthFinal = Math.max(Math.min(maxWidth ?? minWidth ?? maxSize, minWidth ?? maxWidth ?? maxSize), maxSize);
  const minHeightFinal = Math.max(Math.min(maxHeight ?? minHeight ?? minSize, minHeight ?? maxHeight ?? minSize), minSize);
  const maxHeightFinal = Math.max(Math.min(maxHeight ?? minHeight ?? maxSize, minHeight ?? maxHeight ?? maxSize), maxSize);

  const defaultWidth = minWidthFinal + ((minWidthFinal % maxHeightFinal) / 2);
  const width = Math.max(minWidthFinal, Math.min(props.width ?? defaultWidth, maxWidthFinal))

  const defaultHeight = minWidthFinal + ((minWidthFinal % maxHeightFinal) / 2);
  const height = Math.max(minHeightFinal, Math.min(props.height ?? defaultHeight, maxHeightFinal))

  const idFinal = id ?? namedId('buttonGroup');
  React.useEffect(() => {
    const firstElement = document.getElementById(idFinal);
    if (firstElement) {
      firstElement.querySelector(".MuiButtonBase-root")?.classList.add("first-element");
    }
  });
  return (<ToggleButtonGroupStyled
      id={idFinal}
      onChange={onChange}
      value={value}
      size={size}
      disabled={props.disabled}
      buttonCount={childCount}
      minWidth={minWidthFinal}
      minHeight={minHeightFinal}
      maxWidth={maxWidthFinal}
      maxHeight={maxHeightFinal}
      width={width}
      height={height}
    >
      {props.children}
    </ToggleButtonGroupStyled>)
}

export default ToggleButtonGroupEx;
