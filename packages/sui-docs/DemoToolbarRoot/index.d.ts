import * as React from 'react';
import { Theme } from '@mui/material/styles';
import { StyledComponent } from '@emotion/styled';
import { MUIStyledCommonProps } from "@mui/system";

export interface DemoToolbarRootProps {
  demoOptions: any;
  openDemoSource: any;
}

declare const DemoToolbarRoot: StyledComponent<
  MUIStyledCommonProps<Theme> & DemoToolbarRootProps,
  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>,
  {}
>;

export default DemoToolbarRoot; 

