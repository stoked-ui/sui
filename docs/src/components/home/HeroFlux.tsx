import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import GradientText from 'docs/src/components/typography/GradientText';
import SectionHeadline from 'docs/src/components/typography/SectionHeadline';
import Section from 'docs/src/layouts/Section';
import GetStartedButtons from 'docs/src/components/home/GetStartedButtons';
import HeroContainer from 'docs/src/layouts/HeroContainer';

const features = [
  {
    label: 'Multi-Monitor Support',
    description: 'Set different websites as wallpapers on each display with independent controls.',
  },
  {
    label: 'Interactive Browsing Mode',
    description: 'Click through and interact with your wallpaper website directly from the desktop.',
  },
  {
    label: 'Custom CSS & JavaScript',
    description: 'Inject custom styles and scripts to tailor any website to your desktop aesthetic.',
  },
  {
    label: 'Shortcuts Automation',
    description: 'Trigger wallpaper changes and actions with Apple Shortcuts and URL schemes.',
  },
  {
    label: 'Fluid Simulation Wallpaper',
    description:
      'Built-in interactive fluid dynamics wallpaper with mouse tracking for mesmerizing effects.',
  },
];

export default function HeroFlux() {
  return (
    <React.Fragment>
      <HeroContainer
        linearGradient
        left={
          <Box sx={{ textAlign: { xs: 'center', md: 'left' }, maxWidth: 500 }}>
            <Typography variant="h1" mb={1}>
              <GradientText>Flux</GradientText>
            </Typography>
            <Typography variant="h2" mb={1} sx={{ fontSize: 'clamp(1.25rem, 0.8rem + 1.2vw, 1.75rem)' }}>
              Make any website your Mac desktop wallpaper
            </Typography>
            <Typography color="text.secondary" mb={3}>
              Flux is a Mac OSX app that turns any website into a live, interactive desktop
              wallpaper. Browse the web on your desktop, inject custom CSS and JavaScript, automate
              with Shortcuts, and enjoy built-in fluid simulations with mouse tracking -- all with
              full multi-monitor support.
            </Typography>
            <GetStartedButtons
              primaryLabel="Download Flux"
              primaryUrl="/flux/getting-started/"
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
          justifyContent: 'center',
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
              maxWidth: 600,
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
          overline="Features"
          title={
            <Typography variant="h2" component="h2">
              Everything you need for a <GradientText>living desktop</GradientText>
            </Typography>
          }
          description="Flux turns your Mac desktop into a dynamic canvas powered by the web."
        />
        <Box sx={{ mt: 4 }}>
          <Grid container spacing={3} justifyContent="center">
            {features.map((feature) => (
              <Grid item xs={12} sm={6} md={4} key={feature.label}>
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
