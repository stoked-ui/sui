import * as React from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from '@mui/material/styles';
import Box, { BoxProps } from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import useMediaQuery from '@mui/material/useMediaQuery';
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

const TimelineHero = dynamic(() => import('../showcase/TimelineHero'), {
  ssr: false,
  loading: createLoading({ width: '100%', height: 280 }),
});

export default function Hero() {
  const globalTheme = useTheme();
  const isMdUp = useMediaQuery(globalTheme.breakpoints.up('md'));

  return (
    <HeroContainer
      mdHeight={750}
      linearGradient
      left={
        <Box sx={{ textAlign: { xs: 'center', md: 'left' }, maxWidth: 500 }}>
          <Typography variant="h2" mb={1}>
            Make
          </Typography>
          <Typography id='text-bg' variant="h1" mb={1} sx={[
            {
              backgroundRepeat: 'repeat',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              WebkitFontSmoothing: "antialiased",
              backgroundImage: 'url("/static/images/editor/them-thangs-0.png")',
              backgroundAttachment: 'fixed',
              backgroundPosition: 'center',
              backgroundSize: 'cover',
              lineHeight: '1.17',
            },
            (theme) => theme.applyDarkStyles({
              filter: 'invert(100%)',
            }),
          ]}>
            them thangs
          </Typography>
          <Box sx={{
            textWrap: 'nowrap',
            whiteSpace: 'nowrap',
            fontFamily: '"General Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
            fontWeight: '600',
            scrollSnapMarginTop: 'calc(var(--MuiDocs-header-height) + 32px)',
            scrollMarginTop: 'calc(var(--MuiDocs-header-height) + 32px)',
            letterSpacing: '-0.2px',
            marginBottom: '8px',
            display: 'flex',
          }}>
            <Box component="span" sx={{
              fontSize: 'clamp(1.5rem, 0.9643rem + 1.4286vw, 2.25rem)',
              lineHeight: '1.2222222222222223',
              alignSelf: 'center',
            }}>w/</Box>
            <Box component="span" sx={[
              {
                background: 'linear-gradient(90deg, hsl(210, 100%, 60%) 5%, hsl(210, 100%, 45%) 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: 'clamp(2.5rem, 1.125rem + 3.5vw, 3.5em)',
                lineHeight: '1.1142857142857143',
              },
              (theme) => theme.applyDarkStyles({
                background: 'linear-gradient(90deg, hsl(210, 100%, 70%) 5%, hsl(210, 100%, 55%) 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }),
            ]}>&nbsp;Timeline</Box>
          </Box>
          <Typography color="text.secondary" mb={3}>
            Stoked UI: Timeline. A powerful MUI based timeline component used to construct tools that manipulate things over time or at key frames. PR&apos;s welcome!
          </Typography>
          <GetStartedButtons primaryLabel="Checkout the roadmap to see whats next" primaryUrl="https://github.com/orgs/stoked-ui/projects/1/views/1" />
        </Box>
      }
      rightSx={{
        p: 4,
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
          fontFamily: ['"IBM Plex Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'].join(
            ',',
          ),
        },
      }}
      right={
        <React.Fragment>
          {isMdUp && (
            <Stack spacing={3} useFlexGap sx={{ '& > .MuiPaper-root': { maxWidth: 'none' } }}>
              <TimelineHero id={'editor-hero'} sx={{ width: '100%' }} />
            </Stack>
          )}
        </React.Fragment>
      }
    />
  );
}
