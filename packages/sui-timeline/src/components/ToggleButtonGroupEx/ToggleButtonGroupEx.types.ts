import * as React from 'react';
import {  ToggleButtonGroupProps } from "@mui/material";
import {SxProps} from "@mui/system";
import {Theme} from "@mui/material/styles";

export interface ToggleButtonGroupExProps extends ToggleButtonGroupProps {
  minWidth?: number,
  minHeight?: number,
  maxWidth?: number,
  maxHeight?: number,
  width?: number,
  height?: number,
  children?: React.ReactElement[],
  sx?: SxProps<Theme>,
}
