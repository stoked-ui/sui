import * as React from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from '@mui/material/styles';
import Box, { BoxProps } from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import useMediaQuery from '@mui/material/useMediaQuery';
import GradientText from '@stoked-ui/docs/typography/GradientText';
import GetStartedButtons from 'docs/src/components/home/GetStartedButtons';
import HeroContainer from '@stoked-ui/docs/Layouts/HeroContainer';


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

const FileExplorerGrid = dynamic(() => import('../showcase/FileExplorerCard'), {
  ssr: false,
  loading: createLoading({ width: '100%', height: 280 }),
});

const FileExplorerDrop = dynamic(() => import('../showcase/FileExplorerCard'), {
  ssr: false,
  loading: createLoading({ width: 360, height: 280 }),
});

export default function Hero() {
  const globalTheme = useTheme();
  const isMdUp = useMediaQuery(globalTheme.breakpoints.up('md'));
  return (
    <HeroContainer
      linearGradient
      left={
        <Box sx={{ textAlign: { xs: 'center', md: 'left' }, maxWidth: 500 }}>
          <Typography variant="h1" mb={1}>
            <GradientText>File Explorer</GradientText> <br />
            with drag and drop and much more
          </Typography>
          <Typography color="text.secondary" mb={3}>
            SUI is building an open source web based Video Editor and just released the first component. The File Explorer will play a critical role managing files in the Video Editor. It&apos;s built with <a href={'https://mui.com/material-ui/getting-started/'}>MUI</a> through and through and leverages Atlassian&apos;s new <a href={'https://atlassian.design/components/pragmatic-drag-and-drop/'}>Pragmatic Drag and Drop Library</a>. PR&apos;s welcome.
          </Typography>
          <GetStartedButtons primaryLabel="Checkout the roadmap to see whats next" primaryUrl="https://github.com/orgs/stoked-ui/projects/1/views/1" />
        </Box>
      }
      rightSx={{
        p: 4,
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
          fontFamily: ['"IBM Plex Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'].join(
            ',',
          ),
        },
      }}
      right={
        <React.Fragment>
          {isMdUp && (
            <Stack spacing={3} useFlexGap sx={{ '& > .MuiPaper-root': { maxWidth: 'none' } }}>
              <FileExplorerGrid id={'file-explorer-grid'} defaultData grid sx={{ width: '100%' }} />
            </Stack>
          )}
        </React.Fragment>
      }
    />
  );
}
