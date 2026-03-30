import * as React from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import GetStartedButtons from 'docs/src/components/home/GetStartedButtons';
import GradientText from 'docs/src/components/typography/GradientText';
import SectionHeadline from 'docs/src/components/typography/SectionHeadline';
import HeroContainer from 'docs/src/layouts/HeroContainer';
import Section from 'docs/src/layouts/Section';

const features = [
  {
    label: 'Active Window Tracking',
    description:
      'Follow the frontmost app window automatically so OBS stays on the window you are actually using.',
  },
  {
    label: 'Native OBS Source',
    description:
      'Runs as a dedicated OBS source on macOS, built on ScreenCaptureKit for sharp, modern window capture.',
  },
  {
    label: 'Permission-Aware Setup',
    description:
      'Guides you through the Screen Recording and Accessibility permissions required for reliable focus tracking.',
  },
  {
    label: 'Exclusion Rules',
    description:
      'Ignore bundle IDs like Spotlight or Control Center so utility popups do not steal the capture.',
  },
  {
    label: 'Capture Controls',
    description:
      'Tune frame rate, cursor visibility, fit-to-screen behavior, and optional window resizing from the source properties.',
  },
];

export default function HeroFocusCapture() {
  return (
    <React.Fragment>
      <HeroContainer
        linearGradient
        left={
          <Box sx={{ textAlign: { xs: 'center', md: 'left' }, maxWidth: 560 }}>
            <Typography variant="h1" mb={1}>
              <GradientText>Focus Capture</GradientText>
            </Typography>
            <Typography
              variant="h2"
              mb={1}
              sx={{ fontSize: 'clamp(1.25rem, 0.8rem + 1.2vw, 1.75rem)' }}
            >
              An OBS source that follows the window you are actually using
            </Typography>
            <Typography color="text.secondary" mb={3}>
              Focus Capture is a macOS OBS plugin that automatically switches capture to the
              focused application window. It is built for live demos, pair sessions, support calls,
              and screen recordings where manual source switching slows everything down.
            </Typography>
            <GetStartedButtons
              primaryLabel="Download Focus Capture"
              primaryUrl="/products/focus-capture/docs/download/"
              secondaryLabel="Installation"
              secondaryUrl="/products/focus-capture/docs/installation/"
            />
          </Box>
        }
        rightSx={{
          p: 4,
          ml: 2,
          minWidth: 2000,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'start',
          '&& *': {
            fontFamily: ['"IBM Plex Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'].join(
              ',',
            ),
          },
        }}
        right={
          <Box
            sx={(theme) => ({
              width: '100%',
              maxWidth: 640,
              p: 4,
              borderRadius: 2,
              bgcolor: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(8px)',
              border: '1px solid',
              borderColor: 'divider',
              ...theme.applyDarkStyles({
                bgcolor: 'rgba(0, 0, 0, 0.2)',
              }),
            })}
          >
            <Stack spacing={2}>
              {features.map((feature) => (
                <Box key={feature.label}>
                  <Typography variant="body2" fontWeight="bold" color="primary.main">
                    {feature.label}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>
        }
      />
      <Section bg="comfort" cozy>
        <SectionHeadline
          alwaysCenter
          overline="Built for OBS"
          title={
            <Typography variant="h2" component="h2">
              Keep your recording focused on the <GradientText>active window</GradientText>
            </Typography>
          }
          description="Focus Capture removes the repetitive scene juggling that slows down live demos and recordings."
        />
        <Box sx={{ mt: 4 }}>
          <Grid container spacing={3}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={index < 3 ? 4 : 6} key={feature.label}>
                <Box
                  sx={(theme) => ({
                    p: 3,
                    height: '100%',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    ...theme.applyDarkStyles({
                      bgcolor: 'primaryDark.800',
                      borderColor: 'primaryDark.600',
                    }),
                  })}
                >
                  <Chip
                    label={feature.label}
                    color="primary"
                    size="small"
                    variant="outlined"
                    sx={{ mb: 1.5, fontWeight: 'bold' }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Section>
    </React.Fragment>
  );
}
