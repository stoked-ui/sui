import * as React from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from '@mui/material/styles';
import Box, { BoxProps } from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import useMediaQuery from '@mui/material/useMediaQuery';
import GradientText from 'docs/src/components/typography/GradientText';
import GetStartedButtons from 'docs/src/components/home/GetStartedButtons';
import HeroContainer from 'docs/src/layouts/HeroContainer';


function createLoading(sx: BoxProps['sx']) {
  return function Loading() {
    return (
      <Box
        sx={[
          (theme) => ({
            borderRadius: 1,
            bgcolor: 'grey.100',
            ...theme.applyDarkStyles({
              bgcolor: 'primaryDark.800',
            }),
          }),
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      />
    );
  };
}

const EditorHero = dynamic(() => import('../showcase/EditorHero'), {
  ssr: false,
  loading: createLoading({ width: '100%', height: 280 }),
});

export default function Hero() {
  const globalTheme = useTheme();
  const isMdUp = useMediaQuery(globalTheme.breakpoints.up('md'));
  return (
    <HeroContainer
      linearGradient
      left={
        <Box sx={{ textAlign: { xs: 'center', md: 'left' }, maxWidth: 500 }}>
          <Typography variant="h1" mb={1} className={'stoked-font'}sx={{paddingBottom: 1.5}}>
            STOKED <GradientText className={'stoked-font-fat'} >CONSULTING</GradientText>
          </Typography>
          <Typography color="text.secondary" mb={3}>
            Full stack consulting services with over 25 years experience developing web applications.
          </Typography>
          <GetStartedButtons primaryLabel="Make contact" primaryUrl="https://github.com/orgs/stoked-ui/projects/1/views/1" />
        </Box>
      }
      rightSx={{
        p: 0,
        ml: 2,
        minWidth: 2000,
        overflow: 'hidden', // the components in the Hero section are mostly illustrative, even though they're interactive. That's why scrolling is disabled.
        '& > div': {
          width: 760,
          display: 'inline-flex',
          verticalAlign: 'top',
          '&:nth-of-type(2)': {
            width: { xl: 400 },
          },
        },
        '&& *': {
          fontFamily: ['"IBM Plex Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'].join(',')
        },
      }}
      right={
        <React.Fragment>
          {isMdUp && (
            <Stack spacing={3} useFlexGap sx={{ '& > .MuiPaper-root': { maxWidth: 'none' } }}>
              <EditorHero id={'file-explorer-grid'} sx={{ width: '100%' }} />
            </Stack>
          )}
        </React.Fragment>
      }
    />
  );
}

