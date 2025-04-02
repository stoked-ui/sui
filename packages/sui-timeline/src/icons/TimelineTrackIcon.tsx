import * as React from 'react';
import {SxProps} from "@mui/system";
import {styled, Theme} from "@mui/material/styles";

export type RootSvgProps<P = unknown> = Omit<React.SVGProps<SVGSVGElement>, 'ref'> & {
  sx?: SxProps<Theme>;
  ref?: React.Ref<SVGSVGElement>;
} & P;

const Svg = styled('svg')({
  verticalAlign: 'bottom',
});

export default function TimelineTrackIcon(props: RootSvgProps) {
  return (<Svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="-4 4 22 22"
      fill="none"
      sx={[(theme) => ({
        flexShrink: 0, color: 'common.black', ...theme.applyStyles('dark', {
          color: '#FFF',
        })
      }), ...(Array.isArray(props.sx) ? props.sx : [props.sx]),]}
      {...props}
    >
      <path
        d="M 18.024 16.725 L 18.024 19.725 L 2.024 19.725 L 2.024 16.725 L 18.024 16.725 Z M 15.024 12.725 L 15.024 15.725 L 8.024 15.725 L 8.024 12.725 L 15.024 12.725 Z M 18.024 8.725 L 18.024 11.725 L 4.024 11.725 L 4.024 8.725 L 18.024 8.725 Z"
        fill="#007FFF"
      />
    </Svg>);
}

