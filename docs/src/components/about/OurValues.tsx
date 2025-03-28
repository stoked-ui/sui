import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import KeyboardArrowRightRounded from '@mui/icons-material/KeyboardArrowRightRounded';
import { Link } from '@mui/docs';
import GradientText from 'docs/src/components/typography/GradientText';
import ROUTES from 'docs/src/route';
import Section from 'docs/src/layouts/Section';
import SectionHeadline from 'docs/src/components/typography/SectionHeadline';

const values = [
  {
    title: 'Put community first 💙',
    description: "We never lose sight of who we're serving and why.",
    lightIcon: 'url(/static/branding/about/illustrations/community-light.svg)',
    darkIcon: 'url(/static/branding/about/illustrations/community-dark.svg)',
    width: 92,
    height: 84,
  },
  {
    title: 'Avoid bureaucracy 🚫',
    description: "We're so not corporate — and we like it that way.",
    lightIcon: 'url(/static/branding/about/illustrations/bureaucracy-light.svg)',
    darkIcon: 'url(/static/branding/about/illustrations/bureaucracy-dark.svg)',
    width: 81,
    height: 94,
  },
  {
    title: 'Chase "better" 🌱',
    description: "We're driven by an unending desire to improve.",
    lightIcon: 'url(/static/branding/about/illustrations/better-light.svg)',
    darkIcon: 'url(/static/branding/about/illustrations/better-dark.svg)',
    width: 89,
    height: 89,
  },
  {
    title: 'Trust and deliver together 🚀',
    description: 'We choose to cultivate unity as the core of achievement.',
    lightIcon: 'url(/static/branding/about/illustrations/trust-light.svg)',
    darkIcon: 'url(/static/branding/about/illustrations/trust-dark.svg)',
    width: 75,
    height: 92,
  },
];

export default function OurValues() {
  return (
    <Section cozy>
      <SectionHeadline
        overline="Our values"
        title={
          <Typography variant="h2">
            The SUI <GradientText>team pact</GradientText>
          </Typography>
        }
        description="They explain the behaviors and mindsets we actively encourage, discourage, and why. They serve as a guide toward better decision-making, results, and experiences at work."
      />
      <Grid container spacing={3} sx={{ mt: { xs: 1, sm: 2 } }}>
        {values.map(({ title, description, darkIcon, lightIcon, height, width }) => (
          <Grid key={title} xs={12} md={3}>
            <Paper
              variant="outlined"
              sx={(theme) => ({
                p: 4,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'space-between',
                gap: 1.5,
                background: `${theme.palette.gradients.linearSubtle}`,
                ...theme.applyDarkStyles({
                  bgcolor: 'primaryDark.900',
                  background: `${theme.palette.gradients.linearSubtle}`,
                  borderColor: 'primaryDark.700',
                }),
              })}
            >
              <Box sx={{ height: 94 }}>
                <Box
                  width={width}
                  height={height}
                  sx={(theme) => ({
                    background: `${lightIcon}`,
                    ...theme.applyDarkStyles({
                      background: `${darkIcon}`,
                    }),
                  })}
                />
              </Box>
              <Box sx={{ flexGrow: 1 }}>
                <Typography
                  fontWeight="bold"
                  component="h3"
                  variant="body2"
                  sx={(theme) => ({
                    mb: 0.5,
                    color: theme.palette.text.primary,
                    '&::first-letter': {
                      mr: 0.1,
                      fontSize: theme.typography.pxToRem(16),
                      color: theme.palette.primary.main,
                    },
                    ...theme.applyDarkStyles({
                      '&::first-letter': {
                        color: theme.palette.primary[400],
                      },
                    }),
                  })}
                >
                  {title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {description}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Section>
  );
}
