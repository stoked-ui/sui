import * as React from 'react';
import { alpha } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';
import CompareIcon from '@mui/icons-material/Compare';
import StyleRoundedIcon from '@mui/icons-material/StyleRounded';
import { GlowingIconContainer } from '@stoked-ui/docs/InfoCard';
import GetStartedButtons from 'docs/src/components/home/GetStartedButtons';
import Section from 'docs/src/layouts/Section';
import SectionHeadline from 'docs/src/components/typography/SectionHeadline';
import GradientText from 'docs/src/components/typography/GradientText';
import ROUTES from 'docs/src/route';

export default function BaseUIEnd() {
  return (
    <Section
      data-mui-color-scheme="dark"
      sx={{
        color: 'text.secondary',
        background: (theme) =>
          `linear-gradient(180deg, ${theme.palette.primaryDark[900]} 50%, 
          ${alpha(theme.palette.primary[800], 0.2)} 100%), ${
            theme.palette.primaryDark[900]
          }`,
      }}
    >
      <Grid container spacing={{ xs: 6, sm: 10 }} alignItems="center">
        <Grid xs={12} sm={6}>
          <SectionHeadline
            overline="Community"
            title={
              <Typography variant="h2">
                Join our <GradientText>global community</GradientText>
              </Typography>
            }
            description={
              <React.Fragment>
                Base UI wouldn&apos;t be possible without our global community of contributors. Join
                us today to get help when you need it, and lend a hand when you can.
              </React.Fragment>
            }
          />
          <GetStartedButtons
            primaryUrl={ROUTES.baseDocs}
            secondaryLabel="Learn Base UI"
            secondaryUrl={ROUTES.baseQuickstart}
            altInstallation="npm install @mui/base"
          />
        </Grid>
        <Grid xs={12} sm={6}>
          <List sx={{ '& > li': { alignItems: 'flex-start' } }}>
            <ListItem sx={{ p: 0, mb: 4, gap: 2.5 }}>
              <GlowingIconContainer icon={<CompareIcon color="primary" />} />
              <div>
                <Typography color="text.primary" fontWeight="semiBold" gutterBottom>
                  Base UI vs. Stoked UI
                </Typography>
                <Typography>
                  Base UI features many of the same components as Stoked UI, but without the
                  Material Design implementation.
                </Typography>
              </div>
            </ListItem>
            <ListItem sx={{ p: 0, gap: 2.5 }}>
              <GlowingIconContainer icon={<StyleRoundedIcon color="primary" />} />
              <div>
                <Typography color="text.primary" fontWeight="semiBold" gutterBottom>
                  Does it come with styles?
                </Typography>
                <Typography>
                  Base UI <i>is not packaged</i> with any default theme or built-in style engine.
                  This makes it a great choice if you need complete control over how your app&apos;s
                  CSS is implemented.
                </Typography>
              </div>
            </ListItem>
          </List>
        </Grid>
      </Grid>
    </Section>
  );
}
