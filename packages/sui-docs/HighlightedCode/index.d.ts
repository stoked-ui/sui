import * as React from 'react';
import { SxProps } from "@mui/system";
import { Theme } from "@mui/material/styles";

export interface HighlightedCodeProps {
  code: string;
  component?: React.ElementType;
  copyButtonHidden?: boolean;
  copyButtonProps?: Object;
  language?: string;
  sx?: SxProps<Theme>;
}

declare const HighlightedCode: React.ForwardRefExoticComponent<
  HighlightedCodeProps & React.RefAttributes<HTMLElement>
>;

export default HighlightedCode; 
