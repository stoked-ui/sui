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

const FileExplorerGrid = dynamic(() => import('../showcase/FileExplorerCard'), {
  ssr: false,
  loading: createLoading({ width: '100%', height: 280 }),
});

const FileExplorerDnd = dynamic(() => import('../showcase/FileExplorerCard'), {
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
          <Typography variant="h1" mb={1} color="text.primary">
            Full Stack<br/>
            <GradientText>Consulting</GradientText>
          </Typography>
          <Typography color="text.secondary" mb={3}>
            Expert software engineering consulting for greenfield solutions, legacy modernization, and cloud infrastructure. Specializing in full stack development with React, Next.js, Angular, Node.js, Python, and C#. Building production-ready applications with AWS, GCP, and modern IaC tools since 2010.
          </Typography>
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
              <FileExplorerGrid id={'file-explorer-grid'} grid sx={{ width: '100%' }} />
              <FileExplorerDnd
                id={'file-explorer-dnd'}
                sx={{
                  width: 360,
                  '& .MuiFile-content': {
                    marginBottom: '2px',
                    marginTop: '2px',
                  }
                }}
              />
            </Stack>
          )}
        </React.Fragment>
      }
    />
  );
}
