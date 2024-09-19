import SvgIcon from '@mui/material/SvgIcon';
import {createSvgIcon} from '@mui/material/utils';
import * as React from 'react';

export const FileExplorerExpandIcon = createSvgIcon(
  <path d="M16.59 12.41 12 7.83 7.41 12.41 6 11l6-6 6 6z" />,
  'FileExplorerExpandIcon',
);

export const FileExplorerCollapseIcon = createSvgIcon(
  <path d="M16.59 8.59 12 13.17 7.41 8.59 6 10l6 6 6-6z" />,
  'FileExplorerCollapseIcon',
);

export function LottieIcon()  {
  return (
    <SvgIcon>
      {/* credit: cog icon from https://heroicons.com */}
      <svg xmlns="http://www.w3.org/2000/svg"
           viewBox="0 0 400 400"
           stroke="currentColor">
        <g >
          <path fill="#00ddb3" d="M298.783 0H101.217C45.317 0 0 45.317 0 101.217v197.566C0 354.683 45.316 400 101.217 400h197.566C354.683 400 400 354.683 400 298.783V101.217C400 45.317 354.683 0 298.783 0z"></path>
          <path fill="#fff" d="M304.035 89.598c-68.951 0-94.382 49.158-114.885 88.663l-13.486 25.248c-21.74 41.899-37.964 67.35-79.781 67.35a19.756 19.756 0 0 0-13.995 5.784 19.769 19.769 0 0 0-4.291 21.56 19.758 19.758 0 0 0 10.713 10.702 19.756 19.756 0 0 0 7.573 1.499c68.951 0 94.382-49.158 114.885-88.663l13.405-25.248c21.74-41.899 37.964-67.35 79.781-67.35a19.763 19.763 0 0 0 18.286-12.201 19.77 19.77 0 0 0-4.291-21.56 19.763 19.763 0 0 0-13.995-5.784z"></path>
        </g>
      </svg>
    </SvgIcon>
  );
}
