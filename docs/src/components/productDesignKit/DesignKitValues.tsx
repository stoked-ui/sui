import * as React from 'react';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Unstable_Grid2';
import Palette from '@mui/icons-material/Palette';
import LibraryBooks from '@mui/icons-material/LibraryBooks';
import { InfoCard } from '@mui/docs/InfoCard';
import CodeRounded from '@mui/icons-material/CodeRounded';
import GradientText from '@stoked-ui/docs/typography/GradientText';
import Section from '@stoked-ui/docs/Layouts/Section';
import SectionHeadline from '@stoked-ui/docs/typography/SectionHeadline';

const content = [
  {
    icon: <Palette fontSize="small" color="primary" />,
    title: 'For designers',
    description:
      'Save time getting the Stoked UI components all setup, leveraging the latest features from your favorite design tool.',
  },
  {
    icon: <LibraryBooks fontSize="small" color="primary" />,
    title: 'For product managers',
    description:
      'Quickly put together ideas and high-fidelity mockups/prototypes using components from your actual product.',
  },
  {
    icon: <CodeRounded fontSize="small" color="primary" />,
    title: 'For developers',
    description:
      'Effortlessly communicate with designers using the same language around the Stoked UI components props and variants.',
  },
];

export default function DesignKitValues() {
  return (
    <Section cozy>
      <SectionHeadline
        overline="Collaboration"
        title={
          <Typography variant="h2" sx={{ mt: 1 }}>
            Be more efficient <GradientText>designing and developing</GradientText> with the same
            library
          </Typography>
        }
      />
      <Grid container spacing={3} mt={4}>
        {content.map(({ icon, title, description }) => (
          <Grid key={title} xs={12} sm={6} md={4}>
            <InfoCard title={title} icon={icon} description={description} />
          </Grid>
        ))}
      </Grid>
    </Section>
  );
}
