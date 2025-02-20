import * as React from 'react';
import Container from '@mui/material/Container';
import Box, { BoxProps } from '@mui/material/Box';
import { alpha } from '@mui/material/styles';
import NoSsr from '@mui/material/NoSsr';

interface SelectionProps extends BoxProps {
  bg?: 'white' | 'comfort' | 'dim' | 'gradient' | 'transparent';
  /**
   * Less vertical spacing
   */
  cozy?: boolean;
  noPaddingBottom?: boolean;
}

const map = {
  white: {
    light: 'common.white',
    dark: 'primaryDark.900',
  },
  comfort: {
    light: 'grey.50',
    dark: 'primaryDark.900',
  },
  dim: {
    light: 'primaryDark.700',
    dark: 'primaryDark.700',
  },
  transparent: {
    light: 'transparent',
    dark: 'transparent',
  },
};

const Section = React.forwardRef<HTMLDivElement, SelectionProps>(function Section(props, ref) {
  const { bg = 'white', children, sx, cozy = false, noPaddingBottom = false, ...other } = props;

  return (
    <div></div>
  );
});

export default Section;
