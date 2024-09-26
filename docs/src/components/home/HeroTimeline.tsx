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

const EditorHero = dynamic(() => import('../showcase/TimelineHero'), {
  ssr: false,
  loading: createLoading({ width: '100%', height: 280 }),
});

export default function Hero() {
  const globalTheme = useTheme();
  const isMdUp = useMediaQuery(globalTheme.breakpoints.up('md'));
  /* React.useEffect(() => {
   var velocity = 0.2;
   if (window) {
   const mainContent = document.getElementById('main-content');
   const textBg = document.getElementById('text-bg');
   textBg?.addEventListener("scroll", (event, second) => {
   console.log('111', event, second)
   if (textBg?.style && mainContent) {
   const height = mainContent.clientHeight;
   const pos = document.body.scrollTop - 18;
   console.log('(height - pos) * velocity)', (height - pos) * velocity, height, pos, event.target.scrollTop);
   textBg.style.backgroundPositionY = `${Math.round((height - pos) * velocity)}px`
   }
   });
   }
   }, []) */

  return (
    <HeroContainer
      mdHeight={750}
      linearGradient
      left={
        <Box sx={{ textAlign: { xs: 'center', md: 'left' }, maxWidth: 500 }}>
          <Typography variant="h2" mb={1}>
            Make
          </Typography>
          <Typography id='text-bg' variant="h1" mb={1} sx={(theme) => ({
            backgroundRepeat: 'repeat',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            WebkitFontSmoothing: "antialiased",
            backgroundImage: 'url("/static/images/editor/them-thangs-0.png")',
            backgroundAttachment: 'fixed',
            filter: theme.palette.mode === 'dark' ? 'invert(100%)' : undefined,
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            lineHeight: '1.17'
          })}>
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
            <div style={{
              fontSize: 'clamp(1.5rem, 0.9643rem + 1.4286vw, 2.25rem)',
              lineHeight: '1.2222222222222223',
              alignSelf: 'center'
            }}>w/</div>
            <div style={{
              background: 'linear-gradient(90deg, hsl(210, 100%, 60%) 5%, hsl(210, 100%, 45%) 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: 'clamp(2.5rem, 1.125rem + 3.5vw, 3.5em)',
              lineHeight: '1.1142857142857143',
              // eslint-disable-next-line no-irregular-whitespace
            }}> Editor</div>
          </Box>
          <Typography color="text.secondary" mb={3}>
            Stoked UI: Editor. An advanced MUI based component that allows you to quickly and easily make things, that make things.. PR&apos;s welcome!
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
              <EditorHero id={'editor-hero'} sx={{ width: '100%' }} />
            </Stack>
          )}
        </React.Fragment>
      }
    />
  );
}
